import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

const PANEL_WIDTH = 264;
const PANEL_GAP = 8;

export const AccountMenu = ({ showDesktopLogout = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userEmail, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState({});
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const email = userEmail || user?.email || '';
  const isEmailUser = user?.authMethod === 'email';
  const authLabel = isEmailUser
    ? t('account.authEmail')
    : user?.authMethod === 'dev'
      ? t('account.authDev')
      : t('account.authGoogle');

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
            className="account-menu-panel"
            style={panelStyle}
            role="menu"
            aria-label={t('account.menu')}
          >
            <div className="account-menu-panel__header">
              <p className="text-sm font-semibold text-text-primary truncate">
                {email || t('account.user')}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{authLabel}</p>
            </div>

            {isEmailUser ? (
              <button
                type="button"
                role="menuitem"
                className="account-menu-panel__item"
                onClick={() => {
                  setOpen(false);
                  navigate('/change-password');
                }}
              >
                {t('auth.changePassword.title')}
              </button>
            ) : (
              <p className="account-menu-panel__hint">
                {user?.authMethod === 'dev'
                  ? t('auth.changePassword.devInfo')
                  : t('auth.changePassword.googleInfo')}
              </p>
            )}

            {showDesktopLogout ? (
              <div className="account-menu-panel__footer">
                <Button
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  variant="outline"
                  className="w-full text-sm py-2"
                >
                  {t('auth.logout')}
                </Button>
              </div>
            ) : null}
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
        className="inline-flex items-center justify-center rounded-lg border border-border-dark p-2 text-cream hover:text-primary hover:border-primary transition-colors"
        aria-label={t('account.menu')}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <User className="w-5 h-5" strokeWidth={1.75} />
      </button>
      {panel}
    </div>
  );
};
