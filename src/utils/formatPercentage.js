export const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '0,00%';
  }

  // Use Argentine locale for formatting
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  const sign = value >= 0 ? '+' : '-';

  return `${sign}${formatted}%`;
};
