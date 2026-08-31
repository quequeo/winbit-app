import { describe, it, expect } from 'vitest';
import { computeWithdrawableBalance } from './computeWithdrawableBalance';

describe('computeWithdrawableBalance', () => {
  it('returns full balance when no pending items', () => {
    expect(
      computeWithdrawableBalance({
        portfolioBalance: 1000,
        history: [],
      }),
    ).toEqual({
      portfolioBalance: 1000,
      pendingWithdrawals: 0,
      pendingFees: 0,
      pendingAdjustments: 0,
      availableForWithdrawal: 1000,
    });
  });

  it('subtracts pending withdrawals', () => {
    const result = computeWithdrawableBalance({
      portfolioBalance: 1000,
      history: [
        { movement: 'WITHDRAWAL', status: 'PENDING', amount: 200 },
        { movement: 'WITHDRAWAL', status: 'COMPLETED', amount: 50 },
      ],
    });
    expect(result.pendingWithdrawals).toBe(200);
    expect(result.availableForWithdrawal).toBe(800);
  });

  it('never returns negative available balance', () => {
    const result = computeWithdrawableBalance({
      portfolioBalance: 100,
      history: [{ movement: 'WITHDRAWAL', status: 'PENDING', amount: 500 }],
      pendingFees: 50,
    });
    expect(result.availableForWithdrawal).toBe(0);
  });
});
