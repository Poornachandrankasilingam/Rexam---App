"use client"

import { useEffect, useState } from "react"
import { Layers, Award, Clock } from "lucide-react"
import api from "@/lib/api"

type AttemptItem = {
  id: string
  user: { name: string; email: string }
  exam: { title: string; code: string; totalMarks: number }
  score: number
  totalMarks: number
  accuracy: number
  timeSpent: number
  createdAt: string
}

export default function ExamAttemptsPage() {
  const [attempts, setAttempts] = useState<AttemptItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttempts()
  }, [])

  const fetchAttempts = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/attempts")
      setAttempts(res.data.attempts || [])
    } catch (err) {
      console.error("Failed to load attempts", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>Submission Logs</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Student Exam Attempts</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide overview of all student exam submissions, scores, and accuracy.</p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading attempt logs...</div>
        ) : attempts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No exam attempts submitted yet.</div>
        ) : (
          <div className="space-y-3">
            {attempts.map((att) => (
              <div key={att.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white font-outfit">{att.user?.name} ({att.user?.email})</h4>
                  <p className="text-xs text-slate-400">{att.exam?.title} ({att.exam?.code}) • {new Date(att.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-blue-400">{att.score} / {att.totalMarks} pts</p>
                  <span className="text-[10px] font-bold text-emerald-400">{att.accuracy}% Accuracy</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
