import { useTranslation } from 'react-i18next';

export const ErrorMessage = ({ message, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-error text-5xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {t('errors.somethingWentWrong')}
      </h3>
      <p className="text-text-muted text-center mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
};
