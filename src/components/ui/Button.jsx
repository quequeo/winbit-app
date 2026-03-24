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
    primary:
      'bg-[rgba(101,167,165,0.25)] text-white border border-[rgba(101,167,165,0.45)] hover:bg-[rgba(101,167,165,0.35)] hover:border-[rgba(101,167,165,0.65)] hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(101,167,165,0.15)] focus:ring-primary',
    secondary:
      'bg-[rgba(101,167,165,0.1)] text-[#8dc8bf] border border-[rgba(101,167,165,0.35)] hover:bg-[rgba(101,167,165,0.2)] hover:border-[rgba(101,167,165,0.55)] focus:ring-primary',
    danger:
      'bg-[rgba(196,107,107,0.14)] text-[#c46b6b] border border-[rgba(196,107,107,0.18)] hover:bg-[rgba(196,107,107,0.22)] focus:ring-error',
    outline:
      'bg-[rgba(101,167,165,0.1)] text-[#8dc8bf] border border-[rgba(101,167,165,0.35)] hover:bg-[rgba(101,167,165,0.2)] hover:border-[rgba(101,167,165,0.55)] focus:ring-primary',
    copy: 'btn-copy text-xs focus:ring-primary',
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
