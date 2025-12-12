"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployees, getPayrolls } from "@/lib/db"
import Link from "next/link"
import { Users, DollarSign, FileText, LogOut } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayrolls: 0,
    thisMonthPayrolls: 0,
  })

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setUserName(userData.fullname)
    }

    // Calculate stats
    const employees = getEmployees()
    const payrolls = getPayrolls()
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    setStats({
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "Active").length,
      totalPayrolls: payrolls.length,
      thisMonthPayrolls: payrolls.filter(
        (p) => p.payrollPeriod.month === currentMonth && p.payrollPeriod.year === currentYear,
      ).length,
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/dashboard"><h1 className="text-2xl font-bold text-slate-900">Payroll-Pro</h1></a>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Welcome, {userName}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
            <p className="text-slate-600">Manage your payroll operations efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.totalEmployees}</div>
                <p className="text-xs text-slate-500 mt-1">{stats.activeEmployees} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Employees</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.activeEmployees}</div>
                <p className="text-xs text-slate-500 mt-1">Currently working</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Payrolls</CardTitle>
                <DollarSign className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.totalPayrolls}</div>
                <p className="text-xs text-slate-500 mt-1">All time processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
                <FileText className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.thisMonthPayrolls}</div>
                <p className="text-xs text-slate-500 mt-1">Payrolls processed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>Add, view, and manage employee records</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/employees">
                  <Button className="w-full">Manage Employees</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Process Payroll</CardTitle>
                <CardDescription>Calculate and process employee payroll</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/payroll">
                  <Button className="w-full">Process Payroll</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Payslips</CardTitle>
                <CardDescription>Generate and view employee payslips</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/payslips">
                  <Button className="w-full">View Payslips</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
