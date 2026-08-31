import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats positive numbers with USD prefix', () => {
    expect(formatCurrency(1000)).toBe('USD 1.000,00');
    expect(formatCurrency(1234.56)).toBe('USD 1.234,56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('USD 0,00');
  });

  it('formats negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-USD 500,00');
  });

  it('handles null and undefined', () => {
    expect(formatCurrency(null)).toBe('USD 0,00');
    expect(formatCurrency(undefined)).toBe('USD 0,00');
  });

  it('formats decimal numbers correctly', () => {
    expect(formatCurrency(99.99)).toBe('USD 99,99');
    expect(formatCurrency(0.01)).toBe('USD 0,01');
  });

  it('shows + sign for positive when showSign is true', () => {
    expect(formatCurrency(1000, true)).toBe('+USD 1.000,00');
    expect(formatCurrency(500.5, true)).toBe('+USD 500,50');
    expect(formatCurrency(0, true)).toBe('USD 0,00');
  });

  it('shows - sign for negative when showSign is true', () => {
    expect(formatCurrency(-500, true)).toBe('-USD 500,00');
  });
});
