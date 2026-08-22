"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Home, LayoutDashboard, LogIn } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { useAuth } from "@/context/AuthContext"

export default function NotFound() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const dashboardPath = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" 
    ? "/admin" 
    : user 
    ? "/student" 
    : "/login"

  return (
    <div className="min-h-screen bg-[#04130d] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radiant Emerald Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg text-center relative z-10"
      >
        <div className="glass p-10 md:p-12 rounded-3xl border border-emerald-500/20 shadow-2xl space-y-6">
          {/* 3D Brand Logo */}
          <div className="flex justify-center mb-2">
            <BrandLogo size="md" showText={false} />
          </div>

          <div className="space-y-2">
            <h1 className="text-7xl font-black font-outfit text-white tracking-tight">
              4<span className="text-emerald-400">0</span>4
            </h1>
            <h2 className="text-2xl font-bold font-outfit text-white">
              Page Not Found
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              The page you are looking for doesn't exist, was moved, or requires signing into your account.
            </p>
          </div>

          {/* Action Navigation Options */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button size="lg" className="btn-3d-green w-full rounded-2xl px-6 font-bold text-white shadow-lg shadow-emerald-500/25">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>

            <Link to={dashboardPath} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="glass glass-hover w-full rounded-2xl px-6 font-bold text-emerald-300 border-emerald-400/30">
                {user ? (
                  <>
                    <LayoutDashboard className="mr-2 h-4 w-4 text-emerald-400" />
                    Dashboard
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4 text-emerald-400" />
                    Sign In
                  </>
                )}
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto rounded-2xl px-5 text-slate-300 hover:text-white hover:bg-emerald-500/10 font-semibold"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
