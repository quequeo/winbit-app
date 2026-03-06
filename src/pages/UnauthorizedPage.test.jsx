import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedPage } from './UnauthorizedPage';

const mockLogout = vi.fn();
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import * as useAuthModule from '../hooks/useAuth';

describe('UnauthorizedPage', () => {
  beforeEach(() => {
    useAuthModule.useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      userEmail: 'test@example.com',
      logout: mockLogout,
    });
  });

  it('renders unauthorized message', () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows contact information', () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText(/winbit\.cfds@gmail\.com/)).toBeInTheDocument();
  });

  it('calls logout when button is clicked', async () => {
    render(<UnauthorizedPage />);
    const logoutButton = screen.getByText('Cerrar sesión');

    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows user email', () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText(/Cuenta actual/)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles logout error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failingLogout = vi.fn().mockRejectedValue(new Error('Logout failed'));
    useAuthModule.useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      userEmail: 'test@example.com',
      logout: failingLogout,
    });

    render(<UnauthorizedPage />);
    fireEvent.click(screen.getByText('Cerrar sesión'));
    await waitFor(() => {
      expect(failingLogout).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });
});
