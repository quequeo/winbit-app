import { describe, it, expect } from 'vitest';
import { getStatusConfig, getStatusLabel, sumPendingAmount } from './transactionHelpers';

const t = (key, fallback) => fallback ?? key;

describe('transactionHelpers', () => {
  describe('getStatusConfig', () => {
    it.each(['CANCELLED', 'cancelled', 'Cancelled'])(
      'maps %s to the cancelled badge for withdrawals and deposits',
      (raw) => {
        for (const type of ['default', 'deposit']) {
          const config = getStatusConfig(raw, type);
          expect(config.labelKey).toBe('common.status.cancelled');
          expect(config.cls).toBe('badge-cancelled');
          expect(getStatusLabel(config, t)).toBe('Cancelado');
        }
      },
    );
  });

  describe('sumPendingAmount', () => {
    it('does not count cancelled requests as pending', () => {
      const rows = [
        { movement: 'WITHDRAWAL', status: 'PENDING', amount: 100 },
        { movement: 'WITHDRAWAL', status: 'CANCELLED', amount: 400 },
        { movement: 'DEPOSIT', status: 'PENDING', amount: 50 },
      ];
      expect(sumPendingAmount(rows, 'WITHDRAWAL')).toBe(100);
    });
  });
});
