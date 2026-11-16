import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useInvestorHistory } from '../../../hooks/useInvestorHistory';
import { useToast } from '../../ui/ToastProvider';
import {
  buildPendingSnapshot,
  detectRequestTransitions,
  getPendingRequests,
} from '../../../utils/requestHistory';
import { formatCurrency } from '../../../utils/formatCurrency';
import { syncPush } from '../../../services/push';

const NOTIFIED_KEY = 'winbit-notified-transitions';
const SNAPSHOT_KEY_PREFIX = 'winbit-pending-requests:';
const POLL_MS = 2 * 60 * 1000;

const snapshotKeyFor = (email) =>
  email ? `${SNAPSHOT_KEY_PREFIX}${String(email).trim().toLowerCase()}` : null;

const readSnapshot = (key) => {
  if (!key) return null;
  try {
    const raw = globalThis?.localStorage?.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const saveSnapshot = (key, rows) => {
  if (!key) return;
  try {
    globalThis?.localStorage?.setItem(key, JSON.stringify(buildPendingSnapshot(rows)));
  } catch {
    /* ignore */
  }
};

const readNotified = () => {
  try {
    const raw = globalThis?.localStorage?.getItem(NOTIFIED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const markNotified = (key) => {
  try {
    const map = readNotified();
    map[key] = Date.now();
    globalThis?.localStorage?.setItem(NOTIFIED_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
};

const wasNotified = (key) => Boolean(readNotified()[key]);

export const RequestNotificationsProvider = ({ children }) => {
  const { userEmail, isValidated } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const prevRowsRef = useRef(null);
  const initializedRef = useRef(false);

  const { data: history } = useInvestorHistory(userEmail, {
    refetchInterval: (query) => {
      const rows = query.state.data;
      const pending = getPendingRequests(Array.isArray(rows) ? rows : []);
      return pending.length > 0 ? POLL_MS : false;
    },
  });

  // Si el inversor ya activó los avisos al celular en este dispositivo, se vuelve a
  // registrar la suscripción al entrar (por si cambió). No pide permiso.
  useEffect(() => {
    if (isValidated && userEmail) syncPush(userEmail);
  }, [isValidated, userEmail]);

  const pendingCount = useMemo(
    () => getPendingRequests(Array.isArray(history) ? history : []).length,
    [history],
  );

  useEffect(() => {
    if (!isValidated || !Array.isArray(history)) return;

    const snapshotKey = snapshotKeyFor(userEmail);

    if (!initializedRef.current) {
      initializedRef.current = true;
      // Al abrir la app se compara con las solicitudes que estaban pendientes la
      // última vez (guardadas en el dispositivo): así se avisa lo que se aprobó o
      // rechazó mientras la app estaba cerrada.
      const saved = readSnapshot(snapshotKey);
      if (!saved) {
        prevRowsRef.current = history;
        saveSnapshot(snapshotKey, history);
        return;
      }
      prevRowsRef.current = saved;
    }

    const transitions = detectRequestTransitions(prevRowsRef.current, history);

    for (const tr of transitions) {
      // Solo se avisa lo que decide Winbit (aprobación o rechazo). Las solicitudes nuevas
      // y las que cancela el propio inversor ya se confirman en pantalla al hacerlo.
      if (tr.kind !== 'approved' && tr.kind !== 'rejected') continue;

      const notifyKey = `${tr.kind}:${tr.requestId}:${tr.completedId ?? ''}`;
      if (wasNotified(notifyKey)) continue;

      const amountLabel = formatCurrency(tr.amount);
      if (tr.kind === 'approved') {
        const title =
          tr.type === 'DEPOSIT'
            ? t('requests.notifications.depositApprovedTitle')
            : t('requests.notifications.withdrawalApprovedTitle');
        const message =
          tr.type === 'DEPOSIT'
            ? t('requests.notifications.depositApprovedMessage', { amount: amountLabel })
            : t('requests.notifications.withdrawalApprovedMessage', { amount: amountLabel });
        showToast({ title, message, type: 'success', duration: 8000 });
      } else if (tr.kind === 'rejected') {
        const title =
          tr.type === 'DEPOSIT'
            ? t('requests.notifications.depositRejectedTitle')
            : t('requests.notifications.withdrawalRejectedTitle');
        const message =
          tr.type === 'DEPOSIT'
            ? t('requests.notifications.depositRejectedMessage', { amount: amountLabel })
            : t('requests.notifications.withdrawalRejectedMessage', { amount: amountLabel });
        showToast({ title, message, type: 'error', duration: 8000 });
      }

      markNotified(notifyKey);
    }

    prevRowsRef.current = history;
    saveSnapshot(snapshotKey, history);
  }, [history, isValidated, userEmail, showToast, t]);

  return <div data-pending-requests={pendingCount > 0 ? pendingCount : undefined}>{children}</div>;
};
