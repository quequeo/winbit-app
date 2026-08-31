/** Demo operativo solo con flag explícito en dev (nunca por bypass solo). */
export const isOperatingHistoryDemoEnabled = () => {
  if (!import.meta.env.DEV) return false;
  return import.meta.env.VITE_OPERATING_HISTORY_DEMO === 'true';
};

const daysAgoIso = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const getOperatingHistoryDemoData = () => [
  {
    id: 'demo-op-mbt-short',
    movement: 'OPERATING_RESULT',
    contract: 'MBT',
    asset: 'MBT',
    direction: 'SHORT',
    amount: -15.42,
    previousBalance: 10250,
    newBalance: 10234.58,
    status: 'COMPLETED',
    date: daysAgoIso(1),
    entryPrice: 104250.5,
    exitPrice: 103180.25,
  },
  {
    id: 'demo-op-mes-long',
    movement: 'OPERATING_RESULT',
    contract: 'MES',
    asset: 'MES',
    direction: 'LONG',
    amount: 28.75,
    previousBalance: 10234.58,
    newBalance: 10263.33,
    status: 'COMPLETED',
    date: daysAgoIso(3),
    entryPrice: 5420.1,
    exitPrice: 5468.9,
  },
  {
    id: 'demo-op-mnq-long',
    movement: 'OPERATING_RESULT',
    contract: 'MNQ',
    asset: 'MNQ',
    direction: 'LONG',
    amount: 12.3,
    previousBalance: 10263.33,
    newBalance: 10275.63,
    status: 'COMPLETED',
    date: daysAgoIso(5),
    entryPrice: 18840.2,
    exitPrice: 18995.8,
  },
  {
    id: 'demo-op-mym-short',
    movement: 'OPERATING_RESULT',
    contract: 'MYM',
    asset: 'MYM',
    direction: 'SHORT',
    amount: -8.15,
    previousBalance: 10275.63,
    newBalance: 10267.48,
    status: 'COMPLETED',
    date: daysAgoIso(25),
    entryPrice: 39120.4,
    exitPrice: 38980.6,
  },
  {
    id: 'demo-op-mbt-long',
    movement: 'OPERATING_RESULT',
    contract: 'MBT',
    asset: 'MBT',
    direction: 'LONG',
    amount: 22.5,
    previousBalance: 10267.48,
    newBalance: 10289.98,
    status: 'COMPLETED',
    date: daysAgoIso(40),
    entryPrice: 101500,
    exitPrice: 103200,
  },
];

/** @deprecated use getOperatingHistoryDemoData */
export const operatingHistoryDemoData = getOperatingHistoryDemoData();
