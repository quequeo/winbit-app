import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, message, type = 'info' }) => {
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

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? CircleAlert : Info;
  const iconToneClass =
    type === 'success'
      ? 'winbit-modal__icon--success'
      : type === 'error'
        ? 'winbit-modal__icon--error'
        : 'winbit-modal__icon--info';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="winbit-modal__scrim" onClick={onClose} aria-hidden />

      <div className="winbit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button
          type="button"
          onClick={onClose}
          className="winbit-modal__close"
          aria-label={t('common.close')}
        >
          <X className="w-4 h-4" strokeWidth={1.75} aria-hidden />
        </button>

        <div className="winbit-modal__body">
          <div className={`winbit-modal__icon ${iconToneClass}`} aria-hidden>
            <Icon className="w-5 h-5" strokeWidth={1.75} />
          </div>

          <div className="winbit-modal__copy">
            {title ? (
              <h3 id="modal-title" className="winbit-modal__title">
                {title}
              </h3>
            ) : null}
            <p className="winbit-modal__message">{message}</p>
          </div>

          <button type="button" onClick={onClose} className="winbit-modal__primary">
            {t('common.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};
