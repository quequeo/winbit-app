import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard') },
    { path: '/wallets', label: t('nav.deposits') },
    { path: '/requests', label: t('nav.withdrawals') },
    { path: '/history', label: t('nav.history') },
  ];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Winbit</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('es')}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    i18n.language === 'es'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 text-xs font-medium rounded-md ${
                    i18n.language === 'en'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  EN
                </button>
              </div>
              <span className="hidden sm:block text-sm text-gray-600">{user.email}</span>
              <Button onClick={logout} variant="outline" className="text-sm py-2">
                {t('auth.logout')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {user && (
        <nav className="md:hidden border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium py-2 ${
                  location.pathname === item.path
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => handleLanguageChange('es')}
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  i18n.language === 'es' ? 'bg-primary text-white' : 'text-gray-600'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-1 text-xs font-medium rounded-md ${
                  i18n.language === 'en' ? 'bg-primary text-white' : 'text-gray-600'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
