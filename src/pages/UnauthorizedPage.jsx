import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const UnauthorizedPage = () => {
  const { t } = useTranslation();
  const { user, userEmail, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 py-8">
      <div className="max-w-md w-full">
        <Card className="text-center p-8">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[rgba(239,83,80,0.15)] mb-6">
            <svg
              className="h-8 w-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text-primary mb-4">{t('unauthorized.title')}</h1>

          {/* User email */}
          <p className="text-sm text-text-muted mb-4">
            {t('unauthorized.currentAccount')}: <strong>{userEmail ?? user?.email}</strong>
          </p>

          {/* Message */}
          <p className="text-text-primary mb-6 leading-relaxed">{t('unauthorized.message')}</p>

          {/* Contact info */}
          <div className="bg-dark-section rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-text-primary mb-2">
              {t('unauthorized.contactTitle')}
            </p>
            <p className="text-sm text-text-primary">📧 winbit.cfds@gmail.com</p>
          </div>

          {/* Logout button */}
          <Button onClick={handleLogout} className="w-full" variant="primary">
            {t('unauthorized.logout')}
          </Button>

          {/* Additional help */}
          <p className="text-xs text-text-muted mt-4">{t('unauthorized.helpText')}</p>
        </Card>
      </div>
    </div>
  );
};
