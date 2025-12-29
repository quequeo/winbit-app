export const formatCurrency = (amount, showSign = false) => {
  if (amount === null || amount === undefined) {
    return '$0,00';
  }

  // Use Argentine locale for formatting
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  // Add sign for positive values if requested (but not for zero)
  const sign = showSign && amount > 0 ? '+' : amount < 0 ? '-' : '';
  
  return `${sign}$${formatted}`;
};
