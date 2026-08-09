"use client"

import { UserX, UserPlus, RefreshCw, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface AccountNotFoundModalProps {
  isOpen: boolean
  onClose: () => void
  target: string
  targetType: 'EMAIL' | 'PHONE'
}

export function AccountNotFoundModal({
  isOpen,
  onClose,
  target,
  targetType
}: AccountNotFoundModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleCreateAccount = () => {
    onClose()
    navigate(`/register?target=${encodeURIComponent(target)}&type=${targetType}`)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass p-8 rounded-3xl border border-white/20 max-w-md w-full space-y-6 bg-[#0f172a] relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="space-y-3 text-center">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <UserX className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-outfit">Account Not Found</h3>
          <p className="text-xs text-slate-300">
            This {targetType === 'PHONE' ? 'mobile number' : 'email address'} is not registered with Rexam.
          </p>
          <div className="p-2.5 rounded-xl bg-secondary/50 border border-white/10 font-mono text-xs text-blue-400 font-bold inline-block max-w-full truncate px-4">
            {target || "Provided Target"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold text-center leading-relaxed">
          Please create a free Rexam aspirant account first to start practicing government exam mock tests and PYQs.
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleCreateAccount}
            size="lg"
            className="w-full py-6 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account</span>
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
            className="w-full py-5 rounded-2xl font-semibold border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
