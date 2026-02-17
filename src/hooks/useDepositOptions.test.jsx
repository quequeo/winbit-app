import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDepositOptions } from './useDepositOptions';
import { getDepositOptions } from '../services/api';

vi.mock('../services/api', () => ({
  getDepositOptions: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
};

describe('useDepositOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns deposit options on success', async () => {
    const mockData = [
      { id: '1', category: 'BANK_ARS', label: 'Galicia', currency: 'ARS', details: {} },
    ];
    getDepositOptions.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => useDepositOptions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.depositOptions).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('returns error on failure', async () => {
    getDepositOptions.mockResolvedValue({ data: null, error: 'Network error' });

    const { result } = renderHook(() => useDepositOptions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.depositOptions).toEqual([]);
  });

  it('starts in loading state', () => {
    getDepositOptions.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useDepositOptions(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
    expect(result.current.depositOptions).toEqual([]);
  });
});
