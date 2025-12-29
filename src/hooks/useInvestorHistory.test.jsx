import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInvestorHistory } from './useInvestorHistory';
import { getInvestorHistory } from '../services/sheets';

vi.mock('../services/sheets', () => ({
  getInvestorHistory: vi.fn(),
}));

describe('useInvestorHistory', () => {
  it('does not fetch when email is missing', async () => {
    const { result } = renderHook(() => useInvestorHistory(undefined));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getInvestorHistory).not.toHaveBeenCalled();
  });

  it('fetches data and returns it', async () => {
    getInvestorHistory.mockResolvedValueOnce({
      data: [{ code: '008', date: '2024-01-01T00:00:00.000Z' }],
      error: null,
    });

    const { result } = renderHook(() => useInvestorHistory('test@example.com'));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toHaveLength(1);
  });

  it('handles service error', async () => {
    getInvestorHistory.mockResolvedValueOnce({ data: null, error: 'Boom' });
    const { result } = renderHook(() => useInvestorHistory('test@example.com'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Boom');
  });

  it('refetch triggers another request', async () => {
    getInvestorHistory
      .mockResolvedValueOnce({ data: [{ code: '1' }], error: null })
      .mockResolvedValueOnce({ data: [{ code: '2' }], error: null });

    const { result } = renderHook(() => useInvestorHistory('test@example.com'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data[0].code).toBe('1');

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => {
      expect(result.current.data[0].code).toBe('2');
    });
  });
});
