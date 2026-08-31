/** Demo de retiros solo con flag explícito en dev (nunca por bypass solo). */
export const isWithdrawalHistoryDemoEnabled = () => {
  if (!import.meta.env.DEV) return false;
  return import.meta.env.VITE_WITHDRAWAL_HISTORY_DEMO === 'true';
};

export const withdrawalHistoryDemoData = [
  {
    id: 'demo-withdrawal-usdt-completed',
    movement: 'WITHDRAWAL',
    amount: 1200,
    status: 'COMPLETED',
    date: '2026-05-19T20:12:00.000Z',
    method: 'USDT',
    previousBalance: 8500,
    newBalance: 7300,
  },
  {
    id: 'demo-withdrawal-usdc-completed',
    movement: 'WITHDRAWAL',
    amount: 850.5,
    status: 'COMPLETED',
    date: '2026-05-10T17:30:00.000Z',
    method: 'USDC',
    previousBalance: 9350.5,
    newBalance: 8500,
  },
  {
    id: 'demo-withdrawal-lemon-pending',
    movement: 'WITHDRAWAL',
    amount: 500,
    status: 'PENDING',
    date: '2026-06-18T13:00:00.000Z',
    method: 'LEMON_CASH',
    previousBalance: null,
    newBalance: null,
  },
  {
    id: 'demo-withdrawal-cash-rejected',
    movement: 'WITHDRAWAL',
    amount: 300,
    status: 'REJECTED',
    date: '2026-06-15T19:45:00.000Z',
    method: 'CASH_USD',
    previousBalance: 8500,
    newBalance: 8500,
  },
];
