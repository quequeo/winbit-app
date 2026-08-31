import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownToLine, ArrowUpFromLine, Bell, BellOff, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useInvestorHistory } from '../../hooks/useInvestorHistory';
import { buildNotificationItems, dismissNotificationId } from '../../utils/notifications';
import { formatDate } from '../../utils/formatDate';

const getItemIcon = (item) => {
  if (item.status === 'REJECTED') return XCircle;
  if (item.status === 'PENDING') return Clock;
  return item.movement === 'DEPOSIT' ? ArrowDownToLine : ArrowUpFromLine;
};

const PANEL_WIDTH = 320;
const PANEL_GAP = 8;

export const NotificationBell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userEmail } = useAuth();
  const { data: history } = useInvestorHistory(userEmail);
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const [panelStyle, setPanelStyle] = useState({});
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const items = useMemo(
    () => buildNotificationItems(history, t),
    // version forces refresh after dismiss
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, t, version],
  );

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return undefined;

    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
      setPanelStyle({
        position: 'fixed',
        top: rect.bottom + PANEL_GAP,
        left,
        width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleOpenItem = (item) => {
    dismissNotificationId(item.id);
    setVersion((v) => v + 1);
    setOpen(false);
    navigate(item.href);
  };

  const handleViewHistory = () => {
    setOpen(false);
    navigate('/history');
  };

  const panel = open
    ? createPortal(
        <>
          <button
            type="button"
            className="overlay-panel-scrim"
            aria-label={t('common.close')}
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            className="notification-panel"
            style={panelStyle}
            role="dialog"
            aria-label={t('nav.notifications')}
          >
            <div className="notification-panel__header">
              <div className="notification-panel__header-icon" aria-hidden>
                <Bell className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {t('notifications.title')}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{t('notifications.subtitle')}</p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="notification-panel__empty">
                <div className="notification-panel__empty-icon" aria-hidden>
                  <BellOff className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <p className="notification-panel__empty-title">{t('notifications.empty')}</p>
                <p className="notification-panel__empty-hint">{t('notifications.emptyHint')}</p>
              </div>
            ) : (
              <ul className="notification-panel__list">
                {items.map((item) => {
                  const Icon = getItemIcon(item);
                  const toneClass =
                    item.status === 'REJECTED'
                      ? 'notification-panel__item-icon--rejected'
                      : item.status === 'PENDING'
                        ? 'notification-panel__item-icon--pending'
                        : item.status === 'CANCELLED'
                          ? 'notification-panel__item-icon--cancelled'
                          : 'notification-panel__item-icon--completed';

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="notification-panel__item"
                        onClick={() => handleOpenItem(item)}
                      >
                        <div className={`notification-panel__item-icon ${toneClass}`} aria-hidden>
                          <Icon className="w-4 h-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary leading-snug">
                            {item.title}
                            <span className="text-text-muted font-normal">
                              {' '}
                              · {item.amountLabel}
                            </span>
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {item.statusLabel} · {formatDate(item.date, { hourSuffix: true })}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="notification-panel__footer">
              <button
                type="button"
                className="notification-panel__footer-btn"
                onClick={handleViewHistory}
              >
                {t('notifications.viewHistory')}
              </button>
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="relative inline-flex items-center justify-center rounded-lg border border-border-dark p-2 text-cream hover:text-primary transition-colors"
        aria-label={t('nav.notifications')}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {items.length > 0 ? (
          <span
            className="absolute top-1.5 right-1.5 min-w-[0.5rem] h-2 px-0.5 rounded-full bg-primary"
            aria-hidden
          />
        ) : null}
      </button>
      {panel}
    </div>
  );
};
