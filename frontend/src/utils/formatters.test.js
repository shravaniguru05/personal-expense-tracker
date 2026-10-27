import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercentage, formatMonthName } from './formatters';

describe('Formatters Utility', () => {
  it('formats numbers into Indian Rupee (INR) currency correctly', () => {
    // Basic test
    expect(formatCurrency(1000)).toMatch(/₹\s?1,000\.00/);
    // Lakh test
    expect(formatCurrency(100000)).toMatch(/₹\s?1,00,000\.00/);
    // Crore test
    expect(formatCurrency(10000000)).toMatch(/₹\s?1,00,00,000\.00/);
    // Decimals
    expect(formatCurrency(250.75)).toMatch(/₹\s?250\.75/);
    // Null / NaN fallback
    expect(formatCurrency(null)).toBe('₹0.00');
    expect(formatCurrency(undefined)).toBe('₹0.00');
  });

  it('formats dates in readable Indian English format', () => {
    const formatted = formatDate('2026-10-27');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
    expect(formatDate('')).toBe('');
  });

  it('formats month strings into Month and Year', () => {
    const formatted = formatMonthName('2026-10');
    expect(formatted).toContain('October');
    expect(formatted).toContain('2026');
  });

  it('formats percentages correctly', () => {
    expect(formatPercentage(75)).toBe('75.0%');
    expect(formatPercentage(82.345)).toBe('82.3%');
    expect(formatPercentage(null)).toBe('0%');
  });
});

