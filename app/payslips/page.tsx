"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployees, getPayrolls, type Employee, type Payroll } from "@/lib/db"
import { ArrowLeft, FileText, Printer, Download } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import jsPDF from "jspdf";
import html2canvas from "html2canvas";




export default function PayslipsPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const empData = getEmployees()
    const payrollData = getPayrolls()
    setEmployees(empData)
    setPayrolls(payrollData)
  }

  const getEmployeePayrolls = (employeeId: string) => {
    return payrolls
      .filter((p) => p.employeeId === employeeId)
      .sort((a, b) => {
        if (a.payrollPeriod.year !== b.payrollPeriod.year) {
          return b.payrollPeriod.year - a.payrollPeriod.year
        }
        return b.payrollPeriod.month - a.payrollPeriod.month
      })
  }

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[month - 1]
  }

  const handleViewPayslip = (payroll: Payroll) => {
    const employee = employees.find((e) => e.id === payroll.employeeId)
    if (employee) {
      setSelectedPayroll(payroll)
      setSelectedEmployee(employee)
      setIsDialogOpen(true)
    }
  }

  const handlePrint = () => {
    window.print()
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
                <h1 className="text-2xl font-bold text-slate-900">Payslips</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Employee Payslips</h2>
            <p className="text-slate-600 text-sm">View and download payslips for all employees</p>
          </div>

          <div className="space-y-6">
            {employees.map((employee) => {
              const employeePayrolls = getEmployeePayrolls(employee.id)

              if (employeePayrolls.length === 0) return null

              return (
                <Card key={employee.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{employee.fullname}</CardTitle>
                    <CardDescription>
                      {employee.position} - {employeePayrolls.length} payslip
                      {employeePayrolls.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {employeePayrolls.map((payroll) => (
                        <div
                          key={payroll.id}
                          className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                {getMonthName(payroll.payrollPeriod.month)} {payroll.payrollPeriod.year}
                              </h4>
                              <p className="text-xs text-slate-500">
                                Processed: {new Date(payroll.processingDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div
                              className={`px-2 py-1 rounded text-xs font-medium ${payroll.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : payroll.status === "Processed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                                }`}
                            >
                              {payroll.status}
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm text-slate-600">Net Pay</p>
                            <p className="text-xl font-bold text-green-600">${payroll.netPay.toLocaleString()}</p>
                          </div>
                          <Button className="w-full" size="sm" onClick={() => handleViewPayslip(payroll)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Payslip
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {payrolls.length === 0 && (
            <Card className="mt-8">
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No payslips generated yet. Process payroll to generate payslips.</p>
              </CardContent>
            </Card>
          )}
        </main>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full print:shadow-none">
            <DialogHeader className="print:hidden">
              <DialogTitle>Payslip Details</DialogTitle>
              <DialogDescription>Employee compensation breakdown</DialogDescription>
            </DialogHeader>

            {selectedPayroll && selectedEmployee && (
              <div className="payslip-content bg-white text-black">
                {/* Payslip Header */}
                <div className="border-b-2 border-slate-300 pb-6 mb-6">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">PAYSLIP</h1>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Company Name</p>
                      <p className="font-semibold">Enterprise Payroll System</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-600">Pay Period</p>
                      <p className="font-semibold">
                        {getMonthName(selectedPayroll.payrollPeriod.month)} {selectedPayroll.payrollPeriod.year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employee Information */}
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Employee Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Employee Name</p>
                      <p className="font-semibold">{selectedEmployee.fullname}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Position</p>
                      <p className="font-semibold">{selectedEmployee.position}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Email</p>
                      <p className="font-semibold">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Employee ID</p>
                      <p className="font-semibold">{selectedEmployee.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Details</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left p-3 font-semibold">Description</th>
                          <th className="text-right p-3 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-3">Base Salary</td>
                          <td className="p-3 text-right font-medium">${selectedEmployee.salary.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-3">Hours Worked</td>
                          <td className="p-3 text-right">{selectedPayroll.hoursWorked} hours</td>
                        </tr>
                        {selectedPayroll.overtime > 0 && (
                          <tr>
                            <td className="p-3">Overtime (1.5x)</td>
                            <td className="p-3 text-right">{selectedPayroll.overtime} hours</td>
                          </tr>
                        )}
                        {selectedPayroll.allowances > 0 && (
                          <tr>
                            <td className="p-3">Allowances</td>
                            <td className="p-3 text-right font-medium text-green-600">
                              +${selectedPayroll.allowances.toLocaleString()}
                            </td>
                          </tr>
                        )}
                        <tr className="bg-slate-50">
                          <td className="p-3 font-semibold">Gross Pay</td>
                          <td className="p-3 text-right font-bold">${selectedPayroll.grossPay.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-red-600">Tax Deductions</td>
                          <td className="p-3 text-right font-medium text-red-600">
                            -${selectedPayroll.taxes.toLocaleString()}
                          </td>
                        </tr>
                        {selectedPayroll.deductions > 0 && (
                          <tr>
                            <td className="p-3 text-red-600">Other Deductions</td>
                            <td className="p-3 text-right font-medium text-red-600">
                              -${selectedPayroll.deductions.toLocaleString()}
                            </td>
                          </tr>
                        )}
                        <tr className="bg-green-50 border-t-2 border-green-200">
                          <td className="p-3 font-bold text-lg">NET PAY</td>
                          <td className="p-3 text-right font-bold text-2xl text-green-600">
                            ${selectedPayroll.netPay.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bank Details */}
                {selectedEmployee.bankDetails.bankName && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Transfer Details</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Bank Name</p>
                        <p className="font-semibold">{selectedEmployee.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Account Number</p>
                        <p className="font-semibold">{selectedEmployee.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Account Name</p>
                        <p className="font-semibold">{selectedEmployee.bankDetails.accountName}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t pt-4 mt-6 text-center text-xs text-slate-500">
                  <p>This is a computer-generated payslip and does not require a signature.</p>
                  <p className="mt-1">Generated on {new Date(selectedPayroll.processingDate).toLocaleString()}</p>
                </div>

                {/* Print Button */}
                <div className="mt-6 flex gap-3 print:hidden">
                  <Button className="flex-1" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Payslip
                  </Button>
                  <Button className="flex-1 bg-transparent" variant="outline" onClick={handlePrint}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .payslip-content,
          .payslip-content * {
            visibility: visible;
          }
          .payslip-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </AuthGuard>
  )
}
