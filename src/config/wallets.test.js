import { describe, it, expect } from 'vitest';
import { WALLETS } from './wallets';

describe('WALLETS config', () => {
  it('exports an array of wallets', () => {
    expect(Array.isArray(WALLETS)).toBe(true);
    expect(WALLETS.length).toBeGreaterThan(0);
  });

  it('each wallet has required properties', () => {
    WALLETS.forEach((wallet) => {
      expect(wallet).toHaveProperty('network');
      expect(wallet).toHaveProperty('address');
      expect(wallet).toHaveProperty('icon');
    });
  });
});
