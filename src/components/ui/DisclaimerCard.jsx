import { ShieldCheck } from 'lucide-react';

export const DisclaimerCard = ({
  title,
  children,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}) => (
  <div className={`disclaimer-card disclaimer-card--${variant} ${className}`.trim()}>
    <div className="disclaimer-card__icon" aria-hidden>
      <ShieldCheck strokeWidth={1.75} />
    </div>
    <div className="min-w-0 flex-1">
      {title ? <p className="disclaimer-card__title">{title}</p> : null}
      <p className="disclaimer-card__body">{children}</p>
    </div>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="shrink-0 text-sm font-semibold text-primary hover:underline whitespace-nowrap"
      >
        {actionLabel} ›
      </button>
    ) : null}
  </div>
);
