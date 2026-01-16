import { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body cuando el modal está abierto
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
      ? 'bg-green-50 border-green-200'
      : type === 'error'
        ? 'bg-red-50 border-red-200'
        : 'bg-blue-50 border-blue-200';

  const iconColorClass =
    type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600';

  const buttonColorClass =
    type === 'success'
      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      : type === 'error'
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - más cuadrado y centrado */}
      <div
        className={`relative w-full max-w-sm rounded-2xl border-2 p-8 shadow-2xl ${bgColorClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Contenido centrado verticalmente */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
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

          {/* Content */}
          <div className="space-y-2">
            {title && (
              <h3 id="modal-title" className="text-xl font-bold text-gray-900">
                {title}
              </h3>
            )}
            <p className="text-base text-gray-700 whitespace-pre-line">{message}</p>
          </div>

          {/* Accept button - centrado y más grande */}
          <button
            onClick={onClose}
            className={`w-full mt-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColorClass}`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
