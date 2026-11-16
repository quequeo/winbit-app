import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pencil, X } from 'lucide-react';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { useToast } from '../../ui/ToastProvider';
import { useAuth } from '../../../hooks/useAuth';
import { cancelInvestorRequest } from '../../../services/api';
import {
  buildCorrectionHref,
  isManageablePendingRequest,
  normalizeRequestType,
  parseRequestIdFromHistoryId,
} from '../../../utils/requestHistory';
import { formatUsdDisplay } from '../../../utils/formatUsdDisplay';

const ActionButtons = ({ row, compact, className }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { userEmail } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDeposit = normalizeRequestType(row.movement) === 'DEPOSIT';
  const amountLabel = formatUsdDisplay(Math.abs(Number(row.amount) || 0));

  const closeConfirm = () => {
    if (!loading) setConfirmOpen(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    const result = await cancelInvestorRequest(userEmail, parseRequestIdFromHistoryId(row.id));
    setLoading(false);
    setConfirmOpen(false);

    if (result.data) {
      showToast({
        title: t('requests.manage.cancelled.title'),
        message: t(
          isDeposit ? 'requests.manage.cancelled.deposit' : 'requests.manage.cancelled.withdrawal',
          { amount: amountLabel },
        ),
        type: 'success',
        duration: 6000,
      });
    } else {
      showToast({
        title: t('requests.manage.errors.title'),
        message:
          result.status === 422
            ? t('requests.manage.errors.alreadyProcessed')
            : t('requests.manage.errors.cancelFailed'),
        type: 'error',
        duration: 8000,
      });
    }

    // Tanto si se canceló como si ya estaba procesada, la fila tiene que reflejar el estado real.
    await queryClient.invalidateQueries({ queryKey: ['investor'] });
  };

  const sizeCls = compact ? ' pending-request-actions--compact' : '';

  return (
    <>
      <div
        className={`pending-request-actions${sizeCls}${className ? ` ${className}` : ''}`}
        role="group"
        aria-label={t('requests.manage.actionsLabel')}
      >
        <button
          type="button"
          className="pending-request-actions__btn"
          onClick={() => navigate(buildCorrectionHref(row))}
        >
          <Pencil className="pending-request-actions__icon" strokeWidth={2} aria-hidden />
          {t('requests.manage.correct')}
        </button>
        <button
          type="button"
          className="pending-request-actions__btn pending-request-actions__btn--danger"
          onClick={() => setConfirmOpen(true)}
        >
          <X className="pending-request-actions__icon" strokeWidth={2} aria-hidden />
          {t('requests.manage.cancel')}
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title={t('requests.manage.cancelConfirm.title')}
        onConfirm={handleCancel}
        onCancel={closeConfirm}
        loading={loading}
        confirmLabel={t('requests.manage.cancelConfirm.confirm')}
        cancelLabel={t('requests.manage.cancelConfirm.back')}
      >
        <p className="text-sm text-text-primary">
          {t(
            isDeposit
              ? 'requests.manage.cancelConfirm.deposit'
              : 'requests.manage.cancelConfirm.withdrawal',
            { amount: amountLabel },
          )}
        </p>
      </ConfirmModal>
    </>
  );
};

/**
 * "Corregir" y "Cancelar solicitud" para una solicitud de depósito o retiro pendiente.
 * No renderiza nada para cualquier otra fila.
 */
export const PendingRequestActions = ({ row, compact = false, className = '' }) => {
  if (!isManageablePendingRequest(row)) return null;
  return <ActionButtons row={row} compact={compact} className={className} />;
};
