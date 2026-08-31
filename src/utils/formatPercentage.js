import { formatAmountArParts } from './formatUsdDisplay';

const roundHalfUp = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.floor(Math.abs(value) * factor + 0.5) / factor;
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '0,00%';
  }

  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '0,00%';
  }

  const rounded = roundHalfUp(num, 2);
  const formatted = formatAmountArParts(rounded);
  const sign = num >= 0 ? '+' : '-';

  return `${sign}${formatted}%`;
};
