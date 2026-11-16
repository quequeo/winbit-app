import { describe, it, expect } from 'vitest';
import {
  buildDepositFormMethodOptions,
  findDepositFormMethodIdForRequest,
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

  describe('findDepositFormMethodIdForRequest', () => {
    it('finds the option with the same api method as the request', () => {
      const methodOptions = buildDepositFormMethodOptions(options);
      expect(findDepositFormMethodIdForRequest(methodOptions, { method: 'USDT' })).toBe('2');
      expect(findDepositFormMethodIdForRequest(methodOptions, { method: 'lemon_cash' })).toBe('3');
    });

    it('prefers the option on the same network when several share the method', () => {
      const methodOptions = buildDepositFormMethodOptions([
        { id: 'a', category: 'CRYPTO', label: 'USDT BEP20', details: { network: 'BEP20' } },
        { id: 'b', category: 'CRYPTO', label: 'USDT TRC20', details: { network: 'TRC20' } },
      ]);
      expect(
        findDepositFormMethodIdForRequest(methodOptions, { method: 'USDT', network: 'TRC20' }),
      ).toBe('b');
    });

    it('returns null when no option matches', () => {
      const methodOptions = buildDepositFormMethodOptions(options);
      expect(findDepositFormMethodIdForRequest(methodOptions, { method: 'SWIFT' })).toBeNull();
      expect(findDepositFormMethodIdForRequest(methodOptions, {})).toBeNull();
    });
  });
});
