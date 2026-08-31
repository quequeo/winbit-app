import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangePasswordPage } from './ChangePasswordPage';
import { ToastProvider } from '../components/ui/ToastProvider';
import * as useAuthModule from '../hooks/useAuth';
import * as apiModule from '../services/api';

vi.mock('../hooks/useAuth');
vi.mock('../services/api');

const useAuth = vi.spyOn(useAuthModule, 'useAuth');
const changeInvestorPassword = vi.spyOn(apiModule, 'changeInvestorPassword');

const renderPage = () =>
  render(
    <ToastProvider>
      <ChangePasswordPage />
    </ToastProvider>,
  );

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', authMethod: 'email' },
      userEmail: 'test@example.com',
    });
  });

  it('renders form with all fields', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument();
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar contraseña' })).toBeInTheDocument();
  });

  it('shows google info and hides form when user signed in with Google', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com', authMethod: 'google' },
      userEmail: 'test@example.com',
    });
    renderPage();
    expect(screen.getByText(/Iniciaste sesión con Google/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument();
  });

  it('does not show google info banner for email users', () => {
    renderPage();
    expect(screen.queryByText(/Iniciaste sesión con Google/)).not.toBeInTheDocument();
  });

  it('shows mismatch error when passwords do not match', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    });
    expect(changeInvestorPassword).not.toHaveBeenCalled();
  });

  it('shows too short error when new password is less than 6 chars', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(
        screen.getByText('La contraseña debe tener al menos 6 caracteres.'),
      ).toBeInTheDocument();
    });
    expect(changeInvestorPassword).not.toHaveBeenCalled();
  });

  it('calls changeInvestorPassword and shows success toast on submit', async () => {
    changeInvestorPassword.mockResolvedValue({ success: true, error: null });

    renderPage();
    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(changeInvestorPassword).toHaveBeenCalledWith(
        'test@example.com',
        'oldpass123',
        'newpass123',
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Tu contraseña fue actualizada correctamente.')).toBeInTheDocument();
    });
  });

  it('shows error when API returns error', async () => {
    changeInvestorPassword.mockResolvedValue({
      success: false,
      error: 'Contraseña actual incorrecta',
    });

    renderPage();
    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(screen.getByText('Contraseña actual incorrecta')).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    let resolveChangePassword;
    changeInvestorPassword.mockImplementation(
      () =>
        new Promise((r) => {
          resolveChangePassword = r;
        }),
    );

    renderPage();
    fireEvent.change(screen.getByLabelText('Contraseña actual'), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText('Nueva contraseña'), {
      target: { value: 'newpass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nueva contraseña'), {
      target: { value: 'newpass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
    });

    resolveChangePassword({ success: true, error: null });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cambiar contraseña' })).not.toBeDisabled();
    });
  });
});
