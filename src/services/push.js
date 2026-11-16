/**
 * Avisos al celular con la app cerrada (Web Push).
 *
 * - Android (Chrome) y computadoras: funcionan desde el navegador o la app instalada.
 * - iPhone: solo si la app está instalada en la pantalla de inicio (iOS 16.4 o más nuevo).
 *
 * El backend solo avisa cuando una solicitud se aprueba o se rechaza.
 */
import { deletePushSubscription, getPushConfig, savePushSubscription } from './api';

const DISMISSED_KEY = 'winbit-push-prompt-dismissed';

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const isIos = () =>
  typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent || '');

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)')?.matches || navigator.standalone === true);

export const getPermission = () =>
  typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied';

export const wasPromptDismissed = () => {
  try {
    return globalThis?.localStorage?.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const dismissPrompt = () => {
  try {
    globalThis?.localStorage?.setItem(DISMISSED_KEY, 'true');
  } catch {
    /* ignore */
  }
};

/** Convierte la clave pública VAPID (base64 url-safe) al formato que pide el navegador. */
export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = globalThis.atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const getRegistration = async () => {
  if (!isPushSupported()) return null;
  return navigator.serviceWorker.ready;
};

const subscribeAndSave = async (email, publicKey) => {
  const registration = await getRegistration();
  if (!registration) return { ok: false, reason: 'unsupported' };

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const { error } = await savePushSubscription(email, subscription.toJSON());
  return error ? { ok: false, reason: 'save_failed' } : { ok: true };
};

/**
 * Pide permiso y activa los avisos en este dispositivo.
 * @returns {Promise<{ok: boolean, reason?: 'unsupported'|'not_configured'|'denied'|'save_failed'|'error'}>}
 */
export const enablePush = async (email) => {
  try {
    if (!email || !isPushSupported()) return { ok: false, reason: 'unsupported' };

    const { data: config } = await getPushConfig();
    if (!config?.enabled || !config?.publicKey) return { ok: false, reason: 'not_configured' };

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'denied' };

    return await subscribeAndSave(email, config.publicKey);
  } catch {
    return { ok: false, reason: 'error' };
  }
};

/**
 * Si el inversor ya dio permiso, vuelve a registrar la suscripción de este dispositivo
 * (por si cambió o se borró en el servidor). No pide nada: si no hay permiso, no hace nada.
 */
export const syncPush = async (email) => {
  try {
    if (!email || !isPushSupported() || getPermission() !== 'granted') return { ok: false };
    const { data: config } = await getPushConfig();
    if (!config?.enabled || !config?.publicKey) return { ok: false };
    return await subscribeAndSave(email, config.publicKey);
  } catch {
    return { ok: false };
  }
};

/** Desactiva los avisos en este dispositivo. */
export const disablePush = async () => {
  try {
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return { ok: true };
    await deletePushSubscription(subscription.endpoint);
    await subscription.unsubscribe();
    return { ok: true };
  } catch {
    return { ok: false };
  }
};
