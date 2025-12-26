import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { BalanceCard } from '../components/features/dashboard/BalanceCard';
import { PerformanceChart } from '../components/features/dashboard/PerformanceChart';
import { LastUpdated } from '../components/features/dashboard/LastUpdated';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useInvestorData(user?.email);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (!data) {
    return (
      <ErrorMessage 
        message="No data available for your account"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {data.name}
        </h1>
        <p className="text-gray-600 mt-1">Here's your portfolio overview</p>
      </div>

      <BalanceCard
        balance={data.balance}
        totalInvested={data.totalInvested}
        returns={data.returns}
      />

      <PerformanceChart data={data.historicalData} />

      <LastUpdated timestamp={data.lastUpdated} />
    </div>
  );
};

