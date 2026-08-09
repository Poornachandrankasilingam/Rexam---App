"use client"

import { useEffect, useState } from "react"
import { UserCheck, Mail, ShieldCheck } from "lucide-react"
import api from "@/lib/api"

export default function CustomerManagementPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/students")
      setStudents(res.data.students || [])
    } catch (err) {
      console.error("Failed to load customers", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Customer & Support Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Customer Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage registered student customer profiles, support access, and status.</p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading customer records...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No customer records found.</div>
        ) : (
          <div className="space-y-3">
            {students.map((st) => (
              <div key={st.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white font-outfit">{st.name}</h4>
                  <p className="text-xs text-slate-400">{st.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Student
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
