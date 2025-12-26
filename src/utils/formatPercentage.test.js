import { describe, it, expect } from 'vitest';
import { formatPercentage } from './formatPercentage';

describe('formatPercentage', () => {
  it('formats positive percentages with + sign', () => {
    expect(formatPercentage(15.5)).toBe('+15.50%');
    expect(formatPercentage(100)).toBe('+100.00%');
  });

  it('formats negative percentages', () => {
    expect(formatPercentage(-10.5)).toBe('-10.50%');
    expect(formatPercentage(-0.01)).toBe('-0.01%');
  });

  it('formats zero', () => {
    expect(formatPercentage(0)).toBe('+0.00%');
  });

  it('handles null and undefined', () => {
    expect(formatPercentage(null)).toBe('0.00%');
    expect(formatPercentage(undefined)).toBe('0.00%');
  });

  it('formats decimals to 2 places', () => {
    expect(formatPercentage(12.3456)).toBe('+12.35%');
    expect(formatPercentage(-5.789)).toBe('-5.79%');
  });
});

