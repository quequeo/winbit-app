const formatAmountAr = (amount) => {
  const abs = Math.abs(Number(amount) || 0);
  const fixed = abs.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withThousands},${decPart}`;
};

/** Argentine numeric part only: `14.714,57` */
export const formatAmountArParts = (amount) => formatAmountAr(amount);
/** Display like mockups: `USD 14.714,57` (prefix, no $ sign) */
export const formatUsdDisplay = (amount) => `USD ${formatAmountAr(amount)}`;

export const formatUsdAmountOnly = (amount) => formatAmountAr(amount);

/** Display like mockups: `+USD 1.250,00` */
export const formatUsdSignedDisplay = (amount) => {
  const num = Number(amount) || 0;
  if (num > 0) return `+USD ${formatAmountAr(num)}`;
  if (num < 0) return `-USD ${formatAmountAr(num)}`;
  return `USD ${formatAmountAr(0)}`;
};
