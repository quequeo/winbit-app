const VARIANTS = {
  success: 'status-badge--success',
  warning: 'status-badge--warning',
  error: 'status-badge--error',
  info: 'status-badge--info',
  neutral: 'status-badge--neutral',
};

export const StatusBadge = ({ label, variant = 'success', dot = true }) => (
  <span className={`status-badge ${VARIANTS[variant] ?? VARIANTS.neutral}`}>
    {dot ? <span className="status-badge__dot" aria-hidden /> : null}
    {label}
  </span>
);
