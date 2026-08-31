import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';
import { useInvestorHistory } from '../../hooks/useInvestorHistory';

vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useInvestorHistory');

const renderWithRouter = (component) =>
  render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {component}
    </BrowserRouter>,
  );

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useInvestorHistory.mockReturnValue({ data: [], loading: false, error: null });
  });

  it('renders logo', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderWithRouter(<Header />);
    expect(screen.getByAltText('Winbit')).toBeInTheDocument();
  });

  it('renders navigation when user is logged in', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      userEmail: 'test@example.com',
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);
    expect(screen.getAllByText('Inicio').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Depósitos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Retiros').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Movimientos').length).toBeGreaterThan(0);
    expect(screen.queryByText('Reportes')).not.toBeInTheDocument();
  });

  it('does not render navigation when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    renderWithRouter(<Header />);
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
  });

  it('opens account menu and logs out', () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      userEmail: 'test@example.com',
      logout: mockLogout,
    });

    renderWithRouter(<Header />);
    fireEvent.click(screen.getByLabelText('Menú de cuenta'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Salir' })[0]);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('switches language when ES/EN buttons clicked', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      userEmail: 'test@example.com',
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);
    fireEvent.click(screen.getByLabelText('Abrir menú'));

    const enButton = screen.getAllByRole('button', { name: 'EN' })[0];
    const esButton = screen.getAllByRole('button', { name: 'ES' })[0];
    fireEvent.click(enButton);
    fireEvent.click(esButton);
    expect(enButton).toBeInTheDocument();
    expect(esButton).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    useAuth.mockReturnValue({
      user: { email: 'test@example.com' },
      userEmail: 'test@example.com',
      logout: vi.fn(),
    });

    renderWithRouter(<Header />);

    const menuButton = screen.getByLabelText('Abrir menú');
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });
});
