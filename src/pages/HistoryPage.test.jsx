import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HistoryPage } from './HistoryPage';
import { within } from '@testing-library/react';

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
      {
        code: '008',
        date: '2024-03-15T00:00:00.000Z',
        movement: 'Retiro',
        amount: 5000,
        previousBalance: 30000,
        newBalance: 25000,
        status: 'Pendiente',
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('HistoryPage', () => {
  it('renders mobile cards with history rows', () => {
    render(<HistoryPage />);
    expect(screen.getByText('Historial')).toBeInTheDocument();

    const mobile = screen.getByTestId('history-mobile');
    expect(within(mobile).getByText('Depósito')).toBeInTheDocument();
    expect(within(mobile).getByText('$10.000,00')).toBeInTheDocument();
    expect(within(mobile).getByText('Completado')).toBeInTheDocument();

    // Sorted by most recent first
    const cards = within(mobile).getAllByText(/Depósito|Retiro/);
    expect(cards[0].textContent).toBe('Depósito');
  });
});
