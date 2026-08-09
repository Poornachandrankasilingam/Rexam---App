"use client"

import { useEffect, useState } from "react"
import { Shield, ShieldAlert, AlertTriangle, Clock } from "lucide-react"
import api from "@/lib/api"

type ProctoringLogItem = {
  id: string
  user: { name: string; email: string }
  exam: { title: string; code: string }
  eventType: string
  riskScore: number
  details?: string
  timestamp: string
}

export default function ProctoringReportsPage() {
  const [logs, setLogs] = useState<ProctoringLogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProctoringLogs()
  }, [])

  const fetchProctoringLogs = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/proctoring")
      setLogs(res.data.logs || [])
    } catch (err) {
      console.error("Failed to load proctoring logs", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-rose-500/10 via-background to-purple-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300 mb-2">
            <Shield className="h-3.5 w-3.5" />
            <span>AI Proctoring Audit Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Proctoring & Malpractice Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Audit real-time suspicious behavior logs, tab switch events, missing face warnings, and risk scores.</p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading proctoring logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Shield className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Malpractice Events Recorded</h3>
            <p className="text-xs text-slate-400">All CBT candidate sessions have passed AI proctoring checks cleanly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-secondary/30 border border-rose-500/20 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 uppercase">
                      {log.eventType}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white font-outfit">{log.user?.name} ({log.user?.email})</h4>
                  <p className="text-xs text-slate-300">{log.details || "Suspicious behavior event recorded"}</p>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Risk +{log.riskScore}
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
