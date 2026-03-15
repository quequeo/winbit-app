export const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}) => {
  const baseStyles =
    'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/80 focus:ring-primary',
    secondary:
      'bg-accent-dim text-white border border-[rgba(101,167,165,0.45)] hover:bg-accent-glow hover:border-primary focus:ring-primary',
    danger: 'bg-error text-white hover:bg-error/80 focus:ring-error',
    outline:
      'border border-[rgba(101,167,165,0.45)] text-primary bg-accent-dim hover:bg-accent-glow hover:border-primary focus:ring-primary',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
