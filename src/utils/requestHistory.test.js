import { describe, it, expect } from 'vitest';
import {
  pendingHistoryId,
  parseRequestIdFromHistoryId,
  isRequestHistoryId,
  isPendingRequestRow,
  detectRequestTransitions,
  getPendingRequests,
  isCancelledRequestRow,
  isManageablePendingRequest,
  buildCorrectionHref,
  findCorrectableRequest,
  buildPendingSnapshot,
} from './requestHistory';

describe('requestHistory', () => {
  describe('pendingHistoryId / parseRequestIdFromHistoryId', () => {
    it('round-trips the request id as text', () => {
      expect(pendingHistoryId(42)).toBe('request_42');
      expect(parseRequestIdFromHistoryId('request_42')).toBe('42');
    });

    it('recognizes UUID ids that start with a letter', () => {
      const uuid = 'a3f1c2d4-5b6e-4f70-8a91-0b2c3d4e5f60';
      expect(parseRequestIdFromHistoryId(`request_${uuid}`)).toBe(uuid);
      expect(isRequestHistoryId(`request_${uuid}`)).toBe(true);
      expect(isPendingRequestRow({ id: `request_${uuid}`, status: 'PENDING' })).toBe(true);
    });

    it('returns null for non-request ids', () => {
      expect(parseRequestIdFromHistoryId('ph-881')).toBeNull();
      expect(parseRequestIdFromHistoryId('request_')).toBeNull();
      expect(isRequestHistoryId('ph-881')).toBe(false);
    });
  });

  it('detects the approval of a request with a UUID id', () => {
    const uuid = 'c7e2b1a0-1111-4222-8333-444455556666';
    const prev = [
      { id: `request_${uuid}`, movement: 'WITHDRAWAL', amount: 108, status: 'PENDING' },
    ];
    const next = [{ id: 'ph-1', movement: 'WITHDRAWAL', amount: 108, status: 'COMPLETED' }];
    expect(detectRequestTransitions(prev, next)).toEqual([
      {
        kind: 'approved',
        type: 'WITHDRAWAL',
        amount: 108,
        requestId: `request_${uuid}`,
        completedId: 'ph-1',
      },
    ]);
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

    it('leaves out requests cancelled by the investor', () => {
      const rows = [
        {
          id: 'request_1',
          movement: 'DEPOSIT',
          status: 'CANCELLED',
          amount: 100,
          date: '2026-01-01',
        },
        {
          id: 'request_2',
          movement: 'WITHDRAWAL',
          status: 'PENDING',
          amount: 50,
          date: '2026-01-02',
        },
      ];

      expect(getPendingRequests(rows).map((r) => r.id)).toEqual(['request_2']);
    });
  });

  describe('cancelled requests', () => {
    it('reports PENDING → CANCELLED as cancelled, not as rejected or approved', () => {
      const prev = [
        {
          id: 'request_a1b2',
          movement: 'WITHDRAWAL',
          status: 'PENDING',
          amount: 500,
          date: '2026-01-01',
        },
      ];
      const next = [
        {
          id: 'request_a1b2',
          movement: 'WITHDRAWAL',
          status: 'CANCELLED',
          amount: 500,
          date: '2026-01-01',
        },
      ];

      const transitions = detectRequestTransitions(prev, next);
      expect(transitions).toEqual([
        { kind: 'cancelled', type: 'WITHDRAWAL', amount: 500, requestId: 'request_a1b2' },
      ]);
    });

    it('reports a correction as cancelled original plus created replacement', () => {
      const prev = [
        {
          id: 'request_old',
          movement: 'DEPOSIT',
          status: 'PENDING',
          amount: 1000,
          date: '2026-01-01',
        },
      ];
      const next = [
        {
          id: 'request_old',
          movement: 'DEPOSIT',
          status: 'CANCELLED',
          amount: 1000,
          date: '2026-01-01',
        },
        {
          id: 'request_new',
          movement: 'DEPOSIT',
          status: 'PENDING',
          amount: 1200,
          date: '2026-01-02',
        },
      ];

      const kinds = detectRequestTransitions(prev, next).map((tr) => tr.kind);
      expect(kinds).toEqual(['cancelled', 'created']);
    });

    it('recognizes cancelled request rows in any case', () => {
      expect(isCancelledRequestRow({ id: 'request_1', status: 'CANCELLED' })).toBe(true);
      expect(isCancelledRequestRow({ id: 'request_1', status: 'cancelled' })).toBe(true);
      expect(isCancelledRequestRow({ id: 'ph-1', status: 'CANCELLED' })).toBe(false);
    });
  });

  describe('correction helpers', () => {
    const rows = [
      { id: 'request_dep', movement: 'DEPOSIT', status: 'PENDING', amount: 100 },
      { id: 'request_wd', movement: 'WITHDRAWAL', status: 'PENDING', amount: 50 },
      { id: 'request_old', movement: 'WITHDRAWAL', status: 'CANCELLED', amount: 70 },
    ];

    it('builds the form route for each request type', () => {
      expect(buildCorrectionHref(rows[0])).toBe('/wallets?correct=request_dep');
      expect(buildCorrectionHref(rows[1])).toBe('/requests?correct=request_wd');
    });

    it('finds only pending requests of the expected type', () => {
      expect(findCorrectableRequest(rows, 'request_dep', 'DEPOSIT')).toBe(rows[0]);
      expect(findCorrectableRequest(rows, 'request_dep', 'WITHDRAWAL')).toBeNull();
      expect(findCorrectableRequest(rows, 'request_old', 'WITHDRAWAL')).toBeNull();
      expect(findCorrectableRequest(rows, 'request_missing', 'DEPOSIT')).toBeNull();
      expect(findCorrectableRequest(null, 'request_dep', 'DEPOSIT')).toBeNull();
    });
  });

  describe('isManageablePendingRequest', () => {
    it('accepts pending deposit and withdrawal requests only', () => {
      expect(
        isManageablePendingRequest({ id: 'request_1', movement: 'DEPOSIT', status: 'PENDING' }),
      ).toBe(true);
      expect(
        isManageablePendingRequest({ id: 'request_2', movement: 'withdrawal', status: 'pending' }),
      ).toBe(true);
      expect(
        isManageablePendingRequest({ id: 'request_3', movement: 'DEPOSIT', status: 'CANCELLED' }),
      ).toBe(false);
      expect(
        isManageablePendingRequest({ id: 'request_4', movement: 'DEPOSIT', status: 'REJECTED' }),
      ).toBe(false);
      expect(
        isManageablePendingRequest({ id: 'ph-5', movement: 'TRADING_FEE', status: 'PENDING' }),
      ).toBe(false);
    });
  });

  describe('buildPendingSnapshot', () => {
    it('keeps only pending requests, with the fields needed to compare later', () => {
      const rows = [
        {
          id: 'request_1',
          movement: 'DEPOSIT',
          amount: 500,
          status: 'PENDING',
          date: '2026-11-16T13:00:00Z',
          method: 'CRYPTO',
        },
        {
          id: 'ph-1',
          movement: 'DEPOSIT',
          amount: 200,
          status: 'COMPLETED',
          date: '2026-11-01T13:00:00Z',
        },
      ];
      expect(buildPendingSnapshot(rows)).toEqual([
        {
          id: 'request_1',
          movement: 'DEPOSIT',
          amount: 500,
          status: 'PENDING',
          date: '2026-11-16T13:00:00Z',
        },
      ]);
    });

    it('lets the app detect an approval that happened while it was closed', () => {
      const before = [
        {
          id: 'request_9',
          movement: 'DEPOSIT',
          amount: 500,
          status: 'PENDING',
          date: '2026-11-16T13:00:00Z',
        },
      ];
      const snapshot = buildPendingSnapshot(before);
      const afterReopen = [
        {
          id: 'ph-77',
          movement: 'DEPOSIT',
          amount: 500,
          status: 'COMPLETED',
          date: '2026-11-16T21:00:00Z',
        },
      ];
      expect(detectRequestTransitions(snapshot, afterReopen).map((tr) => tr.kind)).toEqual([
        'approved',
      ]);
    });
  });
});
