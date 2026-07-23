"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
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
    
    // Log the request payload before sending
    console.log("📝 Register payload before sending:", formData)
    
    try {
      const response = await api.post("/auth/register", formData)
      console.log("✅ Registration response received:", response.data)
      
      // Redirect to login after successful registration
      router.push("/login")
    } catch (err: unknown) {
      console.error("❌ Registration request failed:", err)
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex mb-4">
              <Image src="/logo.jpg" alt="Rexam Logo" width={64} height={64} className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold">Join Rexam</h1>
            <p className="text-muted-foreground mt-2">Start your journey to excellence</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... input fields ... */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3.5 bg-background/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

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
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 group"
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </div>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
