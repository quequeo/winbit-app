import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Toast = ({ title, message, type = 'success', onClose, duration = 3000 }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: 'winbit-toast winbit-toast--success',
    error: 'winbit-toast winbit-toast--error',
    info: 'winbit-toast winbit-toast--info',
  };

  return (
    <div className="fixed top-4 right-4 z-[60] animate-slide-in">
      <div
        className={`${types[type] ?? types.info} px-5 py-4 rounded-2xl flex items-start gap-3 min-w-[280px] max-w-[360px] shadow-lg`}
        role="status"
      >
        <div className="flex-1 min-w-0">
          {title ? <div className="winbit-toast__title">{title}</div> : null}
          <div
            className={
              title ? 'winbit-toast__message' : 'winbit-toast__message winbit-toast__message--solo'
            }
          >
            {message}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="winbit-toast__close"
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
