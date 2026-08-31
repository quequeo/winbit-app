import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildDashboardViewModel,
  buildRecentOperationsFromHistory,
  buildReportDownloadLabel,
  DASHBOARD_RECENT_CASH_MOVEMENTS_LIMIT,
  DASHBOARD_RECENT_OPERATIONS_LIMIT,
} from './dashboardViewModel';

vi.mock('../config/dashboardDemoData', () => ({
  DASHBOARD_DEMO_ENABLED: true,
  dashboardDemoData: {
    portfolioValue: 14714.57,
    capitalInvested: 15000,
    accumulatedReturnUsd: -285.43,
    accumulatedReturnPct: -1.9,
    monthReturnUsd: -100,
    monthReturnPct: -0.5,
    chartSeries: [
      { date: '2026-03-10', total: 15100 },
      { date: '2026-06-10', total: 14714.57 },
    ],
    recentMovements: [
      { id: 'd1', date: '2026-06-10', descriptionKey: 'demo', status: 'COMPLETED', amount: 0 },
    ],
    recentOperations: [
      { id: 'o1', date: '2026-06-10', asset: 'BTC', direction: 'LONG', resultUsd: 120 },
    ],
    lastUpdateLabel: 'demo',
    nextFeeCutLabel: 'demo',
    reportMonthLabel: 'demo',
    chartPeriodLabel: 'demo',
  },
}));

describe('buildDashboardViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses API balance and invested capital when available', () => {
    const vm = buildDashboardViewModel(
      {
        balance: 20000,
        totalInvested: 18000,
        strategyReturnAllUsd: 2000,
        strategyReturnAllPct: 11.11,
        lastUpdated: '2026-06-10T18:00:00.000Z',
      },
      [],
    );

    expect(vm.portfolioValue).toBe(20000);
    expect(vm.capitalInvested).toBe(18000);
    expect(vm.accumulatedReturnUsd).toBe(2000);
    expect(vm.accumulatedReturnPct).toBe(11.11);
  });

  it('falls back to demo chart and movements when history is empty', () => {
    const vm = buildDashboardViewModel(
      { balance: 1000, totalInvested: 900, lastUpdated: '2026-06-10T18:00:00.000Z' },
      [],
    );

    expect(vm.chartSeries).toHaveLength(2);
    expect(vm.recentMovements).toHaveLength(1);
    expect(vm.recentOperations).toHaveLength(1);
    expect(vm.usesDemoData).toBe(true);
  });

  it('uses real history for movements and operations when available', () => {
    const history = [
      {
        id: 'h1',
        date: '2026-06-17T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: 50.06,
        status: 'COMPLETED',
        newBalance: 14793.08,
      },
      {
        id: 'h2',
        date: '2026-06-16T17:00:00.000Z',
        movement: 'DEPOSIT',
        amount: 1000,
        status: 'COMPLETED',
        newBalance: 15793.08,
      },
      {
        id: 'h3',
        date: '2026-06-15T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: -56.85,
        status: 'COMPLETED',
        newBalance: 14743.02,
      },
      {
        id: 'h4',
        date: '2026-06-14T17:00:00.000Z',
        movement: 'WITHDRAWAL',
        amount: -500,
        status: 'COMPLETED',
        newBalance: 14799.87,
      },
      {
        id: 'h5',
        date: '2026-06-13T17:00:00.000Z',
        movement: 'TRADING_FEE',
        amount: -25,
        status: 'COMPLETED',
        newBalance: 15299.87,
      },
      {
        id: 'h6',
        date: '2026-06-12T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: -6.7,
        status: 'COMPLETED',
        newBalance: 15324.87,
      },
    ];

    const strategyOps = [
      {
        operationDate: '2026-06-17',
        asset: 'MES',
        direction: 'LONG',
      },
      {
        operationDate: '2026-06-15',
        asset: 'NQ',
        direction: 'SHORT',
      },
    ];

    const vm = buildDashboardViewModel(
      { balance: 14793.08, totalInvested: 15000, lastUpdated: '2026-06-17T20:10:45.914Z' },
      history,
      strategyOps,
    );

    expect(vm.recentMovements).toHaveLength(2);
    expect(vm.recentMovements[0].descriptionKey).toBe('history.movement.deposit');
    expect(vm.recentMovements[1].descriptionKey).toBe('history.movement.withdrawal');
    expect(vm.recentOperations[0].asset).toBe('SP500');
    expect(vm.recentOperations[0].assetLabel).toBe('MES — S&P 500');
    expect(vm.recentOperations[0].direction).toBe('LONG');
    expect(vm.recentOperations[0].resultUsd).toBe(50.06);
    expect(vm.recentOperations[1].asset).toBe('NASDAQ');
  });

  it('uses YTD for annual card (priority over annualReturn)', () => {
    const vm = buildDashboardViewModel(
      {
        balance: 20000,
        totalInvested: 18000,
        strategyReturnAllUsd: 2000,
        strategyReturnAllPct: 11.11,
        strategyReturnYtdUsd: 500,
        strategyReturnYtdPct: 2.5,
        annualReturnUsd: 800,
        annualReturnPct: 4.4,
        lastUpdated: '2026-07-10T18:00:00.000Z',
      },
      [],
    );

    expect(vm.yearReturnUsd).toBe(500);
    expect(vm.yearReturnPct).toBe(2.5);
  });

  it('falls back to annualReturn when YTD is zero', () => {
    const vm = buildDashboardViewModel(
      {
        balance: 20000,
        totalInvested: 18000,
        strategyReturnAllUsd: 2000,
        strategyReturnAllPct: 11.11,
        strategyReturnYtdUsd: 0,
        strategyReturnYtdPct: 0,
        annualReturnUsd: 800,
        annualReturnPct: 4.4,
        lastUpdated: '2026-07-10T18:00:00.000Z',
      },
      [],
    );

    expect(vm.yearReturnUsd).toBe(800);
    expect(vm.yearReturnPct).toBe(4.4);
  });

  it('labels month card with current calendar month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00.000Z'));
    const vm = buildDashboardViewModel(
      { balance: 1000, totalInvested: 1000, lastUpdated: '2026-07-15T18:00:00.000Z' },
      [],
    );
    expect(vm.reportMonthLabel).toBe('Julio 2026');
    vi.useRealTimers();
  });

  it('sums current-month operating results for month card', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-18T20:00:00.000Z'));
    const history = [
      {
        id: 'h1',
        date: '2026-07-10T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: 100,
        previousBalance: 1000,
        status: 'COMPLETED',
      },
      {
        id: 'h2',
        date: '2026-07-12T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: -40,
        previousBalance: 1100,
        status: 'COMPLETED',
      },
      {
        id: 'h3',
        date: '2026-06-12T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: 999,
        previousBalance: 500,
        status: 'COMPLETED',
      },
    ];
    const vm = buildDashboardViewModel(
      { balance: 1060, totalInvested: 1000, lastUpdated: '2026-07-18T18:00:00.000Z' },
      history,
    );
    expect(vm.monthReturnUsd).toBe(60);
    // Compounded: (1+100/1000)*(1-40/1100)-1 = 6%
    expect(vm.monthReturnPct).toBeCloseTo(6);
    expect(vm.reportMonthLabel).toBe('Julio 2026');
    vi.useRealTimers();
  });

  it('does not dilute month % by lifetime totalInvested', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-20T15:00:00.000Z'));
    const history = [
      {
        id: 'a1',
        date: '2026-08-03T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: -30,
        previousBalance: 3000,
        status: 'COMPLETED',
      },
      {
        id: 'a2',
        date: '2026-08-10T17:00:00.000Z',
        movement: 'OPERATING_RESULT',
        amount: 15,
        previousBalance: 2970,
        status: 'COMPLETED',
      },
    ];
    const vm = buildDashboardViewModel(
      { balance: 2985, totalInvested: 32854.9, lastUpdated: '2026-08-18T18:00:00.000Z' },
      history,
    );
    expect(vm.monthReturnUsd).toBe(-15);
    // Compounded ≈ -0.505%, NOT -15/32854 ≈ -0.046%
    expect(vm.monthReturnPct).toBeCloseTo((1 - 30 / 3000) * (1 + 15 / 2970) * 100 - 100, 4);
    expect(Math.abs(vm.monthReturnPct)).toBeGreaterThan(0.4);
    vi.useRealTimers();
  });

  it('builds report download label for previous month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00.000Z'));
    expect(buildReportDownloadLabel()).toBe('Junio 2026');
    vi.useRealTimers();
  });

  it('derives return from balance and invested when API return missing', () => {
    const vm = buildDashboardViewModel(
      { balance: 1100, totalInvested: 1000, lastUpdated: '2026-06-10T18:00:00.000Z' },
      [],
    );

    expect(vm.accumulatedReturnUsd).toBe(100);
    expect(vm.accumulatedReturnPct).toBeCloseTo(10);
  });
});

describe('buildRecentOperationsFromHistory', () => {
  it('merges strategy operations by date for asset labels', () => {
    const rows = buildRecentOperationsFromHistory(
      [{ date: '2026-06-16T17:00:00.000Z', movement: 'OPERATING_RESULT', amount: 50.71 }],
      [{ operationDate: '2026-06-16', asset: 'MES', direction: 'SHORT' }],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].asset).toBe('SP500');
    expect(rows[0].assetLabel).toBe('MES — S&P 500');
    expect(rows[0].direction).toBe('SHORT');
  });

  it('exposes dashboard list limits', () => {
    expect(DASHBOARD_RECENT_OPERATIONS_LIMIT).toBeGreaterThan(5);
    expect(DASHBOARD_RECENT_CASH_MOVEMENTS_LIMIT).toBeLessThanOrEqual(3);
  });
});
