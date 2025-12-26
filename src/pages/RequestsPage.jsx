import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';
import { WithdrawalForm } from '../components/features/requests/WithdrawalForm';
import { DepositForm } from '../components/features/requests/DepositForm';
import { Spinner } from '../components/ui/Spinner';

export const RequestsPage = () => {
  const { user } = useAuth();
  const { data, loading } = useInvestorData(user?.email);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
        <p className="text-gray-600 mt-1">
          Submit withdrawal or deposit requests
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WithdrawalForm
          userName={data?.name || user?.displayName || 'Investor'}
          userEmail={user?.email}
          currentBalance={data?.balance || 0}
        />

        <DepositForm
          userName={data?.name || user?.displayName || 'Investor'}
          userEmail={user?.email}
        />
      </div>
    </div>
  );
};

