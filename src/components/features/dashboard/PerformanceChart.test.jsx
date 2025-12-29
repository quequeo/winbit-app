import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerformanceChart } from './PerformanceChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="rc">{children}</div>,
  LineChart: ({ children }) => <div data-testid="lc">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x" />,
  YAxis: () => <div data-testid="y" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tip" />,
}));

describe('PerformanceChart', () => {
  it('shows empty state when no data', () => {
    render(<PerformanceChart data={[]} />);
    expect(screen.getByText('Historial de Rendimiento')).toBeInTheDocument();
    expect(screen.getByText('No hay datos históricos disponibles')).toBeInTheDocument();
  });

  it('renders chart when data is present', () => {
    render(<PerformanceChart data={[{ date: 'Day 1', balance: 100 }]} />);
    expect(screen.getByText('Historial de Rendimiento')).toBeInTheDocument();
    expect(screen.getByTestId('rc')).toBeInTheDocument();
    expect(screen.getByTestId('lc')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });
});
