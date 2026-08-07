"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Download, 
  CheckCircle, 
  Calendar, 
  Award, 
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "YTD">("30D")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleExportReport = () => {
    setToastMessage(`Exporting full analytics report for (${timeRange})...`)
    setTimeout(() => setToastMessage(null), 3000)
  }

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
            <Download className="h-5 w-5 animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-background to-secondary/30">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Platform Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics & Insights</h1>
          <p className="text-muted-foreground text-sm mt-1">Track student growth, exam participation rates, subject accuracy distributions, and revenue metrics.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 p-1 rounded-full bg-secondary/60 border border-border/60">
            {(["7D", "30D", "90D", "YTD"] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  timeRange === tr ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

          <Button 
            onClick={handleExportReport}
            className="rounded-full px-6 font-bold shadow-lg shadow-primary/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Registered Aspirants</p>
            <p className="text-2xl font-extrabold text-foreground">14,502</p>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">+18% this month</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Exams Conducted</p>
            <p className="text-2xl font-extrabold text-foreground">342 Tests</p>
            <p className="text-[10px] text-primary font-bold mt-0.5">+24 new this week</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Average Platform Pass Rate</p>
            <p className="text-2xl font-extrabold text-foreground">78.4%</p>
            <p className="text-[10px] text-amber-400 font-bold mt-0.5">+3.2% accuracy boost</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Platform Revenue (MTD)</p>
            <p className="text-2xl font-extrabold text-foreground">$4,250</p>
            <p className="text-[10px] text-green-400 font-bold mt-0.5">+15% recurring subscriptions</p>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown */}
      <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-xl font-bold">Subject-Wise Student Accuracy Breakdown</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { subject: "Quantitative Aptitude", avgScore: "82%", totalAttempts: "12,400", color: "bg-emerald-500" },
            { subject: "Logical Reasoning", avgScore: "88%", totalAttempts: "14,100", color: "bg-primary" },
            { subject: "Verbal Ability & English", avgScore: "68%", totalAttempts: "9,800", color: "bg-amber-500" },
            { subject: "Data Interpretation", avgScore: "74%", totalAttempts: "8,500", color: "bg-green-500" }
          ].map((item) => (
            <div key={item.subject} className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{item.subject}</span>
                <span className="text-xs font-extrabold text-primary">{item.avgScore} Avg Accuracy</span>
              </div>

              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: item.avgScore }} />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Total Attempts: {item.totalAttempts}</span>
                <span>Target: 80%+</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
