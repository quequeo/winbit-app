import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PerformanceChart } from './PerformanceChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="rc">{children}</div>,
  LineChart: ({ children }) => <div data-testid="lc">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bc">{children}</div>,
  Bar: ({ children }) => <div data-testid="bar">{children}</div>,
  Cell: () => <div data-testid="cell" />,
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

  it('renders fallback line chart when data is present', () => {
    render(<PerformanceChart data={[{ date: 'Day 1', balance: 100 }]} />);
    expect(screen.getByText('Historial de Rendimiento')).toBeInTheDocument();
    expect(screen.getByTestId('rc')).toBeInTheDocument();
    expect(screen.getByTestId('lc')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('renders gains bar chart when history rows are present', () => {
    render(
      <PerformanceChart
        data={[]}
        historyLoading={false}
        historyRows={[
          {
            date: '2024-01-10T00:00:00.000Z',
            movement: 'Depósito',
            amount: 100,
            previousBalance: 0,
            newBalance: 100,
            status: 'Completado',
          },
          {
            date: '2024-02-10T00:00:00.000Z',
            movement: 'Rendimiento',
            amount: 0,
            previousBalance: 100,
            newBalance: 120,
            status: 'Completado',
          },
        ]}
      />,
    );

    expect(screen.getByText('Historial de Rendimiento')).toBeInTheDocument();
    expect(screen.getByText('Ganancia del período')).toBeInTheDocument();
    expect(screen.getByTestId('bc')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });
});
