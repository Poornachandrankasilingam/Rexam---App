import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const [formData, setFormData] = useState(() => {
    const emailParam = searchParams.get("email")
    const sessionEmail = typeof window !== "undefined" ? sessionStorage.getItem("reset_email") : null
    return {
      email: emailParam || sessionEmail || "",
      code: "",
      newPassword: ""
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await api.post("/auth/reset-password", formData)
      setSuccess("Password has been reset successfully!")
      
      // Cleanup sessionStorage
      sessionStorage.removeItem("reset_email")
      
      setTimeout(() => {
        navigate("/login")
      }, 2500)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || "Verification code is invalid or has expired.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex mb-4">
          <img src="/logo.jpg" alt="Rexam Logo" width={64} height={64} className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold">New Password</h1>
        <p className="text-muted-foreground mt-2">Enter the verification code and set your new password</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-xl">
          {success} Redirecting to login...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            disabled={loading || !!success}
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <KeyRound className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="6-Digit Reset Code"
            maxLength={6}
            className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all tracking-widest font-mono text-center text-lg"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })}
            required
            disabled={loading || !!success}
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Lock className="h-5 w-5" />
          </div>
          <input
            type="password"
            placeholder="New Password"
            className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            disabled={loading || !!success}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || !!success}
          className="w-full py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 group"
        >
          {loading ? "Resetting..." : "Reset Password"}
          {!loading && !success && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>

      <div className="text-center mt-8">
        <Link to="/forgot-password" className="inline-flex items-center text-sm font-semibold text-primary hover:underline group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Request new code
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={
          <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl text-center">
            <p className="text-muted-foreground animate-pulse">Loading form...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  )
}
