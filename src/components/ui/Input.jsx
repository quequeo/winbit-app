export const Input = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  min,
  max,
  step,
  className = '',
  icon: Icon,
  controlClassName = '',
}) => {
  const baseControl =
    controlClassName ||
    'w-full px-4 py-3.5 min-h-[52px] bg-[#121514] text-text-primary placeholder:text-text-muted border rounded-[12px] focus:ring-2 focus:ring-[rgba(57,131,109,0.35)] focus:border-[#39836D] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-variant-numeric tabular-nums border-[#28312D]';

  const controlCls = `${baseControl} ${Icon ? 'pl-12' : ''} ${error ? 'border-error' : ''}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-primary"
            strokeWidth={1.75}
            aria-hidden
          />
        ) : null}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          onWheel={(e) => {
            if (type === 'number') {
              e.currentTarget.blur();
            }
          }}
          className={controlCls}
        />
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};
