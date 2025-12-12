"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      router.push("/login")
      return
    }

    const user = getCurrentUser(token)

    if (!user) {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
      router.push("/login")
      return
    }

    if (requireAdmin && user.role !== "admin") {
      router.push("/dashboard")
      return
    }

    setIsAuthorized(true)
    setLoading(false)
  }, [router, requireAdmin])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
