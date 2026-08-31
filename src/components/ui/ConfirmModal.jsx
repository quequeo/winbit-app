import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleHelp, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  children,
  confirmLabel,
  cancelLabel,
  loading = false,
}) => {
  const { t } = useTranslation();
  const resolvedConfirm = confirmLabel ?? t('common.confirm');
  const resolvedCancel = cancelLabel ?? t('common.cancel');

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

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="winbit-modal__scrim" onClick={loading ? undefined : onCancel} aria-hidden />

      <div
        className="winbit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          type="button"
          onClick={onCancel}
          className="winbit-modal__close"
          aria-label={t('common.close')}
          disabled={loading}
        >
          <X className="w-4 h-4" strokeWidth={1.75} aria-hidden />
        </button>

        <div className="winbit-modal__body winbit-modal__body--confirm">
          <div className="winbit-modal__icon winbit-modal__icon--info" aria-hidden>
            <CircleHelp className="w-5 h-5" strokeWidth={1.75} />
          </div>

          {title ? (
            <h3 id="confirm-modal-title" className="winbit-modal__title">
              {title}
            </h3>
          ) : null}

          <div className="winbit-modal__content">{children}</div>

          <div className="winbit-modal__actions">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="winbit-modal__primary"
            >
              {loading ? t('common.sending') : resolvedConfirm}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="winbit-modal__secondary"
            >
              {resolvedCancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
