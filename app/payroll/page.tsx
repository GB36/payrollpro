"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getEmployees, savePayroll, getPayrolls, generateId, type Employee, type Payroll } from "@/lib/db"
import { calculatePayroll } from "@/lib/payroll-calculator"
import { ArrowLeft, DollarSign, Calculator } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    hoursWorked: 160,
    overtime: 0,
    allowances: 0,
    deductions: 0,
  })
  const [calculation, setCalculation] = useState({
    grossPay: 0,
    taxes: 0,
    netPay: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      const calc = calculatePayroll(
        selectedEmployee.salary,
        formData.hoursWorked,
        formData.overtime,
        formData.allowances,
        formData.deductions,
      )
      setCalculation(calc)
    }
  }, [selectedEmployee, formData])

  const loadData = () => {
    const empData = getEmployees().filter((e) => e.status === "Active")
    const payrollData = getPayrolls()
    setEmployees(empData)
    setPayrolls(payrollData)
  }

  const handleProcessPayroll = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      hoursWorked: 160,
      overtime: 0,
      allowances: 0,
      deductions: 0,
    })
    setIsDialogOpen(true)
  }

  const handleSavePayroll = () => {
    if (!selectedEmployee) return

    const user = JSON.parse(localStorage.getItem("user") || "{}")

    const newPayroll: Payroll = {
      id: generateId(),
      employeeId: selectedEmployee.id,
      payrollPeriod: {
        month: formData.month,
        year: formData.year,
      },
      hoursWorked: formData.hoursWorked,
      overtime: formData.overtime,
      allowances: formData.allowances,
      deductions: formData.deductions,
      grossPay: calculation.grossPay,
      taxes: calculation.taxes,
      netPay: calculation.netPay,
      processingDate: new Date().toISOString(),
      processedBy: user.id,
      status: "Processed",
    }

    savePayroll(newPayroll)
    setIsDialogOpen(false)
    loadData()
    setSuccessMessage(`Payroll processed successfully for ${selectedEmployee.fullname}!`)
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const getEmployeePayrolls = (employeeId: string) => {
    return payrolls.filter((p) => p.employeeId === employeeId)
  }

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[month - 1]
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Payroll Processing</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Active Employees</h2>
            <p className="text-slate-600 text-sm">Select an employee to process their payroll</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => {
              const employeePayrolls = getEmployeePayrolls(employee.id)
              const lastPayroll = employeePayrolls[employeePayrolls.length - 1]

              return (
                <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{employee.fullname}</CardTitle>
                    <CardDescription>{employee.position}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Base Salary:</span>
                        <span className="text-sm font-semibold">${employee.salary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Payrolls Processed:</span>
                        <span className="text-sm font-semibold">{employeePayrolls.length}</span>
                      </div>
                      {lastPayroll && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Last Processed:</span>
                          <span className="text-sm font-semibold">
                            {getMonthName(lastPayroll.payrollPeriod.month)} {lastPayroll.payrollPeriod.year}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full" onClick={() => handleProcessPayroll(employee)}>
                      <Calculator className="h-4 w-4 mr-2" />
                      Process Payroll
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {employees.length === 0 && (
            <Card className="mt-8">
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No active employees found. Add employees to process payroll.</p>
              </CardContent>
            </Card>
          )}
        </main>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Process Payroll - {selectedEmployee?.fullname}</DialogTitle>
              <DialogDescription>Enter payroll details and calculate employee compensation</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Month</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number.parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Year</label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours Worked</label>
                  <Input
                    type="number"
                    value={formData.hoursWorked}
                    onChange={(e) => setFormData({ ...formData, hoursWorked: Number.parseFloat(e.target.value) || 0 })}
                    step="0.5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Overtime Hours</label>
                  <Input
                    type="number"
                    value={formData.overtime}
                    onChange={(e) => setFormData({ ...formData, overtime: Number.parseFloat(e.target.value) || 0 })}
                    step="0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Allowances ($)</label>
                  <Input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: Number.parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Deductions ($)</label>
                  <Input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: Number.parseFloat(e.target.value) || 0 })}
                    step="0.01"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3 text-slate-700">Payroll Summary</h3>
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Base Salary:</span>
                    <span className="text-sm font-medium">${selectedEmployee?.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Gross Pay:</span>
                    <span className="text-sm font-medium">${calculation.grossPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">Taxes:</span>
                    <span className="text-sm font-medium">-${calculation.taxes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">Deductions:</span>
                    <span className="text-sm font-medium">-${formData.deductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-base font-semibold text-slate-900">Net Pay:</span>
                    <span className="text-xl font-bold text-green-600">${calculation.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePayroll}>
                <DollarSign className="h-4 w-4 mr-2" />
                Process & Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
