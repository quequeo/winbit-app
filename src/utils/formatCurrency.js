export const formatCurrency = (amount, showSign = false) => {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }

  const abs = Math.abs(amount);
  const fixed = abs.toFixed(2);
  const parts = fixed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = `${integerPart}.${parts[1]}`;

  const sign = showSign && amount > 0 ? '+' : amount < 0 ? '-' : '';

  return `${sign}$${formatted}`;
};
