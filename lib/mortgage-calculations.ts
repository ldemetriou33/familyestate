/**
 * Mortgage & Debt Calculation Utilities
 * Sovereign Estate Financial Engine
 */

export interface MortgageCalculationInput {
  principal: number
  interestRate: number // Annual percentage (e.g., 4.5 for 4.5%)
  termYears: number
  paymentFrequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
}

export interface MortgageCalculationResult {
  monthlyPayment: number
  totalInterest: number
  totalAmount: number
  amortizationSchedule?: AmortizationEntry[]
}

export interface AmortizationEntry {
  paymentNumber: number
  paymentDate: Date
  principal: number
  interest: number
  balance: number
}

/**
 * Calculate monthly mortgage payment using standard formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0 || termYears <= 0) return 0
  
  const monthlyRate = annualRate / 100 / 12
  const numberOfPayments = termYears * 12
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments
  }
  
  const monthlyPayment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  
  return Math.round(monthlyPayment * 100) / 100
}

/**
 * Calculate LTV (Loan-to-Value) ratio
 */
export function calculateLTV(loanBalance: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0
  return Math.round((loanBalance / propertyValue) * 100 * 100) / 100
}

/**
 * Calculate remaining balance after X payments
 */
export function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  paymentsMade: number
): number {
  if (paymentsMade >= termYears * 12) return 0
  
  const monthlyRate = annualRate / 100 / 12
  const totalPayments = termYears * 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears)
  
  if (monthlyRate === 0) {
    return principal - (monthlyPayment * paymentsMade)
  }
  
  const remainingBalance =
    principal *
      (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, paymentsMade)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
  
  return Math.max(0, Math.round(remainingBalance * 100) / 100)
}

/**
 * Generate amortization schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termYears: number,
  startDate: Date = new Date()
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = []
  const monthlyRate = annualRate / 100 / 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears)
  let balance = principal
  
  for (let i = 1; i <= termYears * 12; i++) {
    const interest = balance * monthlyRate
    const principalPayment = monthlyPayment - interest
    balance = Math.max(0, balance - principalPayment)
    
    const paymentDate = new Date(startDate)
    paymentDate.setMonth(paymentDate.getMonth() + i - 1)
    
    schedule.push({
      paymentNumber: i,
      paymentDate,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    })
    
    if (balance <= 0) break
  }
  
  return schedule
}

/**
 * Calculate total interest paid over loan term
 */
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears)
  const totalPaid = monthlyPayment * termYears * 12
  return Math.round((totalPaid - principal) * 100) / 100
}

/**
 * Calculate Debt Service Coverage Ratio (DSCR)
 * DSCR = Net Operating Income / Total Debt Service
 */
export function calculateDSCR(
  netOperatingIncome: number,
  totalDebtService: number
): number {
  if (totalDebtService <= 0) return 0
  return Math.round((netOperatingIncome / totalDebtService) * 100) / 100
}

/**
 * Calculate Interest Coverage Ratio (ICR)
 * ICR = EBITDA / Interest Expense
 */
export function calculateICR(ebitda: number, interestExpense: number): number {
  if (interestExpense <= 0) return 0
  return Math.round((ebitda / interestExpense) * 100) / 100
}

/**
 * Stress test: Calculate new payment with rate change
 */
export function stressTestRateChange(
  currentBalance: number,
  currentRate: number,
  newRate: number,
  remainingYears: number
): {
  currentPayment: number
  newPayment: number
  paymentIncrease: number
  paymentIncreasePercent: number
} {
  const currentPayment = calculateMonthlyPayment(currentBalance, currentRate, remainingYears)
  const newPayment = calculateMonthlyPayment(currentBalance, newRate, remainingYears)
  const paymentIncrease = newPayment - currentPayment
  const paymentIncreasePercent = (paymentIncrease / currentPayment) * 100
  
  return {
    currentPayment: Math.round(currentPayment * 100) / 100,
    newPayment: Math.round(newPayment * 100) / 100,
    paymentIncrease: Math.round(paymentIncrease * 100) / 100,
    paymentIncreasePercent: Math.round(paymentIncreasePercent * 100) / 100,
  }
}

/**
 * Stress test: Calculate new LTV with valuation change
 */
export function stressTestValuationChange(
  currentBalance: number,
  currentValue: number,
  newValue: number
): {
  currentLTV: number
  newLTV: number
  ltvChange: number
} {
  const currentLTV = calculateLTV(currentBalance, currentValue)
  const newLTV = calculateLTV(currentBalance, newValue)
  
  return {
    currentLTV,
    newLTV,
    ltvChange: Math.round((newLTV - currentLTV) * 100) / 100,
  }
}

/**
 * Calculate years until mortgage is paid off
 */
export function calculateYearsRemaining(
  balance: number,
  monthlyPayment: number,
  interestRate: number
): number {
  if (monthlyPayment <= 0 || balance <= 0) return 0
  
  const monthlyRate = interestRate / 100 / 12
  
  if (monthlyRate === 0) {
    return balance / monthlyPayment / 12
  }
  
  // Solve for n: balance = payment * [(1 - (1+r)^-n) / r]
  // Rearranged: n = -log(1 - (balance * r / payment)) / log(1 + r)
  const yearsRemaining =
    -Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate) / 12
  
  return Math.max(0, Math.round(yearsRemaining * 100) / 100)
}

