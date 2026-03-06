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

vi.mock('./pages/HistoryPage', () => ({
  HistoryPage: () => <div>History</div>,
}));

vi.mock('./pages/OperatingPage', () => ({
  OperatingPage: () => <div>Operating</div>,
}));

vi.mock('./pages/ChangePasswordPage', () => ({
  ChangePasswordPage: () => <div>ChangePassword</div>,
}));

describe('App', () => {
  it('renders login route', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Login')).toBeInTheDocument();
  });

  it('renders protected layout for dashboard route', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders wallets route', async () => {
    render(
      <MemoryRouter initialEntries={['/wallets']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Wallets')).toBeInTheDocument();
  });

  it('renders requests route', async () => {
    render(
      <MemoryRouter initialEntries={['/requests']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Requests')).toBeInTheDocument();
  });

  it('renders history route', async () => {
    render(
      <MemoryRouter initialEntries={['/history']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('History')).toBeInTheDocument();
  });

  it('renders operational route', async () => {
    render(
      <MemoryRouter initialEntries={['/operational']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Operating')).toBeInTheDocument();
  });

  it('renders change-password route', async () => {
    render(
      <MemoryRouter initialEntries={['/change-password']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByText('ChangePassword')).toBeInTheDocument();
  });
});
