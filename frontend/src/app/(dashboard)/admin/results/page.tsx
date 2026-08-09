"use client"

import { useEffect, useState } from "react"
import { Award, CheckCircle } from "lucide-react"
import api from "@/lib/api"

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/attempts")
      setResults(res.data.attempts || [])
    } catch (err) {
      console.error("Failed to load results", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Platform Score Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Platform Results Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-wide exam results and student scorecards.</p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No results recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white font-outfit">{r.user?.name}</h4>
                  <p className="text-xs text-slate-400">{r.exam?.title} ({r.exam?.code})</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-blue-400">{r.score} / {r.totalMarks} pts</p>
                  <span className="text-xs font-bold text-emerald-400">{r.accuracy}% Acc</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
