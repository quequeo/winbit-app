const roundHalfUp = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.floor(Math.abs(value) * factor + 0.5) / factor;
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '0,00%';
  }

  const rounded = roundHalfUp(value, 2);
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);

  const sign = value >= 0 ? '+' : '-';

  return `${sign}${formatted}%`;
};
