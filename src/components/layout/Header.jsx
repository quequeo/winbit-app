import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { WinbitLogo } from '../ui/WinbitLogo';
import { NotificationBell } from './NotificationBell';
import { AccountMenu } from './AccountMenu';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isEmailUser = user?.authMethod === 'email';

  const navItems = [
    { path: '/dashboard', label: t('nav.home') },
    { path: '/history', label: t('nav.movements') },
    { path: '/wallets', label: t('nav.deposits') },
    { path: '/requests', label: t('nav.withdrawals') },
    { path: '/operational', label: t('nav.operating') },
  ];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const renderNavLink = (item, mobile = false) => {
    const isActive = location.pathname === item.path;
    const baseClass = mobile
      ? `nav-link flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-cream/10 text-cream border border-border-cream'
            : 'text-text-primary hover:bg-accent-dim hover:text-cream'
        }`
      : `nav-link font-medium transition-colors pb-1 ${
          isActive
            ? 'nav-link-active text-cream border-b-2 border-cream'
            : 'text-text-muted hover:text-cream'
        }`;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={baseClass}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="app-header border-b border-border-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[3.5rem] md:h-16">
          {user ? (
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-border-dark p-2 text-cream"
              aria-label={isMobileMenuOpen ? t('common.closeMenu') : t('common.openMenu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          ) : (
            <div className="md:hidden w-10" />
          )}

          <Link to="/dashboard" className="shrink-0 md:mr-8">
            <WinbitLogo className="items-center md:items-start" size="compact" />
          </Link>

          {user ? (
            <nav className="hidden md:flex items-center gap-5 lg:gap-6 flex-1">
              {navItems.map((item) => renderNavLink(item))}
            </nav>
          ) : null}

          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center gap-1 rounded-lg border border-border-dark p-1">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('es')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                    i18n.language === 'es'
                      ? 'bg-primary text-[#041010]'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                    i18n.language === 'en'
                      ? 'bg-primary text-[#041010]'
                      : 'text-text-muted hover:text-primary'
                  }`}
                >
                  EN
                </button>
              </div>

              <NotificationBell />
              <AccountMenu showDesktopLogout />
            </div>
          ) : null}
        </div>
      </div>

      {user ? (
        <div
          id="mobile-menu"
          className={`md:hidden border-t border-border-dark px-4 py-4 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        >
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => renderNavLink(item, true))}
          </nav>

          {isEmailUser ? (
            <Link
              to="/change-password"
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-primary hover:bg-accent-dim"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('auth.changePassword.title')}
            </Link>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-border-dark">
            <div className="flex items-center gap-1 rounded-lg border border-border-dark p-1">
              <button
                type="button"
                onClick={() => handleLanguageChange('es')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                  i18n.language === 'es' ? 'bg-primary text-[#041010]' : 'text-text-muted'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                  i18n.language === 'en' ? 'bg-primary text-[#041010]' : 'text-text-muted'
                }`}
              >
                EN
              </button>
            </div>
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              variant="outline"
              className="text-sm py-2"
            >
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
};
