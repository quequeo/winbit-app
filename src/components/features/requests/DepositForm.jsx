import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { createInvestorRequest } from '../../../services/api';
import { uploadImage } from '../../../utils/uploadImage';
import { useTranslation } from 'react-i18next';

const BASE_NETWORK_OPTIONS = [
  { value: 'USDT-TRC20', label: 'USDT (TRC20)' },
  { value: 'USDT-BEP20', label: 'USDT (BEP20)' },
  { value: 'USDT-ERC20', label: 'USDT (ERC20)' },
  { value: 'USDT-POLYGON', label: 'USDT (Polygon)' },
  { value: 'USDC-ERC20', label: 'USDC (ERC20)' },
  { value: 'USDC-POLYGON', label: 'USDC (Polygon)' },
];

export const DepositForm = ({ userEmail }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: '',
    method: 'crypto',
    network: '',
    transactionHash: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(null);

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

  const networkOptions = [
    { value: '', label: t('deposits.requestForm.network.placeholder') },
    ...BASE_NETWORK_OPTIONS,
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'error', text: t('deposits.requestForm.validation.invalidAmount') });
      return;
    }

    if (formData.method === 'crypto' && !formData.network) {
      setMessage({ type: 'error', text: t('deposits.requestForm.validation.selectNetwork') });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Subir imagen si hay
    let attachmentUrl = null;
    if (attachment) {
      const uploadResult = await uploadImage(attachment, 'deposits');
      if (uploadResult.error) {
        setMessage({ type: 'error', text: uploadResult.error });
        setLoading(false);
        return;
      }
      attachmentUrl = uploadResult.url;
    }

    // Mapear el método y network al formato del backend
    let method = 'USDT'; // Por defecto
    let network = null;

    if (formData.method === 'crypto') {
      // Extraer el asset (USDT o USDC) del network
      if (formData.network.includes('USDT')) {
        method = 'USDT';
      } else if (formData.network.includes('USDC')) {
        method = 'USDC';
      }

      // Extraer el network (TRC20, BEP20, etc.)
      if (formData.network.includes('TRC20')) {
        network = 'TRC20';
      } else if (formData.network.includes('BEP20')) {
        network = 'BEP20';
      } else if (formData.network.includes('ERC20')) {
        network = 'ERC20';
      } else if (formData.network.includes('POLYGON')) {
        network = 'POLYGON';
      }
    } else if (formData.method === 'lemon') {
      method = 'LEMON_CASH';
    } else if (formData.method === 'cash') {
      method = 'CASH';
    }

    // Enviar solicitud al backend de Rails
    const apiResult = await createInvestorRequest({
      email: userEmail,
      type: 'DEPOSIT',
      amount: parseFloat(formData.amount),
      method: method,
      network: network,
      transactionHash:
        formData.method === 'crypto' && formData.transactionHash ? formData.transactionHash : null,
      attachmentUrl: attachmentUrl,
    });

    setLoading(false);

    if (apiResult.data) {
      setModal({
        type: 'success',
        title: t('requests.registered.title'),
        message: registeredTextByMethod[formData.method] || t('requests.registered.crypto'),
      });
      setFormData({ amount: '', method: 'crypto', network: '', transactionHash: '' });
      removeAttachment();
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

        {formData.method === 'crypto' && (
          <>
            <div>
              <label htmlFor="network" className="mb-2 block text-sm font-medium text-gray-700">
                {t('deposits.requestForm.network.label')} *
              </label>
              <Select
                id="network"
                name="network"
                value={formData.network}
                onChange={handleChange}
                required
              >
                {networkOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label
                htmlFor="transactionHash"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('deposits.requestForm.transactionHash.label')}
              </label>
              <Input
                id="transactionHash"
                name="transactionHash"
                type="text"
                value={formData.transactionHash}
                onChange={handleChange}
                placeholder="0x..."
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="attachment" className="mb-2 block text-sm font-medium text-gray-700">
            {t('deposits.requestForm.attachment.label')}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {t('deposits.requestForm.attachment.description')}
          </p>

          {!attachmentPreview ? (
            <div className="relative">
              <input
                id="attachment"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="attachment"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  {t('deposits.requestForm.attachment.upload')}
                </span>
              </label>
            </div>
          ) : (
            <div className="relative inline-block">
              <img
                src={attachmentPreview}
                alt="Preview"
                className="max-w-xs max-h-48 rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeAttachment}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
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
