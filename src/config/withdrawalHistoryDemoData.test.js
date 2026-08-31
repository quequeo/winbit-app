import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isWithdrawalHistoryDemoEnabled,
  withdrawalHistoryDemoData,
} from './withdrawalHistoryDemoData';

describe('withdrawalHistoryDemoData', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    import.meta.env.DEV = true;
    import.meta.env.VITE_WITHDRAWAL_HISTORY_DEMO = undefined;
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'false';
  });

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv);
  });

  it('exposes four showcase withdrawals', () => {
    expect(withdrawalHistoryDemoData).toHaveLength(4);
    expect(withdrawalHistoryDemoData.map((r) => r.status)).toEqual([
      'COMPLETED',
      'COMPLETED',
      'PENDING',
      'REJECTED',
    ]);
  });

  it('is disabled in production', () => {
    import.meta.env.DEV = false;
    import.meta.env.VITE_WITHDRAWAL_HISTORY_DEMO = 'true';
    expect(isWithdrawalHistoryDemoEnabled()).toBe(false);
  });

  it('is enabled only when VITE_WITHDRAWAL_HISTORY_DEMO is true', () => {
    import.meta.env.VITE_WITHDRAWAL_HISTORY_DEMO = 'true';
    expect(isWithdrawalHistoryDemoEnabled()).toBe(true);
  });

  it('stays disabled when only bypass is on', () => {
    import.meta.env.VITE_WITHDRAWAL_HISTORY_DEMO = undefined;
    import.meta.env.VITE_DEV_BYPASS_AUTH = 'true';
    expect(isWithdrawalHistoryDemoEnabled()).toBe(false);
  });
});
