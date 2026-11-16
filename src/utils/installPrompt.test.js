import { describe, it, expect, beforeEach, vi } from 'vitest';

const setUserAgent = (ua) => {
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
};

const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128 Mobile';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15';
const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128';

const loadModule = async () => {
  vi.resetModules();
  return import('./installPrompt');
};

describe('installPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn(() => ({ matches: false }));
  });

  it('en Android, cuando el navegador avisa, ofrece el botón Instalar', async () => {
    setUserAgent(ANDROID);
    const mod = await loadModule();
    mod.initInstallPrompt();
    const listener = vi.fn();
    mod.subscribeInstallPrompt(listener);

    const event = new Event('beforeinstallprompt');
    event.prompt = vi.fn();
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(event);

    expect(listener).toHaveBeenCalled();
    expect(mod.getInstallBannerMode()).toBe('prompt');
    await expect(mod.promptInstall()).resolves.toBe('accepted');
    expect(event.prompt).toHaveBeenCalled();
    expect(mod.getInstallBannerMode()).toBeNull();
  });

  it('en iPhone explica Agregar a inicio y en otros celulares muestra el instructivo', async () => {
    setUserAgent(IPHONE);
    expect((await loadModule()).getInstallBannerMode()).toBe('ios');

    setUserAgent(ANDROID);
    expect((await loadModule()).getInstallBannerMode()).toBe('guide');
  });

  it('en la computadora no muestra nada si el navegador no ofrece instalar', async () => {
    setUserAgent(DESKTOP);
    expect((await loadModule()).getInstallBannerMode()).toBeNull();
  });

  it('no aparece con la app abierta desde el ícono', async () => {
    setUserAgent(IPHONE);
    window.matchMedia = vi.fn(() => ({ matches: true }));
    expect((await loadModule()).getInstallBannerMode()).toBeNull();
  });

  it('después de "Ahora no" vuelve a aparecer recién a las dos semanas', async () => {
    setUserAgent(IPHONE);
    const mod = await loadModule();
    const now = Date.now();
    mod.dismissInstallBanner(now);

    expect(mod.wasDismissedRecently(now + 13 * 24 * 60 * 60 * 1000)).toBe(true);
    expect(mod.wasDismissedRecently(now + 15 * 24 * 60 * 60 * 1000)).toBe(false);
    expect(mod.getInstallBannerMode()).toBeNull();
  });
});
