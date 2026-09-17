"use client"

import { useEffect, useState } from "react"
import { Users, PenTool, Layers, Shield, PlusCircle, ArrowRight, HelpCircle, Sparkles, Award } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
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
  const location = useLocation()
  const [toastMessage, setToastMessage] = useState<string | null>(location.state?.toastMessage || null)
  
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  useEffect(() => {
    if (location.state?.toastMessage) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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
    { label: "Live & Draft Exams", value: data?.stats?.totalExams ?? 0, icon: PenTool, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { label: "Total Exam Attempts", value: data?.stats?.totalAttempts ?? 0, icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Proctoring Audit Logs", value: data?.stats?.totalProctoringLogs ?? 0, icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ]

  return (
    <div className="space-y-8 pb-12 text-slate-100 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="px-4 py-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-auto backdrop-blur-md"
          >
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        </div>
      )}

      {/* Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl glass border border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-indigo-500/10 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Institutional Examination Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Administrator Command Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-2xl">
            Monitor real-time candidate attempts, deploy CBT examinations, manage AI proctoring logs, and inspect institution metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link to="/admin/exams/create">
            <Button size="lg" className="btn-3d-green rounded-2xl px-6 py-6 font-bold text-white shadow-lg shadow-emerald-500/25">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Examination
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-6 rounded-3xl glass border border-white/10 shadow-lg flex items-center space-x-4 hover:border-emerald-500/30 transition-all"
          >
            <div className={`p-3.5 rounded-2xl ${stat.bg} border flex-shrink-0`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black font-outfit text-white mt-0.5">
                {loading ? "..." : stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Recent Exams & Live Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Managed Examinations */}
        <section className="p-8 rounded-3xl glass border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-extrabold font-outfit text-white">Active Examinations</h2>
              <p className="text-xs text-slate-400 mt-0.5">Recent exams published for candidates.</p>
            </div>
            <Link to="/admin/exams">
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold text-xs">
                Manage All →
              </Button>
            </Link>
          </div>

          {!data?.recentExams || data.recentExams.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-secondary/30 rounded-2xl border border-white/5">
              No exams created yet. Click "Create Examination" to deploy your first CBT test.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentExams.map((exam) => (
                <div key={exam.id} className="p-4 rounded-2xl bg-secondary/40 border border-white/10 flex items-center justify-between hover:border-emerald-500/30 transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {exam.code}
                    </span>
                    <h4 className="font-bold text-sm text-white font-outfit line-clamp-1">{exam.title}</h4>
                    <p className="text-xs text-slate-400">{exam.duration} mins • {exam.questionsCount} questions • {exam.totalMarks} marks</p>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {exam.attemptsCount} Attempts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Student Attempts */}
        <section className="p-8 rounded-3xl glass border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-extrabold font-outfit text-white">Latest Submissions</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time submissions graded across examinations.</p>
            </div>
            <Link to="/admin/attempts">
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold text-xs">
                View All Attempts →
              </Button>
            </Link>
          </div>

          {!data?.recentAttempts || data.recentAttempts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-secondary/30 rounded-2xl border border-white/5">
              No attempts submitted yet. When candidates complete exams, submissions will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAttempts.map((att) => (
                <div key={att.id} className="p-4 rounded-2xl bg-secondary/40 border border-white/10 flex items-center justify-between hover:border-emerald-500/30 transition-all">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white font-outfit">{att.studentName} ({att.studentEmail})</h4>
                    <p className="text-xs text-slate-400">{att.examTitle} [{att.examCode}]</p>
                    <p className="text-[10px] text-slate-500">{new Date(att.date).toLocaleString()}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-sm font-black text-white font-mono">{att.score} / {att.totalMarks}</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {att.accuracy}% Accuracy
                    </span>
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
