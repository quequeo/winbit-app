export const OperatingDirectionBadge = ({ direction, longLabel, shortLabel }) => {
  const normalized = String(direction ?? '')
    .trim()
    .toUpperCase();
  if (normalized !== 'LONG' && normalized !== 'SHORT') return null;

  const isLong = normalized === 'LONG';

  return (
    <span
      className={`dashboard-direction-badge ${
        isLong ? 'dashboard-direction-badge--long' : 'dashboard-direction-badge--short'
      }`}
    >
      {isLong ? longLabel : shortLabel}
    </span>
  );
};
