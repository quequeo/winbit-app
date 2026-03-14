export const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-muted text-center max-w-md">{description}</p>}
    </div>
  );
};
