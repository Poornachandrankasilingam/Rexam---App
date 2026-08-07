import { Routes, Route } from "react-router-dom"
import Home from "@/app/page"
import LoginPage from "@/app/login/page"
import RegisterPage from "@/app/register/page"
import ForgotPasswordPage from "@/app/forgot-password/page"
import ResetPasswordPage from "@/app/reset-password/page"
import NotFound from "@/app/not-found"
import DashboardLayout from "@/app/(dashboard)/layout"

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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="exams" element={<AdminExamsPage />} />
        <Route path="questions" element={<AdminQuestionsPage />} />
        <Route path="malpractice" element={<AdminMalpracticePage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Student Dashboard Routes */}
      <Route path="/student" element={<DashboardLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="exams" element={<StudentExamsPage />} />
        <Route path="practice" element={<StudentPracticePage />} />
        <Route path="pyqs" element={<StudentPyqsPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="settings" element={<StudentSettingsPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
