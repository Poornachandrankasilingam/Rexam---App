"use client"

import { useEffect, useState } from "react"
import { BarChart3, Target, Clock, Award, TrendingUp, HelpCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"

type DashboardStats = {
  stats: {
    totalExams: number
    accuracy: number
    avgScore: number
    totalCorrect: number
    totalWrong: number
    totalQuestionsAttempted: number
  }
  hasAttemptedExams: boolean
  focusAreas: Array<{ topic: string; progress: number; status: string }>
}

export default function StudentAnalyticsPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/dashboard")
      setData(res.data)
    } catch (err) {
      console.error("Failed to load analytics", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-background to-blue-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300 mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>User Data Isolated Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Performance Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time performance analytics calculated strictly from your user account history.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-semibold">Loading analytics...</div>
      ) : !data?.hasAttemptedExams || data.stats.totalExams === 0 ? (
        <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <HelpCircle className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No analytics data available</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Exams Attended = 0 | Accuracy = 0% | Avg Score = 0. Take your first exam to unlock subject & topic performance trends.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border border-white/10 flex items-center space-x-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Total Exams Attended</p>
                <p className="text-2xl font-extrabold font-outfit text-white mt-0.5">{data.stats.totalExams}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 flex items-center space-x-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Overall Accuracy Rate</p>
                <p className="text-2xl font-extrabold font-outfit text-white mt-0.5">{data.stats.accuracy}%</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 flex items-center space-x-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Average Test Score</p>
                <p className="text-2xl font-extrabold font-outfit text-white mt-0.5">{data.stats.avgScore}</p>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10 flex items-center space-x-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Questions Attempted</p>
                <p className="text-2xl font-extrabold font-outfit text-white mt-0.5">{data.stats.totalQuestionsAttempted || (data.stats.totalCorrect + data.stats.totalWrong)}</p>
              </div>
            </div>
          </div>

          {/* Topic Performance Breakdown */}
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold font-outfit text-white">Subject & Topic Performance Diagnostics</h2>

            <div className="space-y-4">
              {data.focusAreas.map((area) => (
                <div key={area.topic} className="p-4 rounded-2xl bg-secondary/30 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white text-sm">{area.topic}</span>
                    <span className="font-mono font-bold text-indigo-400">{area.progress}% Accuracy</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${area.progress >= 80 ? "bg-emerald-500" : area.progress >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${area.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Status: {area.status}</span>
                    <span>{area.progress >= 70 ? "Strong Topic" : "Needs Additional Practice"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
