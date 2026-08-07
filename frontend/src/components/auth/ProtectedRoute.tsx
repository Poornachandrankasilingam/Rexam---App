import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"SUPER_ADMIN" | "ADMIN" | "STUDENT">
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b19] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Verifying session...</p>
        </div>
      </div>
    )
  }

  // 1. Check if user is logged in
  const token = typeof window !== "undefined" ? localStorage.getItem("rexam_token") : null

  if (!user || !token) {
    // Redirect to login page and preserve attempted path
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. Check role authorization if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to their respective authorized dashboard
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        return <Navigate to="/admin" replace />
      } else {
        return <Navigate to="/student" replace />
      }
    }
  }

  return <>{children}</>
}
