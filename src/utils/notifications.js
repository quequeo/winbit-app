import { formatUsdDisplay } from './formatUsdDisplay';

const DISMISSED_KEY = 'winbit_dismissed_notifications';

/** Últimas notificaciones de capital (depósitos/retiros) a mostrar en la campana. */
export const NOTIFICATION_RECENT_LIMIT = 10;

const CAPITAL_STATUSES = new Set(['PENDING', 'REJECTED', 'COMPLETED', 'APPROVED', 'CANCELLED']);

const normalizeStatus = (status) =>
  String(status ?? '')
    .trim()
    .toUpperCase();
const normalizeMovement = (movement) =>
  String(movement ?? '')
    .trim()
    .toUpperCase();

const resolveNotificationStatus = (status) => {
  if (status === 'APPROVED') return 'COMPLETED';
  return status;
};

export const getDismissedNotificationIds = () => {
  try {
    const raw = globalThis?.localStorage?.getItem(DISMISSED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

export const dismissNotificationId = (id) => {
  const current = new Set(getDismissedNotificationIds());
  current.add(String(id));
  try {
    globalThis?.localStorage?.setItem(DISMISSED_KEY, JSON.stringify([...current]));
  } catch {
    // ignore
  }
};

const resolveTitle = (status, isDeposit, t) => {
  if (status === 'PENDING' && isDeposit) return t('notifications.items.depositPending');
  if (status === 'PENDING' && !isDeposit) return t('notifications.items.withdrawalPending');
  if (status === 'REJECTED' && isDeposit) return t('notifications.items.depositRejected');
  if (status === 'REJECTED' && !isDeposit) return t('notifications.items.withdrawalRejected');
  if (status === 'COMPLETED' && isDeposit) return t('notifications.items.depositCompleted');
  if (status === 'COMPLETED' && !isDeposit) return t('notifications.items.withdrawalCompleted');
  if (status === 'CANCELLED' && isDeposit) return t('notifications.items.depositCancelled');
  if (status === 'CANCELLED' && !isDeposit) return t('notifications.items.withdrawalCancelled');
  return t('notifications.items.requestUpdate');
};

const resolveStatusLabel = (status, t) => {
  if (status === 'REJECTED') return t('common.status.rejected');
  if (status === 'PENDING') return t('common.status.pending');
  if (status === 'CANCELLED') return t('common.status.cancelled');
  return t('common.status.completed');
};

/**
 * Notificaciones de la campana: depósitos y retiros recientes (todos los estados),
 * no solo pendientes/rechazados. Orden: más recientes primero. Tope: últimos N.
 */
export const buildNotificationItems = (
  history = [],
  t,
  { limit = NOTIFICATION_RECENT_LIMIT } = {},
) => {
  const dismissed = new Set(getDismissedNotificationIds());

  return (Array.isArray(history) ? history : [])
    .filter((row) => {
      const movement = normalizeMovement(row?.movement);
      if (movement !== 'DEPOSIT' && movement !== 'WITHDRAWAL') return false;
      const status = resolveNotificationStatus(normalizeStatus(row?.status));
      return CAPITAL_STATUSES.has(status);
    })
    .map((row) => {
      const id = String(row.id ?? `${row.movement}-${row.date}-${row.amount}`);
      const movement = normalizeMovement(row.movement);
      const status = resolveNotificationStatus(normalizeStatus(row.status));
      const isDeposit = movement === 'DEPOSIT';
      const href = isDeposit ? '/wallets?tab=history' : '/requests?tab=history';
      const amount = Number(row.amount) || 0;

      return {
        id,
        title: resolveTitle(status, isDeposit, t),
        date: row.date,
        status,
        statusLabel: resolveStatusLabel(status, t),
        movement,
        amount,
        amountLabel: formatUsdDisplay(Math.abs(amount)),
        href,
        dismissed: dismissed.has(id),
      };
    })
    .filter((item) => !item.dismissed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, Math.max(0, Number(limit) || NOTIFICATION_RECENT_LIMIT));
};
