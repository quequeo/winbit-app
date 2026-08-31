import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDelayedLoading } from './useDelayedLoading';

describe('useDelayedLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show loading before delay', () => {
    const { result } = renderHook(() => useDelayedLoading(true, 300));
    expect(result.current).toBe(false);
  });

  it('shows loading after delay', () => {
    const { result } = renderHook(() => useDelayedLoading(true, 300));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(true);
  });

  it('hides loading immediately when loading stops', () => {
    const { result, rerender } = renderHook(({ loading }) => useDelayedLoading(loading, 300), {
      initialProps: { loading: true },
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(true);
    rerender({ loading: false });
    expect(result.current).toBe(false);
  });
});
