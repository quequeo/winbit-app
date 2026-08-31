import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

const ThrowChunkError = () => {
  throw new Error('Failed to fetch dynamically imported module: /assets/DashboardPage-xyz.js');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText('Recargar página')).toBeInTheDocument();
  });

  it('auto-reloads once on a stale chunk load error instead of showing the error card', () => {
    const reloadSpy = vi.fn();
    const locationSpy = vi
      .spyOn(globalThis, 'location', 'get')
      .mockReturnValue({ reload: reloadSpy });

    render(
      <ErrorBoundary>
        <ThrowChunkError />
      </ErrorBoundary>,
    );

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('winbit_chunk_reload_attempted')).toBe('1');
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument();

    locationSpy.mockRestore();
  });

  it('falls back to the error card if a chunk error persists after the reload attempt', () => {
    sessionStorage.setItem('winbit_chunk_reload_attempted', '1');

    render(
      <ErrorBoundary>
        <ThrowChunkError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });
});
