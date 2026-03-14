import { formatDate } from '../../../utils/formatDate';

export const LastUpdated = ({ timestamp }) => {
  return (
    <div className="text-sm text-text-muted text-center py-2">
      Last updated: {formatDate(timestamp)}
    </div>
  );
};
