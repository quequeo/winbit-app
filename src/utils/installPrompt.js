/**
 * Cartel para instalar la app en el celular.
 *
 * - Android (Chrome y la mayoría de los navegadores): el navegador avisa con el evento
 *   `beforeinstallprompt`; lo guardamos para abrir la instalación con nuestro botón.
 * - iPhone (Safari): no hay evento; se explica el paso de "Agregar a inicio" (/instalar).
 * - Si la app ya está instalada (abierta desde el ícono), no se muestra nada.
 */

const DISMISSED_KEY = 'winbit-install-banner-dismissed-at';
const INSTALLED_KEY = 'winbit-app-installed';
export const DISMISS_DAYS = 14;

let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

const readStorage = (key) => {
  try {
    return globalThis?.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    globalThis?.localStorage?.setItem(key, value);
  } catch {
    /* ignore */
  }
};

/** Se llama una vez al arrancar, antes de montar React, para no perder el evento. */
export const initInstallPrompt = () => {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    writeStorage(INSTALLED_KEY, 'true');
    notify();
  });
};

export const subscribeInstallPrompt = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const canPromptInstall = () => deferredPrompt !== null;

/** Abre el diálogo de instalación del navegador. Devuelve 'accepted', 'dismissed' o 'unavailable'. */
export const promptInstall = async () => {
  if (!deferredPrompt) return 'unavailable';
  const event = deferredPrompt;
  deferredPrompt = null;
  event.prompt();
  const choice = await event.userChoice.catch(() => ({ outcome: 'dismissed' }));
  if (choice?.outcome === 'accepted') writeStorage(INSTALLED_KEY, 'true');
  notify();
  return choice?.outcome ?? 'dismissed';
};

export const isStandalone = () =>
  typeof window !== 'undefined' &&
  ((typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches) ||
    navigator.standalone === true);

export const isIos = () =>
  typeof navigator !== 'undefined' &&
  (/iphone|ipad|ipod/i.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

export const isPhone = () =>
  typeof navigator !== 'undefined' &&
  /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '');

export const wasInstalled = () => readStorage(INSTALLED_KEY) === 'true';

export const wasDismissedRecently = (now = Date.now()) => {
  const at = Number(readStorage(DISMISSED_KEY));
  return Number.isFinite(at) && at > 0 && now - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
};

export const dismissInstallBanner = (now = Date.now()) => writeStorage(DISMISSED_KEY, String(now));

/**
 * Qué cartel corresponde: 'prompt' (botón Instalar), 'ios' (explicar Agregar a inicio),
 * 'guide' (link al instructivo) o null (no mostrar).
 */
export const getInstallBannerMode = () => {
  if (isStandalone() || wasInstalled() || wasDismissedRecently()) return null;
  if (canPromptInstall()) return 'prompt';
  if (!isPhone()) return null;
  return isIos() ? 'ios' : 'guide';
};
