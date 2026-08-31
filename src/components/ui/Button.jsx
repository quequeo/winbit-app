export const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center justify-center px-6 py-3 rounded-[14px] font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D0F0E] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]';

  const variants = {
    primary:
      'primary-button text-[#0D0F0E] hover:brightness-110 focus:ring-[rgba(57,131,109,0.45)]',
    secondary:
      'bg-[rgba(57,131,109,0.1)] text-primary border border-[#28312D] hover:bg-[rgba(57,131,109,0.16)] focus:ring-[rgba(57,131,109,0.35)]',
    danger:
      'bg-[rgba(201,108,103,0.14)] text-error border border-[rgba(201,108,103,0.28)] hover:bg-[rgba(201,108,103,0.22)] focus:ring-[rgba(201,108,103,0.35)]',
    outline:
      'bg-transparent text-cream border border-border-cream hover:border-border-cream-strong hover:bg-cream/5 focus:ring-[rgba(236,228,213,0.25)]',
    copy: 'btn-copy text-xs min-h-0 rounded-lg focus:ring-[rgba(57,131,109,0.35)]',
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
