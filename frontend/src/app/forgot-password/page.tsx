"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [target, setTarget] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!target || !target.trim()) {
      setError("Please enter your registered Email Address or Mobile Number.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)

    try {
      await api.post("/auth/reset-password", {
        target: target.trim(),
        newPassword
      })

      setSuccess("Password updated successfully! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err: any) {
      const msg = err.response?.data?.message || "Password reset failed. Please check your details."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block group">
              <div className="relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
                <img
                  src="/logo.jpg"
                  alt="Rexam Logo"
                  width={56}
                  height={56}
                  className="relative h-14 w-14 rounded-2xl object-cover border border-white/20 shadow-xl mx-auto"
                />
              </div>
            </Link>
            <h1 className="text-3xl font-extrabold font-outfit text-white">Reset Password</h1>
            <p className="text-xs text-slate-400">
              Enter your registered email and choose a new password
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Registered Email Address or Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="name@example.com or +919876543210"
                  className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-all"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-6 rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 transition-all"
            >
              {loading ? "Updating Password..." : "Update Password"}
              {!loading && !success && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center text-xs font-bold text-blue-400 hover:underline">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
