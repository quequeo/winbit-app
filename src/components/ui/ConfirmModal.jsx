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
      <div
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onCancel}
      />

      <div
        className="relative w-full max-w-sm rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
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
          <div className="text-yellow-500">
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
            <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-900">
              {title}
            </h3>
          )}

          <div className="w-full text-left">{children}</div>

          <div className="w-full flex flex-col gap-2 mt-2">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60"
            >
              {loading ? 'Enviando...' : confirmLabel}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-60"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
