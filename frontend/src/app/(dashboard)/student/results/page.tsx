"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, 
  Trophy, 
  Target, 
  Clock, 
  Award, 
  Download, 
  CheckCircle, 
  XCircle, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

type TestResult = {
  id: string
  testName: string
  date: string
  score: number
  totalMarks: number
  accuracy: number
  percentile: number
  timeSpent: string
  status: "Passed" | "Needs Improvement"
}

const PAST_RESULTS: TestResult[] = [
  {
    id: "res1",
    testName: "Quantitative Aptitude Mastery Test",
    date: "07 Aug 2026",
    score: 36,
    totalMarks: 40,
    accuracy: 90,
    percentile: 98.4,
    timeSpent: "32 mins",
    status: "Passed"
  },
  {
    id: "res2",
    testName: "Logical Reasoning & Puzzle Challenge",
    date: "05 Aug 2026",
    score: 24,
    totalMarks: 30,
    accuracy: 80,
    percentile: 92.1,
    timeSpent: "24 mins",
    status: "Passed"
  },
  {
    id: "res3",
    testName: "SSC CGL Tier-1 Mock #3",
    date: "01 Aug 2026",
    score: 32,
    totalMarks: 50,
    accuracy: 64,
    percentile: 74.8,
    timeSpent: "58 mins",
    status: "Needs Improvement"
  }
]

export default function StudentResultsPage() {
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleDownloadReport = (testName: string) => {
    setToastMessage(`Downloading official scorecard for ${testName}...`)
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
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-background to-secondary/30">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Performance & Analytics Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Test Scorecards & Weak Area Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">Review test history, overall rank progression, and AI-driven weak area diagnostics.</p>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Average Percentile</p>
            <p className="text-2xl font-extrabold text-foreground">94.2%</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Overall Accuracy</p>
            <p className="text-2xl font-extrabold text-emerald-400">84.5%</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Tests Completed</p>
            <p className="text-2xl font-extrabold text-primary">24 Tests</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Practice Time</p>
            <p className="text-2xl font-extrabold text-green-400">18.5 hrs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test History Table */}
        <div className="lg:col-span-2 glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Test Scorecards</h2>
            <Link to="/student/practice">
              <Button size="sm" className="rounded-full">Take Practice Test</Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-secondary/40 text-muted-foreground text-xs">
                  <th className="px-6 py-4 font-semibold">Test Name</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Accuracy</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {PAST_RESULTS.map((res) => (
                  <tr key={res.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{res.testName}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{res.date}</td>
                    <td className="px-6 py-4 font-extrabold text-primary">{res.score} / {res.totalMarks}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {res.accuracy}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={() => setSelectedResult(res)}
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl"
                        >
                          View Details
                        </Button>
                        <Button 
                          onClick={() => handleDownloadReport(res.testName)}
                          variant="secondary" 
                          size="sm" 
                          className="rounded-xl px-2.5"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Weak Area Diagnostic */}
        <div className="glass p-6 rounded-3xl border border-white/10 space-y-6 h-fit">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base">AI Subject Diagnostics</h3>
          </div>

          <div className="space-y-4">
            {[
              { subject: "Quantitative Aptitude", topic: "Profit & Loss", accuracy: 92, status: "Strong" },
              { subject: "Logical Reasoning", topic: "Syllogisms", accuracy: 85, status: "Good" },
              { subject: "Verbal Ability", topic: "Error Spotting", accuracy: 58, status: "Needs Practice" },
              { subject: "Data Interpretation", topic: "Bar Graphs", accuracy: 78, status: "Good" }
            ].map((diag) => (
              <div key={diag.topic} className="p-4 rounded-2xl bg-secondary/30 border border-border/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{diag.topic}</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    diag.accuracy >= 85 ? "bg-emerald-500/10 text-emerald-400" :
                    diag.accuracy >= 70 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {diag.accuracy}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${diag.accuracy >= 85 ? "bg-emerald-500" : diag.accuracy >= 70 ? "bg-amber-500" : "bg-red-500"}`} 
                    style={{ width: `${diag.accuracy}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">{diag.subject} • {diag.status}</p>
              </div>
            ))}
          </div>

          <Link to="/student/practice">
            <Button className="w-full rounded-2xl py-5 font-bold shadow-md shadow-primary/20">
              Practice Weak Topics Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Detailed Result Scorecard Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-lg w-full space-y-6 relative"
          >
            <button 
              onClick={() => setSelectedResult(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                Official Scorecard
              </span>
              <h3 className="text-xl font-bold">{selectedResult.testName}</h3>
              <p className="text-xs text-muted-foreground">Attempted on {selectedResult.date} • {selectedResult.timeSpent}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-center">
                <p className="text-xs text-muted-foreground font-semibold">Total Score</p>
                <p className="text-2xl font-extrabold text-primary mt-1">{selectedResult.score} / {selectedResult.totalMarks}</p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 text-center">
                <p className="text-xs text-muted-foreground font-semibold">Percentile</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">{selectedResult.percentile}%</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
              <Button variant="ghost" onClick={() => setSelectedResult(null)} className="rounded-xl">
                Close
              </Button>
              <Button onClick={() => { handleDownloadReport(selectedResult.testName); setSelectedResult(null); }} className="rounded-xl font-bold">
                <Download className="h-4 w-4 mr-2" />
                Download Report PDF
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
