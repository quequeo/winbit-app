import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  iconEmoji,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`empty-state winbit-card ${className}`}>
    {Icon ? (
      <div className="empty-state__icon" aria-hidden>
        <Icon className="w-7 h-7" strokeWidth={1.5} />
      </div>
    ) : iconEmoji ? (
      <div className="empty-state__emoji" aria-hidden>
        {iconEmoji}
      </div>
    ) : null}
    <h3 className="empty-state__title">{title}</h3>
    {description ? <p className="empty-state__description">{description}</p> : null}
    {actionLabel && onAction ? (
      <Button type="button" onClick={onAction} className="mt-2 w-full sm:w-auto">
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
