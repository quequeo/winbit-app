import { useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { createInvestorRequest, getWithdrawalFeePreview } from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

const CRYPTO_NETWORKS = [
  { value: 'BEP20', label: 'BEP20 (BSC)' },
  { value: 'POLYGON', label: 'Polygon' },
  { value: 'ERC20', label: 'ERC20 (Ethereum)' },
  { value: 'TRC20', label: 'TRC20 (Tron)' },
];

export const WithdrawalForm = ({ userEmail, currentBalance }) => {
  const [type, setType] = useState('partial');
  const [method, setMethod] = useState('CASH_USD');
  const [network, setNetwork] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const { t } = useTranslation();

  const isCrypto = method === 'CRYPTO';

  const methodOptions = [
    { value: 'CASH_USD', label: t('requests.method.cash_usd') },
    { value: 'SWIFT', label: t('requests.method.swift') },
    { value: 'CRYPTO', label: t('requests.method.crypto') },
  ];

  const networkOptions = [
    { value: '', label: t('withdrawals.form.network.placeholder') },
    ...CRYPTO_NETWORKS,
  ];

  const withdrawalAmount = type === 'full' ? currentBalance : parseFloat(amount);

  const handleMethodChange = (e) => {
    setMethod(e.target.value);
    if (e.target.value !== 'CRYPTO') {
      setNetwork('');
      setWalletAddress('');
    }
  };

  const validate = () => {
    if (type === 'partial' && (!amount || withdrawalAmount <= 0)) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.invalidAmount') });
      return false;
    }
    if (withdrawalAmount > currentBalance) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.exceedsBalance') });
      return false;
    }
    if (isCrypto && !network) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.networkRequired') });
      return false;
    }
    if (isCrypto && !walletAddress.trim()) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.walletAddressRequired') });
      return false;
    }
    return true;
  };

  const submitRequest = async () => {
    setLoading(true);

    const apiResult = await createInvestorRequest({
      email: userEmail,
      type: 'WITHDRAWAL',
      amount: withdrawalAmount,
      method: method,
      network: isCrypto ? network : null,
      walletAddress: isCrypto ? walletAddress.trim() : null,
      lemontag: null,
    });

    setLoading(false);
    setConfirmModal(null);

    if (apiResult.data) {
      setModal({
        type: 'success',
        title: t('requests.registered.withdrawalTitle'),
        message: t('requests.registered.withdrawal'),
      });
      setAmount('');
      setType('partial');
      setNetwork('');
      setWalletAddress('');
    } else {
      setMessage({
        type: 'error',
        text: apiResult.error || t('requests.errors.sendFailed'),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage(null);

    const preview = await getWithdrawalFeePreview(userEmail, withdrawalAmount);

    setLoading(false);

    if (preview.error) {
      setMessage({ type: 'error', text: preview.error });
      return;
    }

    setConfirmModal(preview.data);
  };

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal !== null}
        title="Confirmar retiro"
        onConfirm={submitRequest}
        onCancel={() => setConfirmModal(null)}
        loading={loading}
      >
        {confirmModal && (
          <div className="w-full space-y-3 text-sm text-text-primary">
            <div className="flex justify-between">
              <span>Monto de retiro</span>
              <span className="font-semibold">{formatCurrency(confirmModal.withdrawalAmount)}</span>
            </div>
            {confirmModal.hasFee ? (
              <div className="flex justify-between text-primary">
                <span>Comisión de trading ({confirmModal.feePercentage}%)</span>
                <span className="font-semibold">{formatCurrency(confirmModal.feeAmount)}</span>
              </div>
            ) : (
              <p className="text-text-muted text-xs">
                No hay comisión de trading aplicable a este retiro.
              </p>
            )}
            {confirmModal.hasFee && (
              <div className="border-t border-[rgba(255,255,255,0.08)] pt-3 flex justify-between font-semibold text-text-primary">
                <span>Total debitado del portfolio</span>
                <span>
                  {formatCurrency(confirmModal.withdrawalAmount + confirmModal.feeAmount)}
                </span>
              </div>
            )}
          </div>
        )}
      </ConfirmModal>

      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.title}
        message={modal?.message}
        type={modal?.type}
      />

      <Card title={t('withdrawals.formTitle')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label={t('requests.method.label')}
            id="method"
            name="method"
            value={method}
            onChange={handleMethodChange}
            options={methodOptions}
            disabled={loading}
            required
          />

          {isCrypto && (
            <>
              <Select
                label={t('withdrawals.form.network.label')}
                id="network"
                name="network"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                options={networkOptions}
                disabled={loading}
                required
              />

              <Input
                label={t('withdrawals.form.walletAddress.label')}
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={loading}
                required
                placeholder={t('withdrawals.form.walletAddress.placeholder')}
              />

              <div className="info-box text-sm text-text-primary flex items-start gap-3">
                <AlertTriangle
                  className="w-5 h-5 shrink-0 text-warning mt-0.5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <p>{t('withdrawals.form.walletWarning')}</p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              {t('withdrawals.form.type.label')} <span className="text-error">*</span>
            </label>
            <div className="flex gap-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="partial"
                  checked={type === 'partial'}
                  onChange={(e) => setType(e.target.value)}
                  className="w-5 h-5 text-primary accent-[#65a7a5]"
                />
                <span>{t('withdrawals.form.type.partial')}</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="full"
                  checked={type === 'full'}
                  onChange={(e) => setType(e.target.value)}
                  className="w-5 h-5 text-primary accent-[#65a7a5]"
                />
                <span>{t('withdrawals.form.type.full')}</span>
              </label>
            </div>
          </div>

          {type === 'partial' && (
            <Input
              label={t('withdrawals.form.amount.label')}
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
              required
              min="0.01"
              step="0.01"
              placeholder={t('withdrawals.form.amount.placeholder')}
            />
          )}

          <div className="info-box text-sm text-text-primary">
            <p className="font-medium mb-1 flex items-center gap-2">
              <Clock
                className="w-4 h-4 shrink-0 text-[#8dc8bf]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              {t('withdrawals.processingHoursTitle')}
            </p>
            <p>• {t('withdrawals.processingHoursLine1')}</p>
            <p>• {t('withdrawals.processingHoursLine2')}</p>
            <p>• {t('withdrawals.processingHoursLine3')}</p>
          </div>

          {message && (
            <div
              role="alert"
              className={`p-4 rounded-lg ${
                message.type === 'success' ? 'badge-completed' : 'badge-rejected'
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
    </>
  );
};
