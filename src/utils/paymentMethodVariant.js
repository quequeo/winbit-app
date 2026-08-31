export const resolvePaymentMethodVariant = (option) => {
  if (!option) return 'bank';
  const label = String(option.label ?? option.name ?? '').toLowerCase();
  const category = String(option.category ?? '').toUpperCase();
  const code = String(option.code ?? option.method ?? '').toUpperCase();

  if (
    category === 'LEMON' ||
    label.includes('lemon') ||
    code === 'LEMON' ||
    code === 'LEMON_CASH'
  ) {
    return 'lemon';
  }

  if (label.includes('usdc') || code === 'USDC') return 'usdc';
  if (label.includes('usdt') || code === 'USDT') return 'usdt';
  if (label.includes('btc') || label.includes('bitcoin') || code === 'BTC') return 'btc';
  if (
    category === 'CASH_USD' ||
    label.includes('efectivo') ||
    code === 'CASH_USD' ||
    code === 'CASH'
  ) {
    return 'cash';
  }
  if (label.includes('internacional') || label.includes('swift') || code === 'SWIFT')
    return 'globe';
  if (label.includes('cripto') || label.includes('crypto') || code === 'CRYPTO') {
    return 'usdt';
  }
  if (label.includes('banco') || label.includes('transferencia') || code === 'CUSTOM')
    return 'bank';
  return 'bank';
};
