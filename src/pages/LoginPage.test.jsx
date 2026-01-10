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
    expect(screen.queryByText('Ingresar con Google')).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByText('Ingresar con Google'));

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
    fireEvent.click(screen.getByText('Ingresar con Google'));

    expect(await screen.findByText(/Este dominio no está autorizado/)).toBeInTheDocument();
    expect(screen.getByText(/\(auth\/unauthorized-domain\)/)).toBeInTheDocument();
  });

  it('shows popup closed error message', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/popup-closed-by-user', message: 'Popup closed' },
    });
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle,
    });

    renderAt('/login');
    fireEvent.click(screen.getByText('Ingresar con Google'));

    // App displays generic Spanish message + error code (match the actual error code)
    expect(
      await screen.findByText(/No se pudo iniciar sesión.*auth\/popup-closed-by-user/),
    ).toBeInTheDocument();
  });

  it('shows cancelled popup error message', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/cancelled-popup-request' },
    });
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle,
    });

    renderAt('/login');
    fireEvent.click(screen.getByText('Ingresar con Google'));

    // App displays generic Spanish message + error code
    expect(
      await screen.findByText(/No se pudo iniciar sesión.*auth\/cancelled-popup-request/),
    ).toBeInTheDocument();
  });

  it('shows generic error for unknown errors', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/unknown-error', message: 'Something went wrong' },
    });
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle,
    });

    renderAt('/login');
    fireEvent.click(screen.getByText('Ingresar con Google'));

    // App displays Spanish message + error code
    expect(
      await screen.findByText(/No se pudo iniciar sesión.*auth\/unknown-error/),
    ).toBeInTheDocument();
  });

  it('shows unauthorized investor message', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/unauthorized', message: 'Not an investor' },
    });
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      loginWithGoogle,
      validationError: 'Not an investor', // Should be a string, not an object
    });

    renderAt('/login');

    expect(screen.getByText(/Not an investor/)).toBeInTheDocument();
  });
});
