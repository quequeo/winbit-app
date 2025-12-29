import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats positive numbers correctly (Argentine format)', () => {
    expect(formatCurrency(1000)).toBe('$1.000,00');
    expect(formatCurrency(1234.56)).toBe('$1.234,56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0,00');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-500)).toBe('-$500,00');
  });

  it('handles null and undefined', () => {
    expect(formatCurrency(null)).toBe('$0,00');
    expect(formatCurrency(undefined)).toBe('$0,00');
  });

  it('formats decimals correctly', () => {
    expect(formatCurrency(99.99)).toBe('$99,99');
    expect(formatCurrency(0.01)).toBe('$0,01');
  });

  it('shows positive sign when requested', () => {
    expect(formatCurrency(1000, true)).toBe('+$1.000,00');
    expect(formatCurrency(500.5, true)).toBe('+$500,50');
    expect(formatCurrency(0, true)).toBe('$0,00');
  });

  it('shows negative sign even when showSign is true', () => {
    expect(formatCurrency(-500, true)).toBe('-$500,00');
  });
});
