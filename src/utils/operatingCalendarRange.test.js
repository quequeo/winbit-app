import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getOperatingCalendarRangeStartMs,
  getZonedYmd,
  isWithinOperatingCalendarRange,
  zonedMidnightMs,
} from './operatingCalendarRange';

describe('operatingCalendarRange', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts quarter range at first day of month two months ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-09T15:00:00.000Z'));

    const startMs = getOperatingCalendarRangeStartMs('3M');
    const startYmd = getZonedYmd(new Date(startMs));

    expect(startYmd).toEqual({ year: 2026, month: 5, day: 1 });
    expect(isWithinOperatingCalendarRange('2026-04-30T23:59:00.000Z', '3M')).toBe(false);
    expect(isWithinOperatingCalendarRange('2026-05-01T03:00:00.000Z', '3M')).toBe(true);
    expect(isWithinOperatingCalendarRange('2026-07-09T12:00:00.000Z', '3M')).toBe(true);
  });

  it('starts month range at first day of current month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-09T15:00:00.000Z'));

    const startMs = getOperatingCalendarRangeStartMs('1M');
    const startYmd = getZonedYmd(new Date(startMs));

    expect(startYmd).toEqual({ year: 2026, month: 7, day: 1 });
    expect(isWithinOperatingCalendarRange('2026-06-30T23:59:00.000Z', '1M')).toBe(false);
  });

  it('starts week range on Monday of current week', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-09T15:00:00.000Z'));

    const startMs = getOperatingCalendarRangeStartMs('7D');
    const startYmd = getZonedYmd(new Date(startMs));

    expect(startYmd).toEqual({ year: 2026, month: 7, day: 6 });
  });

  it('resolves midnight in Buenos Aires timezone', () => {
    const ms = zonedMidnightMs(2026, 7, 9);
    expect(getZonedYmd(new Date(ms))).toEqual({ year: 2026, month: 7, day: 9 });
  });
});
