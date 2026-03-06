import { describe, it, expect } from 'vitest';
import { rangeStartMs } from './rangeStartMs';

const rangeOptions = [
  { key: '7D', kind: 'days', value: 7 },
  { key: '1M', kind: 'months', value: 1 },
  { key: '6M', kind: 'months', value: 6 },
  { key: '1Y', kind: 'years', value: 1 },
  { key: 'ALL', kind: 'all' },
];

describe('rangeStartMs', () => {
  it('returns null when opt not found', () => {
    expect(rangeStartMs(1000, 'INVALID', rangeOptions)).toBeNull();
  });

  it('returns null when endMs is not finite', () => {
    expect(rangeStartMs(NaN, '7D', rangeOptions)).toBeNull();
    expect(rangeStartMs(Infinity, '7D', rangeOptions)).toBeNull();
  });

  it('returns null for ALL kind', () => {
    expect(rangeStartMs(1000, 'ALL', rangeOptions)).toBeNull();
  });

  it('calculates days range', () => {
    const endMs = new Date('2024-01-15T12:00:00.000Z').getTime();
    const start = rangeStartMs(endMs, '7D', rangeOptions);
    const expected = endMs - 7 * 24 * 60 * 60 * 1000;
    expect(start).toBe(expected);
  });

  it('calculates months range', () => {
    const endMs = new Date('2024-06-15T12:00:00.000Z').getTime();
    const start = rangeStartMs(endMs, '6M', rangeOptions);
    const expected = new Date('2023-12-15T12:00:00.000Z').getTime();
    expect(start).toBe(expected);
  });

  it('calculates years range', () => {
    const endMs = new Date('2024-06-15T12:00:00.000Z').getTime();
    const start = rangeStartMs(endMs, '1Y', rangeOptions);
    const expected = new Date('2023-06-15T12:00:00.000Z').getTime();
    expect(start).toBe(expected);
  });

  it('returns null for unknown kind', () => {
    const opts = [{ key: 'X', kind: 'unknown' }];
    expect(rangeStartMs(1000, 'X', opts)).toBeNull();
  });
});
