import { useTranslation } from 'react-i18next';

export const ErrorMessage = ({ message, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(201,108,103,0.16)] text-error">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {t('errors.somethingWentWrong')}
      </h3>
      <p className="text-text-muted text-center mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-3 primary-button font-semibold rounded-[14px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D0F0E] focus:ring-primary"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
};
