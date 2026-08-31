export const OPERATING_CONTRACTS = ['MBT', 'MES', 'MNQ', 'MYM'];

const CONTRACT_ALIASES = {
  MBT: 'MBT',
  BTC: 'MBT',
  BITCOIN: 'MBT',
  XBT: 'MBT',
  MES: 'MES',
  SP500: 'MES',
  SPX: 'MES',
  ES: 'MES',
  'S&P500': 'MES',
  'S&P_500': 'MES',
  SP_500: 'MES',
  MNQ: 'MNQ',
  NQ: 'MNQ',
  NASDAQ: 'MNQ',
  NDX: 'MNQ',
  MYM: 'MYM',
  YM: 'MYM',
  DOW_JONES: 'MYM',
  DOWJONES: 'MYM',
  DOW: 'MYM',
  DJI: 'MYM',
  DJIA: 'MYM',
};

const ASSET_ALIAS_GROUPS = [
  { key: 'BTC', aliases: ['BTC', 'BITCOIN', 'MBT', 'XBT'] },
  { key: 'SP500', aliases: ['S&P 500', 'S&P500', 'SP500', 'SPX', 'ES', 'MES'] },
  { key: 'NASDAQ', aliases: ['NASDAQ', 'NQ', 'MNQ'] },
  { key: 'DOWJONES', aliases: ['DOW JONES', 'DJI', 'DJIA', 'YM', 'MYM'] },
];

const assetAliasTokens = (raw) => {
  const value = String(raw ?? '')
    .trim()
    .toUpperCase();
  return new Set([value, value.replace(/\s+/g, ''), value.replace(/\s+/g, '_')]);
};

/** Normaliza cualquier nombre de activo del admin/API al key del badge. */
export const normalizeAsset = (rawAsset) => {
  const tokens = assetAliasTokens(rawAsset);
  for (const { key, aliases } of ASSET_ALIAS_GROUPS) {
    if (
      aliases.some((alias) => {
        const normalized = alias.toUpperCase();
        return (
          tokens.has(normalized) ||
          tokens.has(normalized.replace(/\s+/g, '')) ||
          tokens.has(normalized.replace(/\s+/g, '_'))
        );
      })
    ) {
      return key;
    }
  }
  return null;
};

export const getAssetDisplayName = (assetKey) => {
  switch (assetKey) {
    case 'BTC':
      return 'Micro Bitcoin';
    case 'SP500':
      return 'S&P 500';
    case 'NASDAQ':
      return 'Nasdaq';
    case 'DOWJONES':
      return 'Dow Jones';
    default:
      return null;
  }
};

export const ASSET_BADGE_SIZE_OPERATING = 46;
export const ASSET_BADGE_SIZE_SUMMARY = 38;
export const ASSET_BADGE_SIZE_DASHBOARD = 32;

export const normalizeOperatingContractKey = (value) => {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  if (!raw) return null;
  return (
    CONTRACT_ALIASES[raw] ??
    CONTRACT_ALIASES[raw.replace(/_/g, '')] ??
    (OPERATING_CONTRACTS.includes(raw) ? raw : null)
  );
};

/** @deprecated use normalizeOperatingContractKey */
export const normalizeOperatingAssetKey = normalizeOperatingContractKey;

export const resolveOperatingContract = (row) =>
  normalizeOperatingContractKey(
    row?.contract ?? row?.asset ?? row?.operatingAsset ?? row?.tradeAsset,
  );

/** @deprecated use resolveOperatingContract */
export const resolveOperatingAsset = resolveOperatingContract;

/** Normaliza dirección cargada en admin (LONG / SHORT). */
export const normalizeOperatingDirection = (value) => {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase();
  if (raw === 'LONG' || raw === 'LARGO') return 'LONG';
  if (raw === 'SHORT' || raw === 'CORTO') return 'SHORT';
  return null;
};

export const resolveOperatingDirection = (row) =>
  normalizeOperatingDirection(row?.direction ?? row?.side ?? row?.tradeDirection);

export const getOperatingContractLogo = (contractKey) => {
  const badgeKey = toAssetBadgeKey(contractKey);
  if (!badgeKey) return null;
  const paths = {
    BTC: '/images/operating-assets/btc.png',
    SP500: '/images/operating-assets/sp500.png',
    NASDAQ: '/images/operating-assets/nasdaq.png',
    DOWJONES: '/images/operating-assets/dow-jones.png',
  };
  return paths[badgeKey] ?? null;
};

export const toAssetBadgeKey = (contractKey) => {
  const direct = normalizeAsset(contractKey);
  if (direct) return direct;

  const key = normalizeOperatingContractKey(contractKey);
  if (!key) return null;
  return (
    {
      MBT: 'BTC',
      MES: 'SP500',
      MNQ: 'NASDAQ',
      MYM: 'DOWJONES',
    }[key] ?? null
  );
};

/** @deprecated use getOperatingContractLogo */
export const getOperatingAssetLogo = getOperatingContractLogo;

export const getOperatingContractLabel = (contractKey, t) => {
  const key = normalizeOperatingContractKey(contractKey);
  if (!key) return null;
  const underlying = {
    MBT: t('operating.contracts.mbt'),
    MES: t('operating.contracts.mes'),
    MNQ: t('operating.contracts.mnq'),
    MYM: t('operating.contracts.mym'),
  }[key];
  return `${key} — ${underlying}`;
};

/** Nombre visible para inversores (MBT — Micro Bitcoin, etc.). */
export const getOperatingContractInvestorLabel = (contractOrAsset) => {
  const contractKey = normalizeOperatingContractKey(contractOrAsset);
  if (contractKey) {
    const underlying = {
      MBT: 'Micro Bitcoin',
      MES: 'S&P 500',
      MNQ: 'Nasdaq',
      MYM: 'Dow Jones',
    }[contractKey];
    return `${contractKey} — ${underlying}`;
  }
  const badgeKey = toAssetBadgeKey(contractOrAsset);
  return badgeKey ? getAssetDisplayName(badgeKey) : null;
};

/** Nombre corto del activo (Micro Bitcoin, S&P 500, …). */
export const getOperatingContractShortLabel = (contractKey) => {
  const badgeKey = toAssetBadgeKey(contractKey);
  return badgeKey ? getAssetDisplayName(badgeKey) : null;
};

export const formatOperatingRatioR = (value, isPositive) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const formatted = formatOperatingRatio(Math.abs(n));
  const sign = isPositive ? '+' : '-';
  return `${sign}${formatted}R`;
};

import { BUENOS_AIRES_TZ, getZonedHour, getZonedYmd } from './operatingCalendarRange';

/** Hora de publicación del resultado operativo diario (hora Argentina). */
export const OPERATING_RESULT_PUBLISH_HOUR = 18;

export const operatingDateKey = (dateValue) => {
  const raw = String(dateValue ?? '').trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return null;

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUENOS_AIRES_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

export const combineStrategyOperations = (...lists) => {
  const byDate = {};
  for (const list of lists) {
    Object.assign(byDate, indexStrategyOperationsByDate(list));
  }
  return Object.values(byDate);
};

const DEV_SYNTH_ASSET_CYCLE = ['NQ', 'MYM', 'BTC', 'MES'];

export const isOperatingResultRow = (row) =>
  String(row?.movement ?? '')
    .trim()
    .toUpperCase() === 'OPERATING_RESULT';

const todayDateKey = (now = new Date()) => {
  const { year, month, day } = getZonedYmd(now);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const shiftDateKey = (dateKey, days) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
};

const OPERATING_RESULT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Día del último cierre de saldos (18:00 Argentina).
 * Antes de las 18:00 → día anterior; desde las 18:00 → día actual.
 */
export const getLastSettlementDateKey = (now = new Date()) => {
  const todayKey = todayDateKey(now);
  if (getZonedHour(now) >= OPERATING_RESULT_PUBLISH_HOUR) return todayKey;
  return shiftDateKey(todayKey, -1);
};

/** Label fijo de “Última actualización” del ciclo de 18:00 h (UTC-3). */
export const formatSettlementLastUpdateLabel = (now = new Date()) => {
  const dateKey = getLastSettlementDateKey(now);
  const [year, month, day] = dateKey.split('-').map(Number);
  const monthAbbrev = OPERATING_RESULT_MONTHS[month - 1];
  const hh = String(OPERATING_RESULT_PUBLISH_HOUR).padStart(2, '0');
  return `${day} ${monthAbbrev} ${year} · ${hh}:00 · UTC-3`;
};

/** El inversor ve resultados operativos del día solo a partir de las 18:00 h (Argentina). */
export const isOperatingResultPublished = (dateValue, now = new Date()) => {
  const resultKey = operatingDateKey(dateValue);
  if (!resultKey) return true;

  const todayKey = todayDateKey(now);
  if (resultKey < todayKey) return true;
  if (resultKey > todayKey) return false;

  return getZonedHour(now) >= OPERATING_RESULT_PUBLISH_HOUR;
};

export const filterPublishedOperatingResults = (rows, now = new Date()) =>
  (rows || []).filter((row) => {
    if (!isOperatingResultRow(row)) return true;
    return isOperatingResultPublished(row?.date, now);
  });

/** Hora fija de acreditación visible al inversor (18:00 h Argentina). */
export const formatOperatingResultDateTime = (dateValue, t) => {
  const dateKey = operatingDateKey(dateValue);
  if (!dateKey) return '';

  const [year, month, day] = dateKey.split('-').map(Number);
  const monthAbbrev = t(`history.monthsShort.${month - 1}`, OPERATING_RESULT_MONTHS[month - 1]);

  return `${day} ${monthAbbrev} ${year} · ${String(OPERATING_RESULT_PUBLISH_HOUR).padStart(2, '0')}:00`;
};

/** En dev, completa fechas operativas sin activo/dirección para poder probar la UI. */
export const buildStrategyByDateForHistory = (history, strategyOps = []) => {
  const map = indexStrategyOperationsByDate(strategyOps);

  if (!import.meta.env.DEV) return map;

  let synthIndex = 0;
  for (const row of history || []) {
    if (!isOperatingResultRow(row)) continue;

    const key = operatingDateKey(row?.date);
    if (!key || map[key]) continue;
    if (resolveOperatingContract(row) || resolveOperatingDirection(row)) continue;

    map[key] = {
      operationDate: key,
      asset: DEV_SYNTH_ASSET_CYCLE[synthIndex % DEV_SYNTH_ASSET_CYCLE.length],
      direction: synthIndex % 2 === 0 ? 'SHORT' : 'LONG',
      openedAt: '11:19',
      closedAt: '11:26',
    };
    synthIndex += 1;
  }

  return map;
};

const findStrategyForOperatingRow = (row, strategyByDate) => {
  const nested = row?.strategyOperation ?? row?.strategy_operation ?? null;
  if (nested) return nested;

  const key = operatingDateKey(row?.date);
  if (!key || !strategyByDate) return null;
  if (strategyByDate[key]) return strategyByDate[key];

  return null;
};

export const indexStrategyOperationsByDate = (operations) => {
  const map = {};
  for (const op of operations || []) {
    const key = operatingDateKey(op?.operationDate);
    if (key) map[key] = op;
  }
  return map;
};

export const mergeOperatingWithStrategy = (rows, strategyByDate) => {
  return rows.map((row) => {
    const strategy = findStrategyForOperatingRow(row, strategyByDate);
    if (!strategy) return row;
    return {
      ...row,
      asset: strategy.asset ?? row.asset,
      contract: strategy.contract ?? strategy.asset ?? row.contract,
      direction: normalizeOperatingDirection(strategy.direction) ?? resolveOperatingDirection(row),
      openedAt: strategy.openedAt ?? row.openedAt,
      closedAt: strategy.closedAt ?? row.closedAt,
      ratio: strategy.ratio ?? row.ratio,
      timeframe: strategy.timeframe ?? row.timeframe,
      resultLabel: strategy.resultLabel ?? row.resultLabel,
      entryPrice: strategy.entryPrice ?? row.entryPrice,
      exitPrice: strategy.exitPrice ?? row.exitPrice,
    };
  });
};

/** Datos visibles de activo y dirección para cards de historial operativo. */
export const resolveOperatingTradeDisplay = (row) => {
  const rawAsset = row?.contract ?? row?.asset ?? row?.operatingAsset ?? row?.tradeAsset ?? null;
  const assetKey = resolveOperatingContract(row);
  const badgeKey = toAssetBadgeKey(rawAsset ?? assetKey);
  const assetLabel =
    getOperatingContractInvestorLabel(rawAsset ?? assetKey) ??
    (badgeKey ? getAssetDisplayName(badgeKey) : null);
  const direction = resolveOperatingDirection(row);

  return {
    rawAsset,
    assetKey,
    badgeKey,
    assetLabel,
    direction,
  };
};

/** @deprecated use getOperatingContractLabel */
export const getOperatingAssetLabel = getOperatingContractLabel;

export const getOperatingContractFilterOptions = (t) => [
  { id: 'all', label: t('operating.filters.all') },
  ...OPERATING_CONTRACTS.map((id) => ({
    id,
    label: getOperatingContractLabel(id, t),
  })),
];

export const formatOperatingPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatOperatingRatio = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const parseOperatingTime = (value) => {
  const match = String(value ?? '')
    .trim()
    .match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
};

/** Minutos entre apertura y cierre (soporta cruce de medianoche). */
export const getOperatingDurationMinutes = (openedAt, closedAt) => {
  const openParts = parseOperatingTime(openedAt);
  const closeParts = parseOperatingTime(closedAt);
  if (!openParts || !closeParts) return null;

  let openMin = openParts[0] * 60 + openParts[1];
  let closeMin = closeParts[0] * 60 + closeParts[1];
  if (closeMin < openMin) closeMin += 24 * 60;

  const diff = closeMin - openMin;
  return diff > 0 ? diff : null;
};

export const formatOperatingDurationLabel = (totalMinutes, t) => {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '—';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return t('operating.detail.durationMinutes', { count: minutes });
  if (minutes === 0) return t('operating.detail.durationHours', { count: hours });
  return t('operating.detail.durationHoursMinutes', { hours, minutes });
};

export const formatOperatingTimestamp = (dateValue, timeValue) => {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mon = MONTH_ABBR[d.getMonth()];
  const yyyy = d.getFullYear();
  const datePart = `${dd} ${mon} ${yyyy}`;
  const parsed = parseOperatingTime(timeValue);
  if (!parsed) return `${datePart} · —`;
  const [hour, minute] = parsed;
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${datePart} · ${hh}:${mm}`;
};

export const tradeOpenCloseLabels = (row) => {
  const close = new Date(row?.date);
  if (isNaN(close.getTime())) {
    return { openLabel: '—', closeLabel: '—' };
  }

  const openedAt = row?.openedAt ?? row?.opened_at ?? null;
  const closedAt = row?.closedAt ?? row?.closed_at ?? null;
  const open = new Date(close);
  const openParts = parseOperatingTime(openedAt);
  const closeParts = parseOperatingTime(closedAt);

  if (openParts && closeParts) {
    const [openH, openM] = openParts;
    const [closeH, closeM] = closeParts;
    if (openH > closeH || (openH === closeH && openM > closeM)) {
      open.setUTCDate(open.getUTCDate() - 1);
    }
  }

  return {
    openLabel: formatOperatingTimestamp(open, openedAt),
    closeLabel: formatOperatingTimestamp(close, closedAt),
  };
};

export const operatingDailyPercent = (row) => {
  const raw = row?.operatingResultPercent ?? row?.operating_result_percent;
  if (raw !== null && raw !== undefined && raw !== '') {
    const fromApi = Number(raw);
    if (Number.isFinite(fromApi)) return fromApi;
  }

  const prev = Number(row?.previousBalance);
  const amt = Number(row?.amount);
  if (!Number.isFinite(prev) || prev <= 0) return null;
  if (!Number.isFinite(amt)) return null;
  return (amt / prev) * 100;
};

export const matchesOperatingFilters = (row, { asset, direction, result }) => {
  const rowContract = resolveOperatingContract(row);
  const rowDirection = resolveOperatingDirection(row);
  const amount = Number(row?.amount) || 0;

  if (asset !== 'all' && rowContract !== asset) return false;
  if (direction !== 'all' && rowDirection !== direction) return false;
  if (direction !== 'all' && !rowDirection) return false;
  if (result === 'positive' && amount < 0) return false;
  if (result === 'negative' && amount >= 0) return false;
  return true;
};
