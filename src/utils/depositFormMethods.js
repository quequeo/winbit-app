const CATEGORY_TO_API = {
  CASH_USD: 'CASH_USD',
  CASH_ARS: 'CASH_ARS',
  BANK_ARS: 'TRANSFER_ARS',
  LEMON: 'LEMON_CASH',
  SWIFT: 'SWIFT',
};

export const resolveDepositApiMethod = (option) => {
  if (!option) return 'CASH_USD';

  const explicitCode = String(option.code ?? option.method ?? '').trim();
  if (explicitCode) return explicitCode.toUpperCase();

  const category = String(option.category ?? '').toUpperCase();
  const label = String(option.label ?? '').toLowerCase();

  if (CATEGORY_TO_API[category]) return CATEGORY_TO_API[category];

  if (label.includes('usdc')) return 'USDC';
  if (label.includes('usdt')) return 'USDT';
  if (label.includes('btc') || label.includes('bitcoin')) return 'BTC';
  if (label.includes('lemon') || label.includes('winbit')) return 'LEMON_CASH';
  if (label.includes('efectivo') || label.includes('cash')) return 'CASH_USD';
  if (label.includes('swift') || label.includes('internacional')) return 'SWIFT';

  if (category === 'CRYPTO') {
    const currency = String(option.currency ?? '').toUpperCase();
    if (currency === 'USDC') return 'USDC';
    if (currency === 'USDT') return 'USDT';
    return 'CRYPTO';
  }

  return category || 'CUSTOM';
};

export const buildDepositFormMethodOptions = (depositOptions = []) => {
  if (!Array.isArray(depositOptions) || depositOptions.length === 0) return [];

  return [...depositOptions]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((opt) => ({
      value: String(opt.id),
      label: opt.label,
      apiMethod: resolveDepositApiMethod(opt),
      isCash: String(opt.category ?? '').toUpperCase() === 'CASH_USD',
      option: opt,
    }));
};

export const resolveDefaultDepositFormMethodId = (methodOptions, selectedOptionId) => {
  if (!methodOptions.length) return '';
  const selectedId = selectedOptionId != null ? String(selectedOptionId) : '';
  if (selectedId && methodOptions.some((opt) => opt.value === selectedId)) {
    return selectedId;
  }
  return methodOptions[0].value;
};
