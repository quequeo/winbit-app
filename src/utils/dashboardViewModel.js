import { DASHBOARD_DEMO_ENABLED, dashboardDemoData as demo } from '../config/dashboardDemoData';
import { formatDate } from './formatDate';
import {
  getAssetDisplayName,
  getOperatingContractInvestorLabel,
  getOperatingContractShortLabel,
  indexStrategyOperationsByDate,
  mergeOperatingWithStrategy,
  normalizeAsset,
  resolveOperatingDirection,
  toAssetBadgeKey,
  filterPublishedOperatingResults,
  formatSettlementLastUpdateLabel,
} from './operatingTrade';

const MOVEMENT_I18N_KEYS = {
  DEPOSIT: 'history.movement.deposit',
  WITHDRAWAL: 'history.movement.withdrawal',
  OPERATING_RESULT: 'history.movement.operating_result',
  TRADING_FEE: 'history.movement.trading_fee',
  TRADING_FEE_ADJUSTMENT: 'history.movement.trading_fee_adjustment',
  DEPOSIT_REVERSAL: 'history.movement.deposit_reversal',
  REFERRAL_COMMISSION: 'history.movement.referral_commission',
};

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const normalizeMovementKey = (value) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z_]/g, '');

const CASH_MOVEMENTS = new Set(['DEPOSIT', 'WITHDRAWAL']);

const isCashMovement = (row) => CASH_MOVEMENTS.has(normalizeMovementKey(row?.movement));

const isOperatingResult = (row) => normalizeMovementKey(row?.movement) === 'OPERATING_RESULT';

const movementDescriptionKey = (row) => {
  const movement = normalizeMovementKey(row?.movement);
  return MOVEMENT_I18N_KEYS[movement] ?? 'dashboard.demo.movements.generic';
};

const historyToMovement = (row) => ({
  id: row.id ?? `${row.date}-${row.movement}`,
  date: row.date,
  movement: normalizeMovementKey(row?.movement),
  descriptionKey: movementDescriptionKey(row),
  status: row.status ?? 'COMPLETED',
  amount: Number(row.amount) || 0,
});

const historyToChartPoint = (row) => {
  const date = row?.date ? String(row.date).slice(0, 10) : null;
  const total = Number(row?.newBalance);
  if (!date || !Number.isFinite(total)) return null;
  return { date, total };
};

const buildCurrentMonthLabel = (now = new Date()) =>
  `${MONTHS_ES[now.getMonth()]} ${now.getFullYear()}`;

/** Mes del último reporte cerrado (mes anterior al actual). */
export const buildReportDownloadLabel = () => {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 1);
  return `${MONTHS_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

/**
 * Resultado operativo del mes calendario actual.
 * USD: suma de OPERATING_RESULT publicados del mes.
 * %: compuesto diario (amount / previousBalance), alineado con el admin.
 * No usa totalInvested histórico — diluye el % cuando el saldo actual es menor.
 */
export const buildMonthReturnFromHistory = (
  historyRows = [],
  _capitalInvested = 0,
  now = new Date(),
) => {
  const year = now.getFullYear();
  const month = now.getMonth();
  const published = filterPublishedOperatingResults(
    (historyRows || []).filter(isOperatingResult),
    now,
  );

  const monthRows = published
    .filter((row) => {
      const status = String(row?.status ?? '').toUpperCase();
      if (status && status !== 'COMPLETED') return false;
      const d = new Date(row.date);
      if (Number.isNaN(d.getTime())) return false;
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const usd = monthRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  let factor = 1;
  let compoundedDays = 0;
  for (const row of monthRows) {
    const prev = Number(row.previousBalance);
    const amount = Number(row.amount) || 0;
    if (!Number.isFinite(prev) || prev <= 0) continue;
    factor *= 1 + amount / prev;
    compoundedDays += 1;
  }

  const pct = compoundedDays > 0 ? (factor - 1) * 100 : 0;
  return { usd, pct, hasRows: monthRows.length > 0 };
};

const buildLastUpdateLabel = () => formatSettlementLastUpdateLabel();

const buildChartPeriodLabel = (chartSeries) => {
  if (!chartSeries?.length) return demo.chartPeriodLabel;
  const first = chartSeries[0]?.date;
  const last = chartSeries[chartSeries.length - 1]?.date;
  if (!first || !last) return demo.chartPeriodLabel;
  return `${formatDate(first, { time: false })} – ${formatDate(last, { time: false })}`;
};

const buildNextFeeCutLabel = (historyRows) => {
  const pendingFee = (historyRows || []).find((row) => {
    const movement = normalizeMovementKey(row?.movement);
    const status = String(row?.status ?? '').toUpperCase();
    return status === 'PENDING' && movement === 'TRADING_FEE';
  });

  if (pendingFee?.date) {
    return formatDate(pendingFee.date, { time: false });
  }

  const nextMonth = new Date();
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1, 1);
  return formatDate(nextMonth.toISOString(), { time: false });
};

export const DASHBOARD_RECENT_OPERATIONS_LIMIT = 8;
export const DASHBOARD_RECENT_CASH_MOVEMENTS_LIMIT = 2;

export const buildRecentOperationsFromHistory = (
  history,
  strategyInput = [],
  limit = DASHBOARD_RECENT_OPERATIONS_LIMIT,
) => {
  const operatingRows = filterPublishedOperatingResults((history || []).filter(isOperatingResult));
  const strategyByDate = Array.isArray(strategyInput)
    ? indexStrategyOperationsByDate(strategyInput)
    : strategyInput;
  const merged = mergeOperatingWithStrategy(operatingRows, strategyByDate);

  return merged
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
    .map((row) => {
      const rawAsset = row?.contract ?? row?.asset ?? row?.operatingAsset ?? row?.tradeAsset;
      const badgeKey = normalizeAsset(rawAsset) ?? toAssetBadgeKey(rawAsset);
      const asset = badgeKey ?? rawAsset;
      if (!asset) return null;

      return {
        id: row.id ?? `${row.date}-op`,
        date: row.date,
        asset,
        assetLabel:
          getOperatingContractInvestorLabel(rawAsset) ??
          getAssetDisplayName(badgeKey) ??
          getOperatingContractShortLabel(rawAsset) ??
          getOperatingContractShortLabel(asset),
        direction: resolveOperatingDirection(row),
        resultUsd: Number(row.amount) || 0,
        detailRow: row,
      };
    })
    .filter(Boolean);
};

export const buildDashboardViewModel = (apiData, history, strategyOps = []) => {
  const balance = Number(apiData?.balance);
  const totalInvested = Number(apiData?.totalInvested);
  const hasBalance = Number.isFinite(balance);
  const hasInvested = Number.isFinite(totalInvested);

  const portfolioValue = hasBalance ? balance : demo.portfolioValue;
  const capitalInvested = hasInvested ? totalInvested : demo.capitalInvested;

  const apiReturnUsd = Number(apiData?.strategyReturnAllUsd);
  const apiReturnPct = Number(apiData?.strategyReturnAllPct);
  const derivedReturnUsd = portfolioValue - capitalInvested;
  const derivedReturnPct = capitalInvested > 0 ? (derivedReturnUsd / capitalInvested) * 100 : 0;

  const accumulatedReturnUsd = Number.isFinite(apiReturnUsd)
    ? apiReturnUsd
    : Number.isFinite(derivedReturnUsd)
      ? derivedReturnUsd
      : demo.accumulatedReturnUsd;

  const accumulatedReturnPct = Number.isFinite(apiReturnPct)
    ? apiReturnPct
    : Number.isFinite(derivedReturnPct)
      ? derivedReturnPct
      : demo.accumulatedReturnPct;

  const historyRows = Array.isArray(history) ? history : [];

  const ytdUsd = Number(apiData?.strategyReturnYtdUsd);
  const ytdPct = Number(apiData?.strategyReturnYtdPct);
  const annualUsd = Number(apiData?.annualReturnUsd);
  const annualPct = Number(apiData?.annualReturnPct);

  // "Acumulado anual" / "Año en curso" → YTD strategy return.
  // strategyReturnYtd is the source of truth, same as admin dashboard;
  // annualReturn is legacy fallback.
  // TODO: migrate this logic to new app
  const hasMeaningfulYtd =
    (Number.isFinite(ytdUsd) && ytdUsd !== 0) || (Number.isFinite(ytdPct) && ytdPct !== 0);

  const yearReturnUsd = hasMeaningfulYtd
    ? ytdUsd
    : Number.isFinite(annualUsd) && annualUsd !== 0
      ? annualUsd
      : demo.monthReturnUsd;
  const yearReturnPct = hasMeaningfulYtd
    ? ytdPct
    : Number.isFinite(annualPct) && annualPct !== 0
      ? annualPct
      : demo.monthReturnPct;

  const monthFromHistory = buildMonthReturnFromHistory(historyRows, capitalInvested);
  const monthReturnUsd = monthFromHistory.hasRows
    ? monthFromHistory.usd
    : DASHBOARD_DEMO_ENABLED
      ? demo.monthReturnUsd
      : 0;
  const monthReturnPct = monthFromHistory.hasRows
    ? monthFromHistory.pct
    : DASHBOARD_DEMO_ENABLED
      ? demo.monthReturnPct
      : 0;

  const chartFromHistory = historyRows
    .filter((r) => r?.status === 'COMPLETED' && r?.newBalance != null)
    .map(historyToChartPoint)
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const uniqueChart = [];
  const seenDates = new Set();
  chartFromHistory.forEach((point) => {
    if (!seenDates.has(point.date)) {
      seenDates.add(point.date);
      uniqueChart.push(point);
    }
  });

  const chartSeries =
    uniqueChart.length >= 2 ? uniqueChart : DASHBOARD_DEMO_ENABLED ? demo.chartSeries : uniqueChart;

  const historyMovements = historyRows
    .filter(isCashMovement)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, DASHBOARD_RECENT_CASH_MOVEMENTS_LIMIT)
    .map(historyToMovement);

  const historyOperations = buildRecentOperationsFromHistory(
    historyRows,
    strategyOps,
    DASHBOARD_RECENT_OPERATIONS_LIMIT,
  );

  const recentMovements =
    historyMovements.length > 0
      ? historyMovements
      : DASHBOARD_DEMO_ENABLED
        ? demo.recentMovements
        : [];

  const recentOperations =
    historyOperations.length > 0
      ? historyOperations
      : DASHBOARD_DEMO_ENABLED
        ? demo.recentOperations
        : [];

  return {
    portfolioValue,
    capitalInvested,
    accumulatedReturnUsd,
    accumulatedReturnPct,
    monthReturnUsd,
    monthReturnPct,
    yearReturnUsd,
    yearReturnPct,
    lastUpdateLabel: buildLastUpdateLabel(),
    nextFeeCutLabel: buildNextFeeCutLabel(historyRows),
    reportMonthLabel: buildCurrentMonthLabel(),
    reportDownloadLabel: buildReportDownloadLabel(),
    chartPeriodLabel: buildChartPeriodLabel(chartSeries),
    chartSeries,
    recentMovements,
    recentOperations,
    usesDemoData:
      DASHBOARD_DEMO_ENABLED &&
      (historyMovements.length === 0 || historyOperations.length === 0 || uniqueChart.length < 2),
  };
};
