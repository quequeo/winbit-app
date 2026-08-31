import { useState, useMemo, useEffect } from 'react';
import { Clock, ArrowRight, Mail, DollarSign } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { PaymentMethodIcon } from '../../ui/PaymentMethodIcon';
import { resolvePaymentMethodVariant } from '../../../utils/paymentMethodVariant';
import { normalizeWithdrawalPaymentMethods } from '../../../utils/normalizeWithdrawalPaymentMethods';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { DisclaimerCard } from '../../ui/DisclaimerCard';
import { createInvestorRequest, getWithdrawalFeePreview } from '../../../services/api';
import { usePaymentMethods } from '../../../hooks/usePaymentMethods';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';

const CRYPTO_NETWORKS = [
  { value: 'BEP20', label: 'BEP20 (BSC)' },
  { value: 'POLYGON', label: 'Polygon' },
  { value: 'ERC20', label: 'ERC20 (Ethereum)' },
  { value: 'TRC20', label: 'TRC20 (Tron)' },
];

export const WithdrawalForm = ({ userEmail, currentBalance, availableBalance }) => {
  const withdrawable = availableBalance ?? currentBalance;
  const [type, setType] = useState('partial');
  const [method, setMethod] = useState('USDT');
  const [lemontag, setLemontag] = useState('');
  const [network, setNetwork] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const { t } = useTranslation();
  const {
    paymentMethods: apiMethods,
    loading: methodsLoading,
    error: methodsError,
  } = usePaymentMethods('withdrawal');

  const paymentMethods = useMemo(() => normalizeWithdrawalPaymentMethods(apiMethods), [apiMethods]);

  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m.code === method) ?? null,
    [paymentMethods, method],
  );

  useEffect(() => {
    if (!paymentMethods.length) return;
    if (!paymentMethods.some((m) => m.code === method)) {
      setMethod(paymentMethods[0].code);
    }
  }, [paymentMethods, method]);

  const methodOptions = useMemo(
    () =>
      paymentMethods.map((m) => ({
        value: m.code,
        label: m.name || m.code,
      })),
    [paymentMethods],
  );

  const networkOptions = [
    { value: '', label: t('withdrawals.form.network.placeholder') },
    ...CRYPTO_NETWORKS,
  ];

  const withdrawalAmount = type === 'full' ? withdrawable : parseFloat(amount);

  const handleMethodChange = (e) => {
    const next = e.target.value;
    setMethod(next);
    const nextMeta = paymentMethods.find((m) => m.code === next);
    if (!nextMeta?.requiresNetwork) setNetwork('');
    if (!nextMeta?.requiresWalletAddress) setWalletAddress('');
    if (!nextMeta?.requiresLemontag) setLemontag('');
  };

  const validate = () => {
    if (type === 'partial' && (!amount || withdrawalAmount <= 0)) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.invalidAmount') });
      return false;
    }
    if (withdrawalAmount > withdrawable) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.exceedsBalance') });
      return false;
    }
    if (selectedMethod?.requiresLemontag && !lemontag.trim()) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.lemonTagRequired') });
      return false;
    }
    if (selectedMethod?.requiresNetwork && !network) {
      setMessage({ type: 'error', text: t('withdrawals.form.validation.networkRequired') });
      return false;
    }
    if (selectedMethod?.requiresWalletAddress && !walletAddress.trim()) {
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
      network: selectedMethod?.requiresNetwork ? network : null,
      walletAddress: selectedMethod?.requiresWalletAddress ? walletAddress.trim() : null,
      lemontag: selectedMethod?.requiresLemontag ? lemontag.trim() : null,
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
      setLemontag('');
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

  const showCryptoFields = selectedMethod?.requiresNetwork || selectedMethod?.requiresWalletAddress;
  const showLemontagField = selectedMethod?.requiresLemontag;

  const fieldControlClass = 'withdrawal-field-control';

  const methodIconVariant = resolvePaymentMethodVariant(
    selectedMethod ?? { code: method, name: methodOptions.find((o) => o.value === method)?.label },
  );

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal !== null}
        title={t('withdrawals.confirm.title')}
        onConfirm={submitRequest}
        onCancel={() => setConfirmModal(null)}
        loading={loading}
        confirmLabel={t('withdrawals.confirm.confirmLabel')}
      >
        {confirmModal && (
          <div className="w-full space-y-3 text-sm text-text-primary">
            <div className="flex justify-between">
              <span>{t('withdrawals.confirm.amount')}</span>
              <span className="font-semibold">{formatCurrency(confirmModal.withdrawalAmount)}</span>
            </div>
            {confirmModal.hasFee ? (
              <div className="flex justify-between text-primary">
                <span>{t('withdrawals.confirm.fee', { pct: confirmModal.feePercentage })}</span>
                <span className="font-semibold">{formatCurrency(confirmModal.feeAmount)}</span>
              </div>
            ) : (
              <p className="text-text-muted text-xs">{t('withdrawals.confirm.noFee')}</p>
            )}
            {confirmModal.hasFee && (
              <div className="border-t border-[rgba(255,255,255,0.08)] pt-3 flex justify-between font-semibold text-text-primary">
                <span>{t('withdrawals.confirm.totalDebited')}</span>
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

      <Card title={t('withdrawals.formTitle')} className="withdrawal-form-card">
        <form onSubmit={handleSubmit} className="withdrawal-form space-y-6">
          {methodsError && (
            <p className="text-xs text-text-muted" role="status">
              {t('withdrawals.form.methodsLoadWarning')}
            </p>
          )}

          <Select
            label={t('requests.method.label')}
            id="method"
            name="method"
            value={method}
            onChange={handleMethodChange}
            options={methodOptions}
            disabled={loading || methodsLoading}
            required
            leadingAdornment={<PaymentMethodIcon variant={methodIconVariant} compact />}
            controlClassName={fieldControlClass}
          />

          {showLemontagField && (
            <Input
              label={t('requests.lemonTag.label')}
              type="text"
              id="lemontag"
              name="lemontag"
              value={lemontag}
              onChange={(e) => setLemontag(e.target.value)}
              disabled={loading}
              required
              placeholder={t('requests.lemonTag.placeholder')}
              autoComplete="off"
            />
          )}

          {showCryptoFields && (
            <>
              <Select
                label={t('withdrawals.form.network.label')}
                id="network"
                name="network"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                options={networkOptions}
                disabled={loading}
                required={selectedMethod?.requiresNetwork}
              />

              <Input
                label={t('withdrawals.form.walletAddress.label')}
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={loading}
                required={selectedMethod?.requiresWalletAddress}
                placeholder={t('withdrawals.form.walletAddress.placeholder')}
              />

              <DisclaimerCard title={t('common.important')}>
                {t('withdrawals.form.walletWarning')}
              </DisclaimerCard>
            </>
          )}

          <div>
            <label className="withdrawal-field-label">
              {t('withdrawals.form.type.label')} <span className="text-error">*</span>
            </label>
            <div className="withdrawal-type-toggle">
              <button
                type="button"
                onClick={() => setType('partial')}
                className={`withdrawal-type-option ${type === 'partial' ? 'withdrawal-type-option--active' : ''}`}
              >
                {t('withdrawals.form.type.partial')}
              </button>
              <button
                type="button"
                onClick={() => setType('full')}
                className={`withdrawal-type-option ${type === 'full' ? 'withdrawal-type-option--active' : ''}`}
              >
                {t('withdrawals.form.type.full')}
              </button>
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
              icon={DollarSign}
              controlClassName={fieldControlClass}
            />
          )}

          <div className="withdrawal-processing-card">
            <div className="withdrawal-processing-card__header">
              <div className="withdrawal-processing-card__header-icon" aria-hidden>
                <Clock strokeWidth={1.75} />
              </div>
              <p className="withdrawal-processing-card__title">
                {t('withdrawals.processingHoursTitle')}
              </p>
            </div>
            <div className="withdrawal-processing-card__grid">
              <div className="withdrawal-processing-card__col">
                <div className="withdrawal-processing-card__col-head">
                  <Clock strokeWidth={2} aria-hidden />
                  <span>{t('withdrawals.processingHoursUntil')}</span>
                </div>
                <p className="withdrawal-processing-card__col-detail">
                  {t('withdrawals.processingHoursUntilDetail')}
                </p>
              </div>
              <div className="withdrawal-processing-card__col">
                <div className="withdrawal-processing-card__col-head">
                  <Clock strokeWidth={2} aria-hidden />
                  <span>{t('withdrawals.processingHoursAfter')}</span>
                </div>
                <p className="withdrawal-processing-card__col-detail">
                  {t('withdrawals.processingHoursAfterDetail')}
                </p>
              </div>
              <div className="withdrawal-processing-card__col">
                <div className="withdrawal-processing-card__col-head">
                  <Mail strokeWidth={2} aria-hidden />
                  <span>{t('withdrawals.processingHoursReceipt')}</span>
                </div>
                <p className="withdrawal-processing-card__col-detail">
                  {t('withdrawals.processingHoursReceiptDetail')}
                </p>
              </div>
            </div>
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

          <Button
            type="submit"
            disabled={loading || methodsLoading}
            className="w-full withdrawal-submit-btn"
          >
            <span className="withdrawal-submit-btn__text">
              {loading ? t('common.sending') : t('common.sendRequest')}
            </span>
            {!loading ? (
              <ArrowRight className="withdrawal-submit-btn__arrow" strokeWidth={1.75} aria-hidden />
            ) : null}
          </Button>
        </form>
      </Card>
    </>
  );
};
