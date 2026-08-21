"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen, 
  Send, 
  Loader2, 
  HelpCircle, 
  ShieldCheck, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Zap,
  RefreshCw,
  Flame
} from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

interface SubjectAnalysisItem {
  subject: string
  score: number
  totalMarks: number
  accuracy: number
  correct: number
  wrong: number
  unanswered: number
  avgTimeSeconds: number
  strength: "Strong" | "Average" | "Weak"
  recommendation: string
}

interface TopicAnalysisItem {
  topic: string
  subject: string
  total: number
  correct: number
  wrong: number
  unanswered: number
  accuracy: number
  level: "Strong" | "Average" | "Weak" | "Critical"
}

interface MistakeAnalysisItem {
  questionId: string
  questionText: string
  subject: string
  topic: string
  studentAnswer: string | null
  correctAnswer: string
  reason: string
  explanation: string
  tips: string
  recommendation: string
}

interface StudyPlanDay {
  day: number
  topic: string
  subject: string
  questionsCount: number
  taskTitle: string
  description: string
}

interface AiReportData {
  reportId: string
  examTitle: string
  examCode: string
  date: string
  overallScore: number
  totalMarks: number
  accuracy: number
  attemptRate: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  avgTimePerQ: number
  readinessScore: number
  readinessLevel: string
  performanceLevel: string
  strengths: string[]
  weaknesses: string[]
  criticalTopics: string[]
  subjectAnalysis: SubjectAnalysisItem[]
  topicAnalysis: TopicAnalysisItem[]
  mistakeAnalysis: MistakeAnalysisItem[]
  recommendations: string[]
  studyPlan: StudyPlanDay[]
  trendSummary: string
}

export default function AIReportsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const specificResultId = searchParams.get("resultId")

  const [loading, setLoading] = useState(true)
  const [hasAttempted, setHasAttempted] = useState(false)
  const [report, setReport] = useState<AiReportData | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "topics" | "mistakes" | "studyPlan" | "chat">("overview")
  const [expandedMistake, setExpandedMistake] = useState<string | null>(null)

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your Rexam AI Performance Coach. Ask me anything about your test results, why you lost marks, or which topics to study next!"
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  // Generating Weak Area Mock State
  const [generatingMock, setGeneratingMock] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [specificResultId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const url = specificResultId 
        ? `/student/ai-coach/report/${specificResultId}`
        : `/student/ai-coach/latest`
      const res = await api.get(url)

      if (res.data.hasAttemptedExams && res.data.report) {
        setHasAttempted(true)
        setReport(res.data.report)
      } else {
        setHasAttempted(false)
        setReport(null)
      }
    } catch (err) {
      console.error("Failed to load AI Coach report:", err)
      setHasAttempted(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || chatInput.trim()
    if (!messageToSend || chatLoading) return

    const newMessages = [...chatMessages, { sender: "user" as const, text: messageToSend }]
    setChatMessages(newMessages)
    if (!customMessage) setChatInput("")
    setChatLoading(true)

    try {
      const res = await api.post("/student/ai-coach/chat", {
        message: messageToSend,
        resultId: specificResultId || undefined
      })

      setChatMessages([...newMessages, { sender: "ai" as const, text: res.data.reply }])
    } catch (err) {
      setChatMessages([
        ...newMessages,
        { sender: "ai" as const, text: "I'm having trouble analyzing the result at the moment. Please try again." }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handlePracticeWeakAreas = async () => {
    try {
      setGeneratingMock(true)
      const res = await api.post("/student/ai-coach/generate-weak-mock")
      if (res.data?.exam?.id || res.data?.exam?.examId) {
        const examId = res.data.exam.id || res.data.exam.examId
        navigate(`/student/exam/${examId}`)
      } else {
        navigate("/student/practice")
      }
    } catch (err) {
      console.error("Failed to generate weak area mock test:", err)
      navigate("/student/practice")
    } finally {
      setGeneratingMock(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
        <p className="text-sm font-semibold text-slate-300">Rexam AI is analyzing your performance metrics...</p>
      </div>
    )
  }

  if (!hasAttempted || !report) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/10 via-background to-indigo-500/10 flex items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Rexam AI Performance Coach</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">AI Diagnostic & Improvement Coach</h1>
            <p className="text-slate-400 text-sm mt-1">Deep AI insights identifying your strong topics, weak areas, and personalized study roadmaps.</p>
          </div>
        </div>

        <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-5">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl w-fit mx-auto">
            <Brain className="h-10 w-10 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-outfit">No Completed Exams Detected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Complete your first CBT mock or practice exam to enable Rexam AI to analyze your accuracy, mistake patterns, and build your personalized 7-day study plan.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/student/practice">
              <Button size="lg" className="rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30">
                Take Your First Exam
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/15 via-background to-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Rexam AI Performance Coach</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-outfit text-white">
            Performance Analysis: {report.examTitle}
          </h1>
          <p className="text-xs text-slate-300">
            Exam Code: <span className="font-semibold text-white">{report.examCode}</span> • Completed on: {new Date(report.date).toLocaleDateString()}
          </p>
        </div>

        {/* Practice Weak Areas CTA */}
        <div className="relative z-10">
          <Button
            onClick={handlePracticeWeakAreas}
            disabled={generatingMock}
            className="rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-xl shadow-amber-500/20 py-6 px-6 cursor-pointer"
          >
            {generatingMock ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Flame className="h-5 w-5 mr-2" />
            )}
            Practice My Weak Areas
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {[
          { id: "overview", label: "Executive Overview" },
          { id: "subjects", label: "Subject Breakdown" },
          { id: "topics", label: "Topic Diagnostics" },
          { id: "mistakes", label: `Mistake Analysis (${report.mistakeAnalysis.length})` },
          { id: "studyPlan", label: "7-Day Study Plan" },
          { id: "chat", label: "Ask AI Coach" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-secondary/40 text-slate-400 hover:text-white hover:bg-secondary/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-5 rounded-2xl border border-white/10 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Overall Score</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl md:text-3xl font-extrabold text-white font-outfit">{report.overallScore}</span>
                <span className="text-xs text-slate-400">/ {report.totalMarks}</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold">{report.performanceLevel} Level</p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Accuracy Rate</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-outfit">{report.accuracy}%</span>
              </div>
              <p className="text-[10px] text-slate-400">{report.correctCount} correct • {report.wrongCount} wrong</p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Attempt Rate</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl md:text-3xl font-extrabold text-blue-400 font-outfit">{report.attemptRate}%</span>
              </div>
              <p className="text-[10px] text-slate-400">{report.unansweredCount} unanswered</p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Time / Question</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl md:text-3xl font-extrabold text-amber-400 font-outfit">{report.avgTimePerQ}s</span>
              </div>
              <p className="text-[10px] text-slate-400">Pacing Speed</p>
            </div>
          </div>

          {/* AI Exam Readiness Indicator Card */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-outfit">AI Exam Readiness Score</h2>
                  <p className="text-[11px] text-slate-400">AI-based preparation readiness indicator derived from accuracy, attempt consistency, and pacing.</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-extrabold text-purple-400 font-outfit">{report.readinessScore}/100</div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    report.readinessScore >= 75 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : report.readinessScore >= 50
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}>
                    {report.readinessLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-secondary/70 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${report.readinessScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                <span>0 Needs Improvement</span>
                <span>50 Moderate</span>
                <span>75+ Strong Preparation</span>
              </div>
            </div>

            {/* Historical Trend Insight */}
            {report.trendSummary && (
              <div className="p-4 rounded-2xl bg-secondary/40 border border-white/10 flex items-start space-x-3">
                <TrendingUp className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {report.trendSummary}
                </p>
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strong Areas */}
            <div className="glass p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <h3>Strong Areas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.strengths.length > 0 ? (
                  report.strengths.map((str, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl">
                      ✓ {str}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Baseline established.</span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You performed with high accuracy in these areas. Maintain your level with regular timed revision.
              </p>
            </div>

            {/* Weak Areas & Critical Topics */}
            <div className="glass p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <AlertCircle className="h-5 w-5" />
                <h3>Critical Focus Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.weaknesses.length > 0 ? (
                  report.weaknesses.map((weak, idx) => (
                    <span key={idx} className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl">
                      ⚠ {weak}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No major critical weaknesses detected.</span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                These topics accounted for the majority of incorrect answers and lost marks in this exam.
              </p>
            </div>
          </div>

          {/* AI Key Recommendations */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>AI Actionable Recommendations</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 flex items-start space-x-3">
                  <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT BREAKDOWN */}
      {activeTab === "subjects" && (
        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl border border-white/10">
            <h2 className="text-lg font-bold text-white font-outfit mb-4">Subject-wise Performance Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.subjectAnalysis.map((sub, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-secondary/40 border border-white/10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">{sub.subject}</h3>
                      <p className="text-[11px] text-slate-400">Score: {sub.score} / {sub.totalMarks}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      sub.strength === "Strong" 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : sub.strength === "Average"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}>
                      {sub.strength}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300 font-semibold">
                      <span>Accuracy</span>
                      <span>{sub.accuracy}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          sub.accuracy >= 75 ? "bg-emerald-500" : sub.accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${sub.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1 border-t border-white/5">
                    <span>{sub.correct} Correct</span>
                    <span>{sub.wrong} Wrong</span>
                    <span>{sub.unanswered} Skipped</span>
                  </div>

                  <p className="text-[11px] text-slate-300 bg-secondary/60 p-2.5 rounded-xl border border-white/5">
                    💡 <span className="font-semibold text-white">AI Strategy:</span> {sub.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOPIC DIAGNOSTICS */}
      {activeTab === "topics" && (
        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white font-outfit">Deep Topic Diagnostics</h2>
            <p className="text-xs text-slate-400">Granular topic-level accuracy rankings across your exam attempts.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {report.topicAnalysis.map((top, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-secondary/30 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white">{top.topic}</h4>
                      <p className="text-[10px] text-slate-400">{top.subject}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      top.level === "Strong" 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : top.level === "Average"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : top.level === "Weak"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}>
                      {top.level} ({top.accuracy}%)
                    </span>
                  </div>

                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        top.level === "Strong" ? "bg-emerald-400" : top.level === "Average" ? "bg-blue-400" : top.level === "Weak" ? "bg-amber-400" : "bg-rose-400"
                      }`}
                      style={{ width: `${top.accuracy}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{top.correct} / {top.total} Correct</span>
                    <span>{top.wrong} Errors</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MISTAKE ANALYSIS (EXPLANATION MODE) */}
      {activeTab === "mistakes" && (
        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">Mistake Diagnostics & Explanation Mode</h2>
                <p className="text-xs text-slate-400">AI analysis of why you lost marks on each incorrect question.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                {report.mistakeAnalysis.length} Incorrect Questions
              </span>
            </div>

            {report.mistakeAnalysis.length === 0 ? (
              <div className="p-8 text-center text-emerald-400 font-bold">
                🎉 No mistakes! You answered all attempted questions correctly.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {report.mistakeAnalysis.map((m, idx) => {
                  const isExpanded = expandedMistake === m.questionId
                  return (
                    <div key={idx} className="rounded-2xl bg-secondary/40 border border-white/10 overflow-hidden transition-all">
                      <button
                        onClick={() => setExpandedMistake(isExpanded ? null : m.questionId)}
                        className="w-full p-4 text-left flex justify-between items-start gap-4 hover:bg-secondary/60 transition-all cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                              Q{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-300">{m.topic}</span>
                            <span className="text-[10px] text-slate-400">• {m.subject}</span>
                          </div>
                          <p className="text-xs font-semibold text-white line-clamp-2">{m.questionText}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-amber-400 font-medium">
                            <span>🔍 {m.reason}</span>
                          </div>
                        </div>
                        <div className="text-slate-400 mt-1">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-5 border-t border-white/10 bg-background/50 space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                                <p className="text-[10px] font-bold text-rose-400 uppercase">Your Choice</p>
                                <p className="text-xs text-rose-200 font-semibold">{m.studentAnswer || "Question Skipped"}</p>
                              </div>
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase">Correct Choice</p>
                                <p className="text-xs text-emerald-200 font-semibold">{m.correctAnswer}</p>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Step-by-Step Concept & Explanation</p>
                              <p className="text-xs text-slate-200 bg-secondary/50 p-3 rounded-xl border border-white/5 leading-relaxed">
                                {m.explanation}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Shortcut / Speed Tips</p>
                              <p className="text-xs text-slate-200 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 leading-relaxed font-medium">
                                💡 {m.tips}
                              </p>
                            </div>

                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 font-medium">
                              🎯 <span className="font-bold">Next Action:</span> {m.recommendation}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: 7-DAY PERSONALIZED STUDY PLAN */}
      {activeTab === "studyPlan" && (
        <div className="space-y-4">
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">Personalized 7-Day Improvement Plan</h2>
                <p className="text-xs text-slate-400">Dynamically generated to target your specific weak topics and boost exam readiness.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.studyPlan.map((day) => (
                <div key={day.day} className="p-5 rounded-2xl bg-secondary/40 border border-white/10 space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      Day {day.day}
                    </span>
                    {day.questionsCount > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        🎯 {day.questionsCount} Questions
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {day.taskTitle}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {day.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Topic: {day.topic}</span>
                    <span className="font-semibold text-emerald-400">Target: 85%+ Accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ASK AI ABOUT MY RESULT */}
      {activeTab === "chat" && (
        <div className="space-y-4">
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">Ask AI About My Result</h2>
                <p className="text-xs text-slate-400">Get instant personalized guidance based strictly on your authenticated exam performance.</p>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2">
              {[
                "Why did I lose marks?",
                "Which subject should I study first?",
                "Why am I weak in Maths?",
                "How can I improve my accuracy?",
                "What should I practice tomorrow?"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={chatLoading}
                  className="px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-purple-600/30 hover:border-purple-500/40 border border-white/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  💬 {chip}
                </button>
              ))}
            </div>

            {/* Chat Box */}
            <div className="space-y-3 min-h-[300px] max-h-[450px] overflow-y-auto p-4 rounded-2xl bg-background/50 border border-white/10">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-tr-sm"
                      : "bg-secondary/70 border border-white/10 text-slate-200 rounded-tl-sm font-medium"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-secondary/70 border border-white/10 rounded-2xl text-xs text-purple-300 flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI Coach is analyzing your exam details...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI Coach a question about your result..."
                className="flex-1 px-4 py-3 bg-secondary/50 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
              />
              <Button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="rounded-2xl px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
