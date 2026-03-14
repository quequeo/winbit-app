const roundHalfUp = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.floor(Math.abs(value) * factor + 0.5) / factor;
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '0.00%';
  }

  const rounded = roundHalfUp(value, 2);
  const fixed = rounded.toFixed(2);
  const parts = fixed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `${integerPart}.${parts[1]}`;

  const sign = value >= 0 ? '+' : '-';

  return `${sign}${formatted}%`;
};
