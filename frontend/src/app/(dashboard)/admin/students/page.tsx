"use client"

import { useEffect, useState } from "react"
import { Users, Mail, Phone, Building, Search, Layers } from "lucide-react"
import api from "@/lib/api"

type StudentItem = {
  id: string
  name: string
  email: string
  phone?: string
  institute?: string
  createdAt: string
  _count: { results: number; proctoringLogs: number }
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/students")
      setStudents(res.data.students || [])
    } catch (err) {
      console.error("Failed to load students", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <Users className="h-3.5 w-3.5" />
            <span>Student User Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Registered Students</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage registered student accounts, attempt history count, and proctoring activity.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading student directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No students registered yet.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white font-outfit">{s.name}</h4>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center"><Mail className="h-3 w-3 mr-1 text-blue-400" />{s.email}</span>
                    {s.phone && <span className="flex items-center"><Phone className="h-3 w-3 mr-1 text-blue-400" />{s.phone}</span>}
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="px-2.5 py-1 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {s._count.results} Test Attempts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
