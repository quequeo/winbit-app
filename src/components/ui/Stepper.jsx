export const Stepper = ({ steps, currentStep }) => (
  <div className="winbit-stepper" data-testid="deposit-stepper">
    {steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = index < currentStep;
      const Icon = step.icon;

      return (
        <div key={step.id} className="winbit-stepper__item">
          {index > 0 ? (
            <div
              className={`winbit-stepper__line ${isCompleted || isActive ? 'winbit-stepper__line--active' : ''}`}
              aria-hidden
            />
          ) : null}
          <div className="winbit-stepper__step">
            <div
              className={`winbit-stepper__circle ${
                isActive
                  ? 'winbit-stepper__circle--active'
                  : isCompleted
                    ? 'winbit-stepper__circle--completed'
                    : ''
              }`}
            >
              {Icon ? <Icon className="w-4 h-4" strokeWidth={1.75} aria-hidden /> : index + 1}
            </div>
            <span
              className={`winbit-stepper__label ${isActive ? 'winbit-stepper__label--active' : ''}`}
            >
              {step.label}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);
