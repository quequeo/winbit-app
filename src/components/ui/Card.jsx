export const Card = ({ children, className = '', title }) => {
  return (
    <div
      className={`bg-dark-card rounded-lg border border-border-dark p-6 backdrop-blur-sm ${className}`}
    >
      {title && <h3 className="text-xl font-semibold mb-4 text-text-primary">{title}</h3>}
      {children}
    </div>
  );
};
