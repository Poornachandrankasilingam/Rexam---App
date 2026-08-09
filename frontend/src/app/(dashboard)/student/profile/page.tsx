"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { UserCheck, Mail, Phone, Building, Save, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    institute: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/profile")
      if (res.data?.user) {
        setProfile({
          name: res.data.user.name || user?.name || "",
          email: res.data.user.email || user?.email || "",
          phone: res.data.user.phone || "",
          institute: res.data.user.institute || ""
        })
      }
    } catch (err) {
      console.error("Failed to load profile", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg("")
    try {
      await api.put("/student/profile", {
        name: profile.name,
        phone: profile.phone,
        institute: profile.institute
      })
      setMsg("Profile saved successfully!")
    } catch (err: any) {
      console.error("Failed to save profile", err)
      setMsg("Failed to save profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-sky-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Account Details</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Student Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your personal information, contact phone, and institute details.</p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading profile...</div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <UserCheck className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Email Address (Read Only)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/20 border border-white/5 text-slate-400 text-xs font-semibold cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Contact Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center">
                  <Building className="h-3.5 w-3.5 mr-1.5 text-blue-400" /> Institute / College Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. National Institute of Technology"
                  value={profile.institute}
                  onChange={(e) => setProfile({ ...profile, institute: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {msg && (
              <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                {msg}
              </p>
            )}

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <Button type="submit" disabled={saving} size="lg" className="rounded-2xl px-8 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
