import { describe, it, expect } from 'vitest';
import { truncateAddress } from './truncateAddress';

describe('truncateAddress', () => {
  it('truncates long addresses', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(truncateAddress(address)).toBe('0x1234...5678');
  });

  it('returns short addresses unchanged', () => {
    const address = '0x12345';
    expect(truncateAddress(address)).toBe('0x12345');
  });

  it('handles null and undefined', () => {
    expect(truncateAddress(null)).toBe('');
    expect(truncateAddress(undefined)).toBe('');
  });

  it('respects custom start and end chars', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    expect(truncateAddress(address, 4, 4)).toBe('0x12...5678');
    expect(truncateAddress(address, 10, 6)).toBe('0x12345678...345678');
  });

  it('handles empty string', () => {
    expect(truncateAddress('')).toBe('');
  });
});

