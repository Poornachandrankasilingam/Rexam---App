"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  ShieldCheck, 
  Save, 
  CheckCircle, 
  Check, 
  Target, 
  Mail, 
  Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function StudentSettingsPage() {
  const { user } = useAuth()

  // Profile Form State
  const [name, setName] = useState(user?.name || "Rahul Sharma")
  const [email, setEmail] = useState(user?.email || "rahul.sharma@example.com")
  const [phone, setPhone] = useState("+91 98765 43210")
  const [targetExam, setTargetExam] = useState("SSC CGL Tier-1")

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passError, setPassError] = useState("")

  // Notification Toggles State
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsReminders, setSmsReminders] = useState(true)
  const [aiRecommendations, setAiRecommendations] = useState(true)

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    showToast("Profile information updated successfully!")
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      setPassError("Please enter your current password")
      return
    }
    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match")
      return
    }

    setPassError("")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    showToast("Password updated successfully!")
  }

  const handleSaveNotifications = () => {
    showToast("Notification preferences updated!")
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
          <span>Account Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Profile & Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage personal details, security credentials, target exam goals, and notification channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information Form */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-border/40">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Personal Profile</h2>
                <p className="text-xs text-muted-foreground">Update your personal account details.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground flex items-center space-x-1">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground flex items-center space-x-1">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span>Primary Target Exam</span>
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="SSC CGL Tier-1">SSC CGL Tier-1</option>
                    <option value="UPSC Prelims GS">UPSC Prelims GS</option>
                    <option value="IBPS PO Prelims">IBPS PO Prelims</option>
                    <option value="RRB NTPC CBT-2">RRB NTPC CBT-2</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </section>

          {/* Security & Password Section */}
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-border/40">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Password & Security</h2>
                <p className="text-xs text-muted-foreground">Update your account password securely.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-semibold">
              {passError && <p className="text-xs text-red-400 font-bold">{passError}</p>}

              <div className="space-y-1">
                <label className="text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/40 border border-border/60 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="secondary" className="rounded-full px-6 font-bold">
                  Update Password
                </Button>
              </div>
            </form>
          </section>
        </div>

        {/* Notifications & Preferences Sidebar */}
        <div className="space-y-6">
          <section className="glass p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-border/40">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Notifications</h3>
                <p className="text-xs text-muted-foreground">Choose notification channels.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
                <div>
                  <p className="text-foreground">Email Test Reminders</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Receive exam dates & reminders.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-12 h-6 rounded-full transition-all relative p-1 ${emailAlerts ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${emailAlerts ? "ml-6" : "ml-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
                <div>
                  <p className="text-foreground">SMS Alerts</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Instant SMS for live exam codes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsReminders(!smsReminders)}
                  className={`w-12 h-6 rounded-full transition-all relative p-1 ${smsReminders ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${smsReminders ? "ml-6" : "ml-0"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-border/50">
                <div>
                  <p className="text-foreground">AI Study Recommendations</p>
                  <p className="text-[10px] text-muted-foreground font-normal">Daily weak topic practice sets.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAiRecommendations(!aiRecommendations)}
                  className={`w-12 h-6 rounded-full transition-all relative p-1 ${aiRecommendations ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-all ${aiRecommendations ? "ml-6" : "ml-0"}`} />
                </button>
              </div>

              <Button onClick={handleSaveNotifications} className="w-full rounded-2xl py-5 font-bold shadow-md shadow-primary/20">
                Save Preferences
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
