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
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
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
          // Prevent mouse wheel from changing number inputs (common UX bug on desktop trackpads/mice)
          if (type === 'number') {
            e.currentTarget.blur();
          }
        }}
        className={`w-full px-4 py-3 bg-dark-section text-text-primary placeholder:text-text-dim border rounded-lg focus:ring-2 focus:ring-primary focus:border-border-accent transition-colors duration-200 disabled:bg-dark-bg disabled:cursor-not-allowed disabled:text-text-dim ${
          error ? 'border-error' : 'border-border-dark'
        }`}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};
