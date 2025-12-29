import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnauthorizedPage } from './UnauthorizedPage';

// Mock useAuth
const mockLogout = vi.fn();
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    logout: mockLogout,
  }),
}));

describe('UnauthorizedPage', () => {
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
});
