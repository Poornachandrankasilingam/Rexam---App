"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const processCallback = () => {
      const errorParam = searchParams.get("error")
      if (errorParam) {
        setStatus("error")
        setErrorMessage(decodeURIComponent(errorParam))
        setTimeout(() => {
          navigate(`/login?error=${encodeURIComponent(errorParam)}`)
        }, 2000)
        return
      }

      const token = searchParams.get("token")
      const rawUserData = searchParams.get("userData")

      if (!token || !rawUserData) {
        setStatus("error")
        setErrorMessage("Missing authentication token or user profile data.")
        setTimeout(() => {
          navigate("/login?error=" + encodeURIComponent("Google authentication could not be completed."))
        }, 2000)
        return
      }

      try {
        const user = JSON.parse(decodeURIComponent(rawUserData))
        login(token, user)
        setStatus("success")

        setTimeout(() => {
          if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
            navigate("/admin", { state: { toastMessage: `Successfully signed in as ${user.email}` } })
          } else {
            navigate("/student", { state: { toastMessage: `Successfully signed in as ${user.email}` } })
          }
        }, 500)
      } catch (err: any) {
        setStatus("error")
        setErrorMessage("Failed to parse user session.")
        setTimeout(() => {
          navigate("/login?error=" + encodeURIComponent("Failed to parse session data."))
        }, 2000)
      }
    }

    processCallback()
  }, [searchParams, login, navigate])

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
      <div className="glass p-10 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full text-center space-y-6">
        <div className="relative inline-block">
          <img
            src="/logo.jpg"
            alt="Rexam Logo"
            width={64}
            height={64}
            className="h-16 w-16 rounded-2xl object-cover border border-white/20 shadow-xl mx-auto"
          />
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto" />
            <h2 className="text-xl font-bold font-outfit text-white">Completing Google Sign-In...</h2>
            <p className="text-xs text-slate-400">Verifying security tokens and setting up your session.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold font-outfit text-white">Authentication Successful!</h2>
            <p className="text-xs text-emerald-300">Redirecting to your Rexam portal...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold font-outfit text-white">Authentication Error</h2>
            <p className="text-xs text-rose-300">{errorMessage}</p>
            <p className="text-[11px] text-slate-400">Redirecting back to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}
