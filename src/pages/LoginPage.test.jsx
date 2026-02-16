import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useAuth } from '../hooks/useAuth';

vi.mock('../hooks/useAuth');

const defaultMock = {
  user: null,
  loading: false,
  loginWithGoogle: vi.fn().mockResolvedValue({ user: {}, error: null }),
  loginWithEmail: vi.fn().mockResolvedValue({ user: {}, error: null }),
  clearValidationError: vi.fn(),
  validationError: null,
};

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

const switchToGoogleTab = () => {
  fireEvent.click(screen.getByText('Google'));
};

describe('LoginPage', () => {
  it('shows spinner while auth is loading', () => {
    useAuth.mockReturnValue({ ...defaultMock, loading: true });

    renderAt('/login');
    expect(screen.queryByText('Ingresar con Google')).not.toBeInTheDocument();
  });

  it('redirects to dashboard when already logged in', () => {
    useAuth.mockReturnValue({ ...defaultMock, user: { email: 'test@example.com' } });

    renderAt('/login');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows email/password form by default', () => {
    useAuth.mockReturnValue(defaultMock);

    renderAt('/login');
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('calls loginWithEmail on email form submit', async () => {
    const loginWithEmail = vi.fn().mockResolvedValue({ user: {}, error: null });
    useAuth.mockReturnValue({ ...defaultMock, loginWithEmail });

    renderAt('/login');
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(loginWithEmail).toHaveBeenCalledWith('test@example.com', 'secret123');
    });
  });

  it('shows email login error', async () => {
    const loginWithEmail = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/invalid-credentials', message: 'Credenciales inválidas' },
    });
    useAuth.mockReturnValue({ ...defaultMock, loginWithEmail });

    renderAt('/login');
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('calls loginWithGoogle when clicking Google button', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({ user: {}, error: null });
    useAuth.mockReturnValue({ ...defaultMock, loginWithGoogle });

    renderAt('/login');
    switchToGoogleTab();
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
    useAuth.mockReturnValue({ ...defaultMock, loginWithGoogle });

    renderAt('/login');
    switchToGoogleTab();
    fireEvent.click(screen.getByText('Ingresar con Google'));

    expect(await screen.findByText(/Este dominio no está autorizado/)).toBeInTheDocument();
    expect(screen.getByText(/\(auth\/unauthorized-domain\)/)).toBeInTheDocument();
  });

  it('shows popup closed error message', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/popup-closed-by-user', message: 'Popup closed' },
    });
    useAuth.mockReturnValue({ ...defaultMock, loginWithGoogle });

    renderAt('/login');
    switchToGoogleTab();
    fireEvent.click(screen.getByText('Ingresar con Google'));

    expect(
      await screen.findByText(/No se pudo iniciar sesión.*auth\/popup-closed-by-user/),
    ).toBeInTheDocument();
  });

  it('shows cancelled popup error message', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/cancelled-popup-request' },
    });
    useAuth.mockReturnValue({ ...defaultMock, loginWithGoogle });

    renderAt('/login');
    switchToGoogleTab();
    fireEvent.click(screen.getByText('Ingresar con Google'));

    expect(
      await screen.findByText(/No se pudo iniciar sesión.*auth\/cancelled-popup-request/),
    ).toBeInTheDocument();
  });

  it('shows generic error for unknown errors', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValue({
      user: null,
      error: { code: 'auth/unknown-error', message: 'Something went wrong' },
    });
    useAuth.mockReturnValue({ ...defaultMock, loginWithGoogle });

    renderAt('/login');
    switchToGoogleTab();
    fireEvent.click(screen.getByText('Ingresar con Google'));

    expect(
      await screen.findByText(/No se pudo iniciar sesión.*auth\/unknown-error/),
    ).toBeInTheDocument();
  });

  it('shows unauthorized investor message', async () => {
    useAuth.mockReturnValue({
      ...defaultMock,
      validationError: 'Not an investor',
    });

    renderAt('/login');
    expect(screen.getByText(/Not an investor/)).toBeInTheDocument();
  });
});
