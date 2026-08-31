const WITHDRAWAL_METHOD_ORDER = ['USDT', 'USDC', 'LEMON_CASH', 'CASH_USD'];

export const FALLBACK_WITHDRAWAL_METHODS = [
  {
    code: 'USDT',
    name: 'USDT',
    requiresNetwork: true,
    requiresLemontag: false,
    requiresWalletAddress: true,
  },
  {
    code: 'USDC',
    name: 'USDC',
    requiresNetwork: true,
    requiresLemontag: false,
    requiresWalletAddress: true,
  },
  {
    code: 'LEMON_CASH',
    name: 'Lemon Cash',
    requiresNetwork: false,
    requiresLemontag: true,
    requiresWalletAddress: false,
  },
  {
    code: 'CASH_USD',
    name: 'Efectivo USD',
    requiresNetwork: false,
    requiresLemontag: false,
    requiresWalletAddress: false,
  },
];

const orderIndex = (code) => {
  const idx = WITHDRAWAL_METHOD_ORDER.indexOf(String(code ?? '').toUpperCase());
  return idx === -1 ? 999 : idx;
};

const expandCryptoMethod = (method) => [
  { ...method, code: 'USDT', name: 'USDT' },
  { ...method, code: 'USDC', name: 'USDC' },
];

/**
 * Expande CRYPTO en USDT + USDC y ordena métodos para el formulario de retiro.
 */
export const normalizeWithdrawalPaymentMethods = (methods) => {
  if (!Array.isArray(methods) || methods.length === 0) {
    return FALLBACK_WITHDRAWAL_METHODS;
  }

  const expanded = [];
  for (const method of methods) {
    const code = String(method?.code ?? '').toUpperCase();
    if (code === 'CRYPTO') {
      expanded.push(...expandCryptoMethod(method));
      continue;
    }
    expanded.push(method);
  }

  const seen = new Set();
  const unique = expanded.filter((method) => {
    const code = String(method?.code ?? '').toUpperCase();
    if (!code || seen.has(code)) return false;
    seen.add(code);
    return true;
  });

  return unique.sort((a, b) => orderIndex(a.code) - orderIndex(b.code));
};
