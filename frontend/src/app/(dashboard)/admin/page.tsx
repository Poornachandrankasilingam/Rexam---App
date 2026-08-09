"use client"

import { useEffect, useState } from "react"
import { Users, PenTool, Layers, Shield, PlusCircle, ArrowRight, HelpCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type AdminDashboardData = {
  stats: {
    totalStudents: number
    totalExams: number
    totalAttempts: number
    totalProctoringLogs: number
  }
  recentExams: Array<{
    id: string
    title: string
    code: string
    duration: number
    totalMarks: number
    questionsCount: number
    attemptsCount: number
    createdAt: string
  }>
  recentAttempts: Array<{
    id: string
    studentName: string
    studentEmail: string
    examTitle: string
    examCode: string
    score: number
    totalMarks: number
    accuracy: number
    date: string
  }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/dashboard")
      setData(res.data)
    } catch (err) {
      console.error("Failed to load admin stats", err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: "Registered Students", value: data?.stats?.totalStudents ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Created Exams", value: data?.stats?.totalExams ?? 0, icon: PenTool, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Total Exam Attempts", value: data?.stats?.totalAttempts ?? 0, icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Proctoring Logs", value: data?.stats?.totalProctoringLogs ?? 0, icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Banner Header */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Examination Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Platform Control Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage examinations, OCR paper ingestion, registered students, and live proctoring logs.</p>
        </div>

        <Link to="/admin/exams/create">
          <Button size="lg" className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create & Publish Exam
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="glass p-6 rounded-3xl border border-white/10 flex items-center space-x-4">
            <div className={`p-3.5 rounded-2xl ${card.bg} border`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">{card.label}</p>
              <p className="text-2xl font-extrabold font-outfit text-white mt-0.5">
                {loading ? "..." : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Exams & Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Created Exams List */}
        <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-outfit text-white">Published Examinations</h2>
            <Link to="/admin/exams">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 font-semibold">Loading exams...</div>
          ) : !data?.recentExams || data.recentExams.length === 0 ? (
            <div className="p-8 rounded-2xl bg-secondary/30 border border-white/5 text-center space-y-3">
              <HelpCircle className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No exams created yet.</p>
              <Link to="/admin/exams/create">
                <Button size="sm" className="rounded-full px-6 bg-blue-600 hover:bg-blue-500 font-bold text-xs mt-2">
                  Create First Exam
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentExams.map((ex) => (
                <div key={ex.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">{ex.code}</span>
                    <h4 className="font-bold text-sm text-white font-outfit mt-1">{ex.title}</h4>
                    <p className="text-xs text-slate-400">{ex.questionsCount} Questions | {ex.duration} mins</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">{ex.attemptsCount} Attempts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Student Attempts List */}
        <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-outfit text-white">Recent Student Submissions</h2>
            <Link to="/admin/attempts">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 font-semibold">Loading attempts...</div>
          ) : !data?.recentAttempts || data.recentAttempts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-secondary/30 border border-white/5 text-center space-y-3">
              <HelpCircle className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-white">No results available yet.</p>
              <p className="text-xs text-slate-400">Student submissions will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAttempts.map((att) => (
                <div key={att.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white font-outfit">{att.studentName}</h4>
                    <p className="text-xs text-slate-400">{att.examTitle} ({att.examCode})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-blue-400">{att.score} / {att.totalMarks} pts</p>
                    <span className="text-[10px] font-bold text-emerald-400">{att.accuracy}% Accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
