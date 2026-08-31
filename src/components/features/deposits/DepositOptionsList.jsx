import { DepositOptionCard } from './DepositOptionCard';
import { EmptyState } from '../../ui/EmptyState';
import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORY_ORDER = ['CASH_USD', 'LEMON', 'CRYPTO', 'SWIFT'];

export const DepositOptionsList = ({ options }) => {
  const { t } = useTranslation();

  if (!options || options.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title={t('deposits.noOptionsTitle')}
        description={t('deposits.noOptionsMessage')}
      />
    );
  }

  const grouped = {};
  for (const opt of options) {
    if (!grouped[opt.category]) {
      grouped[opt.category] = [];
    }
    grouped[opt.category].push(opt);
  }

  const sortedCategories = CATEGORY_ORDER.filter((cat) => grouped[cat]);

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-[#e6f4f3] mb-3 pb-2 border-b border-[rgba(57, 131, 109,0.15)] tracking-wide">
            {t(`deposits.categories.${category}`)}
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            {grouped[category].map((opt) => (
              <DepositOptionCard key={opt.id} option={opt} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
