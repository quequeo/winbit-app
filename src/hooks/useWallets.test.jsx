import { renderHook, waitFor } from '../test/utils';
import { describe, it, expect, vi } from 'vitest';
import { useWallets } from './useWallets';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  getWallets: vi.fn(),
}));

describe('useWallets', () => {
  it('fetches wallets from API successfully', async () => {
    const mockWallets = [
      {
        network: 'USDT-TRC20',
        address: 'TXYZabc123',
        icon: '₮',
      },
    ];

    api.getWallets.mockResolvedValueOnce({
      data: mockWallets,
      error: null,
    });

    const { result } = renderHook(() => useWallets());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.wallets).toEqual(mockWallets);
    expect(result.current.error).toBeNull();
  });

  it('returns empty array when API fails', async () => {
    api.getWallets.mockResolvedValueOnce({
      data: null,
      error: 'Network error',
    });

    const { result } = renderHook(() => useWallets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.wallets).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('returns empty array when API returns empty data', async () => {
    api.getWallets.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const { result } = renderHook(() => useWallets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.wallets).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles API exception gracefully', async () => {
    api.getWallets.mockRejectedValueOnce(new Error('API crashed'));

    const { result } = renderHook(() => useWallets());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.wallets).toEqual([]);
    expect(result.current.error).toBe('API crashed');
  });
});
