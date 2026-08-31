import { sumPendingAmount } from './transactionHelpers';

/**
 * Capital disponible para retiro = portafolio − retiros pendientes − comisiones pendientes (si aplica).
 */
export const computeWithdrawableBalance = ({
  portfolioBalance = 0,
  history = [],
  pendingFees = 0,
  pendingAdjustments = 0,
}) => {
  const balance = Number(portfolioBalance) || 0;
  const pendingWithdrawals = sumPendingAmount(history, 'WITHDRAWAL');
  const fees = Number(pendingFees) || 0;
  const adjustments = Number(pendingAdjustments) || 0;
  const available = balance - pendingWithdrawals - fees - adjustments;
  return {
    portfolioBalance: balance,
    pendingWithdrawals,
    pendingFees: fees,
    pendingAdjustments: adjustments,
    availableForWithdrawal: Math.max(0, available),
  };
};
