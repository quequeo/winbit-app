export const Card = ({ children, className = '', title, variant = 'default' }) => {
  const variantClass =
    variant === 'highlight' || variant === 'premium'
      ? 'winbit-card--premium'
      : variant === 'compact'
        ? 'winbit-card--compact'
        : 'winbit-card';

  return (
    <div className={`${variantClass} ${className}`}>
      {title ? <h3 className="form-card-title">{title}</h3> : null}
      {children}
    </div>
  );
};
