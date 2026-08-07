"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Phone, ArrowRight, Shield, GraduationCap, KeyRound, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  // Form inputs
  const [identifier, setIdentifier] = useState("") // Email or Mobile Number
  const [password, setPassword] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpSent, setOtpSent] = useState(false)

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
    setInfoMessage("")

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

  // Handle Generate OTP Request
  const handleGenerateOtp = async () => {
    if (!identifier) {
      setError("Please enter your Email Address or Mobile Number to generate OTP")
      return
    }
    setLoading(true)
    setError("")
    setInfoMessage("")

    try {
      const response = await api.post("/auth/send-otp", { identifier })
      setOtpSent(true)
      setInfoMessage(response.data.message || "OTP generated successfully.")
      if (response.data.otpCode) {
        setOtpCode(response.data.otpCode) // Pre-fill for testing ease
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || "Failed to generate OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Verify OTP & Login
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode) {
      setError("Please enter the 6-digit OTP code")
      return
    }
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/verify-otp", {
        identifier,
        otpCode
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
      setError(axiosError.response?.data?.message || "Invalid or expired OTP code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radiant Glowing Ambient Elements */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
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
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-300"></div>
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
            <p className="text-sm text-slate-400">Login via Email Address, Mobile Number, or OTP</p>
          </div>

          {/* Mode Switcher: Password vs OTP Login */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-secondary/40 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => { setLoginMode("PASSWORD"); setError(""); setInfoMessage(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                loginMode === "PASSWORD" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode("OTP"); setError(""); setInfoMessage(""); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                loginMode === "OTP" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/30" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Generate OTP Login
            </button>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="p-3.5 bg-secondary/40 border border-white/10 rounded-2xl space-y-2 text-center">
            <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">Quick Fill Demo Credentials</p>
            <div className="flex justify-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickDemo("STUDENT")} 
                className="rounded-xl text-xs font-semibold border-white/10 hover:border-indigo-400/40"
              >
                <GraduationCap className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                Student Demo
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickDemo("ADMIN")} 
                className="rounded-xl text-xs font-semibold border-white/10 hover:border-indigo-400/40"
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

          {infoMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-2xl flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{infoMessage}</span>
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
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
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
                    className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 transition-all"
              >
                {loading ? "Signing In..." : "Sign In to Portal"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          ) : (
            /* MODE 2: GENERATE & VERIFY OTP LOGIN */
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address or Mobile Number</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="name@example.com or 9876543210"
                      className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleGenerateOtp}
                    disabled={loading || !identifier}
                    className="px-4 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-500 text-xs shrink-0"
                  >
                    {loading ? "Sending..." : otpSent ? "Resend OTP" : "Get OTP"}
                  </Button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Enter 6-Digit OTP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-emerald-500/40 rounded-2xl text-base font-mono font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !otpSent}
                className="w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-emerald-600/30 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/30 transition-all"
              >
                {loading ? "Verifying..." : "Verify OTP & Sign In"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-indigo-400 font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
