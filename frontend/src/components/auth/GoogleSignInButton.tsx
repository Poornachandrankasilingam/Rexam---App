"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon"
              theme?: "outline" | "filled_blue" | "filled_black"
              size?: "large" | "medium" | "small"
              text?: "signin_with" | "signup_with" | "continue_with" | "signin"
              shape?: "rectangular" | "pill" | "circle" | "square"
              logo_alignment?: "left" | "center"
              width?: string | number
              locale?: string
            }
          ) => void
          prompt: (notification?: (notification: unknown) => void) => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  text?: string
  onError?: (errorMessage: string) => void
}

export function GoogleSignInButton({
  text = "Continue with Google",
  onError
}: GoogleSignInButtonProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
  const isRealClientIdConfigured = Boolean(
    clientId &&
    !clientId.includes("your_google_client_id_here") &&
    clientId.includes(".apps.googleusercontent.com")
  )

  // Handle Google Token / Credential Response from GSI
  const handleCredentialResponse = async (response: { credential?: string }) => {
    if (!response.credential) {
      if (onError) onError("Google authentication could not be completed. No credential received.")
      return
    }

    setLoading(true)
    try {
      const res = await api.post("/auth/google", {
        credential: response.credential
      })

      const { accessToken, user } = res.data
      if (accessToken && user) {
        login(accessToken, user)
        if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
          navigate("/admin")
        } else {
          navigate("/student")
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Google authentication could not be completed. Please try again."
      if (onError) onError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Initialize GSI if client ID is configured
  useEffect(() => {
    if (!isRealClientIdConfigured) return

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          })
        } catch (e) {
          console.warn("Google GSI initialization error:", e)
        }
      }
    }

    if (window.google?.accounts?.id) {
      initGsi()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          initGsi()
        }
      }, 300)
      return () => clearInterval(interval)
    }
  }, [clientId, isRealClientIdConfigured])

  // Handle Click (Supports OAuth2 Redirect & GSI)
  const handleClick = async () => {
    if (loading) return
    setLoading(true)

    try {
      // 1. Check if backend has Google OAuth URL configured
      const res = await api.get("/auth/google/url")

      if (res.data?.configured && res.data?.url) {
        // Redirect to official Google OAuth 2.0 Consent Screen
        window.location.href = res.data.url
        return
      }

      // 2. If backend URL is not configured, check GSI prompt on frontend
      if (isRealClientIdConfigured && window.google?.accounts?.id) {
        window.google.accounts.id.prompt()
        setLoading(false)
        return
      }

      // 3. If credentials are not yet configured in environment variables
      setLoading(false)
      const configErrorMsg = res.data?.message || "Google OAuth credentials not configured on the server. Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your environment variables (backend/.env or Vercel Settings)."
      if (onError) {
        onError(configErrorMsg)
      } else {
        alert(configErrorMsg)
      }
    } catch (err: any) {
      setLoading(false)
      const msg = err.response?.data?.message || "Google authentication could not be completed. Please try again."
      if (onError) onError(msg)
    }
  }

  return (
    <div className="w-full relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full relative flex items-center justify-center gap-3 py-3.5 px-4 bg-secondary/60 hover:bg-secondary/90 text-white text-sm font-semibold rounded-2xl border border-white/10 hover:border-blue-400/40 shadow-lg hover:shadow-blue-500/10 transition-all duration-200 group active:scale-[0.99] disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        ) : (
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="font-medium text-slate-100 group-hover:text-white">
          {loading ? "Connecting to Google..." : text}
        </span>
      </button>
    </div>
  )
}
