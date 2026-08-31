import { Link } from 'react-router-dom';

export const AccountActivityCard = ({
  title,
  dateTime,
  description,
  detailLine,
  detailSecondaryLine,
  balanceImpact,
  amount,
  amountTone,
  secondaryAction,
  onSecondaryAction,
}) => (
  <article className="account-activity-card">
    <div className="account-activity-card__layout">
      <div className="account-activity-card__main">
        <h3 className="account-activity-card__title">{title}</h3>
        <p className="account-activity-card__datetime">{dateTime}</p>
        {description ? <p className="account-activity-card__description">{description}</p> : null}
        {detailLine ? <p className="account-activity-card__detail">{detailLine}</p> : null}
        {detailSecondaryLine ? (
          <p className="account-activity-card__detail account-activity-card__detail--secondary">
            {detailSecondaryLine}
          </p>
        ) : null}
        <p className="account-activity-card__impact">{balanceImpact}</p>
        {secondaryAction?.label ? (
          secondaryAction.type === 'link' && secondaryAction.href ? (
            <Link to={secondaryAction.href} className="account-activity-card__action">
              {secondaryAction.label}
            </Link>
          ) : (
            <button
              type="button"
              className="account-activity-card__action"
              onClick={onSecondaryAction}
            >
              {secondaryAction.label}
            </button>
          )
        ) : null}
      </div>
      <div className="account-activity-card__aside">
        <span className={`account-activity-card__amount ${amountTone}`}>{amount}</span>
      </div>
    </div>
  </article>
);
