/**
 * Formatting utilities for Indian Rupee (INR) and date representations.
 */

export const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 1,
  notation: 'compact',
});

/**
 * Format a number or numeric string to INR format: e.g. ₹1,25,000.00
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }
  return inrFormatter.format(Number(amount));
}

/**
 * Format date to human-readable format: "27 Oct 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date to ISO YYYY-MM-DD
 */
export function toISODate(date) {
  const d = date ? new Date(date) : new Date();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * Format Month YYYY-MM to human-readable "October 2026"
 */
export function formatMonthName(monthString) {
  if (!monthString) return '';
  const [year, month] = monthString.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format percentage: e.g. 78.5%
 */
export function formatPercentage(val) {
  if (val === undefined || val === null || isNaN(Number(val))) return '0%';
  return `${Number(val).toFixed(1)}%`;
}
