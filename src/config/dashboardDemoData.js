/** Demo data for dashboard sections when API/history has no rows yet. */
export const DASHBOARD_DEMO_ENABLED = import.meta.env.VITE_DASHBOARD_DEMO_DATA === 'true';

export const dashboardDemoData = {
  portfolioValue: 14714.57,
  capitalInvested: 15000,
  accumulatedReturnUsd: -285.43,
  accumulatedReturnPct: -1.9,
  monthReturnUsd: -285.43,
  monthReturnPct: -1.9,
  yearReturnUsd: -285.43,
  yearReturnPct: -1.9,
  lastUpdateLabel: '10 Jun 2026 · 18:00 · UTC-3',
  nextFeeCutLabel: '01 Jul 2026',
  reportMonthLabel: 'Junio 2026',
  chartPeriodLabel: '10 Mar 2026 – 10 Jun 2026',
  chartSeries: [
    { date: '2026-03-10', total: 15100 },
    { date: '2026-03-25', total: 15050 },
    { date: '2026-04-10', total: 14980 },
    { date: '2026-04-25', total: 14920 },
    { date: '2026-05-10', total: 14860 },
    { date: '2026-05-25', total: 14810 },
    { date: '2026-06-10', total: 14714.57 },
  ],
  recentMovements: [
    {
      id: 'demo-m2',
      date: '2026-06-02T12:00:00.000Z',
      descriptionKey: 'dashboard.demo.movements.deposit',
      status: 'COMPLETED',
      amount: 15000,
    },
    {
      id: 'demo-m3',
      date: '2026-05-20T12:00:00.000Z',
      descriptionKey: 'dashboard.demo.movements.withdrawalRaw',
      status: 'COMPLETED',
      amount: -2500,
    },
  ],
  recentOperations: [
    {
      id: 'demo-o1',
      date: '2026-06-10T11:20:00.000Z',
      asset: 'BTC',
      direction: 'LONG',
      resultUsd: 120,
    },
    {
      id: 'demo-o2',
      date: '2026-06-09T15:40:00.000Z',
      asset: 'SP500',
      direction: 'SHORT',
      resultUsd: -80,
    },
    {
      id: 'demo-o3',
      date: '2026-06-08T09:10:00.000Z',
      asset: 'BTC',
      direction: 'SHORT',
      resultUsd: 35,
    },
  ],
};
