// Simple in-memory database simulation for the payroll system
// In production, this would connect to a real database

export interface User {
  id: string
  fullname: string
  email: string
  password: string // In production, this would be hashed
  role: "admin" | "user"
  createdAt: string
}

export interface Employee {
  id: string
  fullname: string
  email: string
  position: string
  salary: number
  joinDate: string
  bankDetails: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  status: "Active" | "Inactive"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Payroll {
  id: string
  employeeId: string
  payrollPeriod: {
    month: number
    year: number
  }
  hoursWorked: number
  overtime: number
  allowances: number
  deductions: number
  grossPay: number
  taxes: number
  netPay: number
  processingDate: string
  processedBy: string
  status: "Pending" | "Processed" | "Paid"
}

// Initialize default admin user
const initializeDefaultData = () => {
  if (typeof window === "undefined") return

  const users = localStorage.getItem("payroll_users")
  if (!users) {
    const defaultAdmin: User = {
      id: "1",
      fullname: "Admin User",
      email: "admin@payroll.com",
      password: "admin123", // In production, this would be hashed
      role: "admin",
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem("payroll_users", JSON.stringify([defaultAdmin]))
  }

  // Initialize empty arrays if they don't exist
  if (!localStorage.getItem("payroll_employees")) {
    localStorage.setItem("payroll_employees", JSON.stringify([]))
  }
  if (!localStorage.getItem("payroll_records")) {
    localStorage.setItem("payroll_records", JSON.stringify([]))
  }
}

// Call initialization
if (typeof window !== "undefined") {
  initializeDefaultData()
}

export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem("payroll_users")
  return users ? JSON.parse(users) : []
}

export const saveUser = (user: User) => {
  const users = getUsers()
  users.push(user)
  localStorage.setItem("payroll_users", JSON.stringify(users))
}

export const getEmployees = (): Employee[] => {
  if (typeof window === "undefined") return []
  const employees = localStorage.getItem("payroll_employees")
  return employees ? JSON.parse(employees) : []
}

export const saveEmployee = (employee: Employee) => {
  const employees = getEmployees()
  employees.push(employee)
  localStorage.setItem("payroll_employees", JSON.stringify(employees))
}

export const updateEmployee = (id: string, updatedEmployee: Partial<Employee>) => {
  const employees = getEmployees()
  const index = employees.findIndex((e) => e.id === id)
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updatedEmployee, updatedAt: new Date().toISOString() }
    localStorage.setItem("payroll_employees", JSON.stringify(employees))
  }
}

export const deleteEmployee = (id: string) => {
  const employees = getEmployees()
  const filtered = employees.filter((e) => e.id !== id)
  localStorage.setItem("payroll_employees", JSON.stringify(filtered))
}

export const getPayrolls = (): Payroll[] => {
  if (typeof window === "undefined") return []
  const payrolls = localStorage.getItem("payroll_records")
  return payrolls ? JSON.parse(payrolls) : []
}

export const savePayroll = (payroll: Payroll) => {
  const payrolls = getPayrolls()
  payrolls.push(payroll)
  localStorage.setItem("payroll_records", JSON.stringify(payrolls))
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
