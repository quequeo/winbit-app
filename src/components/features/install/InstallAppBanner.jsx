import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  dismissInstallBanner,
  getInstallBannerMode,
  promptInstall,
  subscribeInstallPrompt,
} from '../../../utils/installPrompt';

// Espera breve para que Android alcance a avisar que la app se puede instalar
// antes de decidir mostrar el instructivo en su lugar.
const GUIDE_DELAY_MS = 2500;

/**
 * Cartel de "Instalá la app de Winbit" abajo de la pantalla, en el celular, cuando la app
 * todavía no está instalada. Con "Ahora no" vuelve a aparecer recién a las dos semanas.
 */
export const InstallAppBanner = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState(null);

  useEffect(() => {
    const update = () => {
      const next = getInstallBannerMode();
      // El instructivo (iPhone u otros navegadores) se muestra después de la espera.
      setMode((current) => (next === 'prompt' || next === null ? next : current));
    };
    const unsubscribe = subscribeInstallPrompt(update);
    update();
    const timer = setTimeout(() => setMode(getInstallBannerMode()), GUIDE_DELAY_MS);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (!mode) return null;

  const close = () => {
    dismissInstallBanner();
    setMode(null);
  };

  const install = async () => {
    const outcome = await promptInstall();
    if (outcome !== 'accepted') dismissInstallBanner();
    setMode(null);
  };

  const message =
    mode === 'ios' ? t('install.banner.ios') : mode === 'guide' ? t('install.banner.guide') : null;

  return (
    <div
      role="dialog"
      aria-label={t('install.banner.title')}
      data-testid="install-app-banner"
      className="fixed inset-x-3 z-50 rounded-2xl border border-[rgba(236,228,213,0.14)] bg-[#121514] p-4 shadow-2xl"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-start gap-3">
        <img src="/icon-192x192.png" alt="" className="h-11 w-11 rounded-xl shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{t('install.banner.title')}</p>
          <p className="text-xs text-text-muted mt-0.5">
            {message ?? t('install.banner.subtitle')}
          </p>
          <div className="flex items-center gap-4 mt-3">
            {mode === 'prompt' ? (
              <button
                type="button"
                onClick={install}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-text-primary"
              >
                <Download className="w-4 h-4" strokeWidth={2} aria-hidden />
                {t('install.banner.install')}
              </button>
            ) : (
              <a href="/instalar" className="text-sm font-semibold text-primary hover:underline">
                {t('install.banner.howTo')}
              </a>
            )}
            <button
              type="button"
              onClick={close}
              className="text-sm text-text-muted hover:underline"
            >
              {t('install.banner.later')}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label={t('install.banner.close')}
          className="text-text-muted hover:text-text-primary shrink-0"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};
