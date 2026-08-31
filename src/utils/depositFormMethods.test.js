import { describe, it, expect } from 'vitest';
import {
  buildDepositFormMethodOptions,
  resolveDefaultDepositFormMethodId,
  resolveDepositApiMethod,
} from './depositFormMethods';

describe('depositFormMethods', () => {
  const options = [
    { id: '1', category: 'CASH_USD', label: 'Depósito en efectivo (USD)', position: 1 },
    {
      id: '2',
      category: 'CRYPTO',
      label: 'Depósito en USDT (BEP20)',
      currency: 'USDT',
      position: 2,
    },
    { id: '3', category: 'LEMON', label: 'Winbit', position: 3 },
  ];

  it('builds one form option per deposit option using its label', () => {
    const result = buildDepositFormMethodOptions(options);
    expect(result).toHaveLength(3);
    expect(result.map((item) => item.label)).toEqual([
      'Depósito en efectivo (USD)',
      'Depósito en USDT (BEP20)',
      'Winbit',
    ]);
  });

  it('resolves api method from category and label', () => {
    expect(resolveDepositApiMethod(options[0])).toBe('CASH_USD');
    expect(resolveDepositApiMethod(options[1])).toBe('USDT');
    expect(resolveDepositApiMethod(options[2])).toBe('LEMON_CASH');
  });

  it('prefers explicit option code when present', () => {
    expect(resolveDepositApiMethod({ category: 'CUSTOM', label: 'Winbit', code: 'WINBIT' })).toBe(
      'WINBIT',
    );
  });

  it('defaults to selected option id when available', () => {
    const methodOptions = buildDepositFormMethodOptions(options);
    expect(resolveDefaultDepositFormMethodId(methodOptions, '2')).toBe('2');
  });
});
