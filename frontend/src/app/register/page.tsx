import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { OtpInputModal } from "@/components/auth/OtpInputModal"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: authContextLogin } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    verificationType: "EMAIL" as "EMAIL" | "PHONE"
  })

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [targetMasked, setTargetMasked] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [isOtpVerified, setIsOtpVerified] = useState(false)

  // Step 1: Click "Send OTP"
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setOtpError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    const target = formData.verificationType === "PHONE" ? formData.phone : formData.email
    if (!target || !target.trim()) {
      setError(`Please enter a valid ${formData.verificationType === "PHONE" ? "phone number" : "email address"}.`)
      return
    }

    setLoading(true)

    try {
      const res = await api.post("/auth/send-otp", {
        target,
        type: formData.verificationType,
        purpose: "REGISTRATION",
        userName: formData.name
      })

      setTargetMasked(res.data.targetMasked || target)
      setShowOtpModal(true)
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send OTP. Please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify 6-digit OTP in Modal
  const handleVerifyOtp = async (otpCode: string) => {
    setVerifyingOtp(true)
    setOtpError(null)

    const target = formData.verificationType === "PHONE" ? formData.phone : formData.email

    try {
      await api.post("/auth/verify-otp", {
        target,
        otpCode,
        purpose: "REGISTRATION"
      })

      setIsOtpVerified(true)
      setShowOtpModal(false)

      // Auto-complete registration after verification
      await completeRegistration()
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid OTP code. Please try again."
      setOtpError(msg)
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    const target = formData.verificationType === "PHONE" ? formData.phone : formData.email
    const res = await api.post("/auth/send-otp", {
      target,
      type: formData.verificationType,
      purpose: "REGISTRATION",
      userName: formData.name
    })
    setTargetMasked(res.data.targetMasked || target)
  }

  // Step 3: Complete Account Creation
  const completeRegistration = async () => {
    setLoading(true)
    try {
      const res = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        verificationType: formData.verificationType
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
      const msg = err.response?.data?.message || "Registration failed after OTP verification."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 my-8"
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
            <h1 className="text-3xl font-extrabold font-outfit text-white">Create Rexam Account</h1>
            <p className="text-sm text-slate-400">Secure OTP-based registration for government exam aspirants</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            {/* Verification Choice Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Verification Option</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, verificationType: "EMAIL" })}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                    formData.verificationType === "EMAIL"
                      ? "bg-blue-600/20 border-blue-400 text-white shadow-md shadow-blue-500/20"
                      : "bg-secondary/30 border-white/10 text-slate-400 hover:bg-secondary/60"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, verificationType: "PHONE" })}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                    formData.verificationType === "PHONE"
                      ? "bg-blue-600/20 border-blue-400 text-white shadow-md shadow-blue-500/20"
                      : "bg-secondary/30 border-white/10 text-slate-400 hover:bg-secondary/60"
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Phone OTP</span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address / Gmail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number (with Country Code)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="+919876543210"
                  className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-semibold"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 rounded-2xl text-sm font-bold shadow-xl shadow-blue-600/30 bg-blue-600 hover:bg-blue-500 border border-blue-400/30 transition-all"
              >
                {loading ? "Sending OTP..." : `Send OTP & Register via ${formData.verificationType}`}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      {/* 6-Digit OTP Modal */}
      <OtpInputModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        targetMasked={targetMasked}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        loading={verifyingOtp}
        error={otpError}
        title={`Verify ${formData.verificationType === "PHONE" ? "Phone" : "Email"} OTP`}
      />
    </div>
  )
}
