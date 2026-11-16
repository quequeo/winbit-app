import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { getPushConfig } from '../../../services/api';
import {
  dismissPrompt,
  enablePush,
  getPermission,
  isIos,
  isPushSupported,
  isStandalone,
  wasPromptDismissed,
} from '../../../services/push';

/**
 * Ofrece activar los avisos al celular (con la app cerrada) para enterarse cuando
 * se procesa una solicitud. Se muestra junto a las solicitudes en curso, una sola
 * vez por dispositivo: desaparece al activarlos o al tocar "Ahora no".
 * En iPhone sin la app instalada explica que hay que instalarla primero.
 */
export const EnablePushPrompt = () => {
  const { t } = useTranslation();
  const { userEmail } = useAuth();
  const [mode, setMode] = useState(null); // null | 'offer' | 'install' | 'enabled' | 'denied' | 'error'
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (wasPromptDismissed()) return undefined;

    if (isIos() && !isStandalone()) {
      setMode('install');
      return undefined;
    }
    if (!isPushSupported() || getPermission() !== 'default') return undefined;

    getPushConfig().then(({ data }) => {
      if (!cancelled && data?.enabled) setMode('offer');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mode) return null;

  const handleEnable = async () => {
    setBusy(true);
    const result = await enablePush(userEmail);
    setBusy(false);
    if (result.ok) {
      dismissPrompt();
      setMode('enabled');
    } else {
      setMode(result.reason === 'denied' ? 'denied' : 'error');
    }
  };

  const handleLater = () => {
    dismissPrompt();
    setMode(null);
  };

  return (
    <div className="info-box rounded-lg p-3 mt-3" data-testid="enable-push-prompt" role="status">
      <div className="flex items-start gap-2">
        <BellRing className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1">
          {mode === 'offer' && (
            <>
              <p className="text-sm text-text-primary">{t('push.offer')}</p>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleEnable}
                  disabled={busy}
                  className="text-sm font-semibold text-primary hover:underline disabled:opacity-60"
                >
                  {busy ? t('push.enabling') : t('push.enable')}
                </button>
                <button
                  type="button"
                  onClick={handleLater}
                  className="text-sm text-text-muted hover:underline"
                >
                  {t('push.later')}
                </button>
              </div>
            </>
          )}
          {mode === 'install' && (
            <>
              <p className="text-sm text-text-primary">{t('push.installFirst')}</p>
              <div className="flex gap-3 mt-2">
                <a href="/instalar" className="text-sm font-semibold text-primary hover:underline">
                  {t('push.howToInstall')}
                </a>
                <button
                  type="button"
                  onClick={handleLater}
                  className="text-sm text-text-muted hover:underline"
                >
                  {t('push.later')}
                </button>
              </div>
            </>
          )}
          {mode === 'enabled' && <p className="text-sm text-text-primary">{t('push.enabled')}</p>}
          {mode === 'denied' && <p className="text-sm text-text-primary">{t('push.denied')}</p>}
          {mode === 'error' && <p className="text-sm text-text-primary">{t('push.error')}</p>}
        </div>
      </div>
    </div>
  );
};
