import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { changeInvestorPassword } from '../services/api';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export const ChangePasswordPage = () => {
  const { user } = useAuth();
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

    const result = await changeInvestorPassword(user?.email, currentPassword, newPassword);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.changePassword.title')}</h1>
      <p className="text-sm text-gray-600 mb-6">{t('auth.changePassword.subtitle')}</p>

      {!isEmailUser && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm mb-6">
          {t('auth.changePassword.googleInfo')}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('auth.changePassword.current')}
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.changePassword.new')}
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('auth.changePassword.confirm')}
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>}

          {success && (
            <div className="p-3 bg-green-50 text-green-800 rounded-lg text-sm">
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
