import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Toast } from '../../ui/Toast';
import { sendWithdrawalRequest } from '../../../services/email';
import { createInvestorRequest } from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export const WithdrawalForm = ({ userName, userEmail, currentBalance }) => {
  const [type, setType] = useState('partial');
  const [method, setMethod] = useState('crypto');
  const [amount, setAmount] = useState('');
  const [lemonTag, setLemonTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [toast, setToast] = useState(null);
  const { t } = useTranslation();

  const methodOptions = [
    { value: 'crypto', label: t('requests.method.crypto') },
    { value: 'lemon', label: t('requests.method.lemon') },
    { value: 'cash', label: t('requests.method.cash') },
    { value: 'international', label: t('requests.method.international') },
  ];

  const registeredTextByMethod = {
    crypto: t('requests.registered.crypto'),
    lemon: t('requests.registered.crypto'),
    cash: t('requests.registered.cash'),
    international: t('requests.registered.international'),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const withdrawalAmount = type === 'full' ? currentBalance : parseFloat(amount);

    if (type === 'partial' && (!amount || withdrawalAmount <= 0)) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.invalidAmount') });
      return;
    }

    if (withdrawalAmount > currentBalance) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.exceedsBalance') });
      return;
    }

    if (method === 'lemon' && !lemonTag.trim()) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.lemonTagRequired') });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Mapear el método al formato que espera el backend
    const methodMap = {
      crypto: 'USDT', // Por defecto USDT para crypto
      lemon: 'LEMON_CASH',
      cash: 'CASH',
      international: 'SWIFT',
    };

    // Enviar solicitud al backend de Rails
    const apiResult = await createInvestorRequest({
      email: userEmail,
      type: 'WITHDRAWAL',
      amount: withdrawalAmount,
      method: methodMap[method] || 'USDT',
      lemontag: method === 'lemon' && lemonTag.trim() ? lemonTag.trim() : null,
    });

    // También enviar por email como backup
    const emailResult = await sendWithdrawalRequest({
      userName,
      userEmail,
      type: type === 'full' ? 'Full Withdrawal' : 'Partial Withdrawal',
      amount: formatCurrency(withdrawalAmount),
      method,
      lemonTag: lemonTag.trim(),
    });

    setLoading(false);

    // Consideramos éxito si al menos uno de los dos funciona
    const success = apiResult.data || emailResult.success;

    if (success) {
      setToast({
        type: 'success',
        title: t('requests.registered.title'),
        message: registeredTextByMethod[method] || t('requests.registered.crypto'),
      });
      setAmount('');
      setType('partial');
      setMethod('crypto');
      setLemonTag('');
    } else {
      setMessage({
        type: 'error',
        text: apiResult.error || emailResult.error || t('requests.errors.sendFailed'),
      });
    }
  };

  return (
    <Card title={t('withdrawals.formTitle')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {toast && (
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={8000}
            onClose={() => setToast(null)}
          />
        )}

        <Select
          label={t('requests.method.label')}
          id="method"
          name="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={methodOptions}
          disabled={loading}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('withdrawals.form.type.label')} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="partial"
                checked={type === 'partial'}
                onChange={(e) => setType(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>{t('withdrawals.form.type.partial')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="full"
                checked={type === 'full'}
                onChange={(e) => setType(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>{t('withdrawals.form.type.full')}</span>
            </label>
          </div>
        </div>

        <Input
          label={t('withdrawals.form.amount.label')}
          type="number"
          id="amount"
          name="amount"
          value={type === 'full' ? formatCurrency(currentBalance) : amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={type === 'full' || loading}
          required={type === 'partial'}
          min="0.01"
          step="0.01"
          placeholder={t('withdrawals.form.amount.placeholder')}
        />

        {method === 'lemon' && (
          <Input
            label={t('requests.lemonTag.label')}
            type="text"
            id="lemonTag"
            name="lemonTag"
            value={lemonTag}
            onChange={(e) => setLemonTag(e.target.value)}
            disabled={loading}
            required
            placeholder={t('requests.lemonTag.placeholder')}
          />
        )}

        <div className="bg-accent/30 p-4 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-1">{t('withdrawals.processingHoursTitle')}</p>
          <p>• {t('withdrawals.processingHoursLine1')}</p>
          <p>• {t('withdrawals.processingHoursLine2')}</p>
        </div>

        {message && (
          <div
            role="alert"
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('common.sending') : t('common.sendRequest')}
        </Button>
      </form>
    </Card>
  );
};
