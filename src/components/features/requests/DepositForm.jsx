import { useState, useMemo, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';
import { createInvestorRequest } from '../../../services/api';
import { uploadImage } from '../../../utils/uploadImage';
import {
  buildDepositFormMethodOptions,
  resolveDefaultDepositFormMethodId,
} from '../../../utils/depositFormMethods';
import { useTranslation } from 'react-i18next';
import { ReceiptAttachment } from '../attachments/ReceiptAttachment';

const FALLBACK_METHODS = [
  { value: 'CASH_USD', labelKey: 'requests.method.cash_usd', apiMethod: 'CASH_USD', isCash: true },
  { value: 'SWIFT', labelKey: 'requests.method.swift', apiMethod: 'SWIFT', isCash: false },
  { value: 'CRYPTO', labelKey: 'requests.method.crypto', apiMethod: 'CRYPTO', isCash: false },
];

export const DepositForm = ({
  userEmail,
  depositOptions = [],
  hideTitle = false,
  selectedOptionId = null,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const methodOptions = useMemo(() => {
    const fromOptions = buildDepositFormMethodOptions(depositOptions);
    if (fromOptions.length) return fromOptions;

    return FALLBACK_METHODS.map((method) => ({
      value: method.value,
      label: t(method.labelKey),
      apiMethod: method.apiMethod,
      isCash: method.isCash,
      option: null,
    }));
  }, [depositOptions, t]);

  const defaultMethodId = useMemo(
    () => resolveDefaultDepositFormMethodId(methodOptions, selectedOptionId),
    [methodOptions, selectedOptionId],
  );

  const [formData, setFormData] = useState({
    amount: '',
    method: defaultMethodId,
  });
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(null);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      method: resolveDefaultDepositFormMethodId(methodOptions, selectedOptionId),
    }));
  }, [methodOptions, selectedOptionId]);

  const selectedMethod = useMemo(
    () => methodOptions.find((opt) => opt.value === formData.method) ?? methodOptions[0] ?? null,
    [methodOptions, formData.method],
  );

  const isCash = selectedMethod?.isCash ?? false;
  const attachmentRequired = !isCash;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('deposits.requestForm.attachment.tooLarge') });
      clearAttachment();
      return;
    }
    setAttachment(file);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      setMessage({ type: 'error', text: t('deposits.requestForm.validation.emailRequired') });
      return;
    }
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
      setLoadingPhase('uploading');
      const { url, error: uploadError } = await uploadImage(attachment, 'deposits');
      setLoadingPhase(null);
      if (uploadError) {
        setLoading(false);
        setLoadingPhase(null);
        setMessage({ type: 'error', text: uploadError });
        return;
      }
      attachmentUrl = url;
    }

    setLoadingPhase('submitting');
    const apiResult = await createInvestorRequest({
      email: userEmail,
      type: 'DEPOSIT',
      amount: parseFloat(formData.amount),
      method: selectedMethod?.apiMethod ?? formData.method,
      network: null,
      transactionHash: null,
      attachmentUrl,
    });

    setLoading(false);
    setLoadingPhase(null);

    if (apiResult.data) {
      queryClient.invalidateQueries({ queryKey: ['investor'] });
      setModal({
        type: 'success',
        title: t('requests.registered.title'),
        message: t('requests.registered.crypto'),
      });
      setFormData((state) => ({ ...state, amount: '' }));
      clearAttachment();
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
      <Card title={hideTitle ? undefined : t('deposits.requestForm.title')} className="border-t-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-text-primary">
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
              placeholder="1.000,00"
              required
            />
          </div>

          <div>
            <label htmlFor="method" className="mb-2 block text-sm font-medium text-text-primary">
              {t('requests.method.label')} *
            </label>
            <Select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleChange}
              required
              options={methodOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </div>

          <div>
            <label
              htmlFor="attachment"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              {t('deposits.requestForm.attachment.label')} {attachmentRequired ? '*' : ''}
            </label>
            <p className="mb-2 text-xs text-text-muted">
              {t('deposits.requestForm.attachment.description')}
            </p>
            <input
              id="attachment"
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[rgba(57, 131, 109,0.10)] file:text-[#8dc8bf] hover:file:bg-[rgba(57, 131, 109,0.18)] cursor-pointer"
            />
            {attachment ? <ReceiptAttachment file={attachment} onRemove={clearAttachment} /> : null}
          </div>

          <div className="deposit-notice">
            <Clock className="deposit-notice__icon" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0">
              <p className="deposit-notice__title">{t('deposits.processingHoursTitle')}</p>
              <ul className="deposit-notice__list">
                <li>{t('deposits.processingHoursLine1')}</li>
                <li>{t('deposits.processingHoursLine2')}</li>
              </ul>
            </div>
          </div>

          {message && (
            <div
              role="alert"
              className={`rounded-lg p-4 ${
                message.type === 'error'
                  ? 'badge-rejected'
                  : message.type === 'success'
                    ? 'badge-completed'
                    : 'info-box'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="deposit-submit-btn w-full flex items-center justify-center gap-2"
          >
            {loading && <Spinner size="sm" />}
            {loading
              ? loadingPhase === 'uploading'
                ? t('deposits.requestForm.uploading')
                : t('deposits.requestForm.submitting')
              : t('deposits.requestForm.submit')}
          </Button>
        </form>
      </Card>
    </>
  );
};
