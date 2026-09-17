"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { BrandLogo } from "@/components/ui/BrandLogo"

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Form inputs
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

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
        navigate("/admin", { state: { toastMessage: `Successfully signed in as ${user.email}` } })
      } else {
        navigate("/student", { state: { toastMessage: `Successfully signed in as ${user.email}` } })
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b13] mesh-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10 my-8"
      >
        <div className="glass p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo size="lg" />
            </Link>
            <h1 className="text-2xl font-extrabold font-outfit text-white">Welcome Back</h1>
            <p className="text-xs text-slate-400 font-medium">
              Sign in to continue your intelligent preparation & CBT exams
            </p>
          </div>

          {/* Google One-Click Sign In */}
          <div className="space-y-3">
            <GoogleSignInButton
              text="Sign in with Google"
              onError={(msg) => setError(msg)}
            />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                <span className="bg-[#0c1220] px-3 text-slate-400 font-mono">Or continue with credentials</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl animate-in fade-in">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="name@example.com or mobile"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-3d-green w-full rounded-2xl py-3.5 font-bold text-white shadow-lg shadow-emerald-500/25 mt-2"
            >
              {loading ? "Signing in..." : "Sign In to Rexam"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          {/* Footer Registration Link */}
          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
