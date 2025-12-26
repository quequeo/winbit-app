import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';
import { beforeEach } from 'vitest';

vi.mock('../../hooks/useAuth');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {component}
    </BrowserRouter>,
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderWithRouter(<Header />);
    expect(screen.getByText('Winbit')).toBeInTheDocument();
  });

  it('renders navigation when user is logged in', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Wallets').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Requests').length).toBeGreaterThan(0);
  });

  it('does not render navigation when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderWithRouter(<Header />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      logout: mockLogout,
    });

    renderWithRouter(<Header />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('displays user email when logged in', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
