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
    { label: "Registered Students", value: data?.stats?.totalStudents ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    { label: "Created Exams", value: data?.stats?.totalExams ?? 0, icon: PenTool, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
    { label: "Total Exam Attempts", value: data?.stats?.totalAttempts ?? 0, icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    { label: "Proctoring Logs", value: data?.stats?.totalProctoringLogs ?? 0, icon: Shield, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  ]

  return (
    <div className="space-y-8 pb-12 text-slate-900">
      {/* Banner Header */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 mb-2">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Admin Examination Portal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight font-outfit text-slate-900">Platform Control Center</h1>
          <p className="text-slate-700 text-sm font-medium mt-1">Manage examinations, OCR paper ingestion, registered students, and live proctoring logs.</p>
        </div>

        <Link to="/admin/exams/create">
          <Button size="lg" className="btn-3d-green rounded-full px-6 font-bold text-white shadow-md shadow-emerald-600/20">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create & Publish Exam
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center space-x-4">
            <div className={`p-3.5 rounded-2xl ${card.bg} border flex-shrink-0`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-700 font-bold uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-black font-outfit text-slate-900 mt-0.5">
                {loading ? "..." : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Exams & Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Created Exams List */}
        <section className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-outfit text-slate-900">Published Examinations</h2>
            <Link to="/admin/exams">
              <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-bold">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600 font-bold">Loading exams...</div>
          ) : !data?.recentExams || data.recentExams.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-sm font-black text-slate-900">No exams created yet.</p>
              <Link to="/admin/exams/create">
                <Button size="sm" className="btn-3d-green rounded-full px-6 font-bold text-xs mt-2 text-white">
                  Create First Exam
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentExams.map((ex) => (
                <div key={ex.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-colors">
                  <div>
                    <span className="text-[10px] font-mono font-black text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">{ex.code}</span>
                    <h4 className="font-black text-sm text-slate-900 font-outfit mt-1">{ex.title}</h4>
                    <p className="text-xs text-slate-600 font-semibold">{ex.questionsCount} Questions | {ex.duration} mins</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">{ex.attemptsCount} Attempts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Student Attempts List */}
        <section className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-outfit text-slate-900">Recent Student Submissions</h2>
            <Link to="/admin/attempts">
              <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 text-xs font-bold">View All</Button>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-600 font-bold">Loading attempts...</div>
          ) : !data?.recentAttempts || data.recentAttempts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-sm font-black text-slate-900">No submissions recorded yet.</p>
              <p className="text-xs text-slate-600 font-semibold">Student submissions will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAttempts.map((att) => (
                <div key={att.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-colors">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 font-outfit">{att.studentName}</h4>
                    <p className="text-xs text-slate-600 font-semibold">{att.examTitle} ({att.examCode})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{att.score} / {att.totalMarks} pts</p>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{att.accuracy}% Accuracy</span>
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
