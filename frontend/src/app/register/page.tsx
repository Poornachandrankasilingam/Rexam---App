"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton"
import { useAuth } from "@/context/AuthContext"
import { BrandLogo } from "@/components/ui/BrandLogo"
import api from "@/lib/api"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login: authContextLogin } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)

    try {
      const res = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password
      })

      if (res.data?.accessToken && res.data?.user) {
        authContextLogin(res.data.accessToken, res.data.user)
        if (res.data.user.role === "ADMIN" || res.data.user.role === "SUPER_ADMIN") {
          navigate("/admin")
        } else {
          navigate("/student")
        }
      } else {
        navigate("/login")
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed. Please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b13] mesh-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

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
            <h1 className="text-2xl font-extrabold font-outfit text-white">Create Your Account</h1>
            <p className="text-xs text-slate-400 font-medium">
              Join thousands of aspirants preparing with Rexam AI
            </p>
          </div>

          {/* Google One-Click Sign In */}
          <div className="space-y-3">
            <GoogleSignInButton
              text="Sign up with Google"
              onError={(msg) => setError(msg)}
            />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                <span className="bg-[#0c1220] px-3 text-slate-400 font-mono">Or register with email</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl animate-in fade-in">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Mobile Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/60 border border-white/10 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/80 focus:ring-1 focus:ring-emerald-400/40 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-3d-green w-full rounded-2xl py-3.5 font-bold text-white shadow-lg shadow-emerald-500/25 mt-3"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          {/* Footer Sign in link */}
          <div className="pt-2 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign In Here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
