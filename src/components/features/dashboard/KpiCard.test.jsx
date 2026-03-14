import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('renders currency variant', () => {
    render(<KpiCard title="Balance" value={1000} variant="currency" />);
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument();
  });

  it('renders percentage variant', () => {
    render(<KpiCard title="Return" value={25.5} variant="percentage" />);
    expect(screen.getByText('+25.50%')).toBeInTheDocument();
  });

  it('renders default variant as string', () => {
    render(<KpiCard title="Count" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders highlighted when highlighted prop is true', () => {
    render(<KpiCard title="Total" value={100} variant="currency" highlighted />);
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('renders neutral tone', () => {
    render(<KpiCard title="Invested" value={500} variant="currency" tone="neutral" />);
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });
});
