import { Routes, Route, Navigate } from "react-router-dom"
import Home from "@/app/page"
import LoginPage from "@/app/login/page"
import RegisterPage from "@/app/register/page"
import ForgotPasswordPage from "@/app/forgot-password/page"
import ResetPasswordPage from "@/app/reset-password/page"
import NotFound from "@/app/not-found"
import DashboardLayout from "@/app/(dashboard)/layout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/context/AuthContext"

import AdminDashboard from "@/app/(dashboard)/admin/page"
import AdminExamsPage from "@/app/(dashboard)/admin/exams/page"
import AdminQuestionsPage from "@/app/(dashboard)/admin/questions/page"
import AdminMalpracticePage from "@/app/(dashboard)/admin/malpractice/page"
import AdminAnalyticsPage from "@/app/(dashboard)/admin/analytics/page"
import AdminSettingsPage from "@/app/(dashboard)/admin/settings/page"

import StudentDashboard from "@/app/(dashboard)/student/page"
import StudentExamsPage from "@/app/(dashboard)/student/exams/page"
import StudentPracticePage from "@/app/(dashboard)/student/practice/page"
import StudentPyqsPage from "@/app/(dashboard)/student/pyqs/page"
import StudentResultsPage from "@/app/(dashboard)/student/results/page"
import StudentSettingsPage from "@/app/(dashboard)/student/settings/page"

// Helper component to redirect logged-in users away from /login or /register
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const token = typeof window !== "undefined" ? localStorage.getItem("rexam_token") : null

  if (user && token) {
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/student" replace />
  }
  return <>{children}</>
}

// Helper component to handle /dashboard alias
function DashboardRedirect() {
  const { user } = useAuth()
  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
    return <Navigate to="/admin" replace />
  }
  return <Navigate to="/student" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages (Accessible without login) */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={
          <AuthRedirect>
            <LoginPage />
          </AuthRedirect>
        } 
      />
      <Route 
        path="/register" 
        element={
          <AuthRedirect>
            <RegisterPage />
          </AuthRedirect>
        } 
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Top-Level Shortcut Redirect Aliases (Protected) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/results" 
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Navigate to="/student/results" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/exams" 
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Navigate to="/student/exams" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/practice" 
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Navigate to="/student/practice" replace />
          </ProtectedRoute>
        } 
      />

      {/* Protected Admin Routes (Accessible only to ADMIN / SUPER_ADMIN) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="exams" element={<AdminExamsPage />} />
        <Route path="questions" element={<AdminQuestionsPage />} />
        <Route path="malpractice" element={<AdminMalpracticePage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Protected Student Routes (Accessible only to STUDENT) */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="exams" element={<StudentExamsPage />} />
        <Route path="practice" element={<StudentPracticePage />} />
        <Route path="pyqs" element={<StudentPyqsPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="settings" element={<StudentSettingsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
