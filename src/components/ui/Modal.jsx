import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  primaryActionLabel,
  onPrimaryAction,
  children,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const iconColorClass =
    type === 'success' ? 'text-success' : type === 'error' ? 'text-error' : 'text-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-sm rounded-lg border border-[rgba(101,167,165,0.25)] bg-[rgba(20,20,20,0.6)] backdrop-blur-xl p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-dim hover:text-text-muted transition-colors"
          aria-label={t('common.close', 'Cerrar')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`${iconColorClass}`}>
            {type === 'success' ? (
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : type === 'error' ? (
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          <div className="space-y-2 w-full">
            {title && (
              <h3 id="modal-title" className="text-xl font-bold text-white">
                {title}
              </h3>
            )}
            {children ?? <p className="text-base text-text-muted whitespace-pre-line">{message}</p>}
          </div>

          <div className="w-full mt-2 space-y-2">
            {primaryActionLabel && onPrimaryAction ? (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="w-full px-6 py-3 bg-[rgba(101,167,165,0.28)] text-white font-semibold rounded-lg border border-[rgba(101,167,165,0.45)] transition-all duration-200 hover:bg-[rgba(101,167,165,0.38)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-primary"
              >
                {primaryActionLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className={`w-full px-6 py-3 font-semibold rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-primary ${
                primaryActionLabel
                  ? 'bg-transparent text-text-muted border-[rgba(255,255,255,0.12)] hover:text-text-primary hover:border-[rgba(101,167,165,0.35)]'
                  : 'bg-[rgba(101,167,165,0.2)] text-white border-[rgba(101,167,165,0.35)] hover:bg-[rgba(101,167,165,0.3)]'
              }`}
            >
              {primaryActionLabel ? t('common.close', 'Cerrar') : t('common.accept', 'Aceptar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
