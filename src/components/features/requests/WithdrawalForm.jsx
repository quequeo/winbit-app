import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { sendWithdrawalRequest } from '../../../services/email';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

export const WithdrawalForm = ({ userName, userEmail, currentBalance }) => {
  const [type, setType] = useState('partial');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const withdrawalAmount = type === 'full' ? currentBalance : parseFloat(amount);

    if (type === 'partial' && (!amount || withdrawalAmount <= 0)) {
      setMessage({ type: 'error', text: 'Ingresá un monto válido' });
      return;
    }

    if (withdrawalAmount > currentBalance) {
      setMessage({ type: 'error', text: 'El monto supera el saldo actual' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await sendWithdrawalRequest({
      userName,
      userEmail,
      type: type === 'full' ? 'Full Withdrawal' : 'Partial Withdrawal',
      amount: formatCurrency(withdrawalAmount),
    });

    setLoading(false);

    if (result.success) {
      setMessage({
        type: 'success',
        text: 'Solicitud de retiro enviada. Te contactaremos pronto.',
      });
      setAmount('');
      setType('partial');
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'No se pudo enviar la solicitud. Intentá de nuevo.',
      });
    }
  };

  return (
    <Card title={t('withdrawals.formTitle')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de retiro <span className="text-red-500">*</span>
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
              <span>Parcial</span>
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
              <span>Total</span>
            </label>
          </div>
        </div>

        <Input
          label="Monto"
          type="number"
          id="amount"
          name="amount"
          value={type === 'full' ? formatCurrency(currentBalance) : amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={type === 'full' || loading}
          required={type === 'partial'}
          min="0.01"
          step="0.01"
          placeholder="Ingresá el monto en USD"
        />

        <div className="bg-accent/30 p-4 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-1">{t('withdrawals.processingHoursTitle')}</p>
          <p>• {t('withdrawals.processingHoursLine1')}</p>
          <p>• {t('withdrawals.processingHoursLine2')}</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </form>
    </Card>
  );
};
