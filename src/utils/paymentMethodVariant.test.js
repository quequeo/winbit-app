import { describe, it, expect } from 'vitest';
import { resolvePaymentMethodVariant } from './paymentMethodVariant';

describe('resolvePaymentMethodVariant', () => {
  it('uses lemon logo for Lemon Cash deposits even when label mentions USDT', () => {
    expect(
      resolvePaymentMethodVariant({
        category: 'LEMON',
        label: 'Transferencia vía Lemon Cash (USDT)',
      }),
    ).toBe('lemon');
  });

  it('uses usdt logo for pure crypto deposit options', () => {
    expect(
      resolvePaymentMethodVariant({
        category: 'CRYPTO',
        label: 'Depósito en USDT (BEP20)',
      }),
    ).toBe('usdt');
  });

  it('uses lemon logo when category is LEMON', () => {
    expect(
      resolvePaymentMethodVariant({
        category: 'LEMON',
        label: 'Winbit',
      }),
    ).toBe('lemon');
  });

  it('uses cash logo for efectivo deposits', () => {
    expect(
      resolvePaymentMethodVariant({
        category: 'CASH_USD',
        label: 'Depósito en efectivo (USD)',
      }),
    ).toBe('cash');
  });
});
