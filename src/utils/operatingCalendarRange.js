export const BUENOS_AIRES_TZ = 'America/Argentina/Buenos_Aires';

const WEEKDAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export const getZonedYmd = (date, timeZone = BUENOS_AIRES_TZ) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const parts = {};
  for (const { type, value } of formatter.formatToParts(date)) {
    parts[type] = value;
  }

  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
  };
};

export const getZonedWeekday = (date, timeZone = BUENOS_AIRES_TZ) =>
  new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);

export const getZonedHour = (date, timeZone = BUENOS_AIRES_TZ) => {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hour12: false,
  }).format(date);

  return parseInt(hour, 10);
};

export const zonedMidnightMs = (year, month, day, timeZone = BUENOS_AIRES_TZ) => {
  let candidate = Date.UTC(year, month - 1, day, 3, 0, 0, 0);

  for (let attempt = 0; attempt < 96; attempt += 1) {
    const zoned = getZonedYmd(new Date(candidate), timeZone);

    if (zoned.year === year && zoned.month === month && zoned.day === day) {
      const hour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone,
          hour: 'numeric',
          hour12: false,
        }).format(new Date(candidate)),
        10,
      );

      if (hour === 0) {
        return candidate;
      }

      candidate -= hour * 60 * 60 * 1000;
      continue;
    }

    if (
      zoned.year < year ||
      (zoned.year === year && zoned.month < month) ||
      (zoned.year === year && zoned.month === month && zoned.day < day)
    ) {
      candidate += 60 * 60 * 1000;
    } else {
      candidate -= 60 * 60 * 1000;
    }
  }

  return Date.UTC(year, month - 1, day, 3, 0, 0, 0);
};

const subtractDaysFromYmd = (year, month, day, days) => {
  const utc = Date.UTC(year, month - 1, day);
  const shifted = new Date(utc - days * 24 * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
};

export const getOperatingCalendarRangeStartMs = (rangeKey, referenceDate = new Date()) => {
  const { year, month, day } = getZonedYmd(referenceDate);

  if (rangeKey === '7D' || rangeKey === 'WEEK') {
    const weekday = getZonedWeekday(referenceDate);
    const dow = WEEKDAY_INDEX[weekday] ?? 0;
    const daysSinceMonday = dow === 0 ? 6 : dow - 1;
    const monday = subtractDaysFromYmd(year, month, day, daysSinceMonday);
    return zonedMidnightMs(monday.year, monday.month, monday.day);
  }

  if (rangeKey === '1M' || rangeKey === 'MONTH') {
    return zonedMidnightMs(year, month, 1);
  }

  if (rangeKey === '3M' || rangeKey === 'QUARTER') {
    let startMonth = month - 2;
    let startYear = year;

    while (startMonth <= 0) {
      startMonth += 12;
      startYear -= 1;
    }

    return zonedMidnightMs(startYear, startMonth, 1);
  }

  return null;
};

export const isWithinOperatingCalendarRange = (
  dateString,
  rangeKey,
  referenceDate = new Date(),
) => {
  const startMs = getOperatingCalendarRangeStartMs(rangeKey, referenceDate);
  if (startMs === null) return true;

  const rowMs = dateString ? new Date(dateString).getTime() : 0;
  return rowMs >= startMs;
};
