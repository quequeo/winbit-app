import { describe, it, expect } from 'vitest';
import {
  FALLBACK_WITHDRAWAL_METHODS,
  normalizeWithdrawalPaymentMethods,
} from './normalizeWithdrawalPaymentMethods';

describe('normalizeWithdrawalPaymentMethods', () => {
  it('returns fallback when API list is empty', () => {
    expect(normalizeWithdrawalPaymentMethods([])).toEqual(FALLBACK_WITHDRAWAL_METHODS);
  });

  it('expands CRYPTO into USDT and USDC', () => {
    const result = normalizeWithdrawalPaymentMethods([
      {
        code: 'CRYPTO',
        name: 'Criptomonedas',
        requiresNetwork: true,
        requiresWalletAddress: true,
      },
      {
        code: 'CASH_USD',
        name: 'Efectivo USD',
      },
    ]);

    expect(result.map((m) => m.code)).toEqual(['USDT', 'USDC', 'CASH_USD']);
  });
});
