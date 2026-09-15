/**
 * Date utility library — consistent date formatting and range logic.
 */

const pad = (n) => String(n).padStart(2, '0');

/** Format ISO date string to localized display: "27 Apr 2026" */
export const toDateLabel = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

/** Format ISO to "27 Apr" (short) */
export const toShortDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return '—';
  }
};

/** Format ISO to "27 Apr 2026, 3:45 PM" */
export const toDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

/** Returns true if the date string is in the past */
export const isExpired = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
};

/** Returns true if the date is within `days` days from today */
export const isExpiringSoon = (dateStr, days = 7) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  if (exp < today) return false; // already expired
  const diffMs = exp - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};

/** Get start and end ISO strings for a given range type */
export const getDateRange = (type, referenceDate = new Date()) => {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);

  if (type === 'today') {
    const start = new Date(d);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  if (type === 'week') {
    const start = new Date(d);
    start.setDate(d.getDate() - 6);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  if (type === 'month') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }

  return null;
};

/** Get YYYY-MM-DD string from a Date object */
export const toYMD = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Get YYYY-MM string from a Date object */
export const toYM = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
