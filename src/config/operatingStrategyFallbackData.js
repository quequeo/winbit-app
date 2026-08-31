import { isDevBypassEnabled } from './devAuth';

/** Datos sintéticos extra solo en dev (relleno visual). */
export const isOperatingStrategyFallbackEnabled = () => {
  if (!import.meta.env.DEV) return false;
  const flag = import.meta.env.VITE_OPERATING_STRATEGY_FALLBACK;
  if (flag === 'false') return false;
  if (flag === 'true') return true;
  return isDevBypassEnabled();
};

/** Operaciones reales cargadas en admin — se usan si el API público aún no está disponible. */
const KNOWN_STRATEGY_OPS = [
  {
    operationDate: '2026-06-26',
    asset: 'BTC',
    direction: 'SHORT',
    openedAt: '11:19',
    closedAt: '11:26',
    ratio: null,
  },
  {
    operationDate: '2026-06-24',
    asset: 'NQ',
    direction: 'SHORT',
    openedAt: '11:20',
    closedAt: '11:27',
    ratio: 1.01,
  },
  {
    operationDate: '2026-06-23',
    asset: 'MYM',
    direction: 'SHORT',
    openedAt: '11:18',
    closedAt: '11:25',
    ratio: null,
  },
  {
    operationDate: '2026-06-22',
    asset: 'NQ',
    direction: 'SHORT',
    openedAt: '11:15',
    closedAt: '11:22',
    ratio: 1.17,
  },
  {
    operationDate: '2026-06-18',
    asset: 'NQ',
    direction: 'SHORT',
    openedAt: '11:10',
    closedAt: '11:18',
    ratio: 1.1,
  },
  {
    operationDate: '2026-06-17',
    asset: 'MES',
    direction: 'LONG',
    openedAt: '11:19',
    closedAt: '11:26',
    ratio: 1.01,
    timeframe: '1m',
    resultLabel: 'POSITIVO',
    entryPrice: 40020,
    exitPrice: 40680,
  },
  {
    operationDate: '2026-06-16',
    asset: 'MES',
    direction: 'SHORT',
    openedAt: '11:19',
    closedAt: '11:26',
    ratio: 1.08,
    timeframe: '1m',
    resultLabel: 'POSITIVO',
    entryPrice: 38340,
    exitPrice: 39540,
  },
];

const EXTRA_OPERATING_DATES = [
  '2026-06-29',
  '2026-06-25',
  '2026-06-15',
  '2026-06-12',
  '2026-06-11',
  '2026-06-10',
  '2026-06-09',
  '2026-06-08',
  '2026-06-04',
  '2026-06-03',
  '2026-06-02',
  '2026-05-28',
  '2026-05-27',
  '2026-05-22',
  '2026-05-21',
  '2026-05-20',
  '2026-05-19',
  '2026-05-18',
  '2026-05-14',
  '2026-05-13',
  '2026-05-04',
];

const ASSET_CYCLE = ['NQ', 'MYM', 'BTC', 'NQ'];

export const getOperatingStrategyKnownOps = () => getOperatingStrategyFallbackData();

const getOperatingStrategyExtraOps = () => {
  const knownByDate = Object.fromEntries(KNOWN_STRATEGY_OPS.map((row) => [row.operationDate, row]));

  return EXTRA_OPERATING_DATES.filter((date) => !knownByDate[date]).map((date, idx) => ({
    operationDate: date,
    asset: ASSET_CYCLE[idx % ASSET_CYCLE.length],
    direction: 'SHORT',
    openedAt: '11:19',
    closedAt: '11:26',
    ratio: idx % 4 === 0 ? null : 1.05,
  }));
};

export const getOperatingStrategyFallbackData = () => {
  const extras =
    import.meta.env.DEV || isOperatingStrategyFallbackEnabled()
      ? getOperatingStrategyExtraOps()
      : [];
  return [...KNOWN_STRATEGY_OPS, ...extras];
};
