import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';
import { useInvestorHistory } from '../../../hooks/useInvestorHistory';
import { useToast } from '../../../hooks/useToast';
import { detectRequestTransitions, getPendingRequests } from '../../../utils/requestHistory';
import { formatCurrency } from '../../../utils/formatCurrency';

const NOTIFIED_KEY = 'winbit-notified-transitions';
const POLL_MS = 2 * 60 * 1000;

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

  const pendingCount = useMemo(
    () => getPendingRequests(Array.isArray(history) ? history : []).length,
    [history],
  );

  useEffect(() => {
    if (!isValidated || !Array.isArray(history)) return;

    if (!initializedRef.current) {
      prevRowsRef.current = history;
      initializedRef.current = true;
      return;
    }

    const transitions = detectRequestTransitions(prevRowsRef.current, history);

    for (const tr of transitions) {
      if (tr.kind === 'created') continue;

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
  }, [history, isValidated, showToast, t]);

  return <div data-pending-requests={pendingCount > 0 ? pendingCount : undefined}>{children}</div>;
};
