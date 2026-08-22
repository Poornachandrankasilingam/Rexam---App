"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Clock, 
  ShieldAlert, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type QuestionOption = {
  id: string
  text: string
  isCorrect?: boolean
}

type QuestionItem = {
  id: string
  text: string
  subject: string
  topic?: string
  difficulty: string
  marks: number
  negativeMarks: number
  explanation?: string
  options: QuestionOption[]
}

type ExamPayload = {
  id: string
  title: string
  code: string
  duration: number
  totalMarks: number
  questions: QuestionItem[]
}

export default function CBTExamEnginePage() {
  const { id: examId } = useParams()
  const navigate = useNavigate()

  // Pre-exam flow step: 1: Instructions, 2: CBT Live
  const [step, setStep] = useState<1 | 2>(1)

  const [exam, setExam] = useState<ExamPayload | null>(null)
  const [loading, setLoading] = useState(true)

  // CBT State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({})
  const [visited, setVisited] = useState<Record<string, boolean>>({ "0": true })
  const [timeLeftSec, setTimeLeftSec] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // 1. Fetch Exam Payload & Initialize / Recover Attempt
  useEffect(() => {
    if (!examId) return

    const initExam = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/student/exams/${examId}`)
        const examData = res.data.exam
        setExam(examData)

        // Start or recover attempt from server
        const attemptRes = await api.post(`/student/exams/${examId}/start`)
        if (attemptRes.data?.savedAnswers) {
          setAnswers(attemptRes.data.savedAnswers)
        }
        const initialTime = attemptRes.data?.timeRemainingSec || examData.duration * 60
        setTimeLeftSec(initialTime)
      } catch (err) {
        console.error("Failed to load exam", err)
      } finally {
        setLoading(false)
      }
    }

    initExam()
  }, [examId])

  // 2. Countdown Timer & Auto-Save
  useEffect(() => {
    if (step !== 2 || timeLeftSec <= 0) return

    const timer = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step, timeLeftSec])

  // Auto-save every 15 seconds to server
  useEffect(() => {
    if (step !== 2 || !examId) return

    const autoSaveTimer = setInterval(async () => {
      try {
        await api.post(`/student/exams/${examId}/save`, {
          answers,
          timeRemainingSec: timeLeftSec
        })
      } catch (e) {
        console.error("Auto-save failed", e)
      }
    }, 15000)

    return () => clearInterval(autoSaveTimer)
  }, [step, examId, answers, timeLeftSec])

  // Option select handler
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  // Navigation handlers
  const handleNext = () => {
    if (!exam) return
    const nextIdx = Math.min(exam.questions.length - 1, currentIndex + 1)
    setCurrentIndex(nextIdx)
    setVisited((prev) => ({ ...prev, [nextIdx]: true }))
  }

  const handlePrev = () => {
    const prevIdx = Math.max(0, currentIndex - 1)
    setCurrentIndex(prevIdx)
    setVisited((prev) => ({ ...prev, [prevIdx]: true }))
  }

  const handleToggleReview = () => {
    if (!exam) return
    const qId = exam.questions[currentIndex].id
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }))
  }

  const handleClearAnswer = () => {
    if (!exam) return
    const qId = exam.questions[currentIndex].id
    setAnswers((prev) => {
      const copy = { ...prev }
      delete copy[qId]
      return copy
    })
  }

  // Final Submission
  const handleSubmitExam = async () => {
    if (submitting || !examId) return
    try {
      setSubmitting(true)
      const timeSpentSec = (exam?.duration || 30) * 60 - timeLeftSec
      await api.post(`/student/exams/${examId}/submit`, {
        answers,
        timeSpentSec
      })
      navigate(`/student/results`)
    } catch (err) {
      console.error("Failed to submit exam", err)
      navigate("/student/results")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-semibold">Loading CBT Examination...</div>
  }

  if (!exam) {
    return (
      <div className="p-12 text-center text-rose-400 font-semibold space-y-4">
        <p>Exam not found or unavailable.</p>
        <Button onClick={() => navigate("/student/exams")}>Back to Available Exams</Button>
      </div>
    )
  }

  const currentQ = exam.questions[currentIndex] || exam.questions[0]
  const answeredCount = Object.keys(answers).length
  const markedCount = Object.values(markedForReview).filter(Boolean).length
  const unansweredCount = exam.questions.length - answeredCount

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col p-4 md:p-8 select-none">
      {/* STEP 1: INSTRUCTIONS */}
      {step === 1 && (
        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 max-w-3xl mx-auto my-auto w-full">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-400 px-2.5 py-1 rounded bg-blue-500/10">
                {exam.code}
              </span>
              <h1 className="text-2xl font-extrabold text-white font-outfit mt-2">{exam.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-lg font-bold text-blue-400">{exam.duration} Mins</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <h3 className="font-bold text-white text-sm">CBT Instructions & Guidelines:</h3>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Ensure a stable internet connection. Progress is auto-saved continuously.</li>
              <li>Questions can be navigated freely using the question palette on the right.</li>
              <li>You can mark questions for review and return to them anytime before final submission.</li>
              <li>Question status: Answered (Green), Unanswered (Gray), Marked for Review (Purple).</li>
            </ul>
          </div>

          <div className="pt-4 flex justify-end">
            <Button size="lg" onClick={() => setStep(2)} className="rounded-2xl px-8 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
              Start CBT Exam Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: CBT EXAM ENGINE INTERFACE */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="glass px-6 py-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white font-outfit">{exam.title}</h2>
              <p className="text-xs text-slate-400 font-mono">Code: {exam.code}</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Countdown Timer */}
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-base font-extrabold">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeLeftSec)}</span>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowSubmitModal(true)}
                className="rounded-xl font-bold px-5 text-xs shadow-lg shadow-rose-500/20"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit Exam
              </Button>
            </div>
          </div>

          {/* Main Exam Grid: Question Area + Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Question Area */}
            <div className="lg:col-span-3 glass p-6 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm font-bold text-blue-400 font-outfit">
                    Question {currentIndex + 1} of {exam.questions.length}
                  </span>
                  <span className="text-xs text-slate-400">
                    Marks: +{currentQ.marks} | -{currentQ.negativeMarks}
                  </span>
                </div>

                <p className="text-base font-semibold text-white leading-relaxed">
                  {currentQ.text}
                </p>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`w-full p-4 rounded-2xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-400 text-white shadow-md shadow-blue-500/20"
                            : "bg-secondary/30 border-white/10 text-slate-300 hover:bg-secondary/60 hover:text-white"
                        }`}
                      >
                        <span>{opt.text}</span>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-400 bg-blue-500" : "border-slate-500"}`}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleReview}
                    className={`rounded-xl text-xs font-bold ${markedForReview[currentQ.id] ? "bg-purple-500/20 border-purple-400 text-purple-300" : ""}`}
                  >
                    <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                    {markedForReview[currentQ.id] ? "Marked" : "Mark for Review"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAnswer}
                    className="rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Clear Answer
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={currentIndex === exam.questions.length - 1}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Question Palette */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white font-outfit border-b border-white/10 pb-3">
                  Question Palette
                </h3>

                {/* Status legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-3 w-3 rounded-md bg-emerald-500/30 border border-emerald-500" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-3 w-3 rounded-md bg-secondary/50 border border-white/10" />
                    <span>Unanswered ({unansweredCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-3 w-3 rounded-md bg-purple-500/30 border border-purple-500" />
                    <span>Review ({markedCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-3 w-3 rounded-md border border-blue-400" />
                    <span>Current</span>
                  </div>
                </div>

                {/* Palette numbers */}
                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                  {exam.questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex
                    const isAnswered = Boolean(answers[q.id])
                    const isReview = Boolean(markedForReview[q.id])

                    let bgClass = "bg-secondary/40 border-white/10 text-slate-400"
                    if (isAnswered) bgClass = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                    if (isReview) bgClass = "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                    if (isCurrent) bgClass += " ring-2 ring-blue-400 border-transparent text-white"

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentIndex(idx)
                          setVisited((prev) => ({ ...prev, [idx]: true }))
                        }}
                        className={`h-9 w-9 rounded-xl border flex items-center justify-center text-xs transition-all ${bgClass}`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowSubmitModal(true)}
                className="w-full rounded-2xl font-bold py-6 shadow-lg shadow-rose-500/25"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="glass p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6 text-center">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-outfit">Submit Examination?</h3>
              <p className="text-xs text-slate-400">
                You have answered <span className="text-emerald-400 font-bold">{answeredCount}</span> out of <span className="text-white font-bold">{exam.questions.length}</span> questions.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <Button variant="ghost" onClick={() => setShowSubmitModal(false)} className="rounded-xl">
                Continue Exam
              </Button>
              <Button
                disabled={submitting}
                onClick={handleSubmitExam}
                className="rounded-xl px-6 font-bold bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25"
              >
                {submitting ? "Submitting..." : "Yes, Submit Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
