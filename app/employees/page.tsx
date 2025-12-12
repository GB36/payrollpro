"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getEmployees, saveEmployee, updateEmployee, deleteEmployee, generateId, type Employee } from "@/lib/db"
import { ArrowLeft, Plus, Search, Edit2, Trash2, UserCheck, UserX } from "lucide-react"
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

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    position: "",
    salary: "",
    joinDate: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    status: "Active" as "Active" | "Inactive",
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = () => {
    const data = getEmployees()
    setEmployees(data)
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setFormData({
      fullname: "",
      email: "",
      position: "",
      salary: "",
      joinDate: new Date().toISOString().split("T")[0],
      bankName: "",
      accountNumber: "",
      accountName: "",
      status: "Active",
    })
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      fullname: employee.fullname,
      email: employee.email,
      position: employee.position,
      salary: employee.salary.toString(),
      joinDate: employee.joinDate.split("T")[0],
      bankName: employee.bankDetails.bankName,
      accountNumber: employee.bankDetails.accountNumber,
      accountName: employee.bankDetails.accountName,
      status: employee.status,
    })
    setIsDialogOpen(true)
  }

  const handleSaveEmployee = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        fullname: formData.fullname,
        email: formData.email,
        position: formData.position,
        salary: Number.parseFloat(formData.salary),
        joinDate: formData.joinDate,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        },
        status: formData.status,
      })
      setSuccessMessage("Employee updated successfully!")
    } else {
      const newEmployee: Employee = {
        id: generateId(),
        fullname: formData.fullname,
        email: formData.email,
        position: formData.position,
        salary: Number.parseFloat(formData.salary),
        joinDate: formData.joinDate,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
        },
        status: formData.status,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveEmployee(newEmployee)
      setSuccessMessage("Employee added successfully!")
    }

    setIsDialogOpen(false)
    loadEmployees()

    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployee(id)
      loadEmployees()
      setSuccessMessage("Employee deleted successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                <h1 className="text-2xl font-bold text-slate-900">Employee Management</h1>
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAddEmployee}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{employee.fullname}</CardTitle>
                      <CardDescription className="mt-1">{employee.position}</CardDescription>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.status === "Active" ? (
                        <UserCheck className="h-3 w-3 inline mr-1" />
                      ) : (
                        <UserX className="h-3 w-3 inline mr-1" />
                      )}
                      {employee.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Email:</span> {employee.email}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Salary:</span> ${employee.salary.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Joined:</span> {new Date(employee.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <Card className="mt-8">
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">
                  {searchTerm
                    ? "No employees found matching your search."
                    : "No employees yet. Add your first employee to get started!"}
                </p>
              </CardContent>
            </Card>
          )}
        </main>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
              <DialogDescription>
                {editingEmployee ? "Update the employee information below." : "Enter the employee details below."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Salary</label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Join Date</label>
                <Input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-full">
                <h3 className="text-sm font-semibold mb-3 text-slate-700">Bank Details</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Name</label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Number</label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Account Name</label>
                <Input
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEmployee}>{editingEmployee ? "Update Employee" : "Add Employee"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
