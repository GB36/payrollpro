// Payroll calculation utilities

export interface PayrollCalculation {
  grossPay: number
  taxes: number
  netPay: number
}

// Calculate gross pay including overtime
export function calculateGrossPay(
  baseSalary: number,
  hoursWorked: number,
  overtime: number,
  allowances: number,
): number {
  // Assuming monthly salary and 160 standard hours per month
  const hourlyRate = baseSalary / 160
  const regularPay = hourlyRate * Math.min(hoursWorked, 160)
  const overtimePay = hourlyRate * 1.5 * overtime

  return regularPay + overtimePay + allowances
}

// Calculate taxes (simplified progressive tax)
export function calculateTaxes(grossPay: number): number {
  let tax = 0

  if (grossPay <= 30000) {
    tax = grossPay * 0.05 // 5% for income up to 30,000
  } else if (grossPay <= 60000) {
    tax = 30000 * 0.05 + (grossPay - 30000) * 0.1 // 10% for 30,001 - 60,000
  } else if (grossPay <= 100000) {
    tax = 30000 * 0.05 + 30000 * 0.1 + (grossPay - 60000) * 0.15 // 15% for 60,001 - 100,000
  } else {
    tax = 30000 * 0.05 + 30000 * 0.1 + 40000 * 0.15 + (grossPay - 100000) * 0.2 // 20% for 100,001+
  }

  return Math.round(tax * 100) / 100
}

// Calculate net pay
export function calculateNetPay(grossPay: number, taxes: number, deductions: number): number {
  return Math.round((grossPay - taxes - deductions) * 100) / 100
}

// Complete payroll calculation
export function calculatePayroll(
  baseSalary: number,
  hoursWorked: number,
  overtime: number,
  allowances: number,
  deductions: number,
): PayrollCalculation {
  const grossPay = calculateGrossPay(baseSalary, hoursWorked, overtime, allowances)
  const taxes = calculateTaxes(grossPay)
  const netPay = calculateNetPay(grossPay, taxes, deductions)

  return {
    grossPay: Math.round(grossPay * 100) / 100,
    taxes,
    netPay,
  }
}
