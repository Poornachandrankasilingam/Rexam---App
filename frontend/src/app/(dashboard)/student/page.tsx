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
  Loader2 
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
        navigate(`/student/exam/${examId}`)
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
      color: "text-indigo-600", 
      bg: "bg-indigo-50 border-indigo-200" 
    },
    { 
      label: "Accuracy Rate", 
      value: `${data?.stats?.accuracy ?? 0}%`, 
      icon: Target, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50 border-emerald-200" 
    },
    { 
      label: "Average Score", 
      value: data?.stats?.avgScore ?? 0, 
      icon: Award, 
      color: "text-amber-600", 
      bg: "bg-amber-50 border-amber-200" 
    },
    { 
      label: "Overall Rank", 
      value: data?.hasAttemptedExams ? (data?.stats?.overallRank || "N/A") : "N/A", 
      icon: Trophy, 
      color: "text-purple-600", 
      bg: "bg-purple-50 border-purple-200" 
    },
  ]

  const topWeak = aiCoach?.report?.weaknesses?.[0] || "Quantitative Aptitude"

  return (
    <div className="space-y-8 pb-12 text-slate-900 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="px-4 py-3 bg-emerald-900 border border-emerald-700 text-white text-sm font-semibold rounded-2xl shadow-2xl shadow-emerald-900/50 flex items-center gap-2 pointer-events-auto"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Student Intelligence Portal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight font-outfit text-slate-900">
            Welcome back, {user?.name || "Aspirant"}! 👋
          </h1>
          <p className="text-slate-700 text-sm font-medium mt-1">
            Real performance analysis and AI-driven recommendations calculated from your actual exam results.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/student/practice">
            <Button size="lg" className="btn-3d-green rounded-full px-6 font-bold text-white shadow-md shadow-emerald-600/20">
              <Play className="h-4 w-4 mr-2 fill-current" />
              Practice Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Rexam AI Performance Coach Spotlight Card */}
      {data?.hasAttemptedExams && aiCoach?.report && (
        <div className="p-6 md:p-8 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-indigo-50 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 bg-purple-100 border border-purple-200 text-purple-700 rounded-2xl shrink-0 mt-1">
                <Brain className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-100 text-[10px] font-extrabold text-purple-800 border border-purple-200">
                  <ShieldCheck className="h-3 w-3" />
                  <span>AI Performance Coach Active</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 font-outfit">Rexam AI Diagnostic Overview</h2>
                <p className="text-xs text-slate-700 font-semibold max-w-xl">
                  {aiCoach.report.trendSummary || "Complete personalized diagnostic report ready for review."}
                </p>
              </div>
            </div>

            {/* Readiness Gauge & Quick Stats */}
            <div className="flex items-center gap-4 self-stretch md:self-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-center px-2">
                <p className="text-[10px] uppercase font-bold text-slate-600">AI Readiness</p>
                <p className="text-2xl font-black font-outfit text-purple-700">{aiCoach.report.readinessScore}%</p>
                <span className="text-[9px] font-bold text-slate-700">{aiCoach.report.readinessLevel}</span>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div className="text-center px-2">
                <p className="text-[10px] uppercase font-bold text-slate-600">Top Weak Area</p>
                <p className="text-xs font-black text-rose-700 line-clamp-1">{topWeak}</p>
                <span className="text-[9px] font-bold text-slate-600">High Priority</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-purple-100">
            <Link to="/student/reports">
              <Button className="rounded-2xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 px-6">
                View Full AI Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              onClick={handlePracticeWeakAreas}
              disabled={generatingMock}
              variant="outline"
              className="rounded-2xl font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 px-6 cursor-pointer"
            >
              {generatingMock ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Flame className="h-4 w-4 mr-2 text-amber-600" />
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
            className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm flex items-center space-x-4"
          >
            <div className={`p-3.5 rounded-2xl ${stat.bg} border flex-shrink-0`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-700 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black font-outfit text-slate-900 mt-0.5">
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
          <section className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black font-outfit text-slate-900">My Exam History & Scorecards</h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Real test results recorded for your unique user account.</p>
              </div>
              <Link to="/student/results">
                <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold text-xs">
                  View All Results
                </Button>
              </Link>
            </div>

            {!data?.hasAttemptedExams || (data?.stats?.totalExams === 0) ? (
              <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <HelpCircle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">No exams attempted yet.</h3>
                  <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto">
                    You haven&apos;t taken any tests yet. Complete your first practice or mock exam to generate performance charts, accuracy metrics, and AI diagnostics.
                  </p>
                </div>
                <Link to="/student/practice" className="inline-block pt-2">
                  <Button className="btn-3d-green rounded-full px-8 py-4 font-bold text-white shadow-md shadow-emerald-600/20 text-xs">
                    Take First Exam
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentResults.map((res) => (
                  <div key={res.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-all">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-black text-emerald-800 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                        {res.code}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 font-outfit">{res.examTitle}</h4>
                      <p className="text-xs text-slate-600 font-semibold">Date: {new Date(res.date).toLocaleDateString()}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-sm font-black text-slate-900">{res.score} / {res.totalMarks} pts</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {res.accuracy}% Accuracy
                        </span>
                        <Link to={`/student/reports?resultId=${res.id}`}>
                          <span className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer">
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
          <section className="p-8 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-left">
                <h2 className="text-2xl font-black font-outfit text-slate-900">Create Custom Practice Test</h2>
                <p className="text-xs text-slate-700 font-semibold">Customize subjects, difficulty level, question count, and live countdown timer.</p>
              </div>
              <Link to="/student/practice">
                <Button size="lg" className="btn-3d-green rounded-full px-8 font-bold text-white shadow-md shadow-emerald-600/20">
                  Create Practice Set
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Diagnostics */}
        <div className="space-y-6">
          <section className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black font-outfit text-slate-900">AI Weak Topic Diagnostics</h3>
              <Link to="/student/reports">
                <span className="text-xs font-black text-emerald-700 hover:underline">Full Coach</span>
              </Link>
            </div>

            {!data?.hasAttemptedExams || (data?.stats?.totalExams === 0) ? (
              <div className="p-6 rounded-2xl bg-slate-50 text-center space-y-2 border border-slate-200">
                <BookOpen className="h-6 w-6 mx-auto text-slate-400" />
                <p className="text-xs text-slate-700 font-bold">No performance data available yet.</p>
                <p className="text-[10px] text-slate-500 font-semibold">Complete an exam to unlock AI weak topic diagnosis.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.focusAreas.map((area) => (
                  <div key={area.topic} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900">{area.topic}</span>
                      <span className="font-black text-emerald-700">{area.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${area.progress >= 80 ? "bg-emerald-500" : area.progress >= 60 ? "bg-amber-500" : "bg-rose-500"}`} 
                        style={{ width: `${area.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 font-semibold">{area.status}</p>
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
