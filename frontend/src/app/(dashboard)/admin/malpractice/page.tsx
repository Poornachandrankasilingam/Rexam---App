"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Camera, 
  Search, 
  X, 
  Check, 
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

type MalpracticeLog = {
  id: string
  candidateName: string
  email: string
  examTitle: string
  eventType: string
  riskLevel: "High" | "Medium" | "Low"
  timestamp: string
  status: "Flagged" | "Resolved" | "Disqualified"
}

const INITIAL_LOGS: MalpracticeLog[] = [
  {
    id: "log1",
    candidateName: "Rahul K.",
    email: "rahul.k@example.com",
    examTitle: "SSC CGL Tier-1 Official Mock",
    eventType: "Multiple Faces Detected",
    riskLevel: "High",
    timestamp: "2 mins ago",
    status: "Flagged"
  },
  {
    id: "log2",
    candidateName: "Priya Sharma",
    email: "priya.s@example.com",
    examTitle: "Quantitative Aptitude Mastery Test",
    eventType: "Tab Switched 3x",
    riskLevel: "Medium",
    timestamp: "5 mins ago",
    status: "Flagged"
  },
  {
    id: "log3",
    candidateName: "Amit Verma",
    email: "amit.v@example.com",
    examTitle: "UPSC Prelims GS Mock Series 2026",
    eventType: "User Left Seat / Face Missing",
    riskLevel: "Medium",
    timestamp: "12 mins ago",
    status: "Flagged"
  },
  {
    id: "log4",
    candidateName: "Siddharth Mehta",
    email: "sid.m@example.com",
    examTitle: "SSC CGL Tier-1 Official Mock",
    eventType: "Background Speech Detected",
    riskLevel: "Low",
    timestamp: "25 mins ago",
    status: "Resolved"
  }
]

export default function AdminMalpracticePage() {
  const [logs, setLogs] = useState<MalpracticeLog[]>(INITIAL_LOGS)
  const [riskFilter, setRiskFilter] = useState<"ALL" | "High" | "Medium" | "Low">("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Screenshot Preview Modal
  const [previewLog, setPreviewLog] = useState<MalpracticeLog | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleResolveAlert = (logId: string, candidate: string) => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: "Resolved" } : l))
    showToast(`Marked alert for ${candidate} as resolved.`)
  }

  const handleDisqualify = (logId: string, candidate: string) => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: "Disqualified" } : l))
    showToast(`Disqualified candidate ${candidate} from examination.`)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredLogs = logs.filter(l => {
    const matchesRisk = riskFilter === "ALL" || l.riskLevel === riskFilter
    const matchesSearch = l.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRisk && matchesSearch
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-semibold shadow-2xl flex items-center space-x-3 border border-emerald-400/40"
          >
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-rose-500/10 via-background to-amber-500/10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 mb-2">
          <Shield className="h-3.5 w-3.5" />
          <span>Real-time AI Proctoring Feed</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Proctoring & Malpractice Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">Review AI-flagged face missing, tab switching, multiple person detection, and audio anomaly logs.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2">
          {(["ALL", "High", "Medium", "Low"] as const).map(risk => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                riskFilter === risk
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {risk === "ALL" ? "All Alerts" : `${risk} Risk`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search candidate or flag type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/40 border border-border/60 text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground text-xs">
                <th className="px-6 py-4 font-semibold">Candidate Details</th>
                <th className="px-6 py-4 font-semibold">Flag Event</th>
                <th className="px-6 py-4 font-semibold">Exam Title</th>
                <th className="px-6 py-4 font-semibold">Risk Level</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground">{log.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{log.email}</p>
                  </td>

                  <td className="px-6 py-4 font-semibold text-rose-400">
                    {log.eventType}
                    <p className="text-[10px] text-muted-foreground font-normal">{log.timestamp}</p>
                  </td>

                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{log.examTitle}</td>

                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      log.riskLevel === "High" ? "bg-rose-500 text-white" :
                      log.riskLevel === "Medium" ? "bg-amber-500 text-white" : "bg-slate-500 text-white"
                    }`}>
                      {log.riskLevel} Risk
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${
                      log.status === "Resolved" ? "text-emerald-400" :
                      log.status === "Disqualified" ? "text-red-400" : "text-amber-400"
                    }`}>
                      {log.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        onClick={() => setPreviewLog(log)}
                        variant="secondary" 
                        size="sm" 
                        className="rounded-xl"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Snapshot
                      </Button>
                      
                      {log.status === "Flagged" && (
                        <>
                          <Button 
                            onClick={() => handleResolveAlert(log.id, log.candidateName)}
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => handleDisqualify(log.id, log.candidateName)}
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl text-red-400 hover:bg-red-500/10"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Preview Modal */}
      {previewLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6 relative"
          >
            <button 
              onClick={() => setPreviewLog(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {previewLog.riskLevel} Risk Alert
              </span>
              <h3 className="text-xl font-bold">{previewLog.candidateName}</h3>
              <p className="text-xs text-muted-foreground">{previewLog.eventType} • {previewLog.timestamp}</p>
            </div>

            {/* Simulated AI Webcam Screenshot */}
            <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-slate-950 aspect-video flex items-center justify-center">
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 text-[10px] font-mono text-red-400 font-bold border border-red-500/40">
                REC • WEBCAM FEED #01
              </div>
              <div className="text-center space-y-2">
                <Camera className="h-10 w-10 mx-auto text-rose-400 animate-pulse" />
                <p className="text-xs font-semibold text-rose-300">AI Bounding Box Overlay Active</p>
                <p className="text-[10px] text-muted-foreground">Captured at 2026-08-07 17:15:30 UTC</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="ghost" onClick={() => setPreviewLog(null)} className="rounded-xl">
                Close
              </Button>
              <Button 
                onClick={() => { handleDisqualify(previewLog.id, previewLog.candidateName); setPreviewLog(null); }}
                className="rounded-xl font-bold bg-red-600 hover:bg-red-700"
              >
                Disqualify Candidate
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
