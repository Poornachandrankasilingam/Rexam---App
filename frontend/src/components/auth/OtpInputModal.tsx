"use client"

import { useState, useEffect, useRef } from "react"
import { ShieldCheck, RefreshCw, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OtpInputModalProps {
  isOpen: boolean
  onClose: () => void
  targetMasked: string
  onVerify: (otpCode: string) => Promise<void>
  onResend: () => Promise<void>
  loading?: boolean
  error?: string | null
  title?: string
}

export function OtpInputModal({
  isOpen,
  onClose,
  targetMasked,
  onVerify,
  onResend,
  loading = false,
  error = null,
  title = "Verify OTP Code"
}: OtpInputModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""))
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Reset countdown & focus on open
  useEffect(() => {
    if (isOpen) {
      setDigits(Array(6).fill(""))
      setCountdown(60)
      setCanResend(false)
      setLocalError(null)
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || countdown <= 0) {
      if (countdown <= 0) setCanResend(true)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, countdown])

  if (!isOpen) return null

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
    const lastChar = value.slice(-1)
    if (value && !/^\d$/.test(lastChar)) return

    const newDigits = [...digits]
    newDigits[index] = lastChar
    setDigits(newDigits)
    setLocalError(null)

    // Auto-focus next box
    if (lastChar && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").trim()
    if (/^\d{6}$/.test(pasted)) {
      const pastedArr = pasted.split("")
      setDigits(pastedArr)
      inputRefs.current[5]?.focus()
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join("")
    if (code.length !== 6) {
      setLocalError("Please enter all 6 digits of the OTP.")
      return
    }
    try {
      await onVerify(code)
    } catch (err: any) {
      setLocalError(err.message || "Invalid OTP code.")
    }
  }

  const handleResendClick = async () => {
    if (!canResend || resending) return
    try {
      setResending(true)
      setLocalError(null)
      await onResend()
      setDigits(Array(6).fill(""))
      setCountdown(60)
      setCanResend(false)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err: any) {
      setLocalError(err.message || "Failed to resend OTP.")
    } finally {
      setResending(false)
    }
  }

  const displayError = localError || error

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass p-8 rounded-3xl border border-white/20 max-w-md w-full space-y-6 bg-background relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-white font-outfit">{title}</h3>
          <p className="text-xs text-slate-300">
            Enter the 6-digit OTP code sent to: <br />
            <strong className="text-blue-400 font-mono text-xs">{targetMasked || "your target"}</strong>
          </p>
        </div>

        {/* Error Alert Banner */}
        {displayError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* 6 Digit Boxes Form */}
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="h-12 w-12 text-center text-xl font-mono font-bold rounded-2xl bg-secondary/50 border border-white/10 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 transition-all"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || digits.join("").length !== 6}
            size="lg"
            className="w-full rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        {/* Resend Countdown */}
        <div className="pt-2 text-center border-t border-white/10 text-xs text-slate-400">
          {canResend ? (
            <button
              onClick={handleResendClick}
              disabled={resending}
              className="font-bold text-blue-400 hover:text-blue-300 inline-flex items-center transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Resending OTP..." : "Resend OTP"}
            </button>
          ) : (
            <p>
              Resend OTP in <span className="font-mono font-bold text-blue-400">{countdown}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
