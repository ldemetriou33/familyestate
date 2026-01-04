// Utility functions for formatting

/**
 * Format a number as GBP currency
 */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a number as GBP currency with decimals
 */
export function formatGBPWithDecimals(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number as EUR currency
 */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a date in UK format (DD/MM/YYYY)
 */
export function formatUKDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate monthly mortgage payment
 * Using standard mortgage payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where P = principal, r = monthly interest rate, n = number of payments
 * For simplicity, assuming 25-year mortgage term
 */
export function calculateMonthlyMortgagePayment(
  principal: number,
  annualInterestRate: number,
  years: number = 25
): number {
  const monthlyRate = annualInterestRate / 100 / 12
  const numberOfPayments = years * 12
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments
  }
  
  const monthlyPayment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  
  return monthlyPayment
}

