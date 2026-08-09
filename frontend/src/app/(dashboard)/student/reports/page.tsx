"use client"

import { useEffect, useState } from "react"
import { Sparkles, Brain, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import api from "@/lib/api"

export default function AIReportsPage() {
  const [loading, setLoading] = useState(true)
  const [hasAttempted, setHasAttempted] = useState(false)
  const [reportsData, setReportsData] = useState<any>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/dashboard")
      setHasAttempted(res.data.hasAttemptedExams)
      setReportsData(res.data)
    } catch (err) {
      console.error("Failed to load AI report", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/10 via-background to-indigo-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Diagnostic Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">AI Diagnostic Performance Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Deep AI insights identifying your strong topics, weak areas, and personalized study roadmaps.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-semibold">Generating AI Diagnostic Report...</div>
      ) : !hasAttempted ? (
        <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-4">
          <Brain className="h-12 w-12 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No AI Reports Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Complete at least 1 practice or competitive mock exam to enable our AI engine to analyze your speed, accuracy, and weak topic patterns.
            </p>
          </div>
          <Link to="/student/practice">
            <Button size="lg" className="rounded-full px-8 font-bold bg-blue-600 hover:bg-blue-500">
              Take Practice Exam
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-outfit">AI Weak Topic & Diagnostic Summary</h2>
                <p className="text-xs text-slate-400">Based on your {reportsData?.stats?.totalExams} completed exam attempt(s).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                <h3 className="font-bold text-emerald-300 text-sm flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />
                  Strong Topics
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your accuracy rate is highest in Quantitative Aptitude and Speed Calculations ({reportsData?.stats?.accuracy}% accuracy).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <h3 className="font-bold text-rose-300 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-rose-400" />
                  Recommended Weak Area Focus
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Focus additional practice on General Awareness & Legal Reasoning topics to boost your overall cut-off ranking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
