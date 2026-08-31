import { formatUsdDisplay, formatUsdSignedDisplay } from './formatUsdDisplay';

export const ACCOUNT_ACTIVITY_FILTERS = [
  'all',
  'capital_in',
  'withdrawal',
  'operating',
  'trading_fee',
  'referral',
];

const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export const getMovementCategory = (movement) => {
  const m = normalize(movement);
  const rawUpper = String(movement ?? '')
    .trim()
    .toUpperCase();
  const canonicalUpper = rawUpper.replace(/[^A-Z_]/g, '');

  if (m === 'depósito' || m === 'deposito' || m === 'deposit' || m === 'deposito') {
    return 'capital_in';
  }

  if (m === 'retiro' || m === 'withdrawal') {
    return 'withdrawal';
  }

  if (
    m === 'profit' ||
    m === 'ganancia' ||
    m === 'rendimiento' ||
    m === 'operating_result' ||
    m === 'resultado_operativo' ||
    m === 'resultado operativo'
  ) {
    return 'operating';
  }

  if (m === 'trading_fee' || m === 'comisión' || m === 'comision') {
    return 'trading_fee';
  }

  if (
    m === 'trading_fee_adjustment' ||
    m === 'deposit_reversal' ||
    m === 'deposit_reversa' ||
    m === 'depósito_revertido'
  ) {
    return 'admin';
  }

  const looksLikeReferral =
    canonicalUpper === 'REFERRAL_COMMISSION' ||
    canonicalUpper === 'REFERRAL_COMISSION' ||
    rawUpper === 'REFERRAL COMMISSION' ||
    (rawUpper.includes('REFERRAL') && rawUpper.includes('COMMISSION'));

  const refKey = m.replace(/[\s-]+/g, '_');
  if (
    looksLikeReferral ||
    refKey === 'referral_commission' ||
    refKey === 'referral_comission' ||
    refKey === 'comision_referido' ||
    refKey === 'comision_por_referido'
  ) {
    return 'referral';
  }

  return 'other';
};

export const matchesActivityFilter = (movement, filterKey) => {
  if (!filterKey || filterKey === 'all') return true;
  return getMovementCategory(movement) === filterKey;
};

const isFiniteBalance = (value) =>
  value !== null && value !== undefined && Number.isFinite(Number(value));

const normalizeStatus = (status) =>
  String(status ?? '')
    .trim()
    .toLowerCase();

export const formatActivityUsd = (amount) => formatUsdSignedDisplay(amount);

export const formatActivityBalanceUsd = (amount) => formatUsdDisplay(amount);

export const formatActivityDateTime = (dateString, t) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const formatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  const parts = {};
  for (const { type, value } of formatter.formatToParts(date)) {
    parts[type] = value;
  }

  const monthIndex = parseInt(parts.month, 10) - 1;
  const monthAbbrev = t(`history.monthsShort.${monthIndex}`, parts.month);

  return `${parts.day} ${monthAbbrev} ${parts.year} · ${parts.hour}:${parts.minute}`;
};

export const formatActivityPercentage = (value) => {
  if (value === null || value === undefined) return null;

  const num = Number(value);
  if (!Number.isFinite(num)) return null;

  const abs = Math.abs(num);
  const fixed = abs.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const sign = num >= 0 ? '+' : '-';

  return `${sign}${intPart},${decPart}%`;
};

const formatSinglePeriodMonth = (year, monthIndex, t) => {
  const monthName = t(`history.monthsFull.${monthIndex}`, '');
  if (!monthName || monthName.includes('.')) return '';
  return `${monthName} ${year}`;
};

export const formatActivityPeriodLabel = (label, t) => {
  if (!label || typeof label !== 'string') return '';

  const rangeMatch = label.match(/^(\d{4})-(\d{2})\s*[/_-]\s*(\d{4})-(\d{2})$/);
  if (rangeMatch) {
    const startYear = parseInt(rangeMatch[1], 10);
    const startMonthIndex = parseInt(rangeMatch[2], 10) - 1;
    const endYear = parseInt(rangeMatch[3], 10);
    const endMonthIndex = parseInt(rangeMatch[4], 10) - 1;
    const start = formatSinglePeriodMonth(startYear, startMonthIndex, t);
    const end = formatSinglePeriodMonth(endYear, endMonthIndex, t);

    if (start && end) {
      if (startYear === endYear) {
        const startMonth = t(`history.monthsFull.${startMonthIndex}`, '');
        const endMonth = t(`history.monthsFull.${endMonthIndex}`, '');
        return `${startMonth}–${endMonth} ${endYear}`;
      }
      return `${start}–${end}`;
    }
  }

  const singleMatch = label.match(/^(\d{4})-(\d{2})$/);
  if (singleMatch) {
    const year = parseInt(singleMatch[1], 10);
    const monthIndex = parseInt(singleMatch[2], 10) - 1;
    return formatSinglePeriodMonth(year, monthIndex, t);
  }

  return label;
};

export const getActivityCardTitle = (row, t) => {
  const category = getMovementCategory(row?.movement);
  const status = normalizeStatus(row?.status);

  if (category === 'capital_in') {
    if (status === 'completado' || status === 'completed') {
      return t('history.cardTitle.depositApproved');
    }
    if (status === 'pendiente' || status === 'pending') {
      return t('history.cardTitle.depositPending');
    }
    if (status === 'rechazado' || status === 'rejected') {
      return t('history.cardTitle.depositRejected');
    }
    if (status === 'cancelado' || status === 'cancelled' || status === 'canceled') {
      return t('history.cardTitle.depositCancelled');
    }
  }

  if (category === 'withdrawal') {
    if (status === 'completado' || status === 'completed') {
      return t('history.cardTitle.withdrawalProcessed');
    }
    if (status === 'pendiente' || status === 'pending') {
      return t('history.cardTitle.withdrawalRequested');
    }
    if (status === 'rechazado' || status === 'rejected') {
      return t('history.cardTitle.withdrawalRejected');
    }
    if (status === 'cancelado' || status === 'cancelled' || status === 'canceled') {
      return t('history.cardTitle.withdrawalCancelled');
    }
  }

  if (category === 'operating') {
    return t('history.cardTitle.operatingRegistered');
  }
  if (category === 'trading_fee') {
    return t('history.cardTitle.tradingFeeDebited');
  }
  if (category === 'referral') {
    return t('history.cardTitle.referralCredited');
  }
  if (category === 'admin') {
    return t('history.cardTitle.adminApplied');
  }

  return t('history.cardTitle.generic');
};

export const getActivityBriefDescription = (row, t) => {
  const category = getMovementCategory(row?.movement);

  if (category === 'capital_in' || category === 'operating') {
    return null;
  }

  if (category === 'withdrawal') {
    return t('history.description.withdrawalGeneric');
  }

  if (category === 'trading_fee') {
    return t('history.description.tradingFeeGeneric');
  }

  if (category === 'referral') {
    return t('history.description.referralGeneric');
  }

  if (category === 'admin') {
    return t('history.description.adminGeneric');
  }

  return null;
};

const isWithdrawalTradingFee = (row) => {
  const source = String(row?.tradingFeeSource ?? '').toUpperCase();
  if (source === 'WITHDRAWAL') return true;
  const label = String(row?.tradingFeePeriodLabel ?? '')
    .trim()
    .toLowerCase();
  return label === 'retiro' || label === 'withdrawal';
};

export const getActivityDetailLine = (row, t) => {
  const category = getMovementCategory(row?.movement);

  if (category === 'operating') {
    const pct =
      row?.operatingResultPercent !== null && row?.operatingResultPercent !== undefined
        ? formatActivityPercentage(Number(row.operatingResultPercent))
        : null;

    if (pct) {
      return t('history.detail.dailyReturn', { pct });
    }
  }

  if (category === 'trading_fee') {
    return isWithdrawalTradingFee(row)
      ? t('history.detail.feeMotiveWithdrawalLabel')
      : t('history.detail.feeMotivePeriodicLabel');
  }

  if (category === 'admin') {
    const period = row?.tradingFeePeriodLabel
      ? formatActivityPeriodLabel(row.tradingFeePeriodLabel, t)
      : '';

    if (period) {
      return t('history.detail.period', { period });
    }
  }

  return null;
};

export const getActivityFeePeriodLine = (row, t) => {
  const category = getMovementCategory(row?.movement);
  if (category !== 'trading_fee' || isWithdrawalTradingFee(row)) return null;

  const period = row?.tradingFeePeriodLabel
    ? formatActivityPeriodLabel(row.tradingFeePeriodLabel, t)
    : '';

  if (!period) return null;
  return t('history.detail.period', { period });
};

export const getActivitySecondaryAction = (row, t) => {
  const category = getMovementCategory(row?.movement);

  if (category === 'capital_in' && row?.attachmentUrl) {
    return {
      label: t('history.actions.viewReceipt'),
      type: 'button',
    };
  }

  if (category === 'trading_fee') {
    return {
      label: t('history.actions.viewCalculation'),
      type: 'link',
      href: '/operational',
    };
  }

  return null;
};

const isRejectedOrCancelledStatus = (status) => {
  const s = normalizeStatus(status);
  return (
    s === 'rechazado' ||
    s === 'rejected' ||
    s === 'cancelado' ||
    s === 'cancelled' ||
    s === 'canceled'
  );
};

const isCapitalFlowWithoutBalanceImpact = (status, category) => {
  if (!isRejectedOrCancelledStatus(status)) return false;
  return category === 'capital_in' || category === 'withdrawal';
};

const signedCapitalAmount = (category, amount) => {
  const abs = Math.abs(Number(amount));
  if (!Number.isFinite(abs) || abs === 0) return null;
  return category === 'withdrawal' ? -abs : abs;
};

export const getActivityBalanceImpact = (row, t) => {
  const category = getMovementCategory(row?.movement);
  const status = normalizeStatus(row?.status);
  const isPending = status === 'pendiente' || status === 'pending';

  // Rechazados/cancelados de depósito o retiro: el saldo no se modificó.
  if (isCapitalFlowWithoutBalanceImpact(status, category)) {
    return t('history.balanceImpact.unchanged');
  }

  let prevNum = isFiniteBalance(row?.previousBalance) ? Number(row.previousBalance) : null;
  let nextNum = isFiniteBalance(row?.newBalance) ? Number(row.newBalance) : null;
  const signed = signedCapitalAmount(category, row?.amount);
  const isCapitalFlow = category === 'capital_in' || category === 'withdrawal';

  if (isPending && (prevNum === null || nextNum === null)) {
    return t('history.balanceImpact.pending');
  }

  // Completados: si el admin no mandó ambos saldos (o vienen iguales),
  // reconstruir con el monto para depositos/retiros.
  if (!isPending && isCapitalFlow && signed !== null) {
    if (prevNum !== null && nextNum !== null && prevNum === nextNum) {
      nextNum = prevNum + signed;
    } else if (prevNum !== null && nextNum === null) {
      nextNum = prevNum + signed;
    } else if (nextNum !== null && prevNum === null) {
      prevNum = nextNum - signed;
    }
  }

  if (prevNum !== null && nextNum !== null) {
    if (prevNum === nextNum) {
      return t('history.balanceImpact.unchanged');
    }

    return t('history.balanceImpact.range', {
      from: formatActivityBalanceUsd(prevNum),
      to: formatActivityBalanceUsd(nextNum),
    });
  }

  if (prevNum === null && nextNum === null) {
    if (isPending) return t('history.balanceImpact.pending');
    // Completado sin saldos: no afirmar "sin cambios" (eso es solo para rechazados).
    if (isCapitalFlow) return '—';
    return t('history.balanceImpact.unchanged');
  }

  return t('history.balanceImpact.unchanged');
};
