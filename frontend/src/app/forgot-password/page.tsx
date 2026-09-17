"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/ui/BrandLogo"
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
    <div className="min-h-screen bg-[#070b13] mesh-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo size="lg" />
            </Link>
            <h1 className="text-2xl font-extrabold font-outfit text-white">Reset Account Password</h1>
            <p className="text-xs text-slate-400 font-medium">
              Enter your registered email and set a new secure password
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl animate-in fade-in">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Registered Email Address or Mobile</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="name@example.com or mobile"
                  className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !!success}
              className="btn-3d-green w-full rounded-2xl py-3.5 font-bold text-white shadow-lg shadow-emerald-500/25 mt-2"
            >
              {loading ? "Updating Password..." : "Update Password"}
              {!loading && !success && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
