import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('formats valid date strings', () => {
    const date = '2024-01-15T10:30:00.000Z';
    const result = formatDate(date);
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles null and undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('handles invalid date strings', () => {
    expect(formatDate('invalid')).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });

  it('handles empty string', () => {
    expect(formatDate('')).toBe('');
  });
});

