import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, User, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await api.post("/auth/register", formData)
      navigate("/login")
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; error?: string } } }
      const serverMessage = axiosError.response?.data?.message;
      const serverError = axiosError.response?.data?.error;
      const displayError = serverError ? `${serverMessage}: ${serverError}` : (serverMessage || "Registration failed. Please try again.");
      setError(displayError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

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
            <h1 className="text-3xl font-extrabold font-outfit text-white">Join Rexam AI</h1>
            <p className="text-sm text-slate-400">Create your aspirant profile to start practicing</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="w-full pl-11 pr-4 py-3.5 bg-secondary/50 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 rounded-2xl text-base font-bold shadow-xl shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 transition-all"
              >
                {loading ? "Creating Account..." : "Create Free Account"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
