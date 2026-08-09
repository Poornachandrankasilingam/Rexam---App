"use client"

import { useEffect, useState } from "react"
import { Award, Clock, CheckCircle, XCircle, HelpCircle, ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type ResultItem = {
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

type SelectedResultDetail = {
  id: string
  examTitle: string
  code: string
  score: number
  totalMarks: number
  correct: number
  incorrect: number
  unanswered: number
  accuracy: number
  timeSpentSeconds: number
  createdAt: string
  explanations: Array<{
    questionId: string
    questionText: string
    userOptionId: string | null
    correctOptionId: string | null
    isCorrect: boolean
    explanation: string
  }>
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDetail, setSelectedDetail] = useState<SelectedResultDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/results")
      setResults(res.data.results || [])
    } catch (err) {
      console.error("Failed to fetch results", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInspectResult = async (id: string) => {
    try {
      setLoadingDetail(true)
      const res = await api.get(`/student/results/${id}`)
      setSelectedDetail(res.data.result)
    } catch (err) {
      console.error("Failed to fetch result detail", err)
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-background to-blue-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300 mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Official Test Scorecards</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Results & Detailed Solutions</h1>
          <p className="text-muted-foreground text-sm mt-1">Inspect your scores, accuracy, correct/wrong responses, and AI step-by-step explanations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Results List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold font-outfit text-white">All Test Submissions</h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400 font-semibold">Loading results...</div>
          ) : results.length === 0 ? (
            <div className="glass p-8 rounded-2xl border border-white/10 text-center space-y-2">
              <Award className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white">No results available yet.</p>
              <p className="text-[10px] text-slate-400">Complete an exam to view detailed scorecards.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => {
                const isSelected = selectedDetail?.id === r.id
                return (
                  <div
                    key={r.id}
                    onClick={() => handleInspectResult(r.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-400 shadow-md shadow-blue-500/20"
                        : "bg-secondary/30 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">{r.code}</span>
                      <span className="text-slate-400">{new Date(r.date).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white font-outfit truncate">{r.examTitle}</h4>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 text-xs">
                      <span className="font-extrabold text-emerald-400">{r.score} / {r.totalMarks} pts</span>
                      <span className="font-bold text-slate-300">{r.accuracy}% Acc</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Result Inspection Detail */}
        <div className="lg:col-span-2 space-y-6">
          {loadingDetail ? (
            <div className="glass p-12 rounded-3xl border border-white/10 text-center text-slate-400 font-semibold">Loading scorecard details...</div>
          ) : !selectedDetail ? (
            <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3">
              <Eye className="h-10 w-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">Select a Result to View Breakdown</h3>
              <p className="text-xs text-slate-400">Click any result from the list to inspect score breakdown and explanations.</p>
            </div>
          ) : (
            <div className="glass p-8 rounded-3xl border border-white/10 space-y-8">
              {/* Summary Metrics */}
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-400 px-2.5 py-1 rounded bg-blue-500/10">
                    {selectedDetail.code}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white font-outfit mt-2">{selectedDetail.examTitle}</h2>
                  <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(selectedDetail.createdAt).toLocaleString()}</p>
                </div>

                <div className="text-right space-y-1">
                  <p className="text-3xl font-extrabold text-emerald-400">{selectedDetail.score} / {selectedDetail.totalMarks}</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {selectedDetail.accuracy}% Accuracy
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400 font-semibold">Correct</p>
                  <p className="text-xl font-bold text-white">{selectedDetail.correct}</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <XCircle className="h-5 w-5 text-rose-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400 font-semibold">Wrong</p>
                  <p className="text-xl font-bold text-white">{selectedDetail.incorrect}</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <HelpCircle className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400 font-semibold">Unanswered</p>
                  <p className="text-xl font-bold text-white">{selectedDetail.unanswered}</p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <Clock className="h-5 w-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-400 font-semibold">Time Spent</p>
                  <p className="text-xl font-bold text-white">{Math.floor(selectedDetail.timeSpentSeconds / 60)}m {selectedDetail.timeSpentSeconds % 60}s</p>
                </div>
              </div>

              {/* Step-by-Step Explanations */}
              <div className="space-y-4">
                <h3 className="text-base font-bold font-outfit text-white">Question Explanations & Solutions</h3>

                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {selectedDetail.explanations.map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-400">Q{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${exp.isCorrect ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {exp.isCorrect ? "Correct (+1)" : "Incorrect"}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-white">{exp.questionText}</p>

                      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                        <p className="font-bold text-blue-300">Solution Explanation:</p>
                        <p>{exp.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
