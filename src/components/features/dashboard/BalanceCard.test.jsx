import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BalanceCard } from './BalanceCard';

describe('BalanceCard', () => {
  it('renders balance, invested, and returns', () => {
    render(
      <BalanceCard
        balance={10000}
        totalInvested={8000}
        returns={25}
      />
    );

    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
    expect(screen.getByText('$8,000.00')).toBeInTheDocument();
    expect(screen.getByText('+25.00%')).toBeInTheDocument();
  });

  it('renders negative returns in red', () => {
    const { container } = render(
      <BalanceCard
        balance={7000}
        totalInvested={8000}
        returns={-12.5}
      />
    );

    const returnsElement = screen.getByText('-12.50%');
    expect(returnsElement).toHaveClass('text-red-200');
  });

  it('renders positive returns in green', () => {
    const { container } = render(
      <BalanceCard
        balance={12000}
        totalInvested={8000}
        returns={50}
      />
    );

    const returnsElement = screen.getByText('+50.00%');
    expect(returnsElement).toHaveClass('text-green-200');
  });
});

