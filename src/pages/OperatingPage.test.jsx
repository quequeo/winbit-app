import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OperatingPage } from './OperatingPage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'test@example.com' } }),
}));

vi.mock('../hooks/useInvestorHistory', () => ({
  useInvestorHistory: vi.fn(),
}));

import * as useInvestorHistoryModule from '../hooks/useInvestorHistory';

describe('OperatingPage', () => {
  it('renders only operating_result rows and hides status column', () => {
    vi.mocked(useInvestorHistoryModule.useInvestorHistory).mockReturnValue({
      data: [
        {
          code: '001',
          date: '2025-12-02T17:00:00.000Z',
          movement: 'OPERATING_RESULT',
          amount: 10,
          previousBalance: 100,
          newBalance: 110,
          status: 'COMPLETED',
        },
        {
          code: '001',
          date: '2025-12-03T00:00:00.000Z',
          movement: 'DEPOSIT',
          amount: 1000,
          previousBalance: 110,
          newBalance: 1110,
          status: 'COMPLETED',
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<OperatingPage />);

    expect(screen.getByText('Operativa')).toBeInTheDocument();

    // Shows operating_result amount
    expect(screen.getAllByText(/\$10,00/).length).toBeGreaterThan(0);

    // Shows movement column/value
    expect(screen.getAllByText(/Resultado Operativo\s+\+10,00%/i).length).toBeGreaterThan(0);

    // Should not show deposit movement (since we filter)
    expect(screen.queryByText('Depósito')).not.toBeInTheDocument();

    // No status column header
    expect(screen.queryByText(/Estado/i)).not.toBeInTheDocument();
  });
});
