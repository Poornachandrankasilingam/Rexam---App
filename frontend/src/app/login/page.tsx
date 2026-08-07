import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight } from "lucide-react"
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
      
      // Redirect based on role
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/3 -left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative"
      >
        <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <img src="/logo.jpg" alt="Rexam Logo" width={64} height={64} className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Log in to continue your preparation</p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-3 bg-secondary/50 border border-border rounded-xl text-center space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Demo Login</p>
            <div className="flex justify-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickDemo("STUDENT")} 
                className="rounded-lg text-xs"
              >
                🎓 Fill Student Demo
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickDemo("ADMIN")} 
                className="rounded-lg text-xs"
              >
                🛡️ Fill Admin Demo
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 group"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
