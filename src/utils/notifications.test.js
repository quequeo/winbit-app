import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildNotificationItems,
  dismissNotificationId,
  getDismissedNotificationIds,
  NOTIFICATION_RECENT_LIMIT,
} from './notifications';

const t = (key) => key;

describe('notifications', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear?.();
  });

  it('includes pending, rejected and completed capital activity', () => {
    const items = buildNotificationItems(
      [
        {
          id: '1',
          movement: 'DEPOSIT',
          status: 'PENDING',
          amount: 100,
          date: '2026-07-01T10:00:00.000Z',
        },
        {
          id: '2',
          movement: 'WITHDRAWAL',
          status: 'REJECTED',
          amount: 250.5,
          date: '2026-07-02T10:00:00.000Z',
        },
        {
          id: '3',
          movement: 'DEPOSIT',
          status: 'COMPLETED',
          amount: 500,
          date: '2026-07-03T10:00:00.000Z',
        },
        {
          id: '4',
          movement: 'OPERATING_RESULT',
          status: 'COMPLETED',
          date: '2026-07-04T10:00:00.000Z',
        },
        {
          id: '5',
          movement: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount: 80,
          date: '2026-07-05T10:00:00.000Z',
        },
      ],
      t,
    );

    expect(items).toHaveLength(4);
    expect(items[0].id).toBe('5');
    expect(items[0].title).toBe('notifications.items.withdrawalCompleted');
    expect(items[0].status).toBe('COMPLETED');
    expect(items[1].id).toBe('3');
    expect(items[1].title).toBe('notifications.items.depositCompleted');
    expect(items[2].id).toBe('2');
    expect(items[3].id).toBe('1');
  });

  it('keeps completed withdrawals after they finish (does not drop them)', () => {
    const items = buildNotificationItems(
      [
        {
          id: 'w1',
          movement: 'WITHDRAWAL',
          status: 'COMPLETED',
          amount: 200,
          date: '2026-08-20T10:00:00.000Z',
        },
      ],
      t,
    );
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('notifications.items.withdrawalCompleted');
    expect(items[0].statusLabel).toBe('common.status.completed');
  });

  it('limits to the most recent capital notifications so old rejections drop off', () => {
    const ordered = [
      {
        id: 'old-rejected',
        movement: 'DEPOSIT',
        status: 'REJECTED',
        amount: 50,
        date: '2026-04-01T10:00:00.000Z',
      },
      ...Array.from({ length: NOTIFICATION_RECENT_LIMIT }, (_, i) => ({
        id: `recent-${i}`,
        movement: 'DEPOSIT',
        status: 'COMPLETED',
        amount: 100 + i,
        date: `2026-08-${String(i + 1).padStart(2, '0')}T10:00:00.000Z`,
      })),
    ];

    const items = buildNotificationItems(ordered, t);
    expect(items).toHaveLength(NOTIFICATION_RECENT_LIMIT);
    expect(items.some((item) => item.id === 'old-rejected')).toBe(false);
    expect(items[0].id).toBe(`recent-${NOTIFICATION_RECENT_LIMIT - 1}`);
  });

  it('hides dismissed notification ids', () => {
    dismissNotificationId('1');
    expect(getDismissedNotificationIds()).toContain('1');

    const items = buildNotificationItems(
      [{ id: '1', movement: 'DEPOSIT', status: 'PENDING', date: '2026-07-01T10:00:00.000Z' }],
      t,
    );
    expect(items).toHaveLength(0);
  });
});
