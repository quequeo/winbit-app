import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HistoryPage } from './HistoryPage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' } }),
}));

vi.mock('../hooks/useInvestorHistory', () => ({
  useInvestorHistory: () => ({
    data: [
      {
        code: '008',
        date: '2024-04-15T00:00:00.000Z',
        movement: 'Depósito',
        amount: 10000,
        previousBalance: 25000,
        newBalance: 35000,
        status: 'Completado',
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('HistoryPage', () => {
  it('renders table with history rows', () => {
    render(<HistoryPage />);
    expect(screen.getByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('Depósito')).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    expect(screen.getByText('Completado')).toBeInTheDocument();
  });
});
