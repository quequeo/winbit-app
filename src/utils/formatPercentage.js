export const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '0.00%';
  }

  const sign = value >= 0 ? '+' : '';

  return `${sign}${value.toFixed(2)}%`;
};
