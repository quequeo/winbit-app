import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Toast } from '../../ui/Toast';
import { sendDepositRequest } from '../../../services/email';
import { useTranslation } from 'react-i18next';

const WINBIT_LEMONTAG = 'lemontag-winbit-pending';

const networkOptions = [
  { value: '', label: 'Seleccioná una red' },
  { value: 'USDT-TRC20', label: 'USDT (TRC20)' },
  { value: 'USDT-BEP20', label: 'USDT (BEP20)' },
  { value: 'USDT-ERC20', label: 'USDT (ERC20)' },
  { value: 'USDT-POLYGON', label: 'USDT (Polygon)' },
  { value: 'USDC-ERC20', label: 'USDC (ERC20)' },
  { value: 'USDC-POLYGON', label: 'USDC (Polygon)' },
];

export const DepositForm = ({ userName, userEmail }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: '',
    method: 'crypto',
    network: '',
    transactionHash: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: 'Ingresá un monto válido' });
      return;
    }

    if (formData.method === 'crypto' && !formData.network) {
      setMessage({ type: 'error', text: 'Seleccioná una red' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await sendDepositRequest({
      userName,
      userEmail,
      amount: `$${parseFloat(formData.amount).toFixed(2)}`,
      method: formData.method,
      network: formData.method === 'crypto' ? formData.network : formData.method,
      transactionHash: formData.method === 'crypto' ? formData.transactionHash : '',
    });

    setLoading(false);

    if (result.success) {
      setToast({
        type: 'success',
        title: t('requests.registered.title'),
        message: registeredTextByMethod[formData.method] || t('requests.registered.crypto'),
      });
      setFormData({ amount: '', method: 'crypto', network: '', transactionHash: '' });
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'No se pudo enviar la solicitud. Intentá de nuevo.',
      });
    }
  };

  return (
    <Card title="Registrar depósito">
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
          value={formData.method}
          onChange={handleChange}
          options={methodOptions}
          disabled={loading}
          required
        />

        {formData.method === 'lemon' && (
          <div className="bg-accent/30 p-4 rounded-lg text-sm text-gray-700">
            <p className="font-medium">{t('requests.lemonTag.winbitLabel')}</p>
            <p className="mt-1 font-mono">{WINBIT_LEMONTAG}</p>
          </div>
        )}

        <Input
          label="Monto"
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          disabled={loading}
          required
          min="0.01"
          step="0.01"
          placeholder="Ingresá el monto en USD"
        />

        {formData.method === 'crypto' && (
          <>
            <Select
              label="Red"
              id="network"
              name="network"
              value={formData.network}
              onChange={handleChange}
              options={networkOptions}
              disabled={loading}
              required
            />

            <Input
              label="Hash de transacción (opcional)"
              type="text"
              id="transactionHash"
              name="transactionHash"
              value={formData.transactionHash}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ingresá el hash o ID"
            />
          </>
        )}

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
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </form>
    </Card>
  );
};
