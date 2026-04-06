const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const formatDate = (dateString, opts = { time: true }) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  const formatterOpts = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-US', formatterOpts);

  const parts = {};
  for (const { type, value } of formatter.formatToParts(date)) {
    parts[type] = value;
  }

  const day = parts.day;
  const month = MONTHS_SHORT[parseInt(parts.month, 10) - 1];
  const year = parts.year;

  if (opts.time === false) {
    return `${day} ${month} ${year}`;
  }

  const hour = parts.hour;
  const minute = parts.minute;
  const suffix = opts.hourSuffix ? ' h' : '';

  return `${day} ${month} ${year} - ${hour}:${minute}${suffix}`;
};
