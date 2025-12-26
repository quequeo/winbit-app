import { useTranslation } from 'react-i18next';

export const HistoryPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('history.title')}</h1>
        <p className="text-gray-600 mt-1">{t('history.comingSoon')}</p>
      </div>
    </div>
  );
};
