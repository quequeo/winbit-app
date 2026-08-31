export const getMethodDescription = (option, t) => {
  if (!option) return '';
  const label = String(option.label ?? '').toLowerCase();
  const category = String(option.category ?? '').toUpperCase();

  if (category === 'CASH_USD' || label.includes('efectivo')) {
    return t('deposits.methodDescriptions.cash');
  }
  if (label.includes('lemon')) return t('deposits.methodDescriptions.lemon');
  if (label.includes('usdt') || label.includes('trc20')) {
    return option.details?.network ? String(option.details.network) : 'TRC20';
  }
  if (label.includes('usdc')) return 'ERC20 / Polygon';
  if (category === 'SWIFT' || label.includes('internacional')) {
    return t('deposits.methodDescriptions.international');
  }
  if (label.includes('banco') || label.includes('transferencia') || category === 'BANK') {
    return t('deposits.methodDescriptions.bank');
  }
  if (category === 'CRYPTO') return option.currency || 'Crypto';
  return option.currency || '';
};

export const getMethodSubtitle = (option) => {
  if (!option) return '';
  const category = String(option.category ?? '').toUpperCase();
  const label = String(option.label ?? '').toLowerCase();

  if (label.includes('usdt')) return 'TRC20';
  if (label.includes('banco') || label.includes('transferencia')) return 'ARS / USD';
  if (category === 'SWIFT') return 'USD / EUR';
  return option.currency || '';
};
