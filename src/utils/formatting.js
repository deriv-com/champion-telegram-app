const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

export const formatters = {
  // Currency formatting
  currency: (value, options = {}) => {
    const {
      currency = DEFAULT_CURRENCY,
      locale = DEFAULT_LOCALE,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  },

  // Number formatting
  number: (value, options = {}) => {
    const {
      locale = DEFAULT_LOCALE,
      minimumFractionDigits = 0,
      maximumFractionDigits = 2,
    } = options;

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  },

  // Percentage formatting
  percentage: (value, options = {}) => {
    const {
      locale = DEFAULT_LOCALE,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value / 100);
  },

  // Date formatting
  date: (value, options = {}) => {
    const {
      locale = DEFAULT_LOCALE,
      format = 'medium', // 'short', 'medium', 'long', 'full'
    } = options;

    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: format,
    }).format(date);
  },

  // Time formatting
  time: (value, options = {}) => {
    const {
      locale = DEFAULT_LOCALE,
      format = 'medium', // 'short', 'medium', 'long', 'full'
    } = options;

    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale, {
      timeStyle: format,
    }).format(date);
  },

  // DateTime formatting
  dateTime: (value, options = {}) => {
    const {
      locale = DEFAULT_LOCALE,
      dateFormat = 'medium',
      timeFormat = 'medium',
    } = options;

    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: dateFormat,
      timeStyle: timeFormat,
    }).format(date);
  },

  // Relative time formatting (e.g., "2 hours ago", "in 3 days")
  relativeTime: (value) => {
    const now = new Date();
    const date = value instanceof Date ? value : new Date(value);
    const diffInSeconds = Math.floor((date - now) / 1000);
    const absSeconds = Math.abs(diffInSeconds);

    const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, {
      numeric: 'auto',
    });

    if (absSeconds < 60) {
      return rtf.format(diffInSeconds, 'second');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(diffInMinutes, 'minute');
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(diffInHours, 'hour');
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (Math.abs(diffInDays) < 30) {
      return rtf.format(diffInDays, 'day');
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (Math.abs(diffInMonths) < 12) {
      return rtf.format(diffInMonths, 'month');
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return rtf.format(diffInYears, 'year');
  },

  // File size formatting
  fileSize: (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${formatters.number(size, { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
  },
};
