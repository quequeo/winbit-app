import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { enablePush, syncPush, urlBase64ToUint8Array, disablePush } from './push';
import { getPushConfig, savePushSubscription, deletePushSubscription } from './api';

vi.mock('./api', () => ({
  getPushConfig: vi.fn(),
  savePushSubscription: vi.fn(),
  deletePushSubscription: vi.fn(),
}));

const subscriptionJson = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  keys: { p256dh: 'p', auth: 'a' },
};

const installPushApis = ({
  permission = 'default',
  requestResult = 'granted',
  existing = null,
} = {}) => {
  const subscription = {
    endpoint: subscriptionJson.endpoint,
    toJSON: () => subscriptionJson,
    unsubscribe: vi.fn().mockResolvedValue(true),
  };
  const pushManager = {
    getSubscription: vi.fn().mockResolvedValue(existing ? subscription : null),
    subscribe: vi.fn().mockResolvedValue(subscription),
  };
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { ready: Promise.resolve({ pushManager }) },
  });
  window.PushManager = function PushManager() {};
  window.Notification = { permission, requestPermission: vi.fn().mockResolvedValue(requestResult) };
  return { pushManager, subscription };
};

describe('push service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPushConfig.mockResolvedValue({ data: { enabled: true, publicKey: 'BEl6' }, error: null });
    savePushSubscription.mockResolvedValue({ data: { active: true }, error: null });
    deletePushSubscription.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    delete navigator.serviceWorker;
    delete window.PushManager;
    delete window.Notification;
  });

  it('convierte la clave pública VAPID a bytes', () => {
    expect(Array.from(urlBase64ToUint8Array('AQID'))).toEqual([1, 2, 3]);
    expect(Array.from(urlBase64ToUint8Array('-_8'))).toEqual([251, 255]);
  });

  it('activa los avisos: pide permiso, se suscribe y guarda la suscripción', async () => {
    const { pushManager } = installPushApis();

    await expect(enablePush('ana@example.com')).resolves.toEqual({ ok: true });

    expect(window.Notification.requestPermission).toHaveBeenCalled();
    expect(pushManager.subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
    expect(savePushSubscription).toHaveBeenCalledWith('ana@example.com', subscriptionJson);
  });

  it('si el inversor no da permiso, no se suscribe', async () => {
    const { pushManager } = installPushApis({ requestResult: 'denied' });

    await expect(enablePush('ana@example.com')).resolves.toEqual({ ok: false, reason: 'denied' });
    expect(pushManager.subscribe).not.toHaveBeenCalled();
  });

  it('si el servidor no tiene los avisos configurados, no pide permiso', async () => {
    installPushApis();
    getPushConfig.mockResolvedValue({ data: { enabled: false, publicKey: null }, error: null });

    await expect(enablePush('ana@example.com')).resolves.toEqual({
      ok: false,
      reason: 'not_configured',
    });
    expect(window.Notification.requestPermission).not.toHaveBeenCalled();
  });

  it('sin soporte del navegador no hace nada', async () => {
    await expect(enablePush('ana@example.com')).resolves.toEqual({
      ok: false,
      reason: 'unsupported',
    });
  });

  it('al entrar, vuelve a registrar la suscripción solo si ya había permiso', async () => {
    installPushApis({ permission: 'default' });
    await syncPush('ana@example.com');
    expect(savePushSubscription).not.toHaveBeenCalled();

    installPushApis({ permission: 'granted', existing: true });
    await expect(syncPush('ana@example.com')).resolves.toEqual({ ok: true });
    expect(savePushSubscription).toHaveBeenCalledWith('ana@example.com', subscriptionJson);
  });

  it('desactiva los avisos de este dispositivo', async () => {
    const { subscription } = installPushApis({ permission: 'granted', existing: true });

    await expect(disablePush()).resolves.toEqual({ ok: true });
    expect(deletePushSubscription).toHaveBeenCalledWith(subscriptionJson.endpoint);
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });
});
