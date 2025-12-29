import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { PerformanceChart } from '../components/features/dashboard/PerformanceChart';
import { LastUpdated } from '../components/features/dashboard/LastUpdated';
import { KpiCard } from '../components/features/dashboard/KpiCard';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useTranslation } from 'react-i18next';
import { formatName } from '../utils/formatName';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useInvestorData(user?.email);
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    const message =
      error === 'Google Sheets credentials not configured'
        ? t('sheets.credentialsNotConfigured')
        : error;

    return <ErrorMessage message={message} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorMessage message="No hay datos disponibles para tu cuenta" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.welcomeBack', { name: formatName(data.name) })}
        </h1>
        <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Primera línea - Valor actual destacado */}
      <div className="mb-6">
        <KpiCard 
          title={t('dashboard.kpis.currentValue')} 
          value={data.balance} 
          variant="currency" 
          highlighted={true}
        />
      </div>

      {/* Segunda línea - Resultado desde el inicio */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <KpiCard
          title={t('dashboard.kpis.totalReturnUsd')}
          value={data.totalReturnUsd ?? 0}
          variant="currency"
        />
        <KpiCard
          title={t('dashboard.kpis.totalReturnPct')}
          value={data.totalReturnPct ?? 0}
          variant="percentage"
        />
      </div>

      {/* Tercera línea - Resultado anual */}
      <div className="grid gap-4 md:grid-cols-2">
        <KpiCard
          title={t('dashboard.kpis.annualReturnUsd')}
          value={data.annualReturnUsd ?? 0}
          variant="currency"
        />
        <KpiCard
          title={t('dashboard.kpis.annualReturnPct')}
          value={data.annualReturnPct ?? 0}
          variant="percentage"
        />
      </div>

      <PerformanceChart data={data.historicalData} />

      <LastUpdated timestamp={data.lastUpdated} />
    </div>
  );
};
