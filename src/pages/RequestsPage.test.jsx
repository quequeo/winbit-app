import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequestsPage } from './RequestsPage';
import { useAuth } from '../hooks/useAuth';
import { useInvestorData } from '../hooks/useInvestorData';

vi.mock('../hooks/useAuth');
vi.mock('../hooks/useInvestorData');

describe('RequestsPage', () => {
  it('shows spinner while loading', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com' } });
    useInvestorData.mockReturnValue({ data: null, loading: true, error: null, refetch: vi.fn() });
    render(<RequestsPage />);
    expect(screen.queryByText('Requests')).not.toBeInTheDocument();
  });

  it('renders both forms when loaded', () => {
    useAuth.mockReturnValue({ user: { email: 'test@example.com', displayName: 'Juan' } });
    useInvestorData.mockReturnValue({
      data: { name: 'Juan', balance: 123 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<RequestsPage />);
    expect(screen.getByText('Requests')).toBeInTheDocument();
    expect(screen.getByText('Request Withdrawal')).toBeInTheDocument();
    expect(screen.getByText('Notify Deposit')).toBeInTheDocument();
  });
});
