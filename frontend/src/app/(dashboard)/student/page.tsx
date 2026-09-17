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
  Sparkles, 
  BookOpen, 
  Award, 
  HelpCircle, 
  Brain, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Loader2,
  Zap,
  CheckCircle2,
  Compass
} from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
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

interface AiCoachSummary {
  hasAttemptedExams: boolean
  report?: {
    reportId: string
    readinessScore: number
    readinessLevel: string
    performanceLevel: string
    accuracy: number
    weaknesses: string[]
    strengths: string[]
    trendSummary: string
  }
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  const [data, setData] = useState<DashboardData | null>(null)
  const [aiCoach, setAiCoach] = useState<AiCoachSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingMock, setGeneratingMock] = useState(false)

  useEffect(() => {
    const fetchDashboardAndAi = async () => {
      try {
        setLoading(true)
        const [dashRes, aiRes] = await Promise.allSettled([
          api.get("/student/dashboard"),
          api.get("/student/ai-coach/latest")
        ])

        if (dashRes.status === "fulfilled") {
          setData(dashRes.value.data)
        }

        if (aiRes.status === "fulfilled") {
          setAiCoach(aiRes.value.data)
        }
      } catch (err) {
        console.error("Failed to load student dashboard stats", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardAndAi()
  }, [user])

  const handlePracticeWeakAreas = async () => {
    try {
      setGeneratingMock(true)
      const res = await api.post("/student/ai-coach/generate-weak-mock")
      if (res.data?.exam?.id || res.data?.exam?.examId) {
        const examId = res.data.exam.id || res.data.exam.examId
        navigate(`/student/exam/${examId}/cbt`)
      } else {
        navigate("/student/practice")
      }
    } catch (err) {
      console.error("Failed to generate weak area mock test:", err)
      navigate("/student/practice")
    } finally {
      setGeneratingMock(false)
    }
  }

  const statsList = [
    { 
      label: "Exams Attended", 
      value: data?.stats?.totalExams ?? 0, 
      icon: Clock, 
      color: "text-blue-400", 
      bg: "bg-blue-500/10 border-blue-500/20" 
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

  const topWeak = aiCoach?.report?.weaknesses?.[0] || "Quantitative Aptitude"

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
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl glass border border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Student Intelligence & Examination Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">
            Welcome back, {user?.name || "Aspirant"}! 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-2xl">
            Real-time performance metrics, AI diagnostics, and CBT proctored assessments calibrated for your exam goals.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link to="/student/practice">
            <Button size="lg" className="btn-3d-green rounded-2xl px-6 py-6 font-bold text-white shadow-lg shadow-emerald-500/25">
              <Play className="h-4 w-4 mr-2 fill-current" />
              Launch Practice Arena
            </Button>
          </Link>
        </div>
      </div>

      {/* Rexam AI Performance Coach Spotlight Card */}
      {data?.hasAttemptedExams && aiCoach?.report && (
        <div className="p-6 md:p-8 rounded-3xl glass border border-purple-500/30 bg-gradient-to-r from-purple-950/25 via-transparent to-indigo-950/25 space-y-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-2xl shrink-0 mt-1">
                <Brain className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[10px] font-extrabold text-purple-300 border border-purple-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  <span>AI Performance Coach Active</span>
                </div>
                <h2 className="text-xl font-bold text-white font-outfit">Rexam AI Diagnostic Overview</h2>
                <p className="text-xs text-slate-300 font-medium max-w-xl">
                  {aiCoach.report.trendSummary || "Personalized diagnostic report ready based on your latest exam submissions."}
                </p>
              </div>
            </div>

            {/* Readiness Gauge & Quick Stats */}
            <div className="flex items-center gap-4 self-stretch md:self-auto bg-secondary/60 p-4 rounded-2xl border border-white/10 shadow-sm">
              <div className="text-center px-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">AI Readiness</p>
                <p className="text-2xl font-black font-outfit text-purple-400">{aiCoach.report.readinessScore}%</p>
                <span className="text-[9px] font-bold text-slate-300">{aiCoach.report.readinessLevel}</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="text-center px-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">Top Weak Area</p>
                <p className="text-xs font-black text-rose-400 line-clamp-1">{topWeak}</p>
                <span className="text-[9px] font-bold text-rose-300/80">Priority Drill</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
            <Link to="/student/reports">
              <Button className="rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 px-6 text-xs">
                View Full AI Analysis
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              onClick={handlePracticeWeakAreas}
              disabled={generatingMock}
              variant="outline"
              className="rounded-xl font-bold border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-6 text-xs"
            >
              {generatingMock ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : (
                <Flame className="h-3.5 w-3.5 mr-2 text-amber-400" />
              )}
              Practice Weak Areas (Adaptive Booster)
            </Button>
          </div>
        </div>
      )}

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, idx) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Exam History */}
          <section className="p-8 rounded-3xl glass border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold font-outfit text-white">Recent Scorecards & Attempts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Graded test attempts recorded for your account.</p>
              </div>
              <Link to="/student/results">
                <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold text-xs">
                  View All Results
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {!data?.hasAttemptedExams || (data?.stats?.totalExams === 0) ? (
              <div className="p-10 rounded-2xl bg-secondary/30 border border-white/10 text-center space-y-3">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Compass className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white font-outfit">No exams attempted yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Take your first examination or practice mock to unlock personalized performance graphs, accuracy metrics, and AI recommendations.
                  </p>
                </div>
                <Link to="/student/exams" className="inline-block pt-2">
                  <Button className="btn-3d-green rounded-full px-8 py-3.5 font-bold text-white shadow-md shadow-emerald-600/20 text-xs">
                    Browse Available Exams
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentResults.map((res) => (
                  <div key={res.id} className="p-4 rounded-2xl bg-secondary/40 border border-white/10 flex items-center justify-between hover:border-emerald-500/30 transition-all">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-blue-400 px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {res.code}
                      </span>
                      <h4 className="font-bold text-sm text-white font-outfit">{res.examTitle}</h4>
                      <p className="text-xs text-slate-400">Date: {new Date(res.date).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-sm font-black text-white font-mono">{res.score} / {res.totalMarks} pts</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {res.accuracy}% Accuracy
                        </span>
                        <Link to={`/student/reports?resultId=${res.id}`}>
                          <span className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
                            AI Report
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Practice Banner */}
          <section className="p-8 rounded-3xl glass border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-teal-950/20 to-transparent shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-left">
                <h2 className="text-2xl font-extrabold font-outfit text-white">Create Custom Practice Test</h2>
                <p className="text-xs text-slate-300">Customize subjects, difficulty level, question count, and timer to drill target topics.</p>
              </div>
              <Link to="/student/practice">
                <Button size="lg" className="btn-3d-green rounded-2xl px-8 font-bold text-white shadow-lg shadow-emerald-500/25">
                  Start Practice Set
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Diagnostics */}
        <div className="space-y-6">
          <section className="p-6 rounded-3xl glass border border-white/10 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-sm font-bold font-outfit text-white uppercase tracking-wider">
                Topic Mastery & Diagnostics
              </h3>
              <Link to="/student/reports">
                <span className="text-xs font-bold text-emerald-400 hover:underline">Full Coach →</span>
              </Link>
            </div>

            {!data?.hasAttemptedExams || (data?.stats?.totalExams === 0) ? (
              <div className="p-6 rounded-2xl bg-secondary/30 text-center space-y-2 border border-white/5">
                <BookOpen className="h-6 w-6 mx-auto text-slate-400" />
                <p className="text-xs text-white font-bold">No performance data yet</p>
                <p className="text-[10px] text-slate-400">Complete an exam to unlock AI weak topic diagnostics.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.focusAreas.map((area) => (
                  <div key={area.topic} className="p-3.5 rounded-2xl bg-secondary/40 border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white">{area.topic}</span>
                      <span className="font-mono font-bold text-emerald-400">{area.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full ${area.progress >= 80 ? "bg-emerald-500" : area.progress >= 60 ? "bg-amber-500" : "bg-rose-500"}`} 
                        style={{ width: `${area.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">{area.status}</p>
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
