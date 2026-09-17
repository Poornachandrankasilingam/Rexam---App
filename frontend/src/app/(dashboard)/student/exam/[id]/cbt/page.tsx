"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Clock, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Camera, 
  CameraOff, 
  Maximize2, 
  AlertTriangle, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  RotateCcw, 
  CheckCircle2, 
  CheckCircle,
  XCircle,
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  HelpCircle, 
  Wifi, 
  WifiOff, 
  User, 
  Eye, 
  AlertCircle,
  FileText,
  Award,
  BarChart3,
  TrendingUp,
  Target,
  RefreshCw,
  Check,
  X,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

type QuestionOption = {
  id: string
  text: string
}

type QuestionItem = {
  id: string
  text: string
  subject: string
  topic?: string
  difficulty: string
  marks: number
  negativeMarks: number
  options: QuestionOption[]
}

type ExamPayload = {
  id: string
  title: string
  code: string
  description?: string
  duration: number
  totalMarks: number
  passingMarks?: number
  questions: QuestionItem[]
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

type ExamReviewData = {
  resultId: string
  examTitle: string
  code: string
  score: number
  totalMarks: number
  correct: number
  incorrect: number
  unanswered: number
  totalQuestions: number
  accuracy: number
  timeSpentSeconds: number
  date: string
  questions: ReviewQuestion[]
}

type MockResultData = {
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

export default function CBTExamEnginePage() {
  const { id: examId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // 4-Stage Sequential Flow:
  // Step 1: Pre-Exam Verification & System Check
  // Step 2: Live CBT Test (Student Answers, Questions + Options ONLY, Zero Leaks)
  // Step 3: Post-Submission Correct Answer Review (Questions, Student Choice, Correct Choice, Status, Explanation)
  // Step 4: Comprehensive Mock Result (Scorecard, Accuracy, Diagnostics, Weak Areas, Recommendations)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [exam, setExam] = useState<ExamPayload | null>(null)
  const [loading, setLoading] = useState(true)

  // CBT State (Step 2)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({})
  const [visited, setVisited] = useState<Record<string, boolean>>({ "0": true })
  const [timeLeftSec, setTimeLeftSec] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Step 3 & 4 Data
  const [resultId, setResultId] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState<ExamReviewData | null>(null)
  const [mockResult, setMockResult] = useState<MockResultData | null>(null)
  const [loadingReview, setLoadingReview] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<"ALL" | "CORRECT" | "WRONG" | "UNANSWERED">("ALL")
  const [reviewSearch, setReviewSearch] = useState("")

  // Proctoring & Security State
  const [violations, setViolations] = useState(0)
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "pending">("pending")
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [filterTab, setFilterTab] = useState<"ALL" | "ANSWERED" | "UNANSWERED" | "REVIEW">("ALL")
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base")
  const [syncStatus, setSyncStatus] = useState<"SAVED" | "SAVING" | "ERROR">("SAVED")
  const [isOnline, setIsOnline] = useState(true)

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
      } catch (err: any) {
        console.error("Failed to load exam", err)
      } finally {
        setLoading(false)
      }
    }

    initExam()
  }, [examId])

  // 2. Camera Setup for AI Proctoring
  const requestCameraAccess = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false })
        setCameraStream(stream)
        setCameraPermission("granted")
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } else {
        setCameraPermission("denied")
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable", err)
      setCameraPermission("denied")
    }
  }

  // Attach camera stream to video tag whenever available
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream, step])

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  // 3. Online/Offline Network Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // 4. Log Proctoring Violation to Server
  const reportViolation = useCallback(async (eventType: string, details: string, risk = 20) => {
    if (!examId) return
    try {
      await api.post("/student/proctoring/log", {
        examId,
        eventType,
        riskScore: risk,
        details
      })
    } catch (e) {
      console.error("Failed to log proctoring event", e)
    }
  }, [examId])

  // 5. Tab Switch & Window Focus Security Handler
  useEffect(() => {
    if (step !== 2) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations((prev) => {
          const nextCount = prev + 1
          const msg = `Tab Switch Detected! You navigated away from the exam window (Warning ${nextCount} of 3).`
          setWarningMessage(msg)
          setWarningModalOpen(true)
          reportViolation("TAB_SWITCH", `Candidate switched tab away from active exam session (Count: ${nextCount})`, 25)
          
          if (nextCount >= 3) {
            setTimeout(() => {
              handleSubmitExam()
            }, 1000)
          }
          return nextCount
        })
      }
    }

    const handleWindowBlur = () => {
      setViolations((prev) => {
        const nextCount = prev + 1
        const msg = `Window Focus Lost! Please keep your attention on the examination window (Warning ${nextCount} of 3).`
        setWarningMessage(msg)
        setWarningModalOpen(true)
        reportViolation("WINDOW_UNFOCUSED", `Candidate lost window focus during active session (Count: ${nextCount})`, 20)

        if (nextCount >= 3) {
          setTimeout(() => {
            handleSubmitExam()
          }, 1000)
        }
        return nextCount
      })
    }

    const handleFullscreenChange = () => {
      const inFullscreen = Boolean(document.fullscreenElement)
      setIsFullscreen(inFullscreen)
      if (!inFullscreen && step === 2) {
        setWarningMessage("Fullscreen Mode Exited! CBT Examination requires full screen. Please restore fullscreen mode.")
        setWarningModalOpen(true)
        reportViolation("FULLSCREEN_EXIT", "Candidate exited fullscreen during active exam session", 15)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("blur", handleWindowBlur)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("blur", handleWindowBlur)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [step, reportViolation])

  // 6. Prevent Copy, Paste, Right Click and Developer Shortcuts
  useEffect(() => {
    if (step !== 2) return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "c" || e.key === "v" || e.key === "p" || e.key === "s"))
      ) {
        e.preventDefault()
        reportViolation("SHORTCUT_BLOCKED", `Attempted prohibited shortcut: ${e.key}`, 10)
        return false
      }

      // Keyboard navigation for options: 1, 2, 3, 4 or A, B, C, D
      if (exam && exam.questions[currentIndex]) {
        const q = exam.questions[currentIndex]
        const optKeys: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 }
        const keyLower = e.key.toLowerCase()
        if (optKeys[keyLower] !== undefined && q.options[optKeys[keyLower]]) {
          handleSelectOption(q.id, q.options[optKeys[keyLower]].id)
        }

        if (e.key === "ArrowRight") {
          handleNext()
        } else if (e.key === "ArrowLeft") {
          handlePrev()
        }
      }
    }

    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [step, exam, currentIndex])

  // 7. Countdown Timer
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

  // 8. Auto-Save Answers Every 15 Seconds
  useEffect(() => {
    if (step !== 2 || !examId) return

    const autoSaveTimer = setInterval(async () => {
      try {
        setSyncStatus("SAVING")
        await api.post(`/student/exams/${examId}/save`, {
          answers,
          timeRemainingSec: timeLeftSec
        })
        setSyncStatus("SAVED")
      } catch (e) {
        console.error("Auto-save failed", e)
        setSyncStatus("ERROR")
      }
    }, 15000)

    return () => clearInterval(autoSaveTimer)
  }, [step, examId, answers, timeLeftSec])

  // Fullscreen Enforcer
  const enterFullscreenAndStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (e) {
      console.warn("Fullscreen request not permitted by browser", e)
    }
    setStep(2)
  }

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

  // =========================================================================
  // SUBMISSION FLOW:
  // Student Answers -> Submit Exam -> Mark SUBMITTED -> Show Correct Answers (Step 3) -> Show Mock Result (Step 4)
  // =========================================================================
  const handleSubmitExam = async () => {
    if (submitting || !examId) return
    try {
      setSubmitting(true)
      const timeSpentSec = Math.max(1, (exam?.duration || 30) * 60 - timeLeftSec)
      
      const submitRes = await api.post(`/student/exams/${examId}/submit`, {
        answers,
        timeSpentSec
      })

      const gradedResultId = submitRes.data?.resultId
      setResultId(gradedResultId)

      // Exit fullscreen mode on test complete
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }

      // Fetch Question-by-Question Review (Step 3) and Mock Result Details (Step 4)
      if (gradedResultId) {
        setLoadingReview(true)
        try {
          const [revRes, mockRes] = await Promise.all([
            api.get(`/student/results/${gradedResultId}/review`),
            api.get(`/student/results/${gradedResultId}`)
          ])
          setReviewData(revRes.data.review)
          setMockResult(mockRes.data.result)
        } catch (fetchErr) {
          console.error("Failed to fetch graded review payload", fetchErr)
        } finally {
          setLoadingReview(false)
        }
      }

      setShowSubmitModal(false)
      // Transition directly to Step 3: Show Correct Answers Review
      setStep(3)
    } catch (err) {
      console.error("Failed to submit exam", err)
      setShowSubmitModal(false)
      navigate("/student/results")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="text-slate-400 font-semibold font-outfit text-sm">Preparing Secure CBT Examination Engine...</p>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl border border-rose-500/30 max-w-md w-full text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white font-outfit">Exam Unavailable</h2>
          <p className="text-xs text-slate-400">The requested examination could not be loaded or is no longer accessible.</p>
          <Button onClick={() => navigate("/student/exams")} className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold">
            Back to Available Exams
          </Button>
        </div>
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

  // Filtered Question List for Palette
  const filteredQuestions = exam.questions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
    const isAns = Boolean(answers[q.id])
    const isRev = Boolean(markedForReview[q.id])
    if (filterTab === "ANSWERED") return isAns
    if (filterTab === "UNANSWERED") return !isAns
    if (filterTab === "REVIEW") return isRev
    return true
  })

  // Timer Color logic
  const isTimerLow = timeLeftSec <= 300 // 5 mins
  const isTimerCritical = timeLeftSec <= 60 // 1 min

  // Filtered Review Questions for Step 3
  const filteredReviewQuestions = (reviewData?.questions || []).filter((q) => {
    if (reviewFilter === "CORRECT" && q.status !== "CORRECT") return false
    if (reviewFilter === "WRONG" && q.status !== "WRONG") return false
    if (reviewFilter === "UNANSWERED" && q.status !== "UNANSWERED") return false
    if (reviewSearch.trim()) {
      const s = reviewSearch.toLowerCase()
      return q.questionText.toLowerCase().includes(s) || q.subject.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col p-4 md:p-6 select-none font-sans">
      {/* ========================================================================= */}
      {/* STEP 1: PRE-EXAM SYSTEM CHECK & VERIFICATION                             */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto my-auto w-full space-y-6">
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-mono font-bold text-blue-400 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    CODE: {exam.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    AI Proctoring Enabled
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">{exam.title}</h1>
                <p className="text-xs text-slate-400 mt-1">{exam.description || "Official Computer-Based Examination Session"}</p>
              </div>

              <div className="bg-secondary/40 p-4 rounded-2xl border border-white/10 text-right min-w-[140px]">
                <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Exam Duration</p>
                <p className="text-2xl font-black text-blue-400 font-mono">{exam.duration} Mins</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{exam.questions.length} Questions | {exam.totalMarks} Marks</p>
              </div>
            </div>

            {/* Candidate & Hardware Readiness Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidate Details */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-white/10 space-y-3">
                <div className="flex items-center space-x-2 text-white font-bold text-sm font-outfit">
                  <User className="h-4 w-4 text-blue-400" />
                  <span>Candidate Identity</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-400">Name: <span className="text-white font-semibold">{user?.name || "Student Candidate"}</span></p>
                  <p className="text-slate-400">Email: <span className="text-white font-mono">{user?.email || "student@rexam.com"}</span></p>
                  <p className="text-slate-400">Environment: <span className="text-emerald-400 font-mono font-bold">Secure Browser Sandbox</span></p>
                </div>
              </div>

              {/* Hardware & Webcam Proctoring Check */}
              <div className="p-5 rounded-2xl bg-secondary/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-white font-bold text-sm font-outfit">
                    <Camera className="h-4 w-4 text-purple-400" />
                    <span>AI Webcam Proctoring</span>
                  </div>
                  {cameraPermission === "granted" ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Camera Ready ✓
                    </span>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={requestCameraAccess}
                      className="text-xs h-7 rounded-lg border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      Enable Webcam
                    </Button>
                  )}
                </div>

                {cameraPermission === "granted" ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-emerald-500/30">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-[10px] font-mono font-bold flex items-center space-x-1 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live Video Stream</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-4 bg-secondary/40 border border-white/5 text-center text-xs text-slate-400 space-y-1">
                    <CameraOff className="h-6 w-6 mx-auto text-slate-500" />
                    <p>Click "Enable Webcam" above to activate proctoring video verification.</p>
                  </div>
                )}
              </div>
            </div>

            {/* CBT Instructions */}
            <div className="space-y-3 bg-blue-950/20 p-5 rounded-2xl border border-blue-500/20 text-xs text-slate-300">
              <h3 className="font-bold text-white text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-400" />
                CBT Examination Guidelines & Integrity Rules:
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-300">
                <li><strong className="text-white">Strict Sequence:</strong> Questions only during the test. Solutions and detailed mock result become available exclusively after final submission.</li>
                <li><strong className="text-white">Fullscreen Lock:</strong> The exam runs in dedicated fullscreen mode. Exiting fullscreen logs a proctoring violation.</li>
                <li><strong className="text-white">No Tab Switching:</strong> Navigating away or minimizing the browser will be flagged by AI Proctoring. 3 strikes will automatically submit the test.</li>
                <li><strong className="text-white">Continuous Auto-Save:</strong> Your answers are saved locally and synchronized every 15 seconds.</li>
                <li><strong className="text-white">Navigation:</strong> You can mark questions for review and jump between questions freely using the Question Palette.</li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/student/exams")} 
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel & Return
              </Button>

              <Button 
                size="lg" 
                onClick={enterFullscreenAndStart} 
                className="rounded-2xl px-8 py-6 font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 w-full sm:w-auto"
              >
                <span>Launch Secure CBT Examination</span>
                <Maximize2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: LIVE CBT EXAM ENGINE INTERFACE (Zero Answer Leaks)               */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-4 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Top Control Bar */}
          <header className="glass px-6 py-3.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            {/* Exam Title & Candidate */}
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-outfit">
                CBT
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white font-outfit line-clamp-1">{exam.title}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="font-mono text-blue-400 font-semibold">{exam.code}</span>
                  <span>•</span>
                  <span>{user?.name || "Student"}</span>
                  <span>•</span>
                  {isOnline ? (
                    <span className="text-emerald-400 flex items-center text-[10px] font-semibold">
                      <Wifi className="h-3 w-3 mr-1" />
                      {syncStatus === "SAVED" ? "Saved ✓" : syncStatus === "SAVING" ? "Syncing..." : "Sync Error"}
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center text-[10px] font-semibold">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Offline (Cached)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Timer, Malpractice Counter, Submit */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Font Size Adjuster */}
              <div className="hidden sm:flex items-center space-x-1 bg-secondary/40 p-1 rounded-xl border border-white/10 text-xs">
                <button 
                  onClick={() => setFontSize("sm")}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${fontSize === "sm" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  A-
                </button>
                <button 
                  onClick={() => setFontSize("base")}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${fontSize === "base" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  A
                </button>
                <button 
                  onClick={() => setFontSize("lg")}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${fontSize === "lg" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                >
                  A+
                </button>
              </div>

              {/* Proctoring Status Pill */}
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">AI Proctor Active</span>
                {violations > 0 && (
                  <span className="text-rose-400 font-bold ml-1">({violations}/3 Strikes)</span>
                )}
              </div>

              {/* Countdown Timer */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-mono text-base font-black transition-all ${
                isTimerCritical
                  ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse shadow-lg shadow-rose-500/30"
                  : isTimerLow
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-300"
              }`}>
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeLeftSec)}</span>
              </div>

              {/* Submit Button */}
              <Button
                variant="destructive"
                onClick={() => setShowSubmitModal(true)}
                className="rounded-xl font-bold px-4 sm:px-6 text-xs bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Submit Exam
              </Button>
            </div>
          </header>

          {/* Main Grid: Left Question Area + Right Question Palette & AI Video Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 flex-1">
            {/* ================================================================= */}
            {/* LEFT QUESTION PANEL (Cols 1-3)                                    */}
            {/* ================================================================= */}
            <main className="lg:col-span-3 glass p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-6">
                {/* Question Header & Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-base font-extrabold text-blue-400 font-outfit">
                      Question {currentIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">of {exam.questions.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2.5 py-0.5 rounded-full bg-secondary/60 border border-white/10">
                      {currentQ.subject} {currentQ.topic ? `• ${currentQ.topic}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-emerald-400">+{currentQ.marks} Marks</span>
                    {currentQ.negativeMarks > 0 && (
                      <span className="font-semibold text-rose-400">(-{currentQ.negativeMarks} Neg)</span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className={`text-white font-medium leading-relaxed ${
                  fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-base"
                }`}>
                  {currentQ.text}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id] === opt.id
                    const optionLetter = String.fromCharCode(65 + optIdx) // A, B, C, D

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`w-full p-4 rounded-2xl text-left font-medium border transition-all flex items-center justify-between group ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-400 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400"
                            : "bg-secondary/30 border-white/10 text-slate-300 hover:bg-secondary/60 hover:text-white hover:border-white/20"
                        } ${fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm"}`}
                      >
                        <div className="flex items-center space-x-3.5 pr-3">
                          <span className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-400"
                              : "bg-secondary/80 text-slate-400 border-white/10 group-hover:text-white"
                          }`}>
                            {optionLetter}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>

                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? "border-blue-400 bg-blue-500" : "border-slate-500"
                        }`}>
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
                    className={`rounded-xl text-xs font-bold transition-all ${
                      markedForReview[currentQ.id]
                        ? "bg-purple-500/20 border-purple-400 text-purple-300"
                        : "border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5 mr-1.5" />
                    {markedForReview[currentQ.id] ? "Marked for Review ✓" : "Mark for Review"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAnswer}
                    className="rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Clear Response
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold border-white/10"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={currentIndex === exam.questions.length - 1}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </main>

            {/* ================================================================= */}
            {/* RIGHT SIDEBAR: PROCTORING FEED + QUESTION PALETTE (Col 4)        */}
            {/* ================================================================= */}
            <aside className="glass p-5 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                {/* AI Proctor Live Webcam Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/60 border border-white/10 flex items-center justify-center">
                  {cameraPermission === "granted" && cameraStream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                  ) : (
                    <div className="text-center p-3 space-y-1">
                      <Camera className="h-6 w-6 mx-auto text-purple-400 animate-pulse" />
                      <p className="text-[10px] text-slate-400 font-semibold">AI Proctor Active</p>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-[9px] font-mono font-bold flex items-center space-x-1 border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>PROCTOR LIVE</span>
                  </div>
                </div>

                {/* Question Palette Filter Tabs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-bold text-white font-outfit uppercase tracking-wider">
                      Question Palette
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">{exam.questions.length} Total</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[9px] font-bold">
                    <button 
                      onClick={() => setFilterTab("ALL")}
                      className={`py-1 rounded-lg text-center transition-all ${filterTab === "ALL" ? "bg-blue-600 text-white" : "bg-secondary/30 text-slate-400 hover:text-white"}`}
                    >
                      All ({exam.questions.length})
                    </button>
                    <button 
                      onClick={() => setFilterTab("ANSWERED")}
                      className={`py-1 rounded-lg text-center transition-all ${filterTab === "ANSWERED" ? "bg-emerald-600 text-white" : "bg-secondary/30 text-emerald-400 hover:text-white"}`}
                    >
                      Ans ({answeredCount})
                    </button>
                    <button 
                      onClick={() => setFilterTab("UNANSWERED")}
                      className={`py-1 rounded-lg text-center transition-all ${filterTab === "UNANSWERED" ? "bg-slate-600 text-white" : "bg-secondary/30 text-slate-400 hover:text-white"}`}
                    >
                      Left ({unansweredCount})
                    </button>
                    <button 
                      onClick={() => setFilterTab("REVIEW")}
                      className={`py-1 rounded-lg text-center transition-all ${filterTab === "REVIEW" ? "bg-purple-600 text-white" : "bg-secondary/30 text-purple-400 hover:text-white"}`}
                    >
                      Rev ({markedCount})
                    </button>
                  </div>
                </div>

                {/* Status Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold p-2.5 rounded-xl bg-secondary/20 border border-white/5">
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-emerald-500" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-purple-500" />
                    <span>Review ({markedCount})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded bg-secondary/80 border border-white/20" />
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded ring-2 ring-blue-400" />
                    <span>Current</span>
                  </div>
                </div>

                {/* Palette Grid Buttons */}
                <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredQuestions.map(({ q, idx }) => {
                    const isCurrent = idx === currentIndex
                    const isAnswered = Boolean(answers[q.id])
                    const isReview = Boolean(markedForReview[q.id])

                    let bgClass = "bg-secondary/40 border-white/10 text-slate-400"
                    if (isAnswered) bgClass = "bg-emerald-500/25 border-emerald-500 text-emerald-300 font-bold"
                    if (isReview) bgClass = "bg-purple-500/25 border-purple-500 text-purple-300 font-bold"
                    if (isCurrent) bgClass += " ring-2 ring-blue-400 border-transparent text-white font-black"

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentIndex(idx)
                          setVisited((prev) => ({ ...prev, [idx]: true }))
                        }}
                        className={`h-9 w-9 rounded-xl border flex items-center justify-center text-xs transition-all hover:scale-105 ${bgClass}`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit Final Test Button */}
              <Button
                variant="destructive"
                onClick={() => setShowSubmitModal(true)}
                className="w-full rounded-2xl font-bold py-6 text-sm bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-lg shadow-rose-600/30"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Examination
              </Button>
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: POST-SUBMISSION CORRECT ANSWER REVIEW (Step 3 in Flow)            */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="max-w-5xl mx-auto w-full space-y-6 pb-16">
          {/* Review Header Banner */}
          <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/15 via-purple-600/10 to-emerald-600/15 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-400 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    STEP 3 OF 4: ANSWER EVALUATION & REVIEW
                  </span>
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Attempt Submitted
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
                  {reviewData?.examTitle || exam.title} — Detailed Solutions
                </h1>
                <p className="text-xs text-slate-400">
                  Inspect your submitted choices, correct answers, step-by-step mathematical proofs, and conceptual solutions.
                </p>
              </div>

              {/* Quick Score Snapshot */}
              <div className="bg-secondary/60 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Earned Score</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    {reviewData?.score ?? "--"} <span className="text-xs text-slate-400">/ {reviewData?.totalMarks ?? exam.totalMarks}</span>
                  </p>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
                  <p className="text-2xl font-black text-blue-400 font-mono">
                    {reviewData?.accuracy ?? "--"}%
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setReviewFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    reviewFilter === "ALL"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-secondary/40 text-slate-400 hover:text-white"
                  }`}
                >
                  All Questions ({reviewData?.questions.length || 0})
                </button>
                <button
                  onClick={() => setReviewFilter("CORRECT")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    reviewFilter === "CORRECT"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "bg-secondary/40 text-emerald-400 hover:text-white"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  Correct ({reviewData?.correct || 0})
                </button>
                <button
                  onClick={() => setReviewFilter("WRONG")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    reviewFilter === "WRONG"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                      : "bg-secondary/40 text-rose-400 hover:text-white"
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                  Wrong ({reviewData?.incorrect || 0})
                </button>
                <button
                  onClick={() => setReviewFilter("UNANSWERED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    reviewFilter === "UNANSWERED"
                      ? "bg-slate-600 text-white shadow-md shadow-slate-500/20"
                      : "bg-secondary/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Unanswered ({reviewData?.unanswered || 0})
                </button>
              </div>

              {/* Action Button: Proceed to Mock Result (Step 4) */}
              <Button
                onClick={() => setStep(4)}
                className="rounded-2xl px-6 py-5 font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/25"
              >
                <span>Proceed to Mock Result & Analytics</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Question-by-Question Review List */}
          {loadingReview ? (
            <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-4">
              <div className="h-10 w-10 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mx-auto" />
              <p className="text-slate-400 font-semibold text-xs font-outfit">Loading solution blueprints & explanations...</p>
            </div>
          ) : filteredReviewQuestions.length === 0 ? (
            <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3">
              <BookOpen className="h-10 w-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white font-outfit">No Questions in This Category</h3>
              <p className="text-xs text-slate-400">Try selecting a different filter tab above to inspect your test questions.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviewQuestions.map((q, idx) => {
                const isCorrect = q.status === "CORRECT"
                const isWrong = q.status === "WRONG"
                const isUnanswered = q.status === "UNANSWERED"

                return (
                  <div
                    key={q.questionId}
                    className={`glass p-6 sm:p-8 rounded-3xl border transition-all space-y-5 shadow-xl ${
                      isCorrect
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : isWrong
                        ? "border-rose-500/30 bg-rose-950/10"
                        : "border-white/10 bg-secondary/20"
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-extrabold text-blue-400 font-outfit">
                          Question {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2.5 py-0.5 rounded-full bg-secondary/60 border border-white/10">
                          {q.subject} {q.topic ? `• ${q.topic}` : ""}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                          {q.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isCorrect && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Correct (+{q.marksAwarded} Marks)
                          </span>
                        )}
                        {isWrong && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center">
                            <X className="h-3 w-3 mr-1" />
                            Incorrect ({q.marksAwarded} Marks)
                          </span>
                        )}
                        {isUnanswered && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-500/15 text-slate-400 border border-slate-500/30 flex items-center">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            Unanswered (0 Marks)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="text-base text-white font-medium leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Options List with Evaluation Highlighting */}
                    <div className="space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const optionLetter = String.fromCharCode(65 + optIdx)
                        const isStudentChoice = opt.isSelected
                        const isTargetCorrect = opt.isCorrect

                        let optCardStyle = "bg-secondary/30 border-white/10 text-slate-300"
                        let badgeText: string | null = null
                        let badgeColor = ""

                        if (isTargetCorrect && isStudentChoice) {
                          optCardStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400"
                          badgeText = "Your Choice & Correct Answer ✓"
                          badgeColor = "bg-emerald-500/30 text-emerald-300 border-emerald-400/40"
                        } else if (isTargetCorrect && !isStudentChoice) {
                          optCardStyle = "bg-emerald-500/15 border-emerald-500/60 text-emerald-200"
                          badgeText = "Correct Answer ✓"
                          badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        } else if (isStudentChoice && !isTargetCorrect) {
                          optCardStyle = "bg-rose-500/20 border-rose-400 text-rose-100 ring-1 ring-rose-400"
                          badgeText = "Your Selected Choice ✗"
                          badgeColor = "bg-rose-500/30 text-rose-300 border-rose-400/40"
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-4 rounded-2xl border text-sm font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${optCardStyle}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isTargetCorrect
                                  ? "bg-emerald-600 text-white"
                                  : isStudentChoice
                                  ? "bg-rose-600 text-white"
                                  : "bg-secondary/70 text-slate-400 border border-white/10"
                              }`}>
                                {optionLetter}
                              </span>
                              <span className="leading-snug">{opt.text}</span>
                            </div>

                            {badgeText && (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border self-start sm:self-auto ${badgeColor}`}>
                                {badgeText}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Step-by-Step Mathematical / Conceptual Explanation */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-slate-900/60 border border-blue-500/25 space-y-2">
                      <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs font-mono uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" />
                        <span>Step-by-Step Solution & Concept Explanation:</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Bottom Sticky Action Bar */}
          <div className="glass p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <Button
              variant="outline"
              onClick={() => navigate("/student/exams")}
              className="border-white/10 text-slate-300 hover:text-white rounded-2xl text-xs font-bold w-full sm:w-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Available Exams
            </Button>

            <Button
              onClick={() => setStep(4)}
              className="rounded-2xl px-8 py-6 font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/25 w-full sm:w-auto"
            >
              <span>View Comprehensive Mock Result & Analytics</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: COMPREHENSIVE FINAL MOCK RESULT & PERFORMANCE ANALYSIS (Step 4)   */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="max-w-5xl mx-auto w-full space-y-8 pb-16">
          {/* Header Banner */}
          <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-600/15 via-blue-600/10 to-indigo-600/15 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    STEP 4 OF 4: FINAL MOCK RESULT & SCORECARD
                  </span>
                  <span className="text-xs font-bold text-blue-400 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    {mockResult?.code || exam.code}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-white font-outfit">
                  {mockResult?.examTitle || exam.title}
                </h1>
                <p className="text-xs text-slate-400">
                  Comprehensive performance analytics, accuracy diagnostics, topic mastery breakdown, and weakness remediation.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-2xl text-xs font-black font-mono border ${
                  mockResult?.status === "PASSED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}>
                  {mockResult?.status === "PASSED" ? "QUALIFIED / PASSED ✓" : "NEEDS PRACTICE ✗"}
                </span>
                <span className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {mockResult?.performanceLevel || "High Performance"}
                </span>
              </div>
            </div>

            {/* Main Scorecard Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-secondary/40 border border-white/10 text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Score</p>
                <p className="text-3xl font-black text-emerald-400 font-mono">
                  {mockResult?.score ?? reviewData?.score ?? 0}
                  <span className="text-sm text-slate-400 font-normal"> / {mockResult?.totalMarks ?? exam.totalMarks}</span>
                </p>
                <p className="text-[10px] text-slate-400">Passing: {mockResult?.passingMarks ?? 1.6} Marks</p>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/40 border border-white/10 text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                <p className="text-3xl font-black text-blue-400 font-mono">
                  {mockResult?.accuracy ?? reviewData?.accuracy ?? 0}%
                </p>
                <p className="text-[10px] text-slate-400">Based on attempted items</p>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/40 border border-white/10 text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time Spent</p>
                <p className="text-3xl font-black text-purple-400 font-mono">
                  {mockResult?.timeSpentFormatted || `${Math.floor((mockResult?.timeSpentSeconds || 60) / 60)}m`}
                </p>
                <p className="text-[10px] text-slate-400">Allocated: {exam.duration} mins</p>
              </div>

              <div className="p-5 rounded-2xl bg-secondary/40 border border-white/10 text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completion</p>
                <p className="text-3xl font-black text-white font-mono">
                  {((mockResult?.correct || 0) + (mockResult?.incorrect || 0))} / {mockResult?.totalQuestions || exam.questions.length}
                </p>
                <p className="text-[10px] text-slate-400">Questions Answered</p>
              </div>
            </div>
          </div>

          {/* Breakdown KPIs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Correct</p>
              <p className="text-2xl font-black text-emerald-300 font-mono mt-0.5">{mockResult?.correct ?? reviewData?.correct ?? 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <XCircle className="h-5 w-5 text-rose-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Incorrect</p>
              <p className="text-2xl font-black text-rose-300 font-mono mt-0.5">{mockResult?.incorrect ?? reviewData?.incorrect ?? 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <HelpCircle className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Unanswered</p>
              <p className="text-2xl font-black text-amber-300 font-mono mt-0.5">{mockResult?.unanswered ?? reviewData?.unanswered ?? 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <BarChart3 className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Questions</p>
              <p className="text-2xl font-black text-blue-300 font-mono mt-0.5">{mockResult?.totalQuestions || exam.questions.length}</p>
            </div>
          </div>

          {/* Subject & Topic Performance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Mastery */}
            <div className="glass p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                <Target className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-outfit text-white uppercase tracking-wider">
                  Subject-Wise Performance
                </h3>
              </div>

              <div className="space-y-3">
                {(mockResult?.subjectPerformance || []).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No subject breakdown metrics recorded.</p>
                ) : (
                  (mockResult?.subjectPerformance || []).map((subj, sIdx) => (
                    <div key={sIdx} className="p-3.5 rounded-2xl bg-secondary/30 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{subj.subject}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          subj.accuracy >= 70 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                        }`}>
                          {subj.accuracy}% Acc • {subj.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                        <span>{subj.correct} / {subj.total} Correct</span>
                        <span className="font-mono font-bold text-emerald-400">{subj.score} Marks</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Topic Diagnostic Matrix */}
            <div className="glass p-6 sm:p-7 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold font-outfit text-white uppercase tracking-wider">
                  Topic Diagnostic Matrix
                </h3>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {(mockResult?.topicPerformance || []).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No topic diagnostics available.</p>
                ) : (
                  (mockResult?.topicPerformance || []).map((top, tIdx) => (
                    <div key={tIdx} className="p-3.5 rounded-2xl bg-secondary/30 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[200px]">{top.topic}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          top.level === "Strong" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                        }`}>
                          {top.accuracy}% • {top.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                        <span>Subject: {top.subject}</span>
                        <span>{top.correct} of {top.total} Correct</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Weak Areas & Actionable Recommendations */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/20 via-transparent to-blue-950/20 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold font-outfit text-white">
                Weak Areas & Actionable Improvement Plan
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Weak Topics */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Priority Focus Modules:
                </h4>
                {(mockResult?.weakTopics || []).length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-semibold">
                    Outstanding performance! No critical weak areas flagged.
                  </div>
                ) : (
                  (mockResult?.weakTopics || []).map((w, wIdx) => (
                    <div key={wIdx} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{w.topic}</span>
                        <span className="text-rose-400 font-mono font-bold">{w.accuracy}% Acc</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{w.recommendation}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  AI Coach Recommendations:
                </h4>
                <div className="space-y-2">
                  {(mockResult?.improvementSuggestions || []).map((sug, sIdx) => (
                    <div key={sIdx} className="p-3.5 rounded-2xl bg-secondary/40 border border-white/10 text-xs text-slate-300 flex items-start space-x-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="glass p-6 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
            <Button
              variant="outline"
              onClick={() => setStep(3)}
              className="border-white/10 text-slate-200 hover:text-white rounded-2xl text-xs font-bold px-6 py-5"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-2" />
              Review Questions & Solutions Again
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              {resultId && (
                <Button
                  onClick={() => navigate(`/student/reports?resultId=${resultId}`)}
                  className="rounded-2xl px-6 py-5 font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  AI Performance Coach Deep-Dive
                </Button>
              )}

              <Button
                onClick={() => navigate("/student/dashboard")}
                className="rounded-2xl px-8 py-5 font-bold text-xs bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/25"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROCTORING MALPRACTICE WARNING MODAL                                      */}
      {/* ========================================================================= */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass p-8 rounded-3xl border border-rose-500/40 max-w-md w-full space-y-5 text-center shadow-2xl bg-[#0e0712]">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 animate-bounce">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-outfit">Proctoring Security Alert!</h3>
              <p className="text-xs text-rose-300 leading-relaxed font-semibold">{warningMessage}</p>
              <div className="pt-2">
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Strike {violations} of 3 • 3 Strikes Auto-Submits
                </span>
              </div>
            </div>

            <Button
              onClick={() => {
                setWarningModalOpen(false)
                if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {})
                }
              }}
              className="w-full rounded-2xl py-6 font-bold bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
            >
              I Understand & Resume Test
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION SUBMIT MODAL                                                 */}
      {/* ========================================================================= */}
      {showSubmitModal && exam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass p-8 rounded-3xl border border-white/10 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white font-outfit">Submit Examination?</h3>
              <p className="text-xs text-slate-400">
                Once submitted, your answers will be finalized. You will immediately proceed to step-by-step solutions and your Mock Result.
              </p>
            </div>

            {/* Breakdown summary */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xl font-black text-emerald-400 font-mono">{answeredCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Answered</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xl font-black text-purple-400 font-mono">{markedCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Marked Review</p>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/50 border border-white/10">
                <p className="text-xl font-black text-slate-300 font-mono">{unansweredCount}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Unanswered</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setShowSubmitModal(false)} 
                className="rounded-xl text-xs font-semibold"
              >
                Return to Exam
              </Button>
              <Button
                disabled={submitting}
                onClick={handleSubmitExam}
                className="rounded-xl px-8 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25"
              >
                {submitting ? "Grading & Submitting..." : "Yes, Submit Test"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
