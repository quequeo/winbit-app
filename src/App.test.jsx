import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

vi.mock('./components/features/auth/AuthProvider', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock('./components/layout/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }) => <div>{children}</div>,
}));

vi.mock('./components/layout/Header', () => ({
  Header: () => <div>Header</div>,
}));

vi.mock('./components/layout/Footer', () => ({
  Footer: () => <div>Footer</div>,
}));

vi.mock('./pages/LoginPage', () => ({
  LoginPage: () => <div>Login</div>,
}));

vi.mock('./pages/DashboardPage', () => ({
  DashboardPage: () => <div>Dashboard</div>,
}));

vi.mock('./pages/WalletsPage', () => ({
  WalletsPage: () => <div>Wallets</div>,
}));

vi.mock('./pages/RequestsPage', () => ({
  RequestsPage: () => <div>Requests</div>,
}));

describe('App', () => {
  it('renders login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders protected layout for dashboard route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
