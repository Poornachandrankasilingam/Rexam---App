import { Routes, Route, Navigate } from "react-router-dom"
import Home from "@/app/page"
import AboutPage from "@/app/about/page"
import ContactPage from "@/app/contact/page"
import LoginPage from "@/app/login/page"
import RegisterPage from "@/app/register/page"
import ForgotPasswordPage from "@/app/forgot-password/page"
import ResetPasswordPage from "@/app/reset-password/page"
import GoogleCallbackPage from "@/app/auth/callback/google/page"
import NotFound from "@/app/not-found"
import DashboardLayout from "@/app/(dashboard)/layout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/context/AuthContext"

// Admin Pages
import AdminDashboard from "@/app/(dashboard)/admin/page"
import CreateExamPage from "@/app/(dashboard)/admin/exams/create/page"
import ManageExamsPage from "@/app/(dashboard)/admin/exams/page"
import QuestionPapersPage from "@/app/(dashboard)/admin/question-papers/page"
import AdminQuestionsPage from "@/app/(dashboard)/admin/questions/page"
import AdminPyqsPage from "@/app/(dashboard)/admin/pyqs/page"
import AdminStudentsPage from "@/app/(dashboard)/admin/students/page"
import ExamAttemptsPage from "@/app/(dashboard)/admin/attempts/page"
import ProctoringReportsPage from "@/app/(dashboard)/admin/proctoring/page"
import AdminResultsPage from "@/app/(dashboard)/admin/results/page"
import AdminAnalyticsPage from "@/app/(dashboard)/admin/analytics/page"
import AIMockTestManagementPage from "@/app/(dashboard)/admin/ai-mock-tests/page"
import CustomerManagementPage from "@/app/(dashboard)/admin/customers/page"
import SubscriptionManagementPage from "@/app/(dashboard)/admin/subscriptions/page"
import AdminSettingsPage from "@/app/(dashboard)/admin/settings/page"

// Student Pages
import StudentDashboard from "@/app/(dashboard)/student/page"
import AvailableExamsPage from "@/app/(dashboard)/student/exams/page"
import MyExamsPage from "@/app/(dashboard)/student/my-exams/page"
import CBTExamEnginePage from "@/app/(dashboard)/student/exam/[id]/cbt/page"
import StudentPracticePage from "@/app/(dashboard)/student/practice/page"
import StudentPyqsPage from "@/app/(dashboard)/student/pyqs/page"
import AIMockTestsPage from "@/app/(dashboard)/student/mock-tests/page"
import StudentResultsPage from "@/app/(dashboard)/student/results/page"
import StudentAnalyticsPage from "@/app/(dashboard)/student/analytics/page"
import AIReportsPage from "@/app/(dashboard)/student/reports/page"
import StudentProfilePage from "@/app/(dashboard)/student/profile/page"
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
      {/* Public Unauthenticated Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
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
      <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />

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
        <Route path="exams/create" element={<CreateExamPage />} />
        <Route path="exams" element={<ManageExamsPage />} />
        <Route path="question-papers" element={<QuestionPapersPage />} />
        <Route path="questions" element={<AdminQuestionsPage />} />
        <Route path="pyqs" element={<AdminPyqsPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="attempts" element={<ExamAttemptsPage />} />
        <Route path="proctoring" element={<ProctoringReportsPage />} />
        <Route path="results" element={<AdminResultsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="ai-mock-tests" element={<AIMockTestManagementPage />} />
        <Route path="customers" element={<CustomerManagementPage />} />
        <Route path="subscriptions" element={<SubscriptionManagementPage />} />
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
        <Route path="exams" element={<AvailableExamsPage />} />
        <Route path="my-exams" element={<MyExamsPage />} />
        <Route path="exam/:id/cbt" element={<CBTExamEnginePage />} />
        <Route path="practice" element={<StudentPracticePage />} />
        <Route path="pyqs" element={<StudentPyqsPage />} />
        <Route path="mock-tests" element={<AIMockTestsPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="analytics" element={<StudentAnalyticsPage />} />
        <Route path="reports" element={<AIReportsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="settings" element={<StudentSettingsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
