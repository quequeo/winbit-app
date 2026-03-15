import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { changeInvestorPassword } from '../services/api';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export const ChangePasswordPage = () => {
  const { user, userEmail } = useAuth();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setSubmitting(false);
  };

  const isEmailUser = user?.authMethod === 'email';

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {t('auth.changePassword.title')}
      </h1>
      <p className="text-sm text-text-muted mb-6">{t('auth.changePassword.subtitle')}</p>

      {!isEmailUser && (
        <div className="p-4 bg-[rgba(255,152,0,0.15)] text-warning rounded-lg text-sm mb-6">
          {t('auth.changePassword.googleInfo')}
        </div>
      )}

      <div className="bg-dark-card rounded-lg border border-border-dark p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded-lg border border-border-dark bg-dark-section px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:border-border-accent focus:ring-2 focus:ring-accent-dim outline-none"
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
              className="w-full rounded-lg border border-border-dark bg-dark-section px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:border-border-accent focus:ring-2 focus:ring-accent-dim outline-none"
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
              className="w-full rounded-lg border border-border-dark bg-dark-section px-4 py-3 text-sm text-text-primary placeholder:text-text-dim focus:border-border-accent focus:ring-2 focus:ring-accent-dim outline-none"
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="p-3 bg-[rgba(239,83,80,0.15)] text-error rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-[rgba(76,175,80,0.15)] text-success rounded-lg text-sm">
              {t('auth.changePassword.success')}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? t('common.sending') : t('auth.changePassword.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
};
