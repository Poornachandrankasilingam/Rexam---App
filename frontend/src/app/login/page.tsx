"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Phone, ArrowRight, Shield, GraduationCap, KeyRound, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { OtpInputModal } from "@/components/auth/OtpInputModal"
import { AccountNotFoundModal } from "@/components/auth/AccountNotFoundModal"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form inputs
  const [identifier, setIdentifier] = useState("") // Email or Mobile Number
  const [password, setPassword] = useState("")

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [targetMasked, setTargetMasked] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)

  // Account Not Found Modal State
  const [showAccountNotFoundModal, setShowAccountNotFoundModal] = useState(false)
  const [unregisteredTarget, setUnregisteredTarget] = useState("")
  const [unregisteredType, setUnregisteredType] = useState<'EMAIL' | 'PHONE'>('EMAIL')

  const handleQuickDemo = (role: "STUDENT" | "ADMIN") => {
    if (role === "ADMIN") {
      setIdentifier("admin@rexam.com")
      setPassword("admin123")
    } else {
      setIdentifier("student@rexam.com")
      setPassword("student123")
    }
  }

  // Handle Standard Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/login", {
        identifier,
        password
      })
      const { accessToken, user } = response.data

      login(accessToken, user)

      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate("/admin")
      } else {
        navigate("/student")
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Request OTP for Login
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier || !identifier.trim()) {
      setError("Please enter your Email Address or Mobile Number")
      return
    }
    setLoading(true)
    setError("")
    setOtpError(null)

    try {
      const res = await api.post("/auth/send-otp", {
        identifier: identifier.trim(),
        purpose: "LOGIN"
      })
      setTargetMasked(res.data.targetMasked || identifier)
      setShowOtpModal(true)
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.data?.accountExists === false) {
        const targetType: 'EMAIL' | 'PHONE' = err.response?.data?.targetType || (identifier.includes('@') ? 'EMAIL' : 'PHONE')
        setUnregisteredTarget(identifier.trim())
        setUnregisteredType(targetType)
        setShowAccountNotFoundModal(true)
      } else {
        setError(err.response?.data?.message || "Failed to send OTP. Please check your details and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP Verification for Login
  const handleVerifyOtpForLogin = async (otpCode: string) => {
    setVerifyingOtp(true)
    setOtpError(null)

    try {
      const res = await api.post("/auth/verify-otp", {
        identifier,
        otpCode,
        purpose: "LOGIN"
      })

      const { accessToken, user } = res.data
      login(accessToken, user)
      setShowOtpModal(false)

      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate("/admin")
      } else {
        navigate("/student")
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired OTP code."
      setOtpError(msg)
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    const res = await api.post("/auth/send-otp", {
      identifier,
      purpose: "LOGIN"
    })
    setTargetMasked(res.data.targetMasked || identifier)
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            <h1 className="text-3xl font-extrabold font-outfit text-white">Welcome Back</h1>
            <p className="text-sm text-slate-400">Login via Email Address, Mobile Number, or Secure OTP</p>
          </div>

          {/* Mode Switcher: Password vs OTP Login */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-secondary/40 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => { setLoginMode("PASSWORD"); setError(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                loginMode === "PASSWORD"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode("OTP"); setError(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                loginMode === "OTP"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              OTP Login
            </button>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="p-3.5 bg-secondary/40 border border-white/10 rounded-2xl space-y-2 text-center">
            <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Quick Fill Demo Credentials</p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo("STUDENT")}
                className="rounded-xl text-xs font-semibold border-white/10 hover:border-blue-400/40"
              >
                <GraduationCap className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                Student Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickDemo("ADMIN")}
                className="rounded-xl text-xs font-semibold border-white/10 hover:border-blue-400/40"
              >
                <Shield className="h-3.5 w-3.5 mr-1 text-amber-400" />
                Admin Demo
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          {/* MODE 1: PASSWORD LOGIN */}
          {loginMode === "PASSWORD" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address or Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="name@example.com or 9876543210"
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 transition-all"
              >
                {loading ? "Signing In..." : "Sign In to Portal"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
            /* MODE 2: OTP LOGIN */
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address or Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="name@example.com or +919876543210"
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-semibold"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !identifier}
                className="w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-emerald-600/30 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 transition-all"
              >
                {loading ? "Sending OTP..." : "Send OTP & Login"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-400 font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>

      {/* OTP Input Modal */}
      <OtpInputModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        targetMasked={targetMasked}
        onVerify={handleVerifyOtpForLogin}
        onResend={handleResendOtp}
        loading={verifyingOtp}
        error={otpError}
        title="Login OTP Verification"
      />

      {/* Account Not Found Modal */}
      <AccountNotFoundModal
        isOpen={showAccountNotFoundModal}
        onClose={() => setShowAccountNotFoundModal(false)}
        target={unregisteredTarget}
        targetType={unregisteredType}
      />
    </div>
  )
}
