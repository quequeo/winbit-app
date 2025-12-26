import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth');

const renderAt = (path) => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('LoginPage', () => {
  it('shows spinner while auth is loading', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
      loginWithGoogle: vi.fn(),
    });

    renderAt('/login');
    expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument();
  });

  it('redirects to dashboard when already logged in', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      loginWithGoogle: vi.fn(),
    });

    renderAt('/login');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('calls loginWithGoogle when clicking button', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({ user: {}, error: null });
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle,
    });

    renderAt('/login');
    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  it('shows a friendly error with firebase code', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/unauthorized-domain' },
    });
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle,
    });

    renderAt('/login');
    fireEvent.click(screen.getByText('Sign in with Google'));

    expect(await screen.findByText(/This domain is not authorized/)).toBeInTheDocument();
    expect(screen.getByText(/\(auth\/unauthorized-domain\)/)).toBeInTheDocument();
  });
});
