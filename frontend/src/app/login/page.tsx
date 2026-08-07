import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight, Sparkles, Shield, GraduationCap } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleQuickDemo = (role: "STUDENT" | "ADMIN") => {
    if (role === "ADMIN") {
      setFormData({ email: "admin@rexam.com", password: "admin123" })
    } else {
      setFormData({ email: "student@rexam.com", password: "student123" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/auth/login", formData)
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
            <p className="text-sm text-slate-400">Sign in to your Rexam AI Intelligence portal</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:underline">
                  Forgot?
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
