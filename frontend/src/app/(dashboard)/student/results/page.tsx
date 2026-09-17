"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Check, 
  X, 
  BookOpen,
  Layers,
  FileText
} from "lucide-react"
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

type ReviewOption = {
  id: string
  text: string
  isCorrect: boolean
  isSelected: boolean
}

type ReviewQuestion = {
  questionId: string
  questionText: string
  subject: string
  topic: string
  difficulty: string
  marks: number
  negativeMarks: number
  studentOptionId: string | null
  studentOptionText: string | null
  correctOptionId: string | null
  correctOptionText: string | null
  options: ReviewOption[]
  isCorrect: boolean
  status: "CORRECT" | "WRONG" | "UNANSWERED"
  explanation: string
  marksAwarded: number
}

type SelectedResultDetail = {
  id: string
  examId: string
  examTitle: string
  code: string
  duration: number
  score: number
  totalMarks: number
  passingMarks: number
  status: "PASSED" | "FAILED"
  performanceLevel: string
  correct: number
  incorrect: number
  unanswered: number
  totalQuestions: number
  accuracy: number
  timeSpentSeconds: number
  timeSpentFormatted: string
  createdAt: string
  subjectPerformance: Array<{
    subject: string
    total: number
    correct: number
    wrong: number
    score: number
    accuracy: number
    status: string
  }>
  topicPerformance: Array<{
    topic: string
    subject: string
    total: number
    correct: number
    wrong: number
    accuracy: number
    level: string
  }>
  weakTopics: Array<{
    topic: string
    subject: string
    accuracy: number
    recommendation: string
  }>
  improvementSuggestions: string[]
  explanations: ReviewQuestion[]
}

export default function StudentResultsPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDetail, setSelectedDetail] = useState<SelectedResultDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "SOLUTIONS">("OVERVIEW")
  const [solutionsFilter, setSolutionsFilter] = useState<"ALL" | "CORRECT" | "WRONG" | "UNANSWERED">("ALL")

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/results")
      const list = res.data.results || []
      setResults(list)
      if (list.length > 0 && !selectedDetail) {
        handleInspectResult(list[0].id)
      }
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

  const filteredExplanations = (selectedDetail?.explanations || []).filter((exp) => {
    if (solutionsFilter === "CORRECT" && exp.status !== "CORRECT") return false
    if (solutionsFilter === "WRONG" && exp.status !== "WRONG") return false
    if (solutionsFilter === "UNANSWERED" && exp.status !== "UNANSWERED") return false
    return true
  })

  return (
    <div className="space-y-8 pb-12 text-slate-100 font-sans">
      {/* Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
            <Award className="h-3.5 w-3.5" />
            <span>Candidate Scorecards & Accuracy Breakdown</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Results & Solution Blueprints</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Inspect your official scores, mock test analytics, subject mastery, and question-by-question proofs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Results List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold font-outfit text-white flex items-center justify-between">
            <span>Submission History</span>
            <span className="text-xs font-mono text-slate-400">{results.length} Recorded</span>
          </h2>

          {loading ? (
            <div className="glass p-8 rounded-2xl border border-white/10 text-center text-slate-400 font-semibold text-xs">
              Loading scorecards...
            </div>
          ) : results.length === 0 ? (
            <div className="glass p-8 rounded-2xl border border-white/10 text-center space-y-3">
              <Award className="h-8 w-8 text-slate-500 mx-auto" />
              <p className="text-xs font-bold text-white font-outfit">No examination results recorded yet.</p>
              <p className="text-[10px] text-slate-400">Complete an exam or mock drill to generate detailed scorecards.</p>
              <Button onClick={() => navigate("/student/exams")} className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-xl">
                Take an Exam
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {results.map((r) => {
                const isSelected = selectedDetail?.id === r.id
                return (
                  <div
                    key={r.id}
                    onClick={() => handleInspectResult(r.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-md ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-400 shadow-emerald-500/10 ring-1 ring-emerald-400"
                        : "bg-secondary/40 border-white/10 hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{r.code}</span>
                      <span className="text-slate-400 text-[11px]">{new Date(r.date).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-bold text-sm text-white font-outfit truncate">{r.examTitle}</h4>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 text-xs">
                      <span className="font-mono font-black text-emerald-400">{r.score} / {r.totalMarks} pts</span>
                      <span className="font-mono font-bold text-slate-300 bg-secondary/80 px-2 py-0.5 rounded-full border border-white/5">{r.accuracy}% Acc</span>
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
            <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-4">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
              <p className="text-slate-400 font-semibold text-xs">Loading scorecard breakdown & analytics...</p>
            </div>
          ) : !selectedDetail ? (
            <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3 shadow-xl">
              <Eye className="h-10 w-10 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white font-outfit">Select a Result to View Breakdown</h3>
              <p className="text-xs text-slate-400">Click any result from the history list to inspect question-by-question explanations.</p>
            </div>
          ) : (
            <div className="glass p-8 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
              {/* Summary Metrics */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      {selectedDetail.code}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                      selectedDetail.status === "PASSED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}>
                      {selectedDetail.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white font-outfit mt-2">{selectedDetail.examTitle}</h2>
                  <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(selectedDetail.createdAt).toLocaleString()}</p>
                </div>

                <div className="text-left sm:text-right space-y-2">
                  <p className="text-3xl font-black text-emerald-400 font-mono">{selectedDetail.score} / {selectedDetail.totalMarks}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      {selectedDetail.accuracy}% Accuracy
                    </span>
                    <Button
                      onClick={() => navigate(`/student/reports?resultId=${selectedDetail.id}`)}
                      size="sm"
                      className="rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 text-xs px-3.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      AI Coach Report
                    </Button>
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs: Overview vs Step-by-Step Solutions */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <button
                  onClick={() => setActiveTab("OVERVIEW")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "OVERVIEW"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "bg-secondary/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Mock Result & Diagnostic Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab("SOLUTIONS")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "SOLUTIONS"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-secondary/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Questions & Solutions Review ({selectedDetail.explanations?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: MOCK RESULT & DIAGNOSTIC OVERVIEW */}
              {activeTab === "OVERVIEW" && (
                <div className="space-y-6">
                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Correct</p>
                      <p className="text-xl font-black text-white font-mono mt-0.5">{selectedDetail.correct}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-sm">
                      <XCircle className="h-5 w-5 text-rose-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Incorrect</p>
                      <p className="text-xl font-black text-white font-mono mt-0.5">{selectedDetail.incorrect}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
                      <HelpCircle className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Unanswered</p>
                      <p className="text-xl font-black text-white font-mono mt-0.5">{selectedDetail.unanswered}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-sm">
                      <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Time Spent</p>
                      <p className="text-xl font-black text-white font-mono mt-0.5">{Math.floor(selectedDetail.timeSpentSeconds / 60)}m {selectedDetail.timeSpentSeconds % 60}s</p>
                    </div>
                  </div>

                  {/* Subject & Topic Diagnostic Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Subject Breakdown */}
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                        <Target className="h-3.5 w-3.5" />
                        Subject-Wise Performance
                      </h4>
                      <div className="space-y-2">
                        {(selectedDetail.subjectPerformance || []).length === 0 ? (
                          <p className="text-xs text-slate-400">No subject performance data available.</p>
                        ) : (
                          (selectedDetail.subjectPerformance || []).map((s, sIdx) => (
                            <div key={sIdx} className="p-2.5 rounded-xl bg-secondary/40 border border-white/5 text-xs flex items-center justify-between">
                              <span className="font-bold text-white">{s.subject}</span>
                              <span className="font-mono text-emerald-400 font-bold">{s.accuracy}% Acc ({s.score} pts)</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Weak Areas & Suggestions */}
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-white/10 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 font-mono">
                        <Sparkles className="h-3.5 w-3.5" />
                        Weak Areas & Recommendations
                      </h4>
                      <div className="space-y-2">
                        {(selectedDetail.weakTopics || []).length === 0 ? (
                          <p className="text-xs text-emerald-300">All topic modules within strong performance range.</p>
                        ) : (
                          (selectedDetail.weakTopics || []).slice(0, 3).map((w, wIdx) => (
                            <div key={wIdx} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-0.5">
                              <div className="flex items-center justify-between text-white font-bold">
                                <span>{w.topic}</span>
                                <span className="text-rose-400 font-mono text-[10px]">{w.accuracy}% Acc</span>
                              </div>
                              <p className="text-slate-300 text-[10px]">{w.recommendation}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STEP-BY-STEP QUESTION SOLUTIONS */}
              {activeTab === "SOLUTIONS" && (
                <div className="space-y-4">
                  {/* Solutions Sub-Filter */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                    <button
                      onClick={() => setSolutionsFilter("ALL")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        solutionsFilter === "ALL" ? "bg-blue-600 text-white" : "bg-secondary/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      All ({selectedDetail.explanations?.length || 0})
                    </button>
                    <button
                      onClick={() => setSolutionsFilter("CORRECT")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        solutionsFilter === "CORRECT" ? "bg-emerald-600 text-white" : "bg-secondary/40 text-emerald-400 hover:text-white"
                      }`}
                    >
                      Correct ({selectedDetail.correct})
                    </button>
                    <button
                      onClick={() => setSolutionsFilter("WRONG")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        solutionsFilter === "WRONG" ? "bg-rose-600 text-white" : "bg-secondary/40 text-rose-400 hover:text-white"
                      }`}
                    >
                      Wrong ({selectedDetail.incorrect})
                    </button>
                    <button
                      onClick={() => setSolutionsFilter("UNANSWERED")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        solutionsFilter === "UNANSWERED" ? "bg-slate-600 text-white" : "bg-secondary/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      Unanswered ({selectedDetail.unanswered})
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[520px] overflow-y-auto custom-scrollbar pr-2">
                    {filteredExplanations.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No questions found matching this filter.</p>
                    ) : (
                      filteredExplanations.map((exp, idx) => {
                        const isCorrect = exp.status === "CORRECT" || exp.isCorrect
                        const isWrong = exp.status === "WRONG" || (!exp.isCorrect && exp.studentOptionId)

                        return (
                          <div
                            key={idx}
                            className={`p-5 rounded-2xl border space-y-3.5 transition-all ${
                              isCorrect
                                ? "bg-emerald-950/15 border-emerald-500/30"
                                : isWrong
                                ? "bg-rose-950/15 border-rose-500/30"
                                : "bg-secondary/40 border-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-blue-400 font-outfit">
                                Question {idx + 1} {exp.subject ? `• ${exp.subject}` : ""}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                isCorrect
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : isWrong
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                              }`}>
                                {isCorrect ? "Correct Response ✓" : isWrong ? "Incorrect Selection ✗" : "Unanswered ⚪"}
                              </span>
                            </div>

                            <p className="text-sm font-semibold text-white leading-relaxed">{exp.questionText}</p>

                            {/* Options if available */}
                            {exp.options && exp.options.length > 0 && (
                              <div className="space-y-2 pt-1">
                                {exp.options.map((opt, optIdx) => {
                                  const optionLetter = String.fromCharCode(65 + optIdx)
                                  let optStyle = "bg-secondary/30 border-white/10 text-slate-300"
                                  let tag = null

                                  if (opt.isCorrect && opt.isSelected) {
                                    optStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-100"
                                    tag = "Your Choice & Correct ✓"
                                  } else if (opt.isCorrect) {
                                    optStyle = "bg-emerald-500/15 border-emerald-500/50 text-emerald-200"
                                    tag = "Correct Answer ✓"
                                  } else if (opt.isSelected) {
                                    optStyle = "bg-rose-500/20 border-rose-400 text-rose-100"
                                    tag = "Your Selected Choice ✗"
                                  }

                                  return (
                                    <div key={opt.id} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}>
                                      <div className="flex items-center space-x-2.5">
                                        <span className="font-bold font-mono">{optionLetter}.</span>
                                        <span>{opt.text}</span>
                                      </div>
                                      {tag && <span className="font-mono text-[10px] font-bold">{tag}</span>}
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {/* Detailed Solution & Proof */}
                            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-1">
                              <p className="font-bold text-blue-400 text-[11px] uppercase tracking-wider font-mono flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Step-by-Step Proof & Concept:
                              </p>
                              <p className="leading-relaxed text-slate-200">{exp.explanation}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
