import { formatAmountArParts, formatUsdDisplay, formatUsdSignedDisplay } from './formatUsdDisplay';

/**
 * Unified USD display for the whole app.
 * USD 1.000,00 | +USD 1.000,00 | -USD 500,00
 */
export const formatCurrency = (amount, showSign = false) => {
  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
    return showSign ? formatUsdSignedDisplay(0) : formatUsdDisplay(0);
  }

  if (showSign) {
    return formatUsdSignedDisplay(amount);
  }

  const num = Number(amount);
  if (num < 0) {
    return `-USD ${formatAmountArParts(num)}`;
  }

  return formatUsdDisplay(num);
};
