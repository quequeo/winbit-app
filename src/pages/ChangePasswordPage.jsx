import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { changeInvestorPassword } from '../services/api';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/ToastProvider';

export const ChangePasswordPage = () => {
  const { user, userEmail } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEmailUser = user?.authMethod === 'email';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailUser) return;

    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t('auth.changePassword.mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.changePassword.tooShort'));
      return;
    }

    setSubmitting(true);

    const result = await changeInvestorPassword(userEmail, currentPassword, newPassword);

    if (result.error) {
      setError(result.error);
    } else {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast({
        type: 'success',
        message: t('auth.changePassword.success'),
      });
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <header className="page-header mb-6">
        <h1 className="page-title">{t('auth.changePassword.title')}</h1>
        <p className="section-subtitle">{t('auth.changePassword.subtitle')}</p>
      </header>

      {!isEmailUser ? (
        <div className="rounded-[14px] border border-[rgba(224,180,75,0.28)] bg-[rgba(224,180,75,0.14)] p-4 text-sm text-warning">
          {user?.authMethod === 'dev'
            ? t('auth.changePassword.devInfo')
            : t('auth.changePassword.googleInfo')}
        </div>
      ) : (
        <div className="winbit-card winbit-card--premium relative overflow-hidden p-6">
          <div className="wb-geo-accent" aria-hidden />
          <form onSubmit={handleSubmit} className="relative z-[1] space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                {t('auth.changePassword.current')}
              </label>
              <input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                {t('auth.changePassword.new')}
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                {t('auth.changePassword.confirm')}
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error ? (
              <div className="rounded-[14px] border border-[rgba(201,108,103,0.28)] bg-[rgba(201,108,103,0.16)] p-3 text-sm text-error">
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? t('common.sending') : t('auth.changePassword.submit')}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
