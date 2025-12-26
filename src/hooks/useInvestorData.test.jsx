import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInvestorData } from './useInvestorData';
import { getInvestorData } from '../services/sheets';

vi.mock('../services/sheets', () => ({
  getInvestorData: vi.fn(),
}));

describe('useInvestorData', () => {
  it('does not fetch when email is missing', async () => {
    const { result } = renderHook(() => useInvestorData(undefined));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(getInvestorData).not.toHaveBeenCalled();
  });

  it('fetches data and returns it', async () => {
    getInvestorData.mockResolvedValueOnce({
      data: { email: 'test@example.com', name: 'Test' },
      error: null,
    });

    const { result } = renderHook(() => useInvestorData('test@example.com'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ email: 'test@example.com', name: 'Test' });
  });

  it('handles service error', async () => {
    getInvestorData.mockResolvedValueOnce({ data: null, error: 'Boom' });
    const { result } = renderHook(() => useInvestorData('test@example.com'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Boom');
  });

  it('refetch triggers another request', async () => {
    getInvestorData
      .mockResolvedValueOnce({ data: { name: 'First' }, error: null })
      .mockResolvedValueOnce({ data: { name: 'Second' }, error: null });

    const { result } = renderHook(() => useInvestorData('test@example.com'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data.name).toBe('First');

    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => {
      expect(result.current.data.name).toBe('Second');
    });
  });
});
