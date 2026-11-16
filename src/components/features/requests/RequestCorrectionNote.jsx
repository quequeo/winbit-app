import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/formatDate';
import { formatUsdDisplay } from '../../../utils/formatUsdDisplay';

/** Aviso en el formulario cuando se está corrigiendo una solicitud pendiente. */
export const RequestCorrectionNote = ({ request, type, onDismiss }) => {
  const { t } = useTranslation();
  if (!request) return null;

  const key =
    type === 'DEPOSIT'
      ? 'requests.manage.correction.depositNote'
      : 'requests.manage.correction.withdrawalNote';

  return (
    <div className="request-correction-note" role="status" data-testid="request-correction-note">
      <p>
        {t(key, {
          amount: formatUsdDisplay(Math.abs(Number(request.amount) || 0)),
          date: formatDate(request.date, { time: false }),
        })}
      </p>
      {onDismiss ? (
        <button type="button" className="request-correction-note__dismiss" onClick={onDismiss}>
          {t('requests.manage.correction.dismiss')}
        </button>
      ) : null}
    </div>
  );
};
