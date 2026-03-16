export const Card = ({ children, className = '', title, variant = 'default' }) => {
  const variantClass =
    variant === 'highlight'
      ? 'winbit-card--highlight'
      : variant === 'compact'
        ? 'winbit-card--compact'
        : 'winbit-card';

  return (
    <div className={`${variantClass} ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-4 text-text-primary">{title}</h3>}
      {children}
    </div>
  );
};
