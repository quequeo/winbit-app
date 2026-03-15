import { useEffect } from 'react';

export const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 transition-opacity" onClick={onCancel} />

      <div
        className="relative w-full max-w-sm rounded-lg border-2 border-[rgba(255,152,0,0.3)] bg-[rgba(255,152,0,0.15)] p-8 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-text-dim hover:text-text-muted transition-colors"
          aria-label="Cerrar"
          disabled={loading}
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
          <div className="text-warning">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {title && (
            <h3 id="confirm-modal-title" className="text-xl font-bold text-text-primary">
              {title}
            </h3>
          )}

          <div className="w-full text-left text-text-muted">{children}</div>

          <div className="w-full flex flex-col gap-2 mt-2">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-primary disabled:opacity-60"
            >
              {loading ? 'Enviando...' : confirmLabel}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full px-6 py-3 bg-dark-section border border-border-dark text-text-primary font-semibold rounded-lg transition-colors hover:bg-accent-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-primary disabled:opacity-60"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
