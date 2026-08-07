"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings, 
  Shield, 
  Sliders, 
  Bell, 
  Save, 
  CheckCircle, 
  Lock, 
  Database, 
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  const [proctoringSensitivity, setProctoringSensitivity] = useState<"Strict" | "Moderate" | "Lenient">("Strict")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(true)
  const [maxRetries, setMaxRetries] = useState(3)
  const [smtpServer, setSmtpServer] = useState("smtp.rexam.ai")

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    showToast("System configuration settings saved successfully!")
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-semibold shadow-2xl flex items-center space-x-3 border border-emerald-400/40"
          >
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-background to-secondary/30">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
          <Settings className="h-3.5 w-3.5" />
          <span>System Administration</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings & Controls</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure AI proctoring parameters, platform maintenance mode, registration limits, and mail servers.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
            <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-border/40">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">AI Proctoring Engine Sensitivity</h2>
                  <p className="text-xs text-muted-foreground">Adjust automated flag thresholds for eye tracking, face detection & audio alerts.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(["Strict", "Moderate", "Lenient"] as const).map((sens) => (
                  <button
                    key={sens}
                    type="button"
                    onClick={() => setProctoringSensitivity(sens)}
                    className={`p-4 rounded-2xl border text-xs font-bold transition-all text-center ${
                      proctoringSensitivity === sens
                        ? "border-rose-500 bg-rose-500/10 text-rose-400 shadow-md shadow-rose-500/10"
                        : "border-border/60 bg-secondary/30 hover:border-border text-muted-foreground"
                    }`}
                  >
                    {sens} Mode
                  </button>
                ))}
              </div>
            </section>

            <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-border/40">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Exam Execution Policy</h2>
                  <p className="text-xs text-muted-foreground">Define re-attempt policies and time-out limits.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Max Allowed Exam Re-attempts</label>
                  <input
                    type="number"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">SMTP Gateway Server</label>
                  <input
                    type="text"
                    value={smtpServer}
                    onChange={(e) => setSmtpServer(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* System Toggles Sidebar */}
          <div className="space-y-6">
            <section className="glass p-6 rounded-3xl border border-white/10 space-y-6">
              <h3 className="font-bold text-base">Global System Switches</h3>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
                  <div>
                    <p className="text-foreground">Maintenance Mode</p>
                    <p className="text-[10px] text-muted-foreground font-normal">Temporarily pause student exam access.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 ${maintenanceMode ? "bg-rose-500" : "bg-secondary"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${maintenanceMode ? "ml-6" : "ml-0"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
                  <div>
                    <p className="text-foreground">Allow New Registration</p>
                    <p className="text-[10px] text-muted-foreground font-normal">Enable new student signups.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowRegistration(!allowRegistration)}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 ${allowRegistration ? "bg-primary" : "bg-secondary"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all ${allowRegistration ? "ml-6" : "ml-0"}`} />
                  </button>
                </div>

                <Button type="submit" className="w-full rounded-2xl py-5 font-bold shadow-md shadow-primary/20">
                  <Save className="h-4 w-4 mr-2" />
                  Save System Settings
                </Button>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  )
}
