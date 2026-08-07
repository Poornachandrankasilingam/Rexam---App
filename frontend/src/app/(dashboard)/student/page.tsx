"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Clock, 
  Target, 
  ArrowRight,
  Play,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Award
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type DashboardData = {
  user: { id: string; name: string; email: string }
  hasAttemptedExams: boolean
  message?: string
  stats: {
    totalExams: number
    accuracy: number
    avgScore: number
    totalCorrect: number
    totalWrong: number
    overallRank: string
  }
  recentResults: Array<{
    id: string
    examTitle: string
    code: string
    score: number
    totalMarks: number
    correct: number
    incorrect: number
    accuracy: number
    date: string
  }>
  focusAreas: Array<{
    topic: string
    progress: number
    status: string
  }>
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await api.get("/student/dashboard")
        setData(response.data)
      } catch (err) {
        console.error("Failed to load student dashboard stats", err)
        // Fallback default empty state for 0 exams
        setData({
          user: { id: user?.id || "", name: user?.name || "", email: user?.email || "" },
          hasAttemptedExams: false,
          message: "No exams attempted yet.",
          stats: {
            totalExams: 0,
            accuracy: 0,
            avgScore: 0,
            totalCorrect: 0,
            totalWrong: 0,
            overallRank: "N/A"
          },
          recentResults: [],
          focusAreas: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const statsList = [
    { 
      label: "Exams Attended", 
      value: data?.stats?.totalExams ?? 0, 
      icon: Clock, 
      color: "text-indigo-400", 
      bg: "bg-indigo-500/10 border-indigo-500/20" 
    },
    { 
      label: "Accuracy Rate", 
      value: `${data?.stats?.accuracy ?? 0}%`, 
      icon: Target, 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10 border-emerald-500/20" 
    },
    { 
      label: "Average Score", 
      value: data?.stats?.avgScore ?? 0, 
      icon: Award, 
      color: "text-amber-400", 
      bg: "bg-amber-500/10 border-amber-500/20" 
    },
    { 
      label: "Overall Rank", 
      value: data?.hasAttemptedExams ? (data?.stats?.overallRank || "N/A") : "N/A", 
      icon: Trophy, 
      color: "text-purple-400", 
      bg: "bg-purple-500/10 border-purple-500/20" 
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-background to-emerald-500/10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Student Intelligence Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit">Welcome back, {user?.name || "Aspirant"}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here is your dynamic performance summary calculated from your exam history.</p>
        </div>

        <Link to="/student/practice">
          <Button size="lg" className="rounded-full px-6 font-bold shadow-lg shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30">
            <Play className="h-4 w-4 mr-2 fill-current" />
            Start Practice Test
          </Button>
        </Link>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass glass-hover p-6 rounded-3xl border border-white/10 flex items-center space-x-4"
          >
            <div className={`p-3.5 rounded-2xl ${stat.bg} border`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">{stat.label}</p>
              <p className="text-2xl font-extrabold font-outfit text-white mt-0.5">
                {loading ? "..." : stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Exam History / Empty State Container */}
          <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-outfit">My Exam History & Recent Scorecards</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real test results recorded for your unique user account.</p>
              </div>
              <Link to="/student/results">
                <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                  View All Results
                </Button>
              </Link>
            </div>

            {/* IF NO EXAMS ATTEMPTED: DISPLAY EXPLICIT EMPTY STATE */}
            {!data?.hasAttemptedExams || (data?.stats?.totalExams === 0) ? (
              <div className="p-10 rounded-2xl bg-secondary/30 border border-white/5 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <HelpCircle className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No exams attempted yet.</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    You haven&apos;t taken any tests yet. Complete your first practice or mock exam to generate performance charts, accuracy metrics, and AI diagnostics.
                  </p>
                </div>
                <Link to="/student/practice" className="inline-block pt-2">
                  <Button className="rounded-full px-8 py-5 font-bold shadow-lg shadow-indigo-600/25 bg-indigo-600 hover:bg-indigo-500">
                    Take First Exam
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              /* IF USER HAS ATTEMPTED EXAMS: DISPLAY REAL RESULTS */
              <div className="space-y-4">
                {data.recentResults.map((res) => (
                  <div key={res.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-between hover:border-indigo-500/40 transition-all">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                        {res.code}
                      </span>
                      <h4 className="font-bold text-sm text-white">{res.examTitle}</h4>
                      <p className="text-xs text-slate-400">Date: {new Date(res.date).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-base font-extrabold text-indigo-400">{res.score} / {res.totalMarks} pts</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {res.accuracy}% Accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Banner */}
          <section className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-background to-emerald-500/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-outfit">Make Own Aptitude Test</h2>
                <p className="text-xs text-slate-300">Customize subjects, difficulty level, question count, and live countdown timer.</p>
              </div>
              <Link to="/student/practice">
                <Button size="lg" className="rounded-full px-8 shadow-xl shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500">
                  Create Practice Set
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Diagnostics */}
        <div className="space-y-6">
          <section className="glass p-6 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-base font-bold font-outfit">AI Weak Topic Diagnostics</h3>

            {!data?.hasAttemptedExams || (data?.stats?.totalExams === 0) ? (
              <div className="p-6 rounded-2xl bg-secondary/30 text-center space-y-2 border border-white/5">
                <BookOpen className="h-6 w-6 mx-auto text-slate-400" />
                <p className="text-xs text-slate-400 font-medium">No performance data available yet.</p>
                <p className="text-[10px] text-slate-500">Complete an exam to unlock AI weak topic diagnosis.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.focusAreas.map((area) => (
                  <div key={area.topic} className="p-3.5 rounded-2xl bg-secondary/30 border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-white">{area.topic}</span>
                      <span className="font-bold text-indigo-400">{area.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${area.progress >= 80 ? "bg-emerald-500" : area.progress >= 60 ? "bg-amber-500" : "bg-rose-500"}`} 
                        style={{ width: `${area.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">{area.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
