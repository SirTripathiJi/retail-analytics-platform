import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts any value to a lowercase string.
 * Handles null, undefined, numbers, and objects.
 */
export const safeString = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val).toLowerCase();
    } catch (e) {
      return '';
    }
  }
  return String(val).toLowerCase();
};

/**
 * Normalizes search input by trimming and converting to lowercase.
 */
export const normalizeSearch = (query) => {
  return String(query || '')
    .trim()
    .toLowerCase();
};

/**
 * Ensures a value is a string. Useful for IDs.
 */
export const ensureString = (val) => {
  if (val === null || val === undefined) return '';
  return String(val);
};
