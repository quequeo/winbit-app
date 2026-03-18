import { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, message, type = 'info' }) => {
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

  const bgColorClass =
    type === 'success'
      ? 'bg-[rgba(76,175,80,0.15)] border-[rgba(76,175,80,0.3)]'
      : type === 'error'
        ? 'bg-[rgba(239,83,80,0.15)] border-[rgba(239,83,80,0.3)]'
        : 'bg-[rgba(101,167,165,0.15)] border-[rgba(101,167,165,0.3)]';

  const iconColorClass =
    type === 'success' ? 'text-success' : type === 'error' ? 'text-error' : 'text-primary';

  const buttonColorClass =
    type === 'success'
      ? 'bg-success hover:bg-success/80 focus:ring-success'
      : type === 'error'
        ? 'bg-error hover:bg-error/80 focus:ring-error'
        : 'bg-primary hover:bg-primary/80 focus:ring-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black transition-opacity" onClick={onClose} />

      <div
        className={`relative w-full max-w-sm rounded-lg border-2 p-8 backdrop-blur-md ${bgColorClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-dim hover:text-text-muted transition-colors"
          aria-label="Cerrar"
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

          <div className="space-y-2">
            {title && (
              <h3 id="modal-title" className="text-xl font-bold text-text-primary">
                {title}
              </h3>
            )}
            <p className="text-base text-text-muted whitespace-pre-line">{message}</p>
          </div>

          <button
            onClick={onClose}
            className={`w-full mt-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg ${buttonColorClass}`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
