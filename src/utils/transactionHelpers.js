export const METHOD_LABELS = {
  CASH_USD: 'Efectivo USD',
  SWIFT: 'SWIFT',
  CRYPTO: 'Cripto',
  USDT: 'USDT',
  USDC: 'USDC',
  LEMON_CASH: 'Lemon Cash',
  BANK_USD: 'Banco USD',
};

export const STATUS_CONFIG = {
  COMPLETED: {
    labelKey: 'common.status.completed',
    labelFallback: 'Completado',
    cls: 'badge-completed',
    dotCls: 'bg-success',
  },
  PENDING: {
    labelKey: 'common.status.pending',
    labelFallback: 'Pendiente',
    cls: 'badge-pending',
    dotCls: 'bg-warning',
  },
  REJECTED: {
    labelKey: 'common.status.rejected',
    labelFallback: 'Rechazado',
    cls: 'badge-rejected',
    dotCls: 'bg-error',
  },
  CANCELLED: {
    labelKey: 'common.status.cancelled',
    labelFallback: 'Cancelado',
    cls: 'badge-cancelled',
    dotCls: 'bg-text-dim',
  },
};

export const DEPOSIT_STATUS_CONFIG = {
  COMPLETED: {
    labelKey: 'deposits.status.accredited',
    labelFallback: 'Acreditado',
    cls: 'badge-completed',
    dotCls: 'bg-success',
  },
  PENDING: {
    labelKey: 'deposits.status.inReview',
    labelFallback: 'En revisión',
    cls: 'bg-[rgba(59,130,246,0.12)] text-[#7eb8ff] border border-[rgba(59,130,246,0.25)]',
    dotCls: 'bg-[#3b82f6]',
  },
  REJECTED: {
    labelKey: 'common.status.rejected',
    labelFallback: 'Rechazado',
    cls: 'badge-rejected',
    dotCls: 'bg-error',
  },
  CANCELLED: {
    labelKey: 'common.status.cancelled',
    labelFallback: 'Cancelado',
    cls: 'badge-cancelled',
    dotCls: 'bg-text-dim',
  },
};

export const getStatusConfig = (status, type = 'default') => {
  const map = type === 'deposit' ? DEPOSIT_STATUS_CONFIG : STATUS_CONFIG;
  const key = String(status ?? '').toUpperCase();
  return (
    map[key] ?? {
      labelKey: null,
      labelFallback: status ?? '—',
      cls: 'badge-cancelled',
      dotCls: 'bg-text-dim',
    }
  );
};

export const getStatusLabel = (sc, t) =>
  sc.labelKey ? t(sc.labelKey, sc.labelFallback) : sc.labelFallback;

export const getMethodLabel = (method) => {
  if (!method) return '—';
  return METHOD_LABELS[method] ?? method;
};

export const buildPaymentMethodOption = (method) => {
  const code = String(method ?? '').toUpperCase();
  const label = getMethodLabel(method);
  return {
    label,
    code,
    category: code === 'LEMON_CASH' ? 'LEMON' : code,
    method: code,
  };
};

export const sumPendingAmount = (rows, movementType) =>
  (Array.isArray(rows) ? rows : [])
    .filter(
      (r) =>
        String(r?.movement ?? '').toUpperCase() === movementType &&
        String(r?.status ?? '').toUpperCase() === 'PENDING',
    )
    .reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
