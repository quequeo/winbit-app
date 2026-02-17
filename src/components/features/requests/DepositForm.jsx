import { useState, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { createInvestorRequest } from '../../../services/api';
import { useTranslation } from 'react-i18next';

const CASH_METHODS = ['CASH_ARS', 'CASH_USD'];

const FALLBACK_METHODS = [
  { value: 'CASH_ARS', labelKey: 'requests.method.cash_ars' },
  { value: 'CASH_USD', labelKey: 'requests.method.cash_usd' },
  { value: 'TRANSFER_ARS', labelKey: 'requests.method.transfer_ars' },
  { value: 'SWIFT', labelKey: 'requests.method.swift' },
  { value: 'CRYPTO', labelKey: 'requests.method.crypto' },
];

const CATEGORY_TO_METHOD = {
  CASH_ARS: 'CASH_ARS',
  CASH_USD: 'CASH_USD',
  BANK_ARS: 'TRANSFER_ARS',
  LEMON: 'LEMON',
  CRYPTO: 'CRYPTO',
  SWIFT: 'SWIFT',
};

export const DepositForm = ({ userEmail, depositOptions = [] }) => {
  const { t } = useTranslation();

  const methodOptions = useMemo(() => {
    if (!depositOptions || depositOptions.length === 0) {
      return FALLBACK_METHODS.map((m) => ({ value: m.value, label: t(m.labelKey) }));
    }

    const seen = new Set();
    const methods = [];
    for (const opt of depositOptions) {
      const method = CATEGORY_TO_METHOD[opt.category] || opt.category;
      if (!seen.has(method)) {
        seen.add(method);
        methods.push({
          value: method,
          label: t(`deposits.categories.${opt.category}`, opt.category),
        });
      }
    }
    return methods;
  }, [depositOptions, t]);

  const defaultMethod = methodOptions[0]?.value || 'CASH_ARS';

  const [formData, setFormData] = useState({
    amount: '',
    method: defaultMethod,
  });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(null);

  const isCash = CASH_METHODS.includes(formData.method);
  const attachmentRequired = !isCash;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('deposits.requestForm.attachment.tooLarge') });
      setAttachment(null);
      return;
    }
    setAttachment(file);
    setMessage(null);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: t('deposits.requestForm.validation.invalidAmount') });
      return;
    }

    if (attachmentRequired && !attachment) {
      setMessage({ type: 'error', text: t('deposits.requestForm.validation.attachmentRequired') });
      return;
    }

    setLoading(true);
    setMessage(null);

    let attachmentUrl = null;
    if (attachment) {
      try {
        attachmentUrl = await toBase64(attachment);
      } catch {
        attachmentUrl = null;
      }
    }

    const apiResult = await createInvestorRequest({
      email: userEmail,
      type: 'DEPOSIT',
      amount: parseFloat(formData.amount),
      method: formData.method,
      network: null,
      transactionHash: null,
      attachmentUrl,
    });

    setLoading(false);

    if (apiResult.data) {
      setModal({
        type: 'success',
        title: t('requests.registered.title'),
        message: t('requests.registered.crypto'),
      });
      setFormData((s) => ({ ...s, amount: '' }));
      setAttachment(null);
    } else {
      setMessage({
        type: 'error',
        text: apiResult.error || t('requests.errors.sendFailed'),
      });
    }
  };

  return (
    <>
      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.title}
        message={modal?.message}
        type={modal?.type}
      />
      <Card title={t('deposits.requestForm.title')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-700">
              {t('deposits.requestForm.amount.label')} *
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              placeholder="1000"
              required
            />
          </div>

          <div>
            <label htmlFor="method" className="mb-2 block text-sm font-medium text-gray-700">
              {t('requests.method.label')} *
            </label>
            <Select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleChange}
              required
            >
              {methodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="attachment" className="mb-2 block text-sm font-medium text-gray-700">
              {t('deposits.requestForm.attachment.label')} {attachmentRequired ? '*' : ''}
            </label>
            <p className="mb-2 text-xs text-gray-500">
              {t('deposits.requestForm.attachment.description')}
            </p>
            <input
              id="attachment"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {attachment && (
              <p className="mt-1 text-xs text-green-600">
                {attachment.name} ({(attachment.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div className="bg-accent/30 p-4 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-1">{t('deposits.processingHoursTitle')}</p>
            <p>• {t('deposits.processingHoursLine1')}</p>
            <p>• {t('deposits.processingHoursLine2')}</p>
          </div>

          {message && (
            <div
              role="alert"
              className={`rounded-lg p-4 ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-800'
                  : message.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-blue-50 text-blue-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('deposits.requestForm.submitting') : t('deposits.requestForm.submit')}
          </Button>
        </form>
      </Card>
    </>
  );
};
