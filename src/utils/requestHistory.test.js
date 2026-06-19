import { describe, it, expect } from 'vitest';
import {
  pendingHistoryId,
  parseRequestIdFromHistoryId,
  isRequestHistoryId,
  isPendingRequestRow,
  detectRequestTransitions,
  getPendingRequests,
} from './requestHistory';

describe('requestHistory', () => {
  describe('pendingHistoryId / parseRequestIdFromHistoryId', () => {
    it('round-trips numeric request id', () => {
      expect(pendingHistoryId(42)).toBe('request_42');
      expect(parseRequestIdFromHistoryId('request_42')).toBe(42);
    });

    it('returns null for non-request ids', () => {
      expect(parseRequestIdFromHistoryId('ph-881')).toBeNull();
      expect(isRequestHistoryId('ph-881')).toBe(false);
    });
  });

  describe('isPendingRequestRow', () => {
    it('identifies pending request rows', () => {
      expect(
        isPendingRequestRow({
          id: 'request_1',
          movement: 'DEPOSIT',
          status: 'PENDING',
          amount: 100,
        }),
      ).toBe(true);

      expect(
        isPendingRequestRow({
          id: 'ph-1',
          movement: 'DEPOSIT',
          status: 'COMPLETED',
          amount: 100,
        }),
      ).toBe(false);
    });
  });

  describe('detectRequestTransitions', () => {
    it('detects PENDING → REJECTED on same id', () => {
      const prev = [
        {
          id: 'request_42',
          movement: 'DEPOSIT',
          status: 'PENDING',
          amount: 1000,
          date: '2026-01-01',
        },
      ];
      const next = [
        {
          id: 'request_42',
          movement: 'DEPOSIT',
          status: 'REJECTED',
          amount: 1000,
          date: '2026-01-01',
        },
      ];

      expect(detectRequestTransitions(prev, next)).toEqual([
        {
          kind: 'rejected',
          type: 'DEPOSIT',
          amount: 1000,
          requestId: 'request_42',
        },
      ]);
    });

    it('detects approval when pending disappears and COMPLETED appears with new id', () => {
      const prev = [
        {
          id: 'request_42',
          movement: 'DEPOSIT',
          status: 'PENDING',
          amount: 1000,
          date: '2026-01-01',
        },
      ];
      const next = [
        {
          id: 'ph-881',
          movement: 'DEPOSIT',
          status: 'COMPLETED',
          amount: 1000,
          date: '2026-01-02',
        },
      ];

      expect(detectRequestTransitions(prev, next)).toEqual([
        {
          kind: 'approved',
          type: 'DEPOSIT',
          amount: 1000,
          requestId: 'request_42',
          completedId: 'ph-881',
        },
      ]);
    });

    it('detects newly created pending request', () => {
      const prev = [];
      const next = [
        {
          id: 'request_99',
          movement: 'WITHDRAWAL',
          status: 'PENDING',
          amount: 500,
          date: '2026-01-01',
        },
      ];

      expect(detectRequestTransitions(prev, next)).toEqual([
        {
          kind: 'created',
          type: 'WITHDRAWAL',
          amount: 500,
          requestId: 'request_99',
        },
      ]);
    });
  });

  describe('getPendingRequests', () => {
    it('returns only pending request rows sorted by date desc', () => {
      const rows = [
        {
          id: 'request_1',
          movement: 'DEPOSIT',
          status: 'PENDING',
          amount: 100,
          date: '2026-01-01',
        },
        { id: 'ph-2', movement: 'DEPOSIT', status: 'COMPLETED', amount: 200, date: '2026-01-03' },
        {
          id: 'request_3',
          movement: 'WITHDRAWAL',
          status: 'PENDING',
          amount: 50,
          date: '2026-01-05',
        },
      ];

      const pending = getPendingRequests(rows);
      expect(pending).toHaveLength(2);
      expect(pending[0].id).toBe('request_3');
      expect(pending[1].id).toBe('request_1');
    });
  });
});
