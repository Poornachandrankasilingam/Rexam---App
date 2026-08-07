"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, 
  Trophy, 
  Target, 
  Clock, 
  Award, 
  Download, 
  FileText, 
  X, 
  HelpCircle, 
  Sparkles 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

type TestResultItem = {
  id: string
  examTitle: string
  code: string
  score: number
  totalMarks: number
  correct: number
  incorrect: number
  accuracy: number
  timeSpent: string
  date: string
}

export default function StudentResultsPage() {
  const { user } = useAuth()
  const [results, setResults] = useState<TestResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<TestResultItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        const response = await api.get("/student/results")
        setResults(response.data.results || [])
      } catch (err) {
        console.error("Failed to load student test results", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [user])

  const handleDownloadReport = (testName: string) => {
    setToastMessage(`Downloading official scorecard for ${testName}...`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const totalExams = results.length
  const totalScoreSum = results.reduce((acc, r) => acc + r.score, 0)
  const avgScore = totalExams > 0 ? (totalScoreSum / totalExams).toFixed(1) : 0
  const avgAccuracy = totalExams > 0 ? Math.round(results.reduce((acc, r) => acc + r.accuracy, 0) / totalExams) : 0

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
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-background to-emerald-500/10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-2">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>User Scorecard Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight font-outfit">My Exam Scorecards</h1>
        <p className="text-muted-foreground text-sm mt-1">Dynamic test results and performance statistics for account: <span className="text-white font-semibold">{user?.email}</span></p>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Average Accuracy</p>
            <p className="text-2xl font-extrabold font-outfit text-emerald-400">{avgAccuracy}%</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Tests Completed</p>
            <p className="text-2xl font-extrabold font-outfit text-indigo-400">{totalExams} Tests</p>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Average Score</p>
            <p className="text-2xl font-extrabold font-outfit text-amber-400">{avgScore} pts</p>
          </div>
        </div>
      </div>

      {/* Test Scorecards Table / Empty State */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold font-outfit">My Exam History</h2>
          <Link to="/student/practice">
            <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-500">Take Practice Test</Button>
          </Link>
        </div>

        {totalExams === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <HelpCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No exams attempted yet.</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have not completed any test papers under this account. Complete your first practice or mock test to record your scorecards.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-secondary/40 text-slate-400 text-xs">
                  <th className="px-6 py-4 font-semibold">Test Name & Code</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Accuracy</th>
                  <th className="px-6 py-4 font-semibold">Time Spent</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                        {res.code}
                      </span>
                      <p className="font-bold text-white text-sm mt-1">{res.examTitle}</p>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(res.date).toLocaleDateString()}</td>

                    <td className="px-6 py-4 font-extrabold text-indigo-400">{res.score} / {res.totalMarks}</td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {res.accuracy}%
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-300">{res.timeSpent}</td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          onClick={() => setSelectedResult(res)}
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl text-xs"
                        >
                          Details
                        </Button>
                        <Button 
                          onClick={() => handleDownloadReport(res.examTitle)}
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
        )}
      </div>

      {/* Scorecard Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6 relative"
          >
            <button 
              onClick={() => setSelectedResult(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Official Scorecard
              </span>
              <h3 className="text-xl font-bold font-outfit text-white">{selectedResult.examTitle}</h3>
              <p className="text-xs text-slate-400">Recorded on {new Date(selectedResult.date).toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-secondary/40 border border-white/10 text-center">
                <p className="text-xs text-slate-400 font-semibold">Total Score</p>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">{selectedResult.score} / {selectedResult.totalMarks}</p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/40 border border-white/10 text-center">
                <p className="text-xs text-slate-400 font-semibold">Accuracy Rate</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-1">{selectedResult.accuracy}%</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={() => setSelectedResult(null)} className="rounded-xl">
                Close
              </Button>
              <Button onClick={() => { handleDownloadReport(selectedResult.examTitle); setSelectedResult(null); }} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500">
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
