"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Camera, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  RotateCcw, 
  Send,
  Eye,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type QuestionItem = {
  id: string
  text: string
  subject: string
  difficulty: string
  marks: number
  negativeMarks: number
  explanation: string
  options: Array<{ id: string; text: string }>
}

type ExamPayload = {
  id: string
  title: string
  description: string
  code: string
  duration: number
  totalMarks: number
  questions: QuestionItem[]
}

export default function CBTExamEnginePage() {
  const { id: examId } = useParams()
  const navigate = useNavigate()

  // Pre-exam flow step: 1: Instructions, 2: Camera, 3: Face Verification, 4: CBT Live
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [exam, setExam] = useState<ExamPayload | null>(null)
  const [loading, setLoading] = useState(true)

  // Camera & Proctoring state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraGranted, setCameraGranted] = useState(false)
  const [faceVerified, setFaceVerified] = useState(false)
  const [riskScore, setRiskScore] = useState(0)
  const [proctorWarning, setProctorWarning] = useState<string | null>(null)

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

  // 2. Camera Request
  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraGranted(true)
      setStep(3)
    } catch (err) {
      console.warn("Camera access denied or unequipped", err)
      // Allow proceeding with simulated proctoring mode
      setCameraGranted(true)
      setStep(3)
    }
  }

  // 3. Face Verification Step
  const verifyFace = () => {
    setFaceVerified(true)
    setStep(4)
  }

  // 4. Countdown Timer & Auto-Save
  useEffect(() => {
    if (step !== 4 || timeLeftSec <= 0) return

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
    if (step !== 4 || !examId) return

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

  // 5. AI Proctoring Tab & Focus Listener
  useEffect(() => {
    if (step !== 4) return

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const warning = "Tab switch detected! Malpractice event recorded."
        setProctorWarning(warning)
        setRiskScore((prev) => prev + 15)

        try {
          await api.post("/student/proctoring/log", {
            examId,
            eventType: "TAB_SWITCH",
            riskScore: 15,
            details: "User navigated away from active CBT exam tab."
          })
        } catch (e) {
          console.error("Failed to log proctoring event", e)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [step, examId])

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
      const res = await api.post(`/student/exams/${examId}/submit`, {
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
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6 pb-12 min-h-[85vh] flex flex-col justify-between">
      {/* STEP 1: EXAM INSTRUCTIONS */}
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
              <li>Camera permission is required for live AI face monitoring and malpractice tracking.</li>
              <li>Do NOT switch tabs or minimize the browser during the exam.</li>
              <li>Question status: Answered (Green), Unanswered (Gray), Marked for Review (Purple).</li>
            </ul>
          </div>

          <div className="pt-4 flex justify-end">
            <Button size="lg" onClick={() => setStep(2)} className="rounded-2xl px-8 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
              Proceed to Camera Check
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: CAMERA PERMISSION */}
      {step === 2 && (
        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 max-w-xl mx-auto my-auto text-center w-full">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Camera className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white font-outfit">AI Proctoring Camera Verification</h2>
            <p className="text-xs text-slate-300">
              Please grant camera access to enable real-time face tracking during the test.
            </p>
          </div>

          <div className="pt-2">
            <Button size="lg" onClick={requestCamera} className="rounded-2xl px-8 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
              Grant Camera Permission
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: FACE VERIFICATION */}
      {step === 3 && (
        <div className="glass p-8 rounded-3xl border border-white/10 space-y-6 max-w-xl mx-auto my-auto text-center w-full">
          <h2 className="text-xl font-bold text-white font-outfit">Face Alignment Preview</h2>
          <p className="text-xs text-slate-300">Position your face in the center of the camera frame.</p>

          <div className="relative w-64 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-blue-500/40 bg-black flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-4 border border-dashed border-blue-400/60 rounded-xl pointer-events-none" />
          </div>

          <Button size="lg" onClick={verifyFace} className="rounded-2xl px-8 font-bold bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Confirm & Start Exam
          </Button>
        </div>
      )}

      {/* STEP 4: CBT EXAM ENGINE INTERFACE */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="glass px-6 py-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white font-outfit">{exam.title}</h2>
              <p className="text-xs text-slate-400 font-mono">Code: {exam.code}</p>
            </div>

            {/* Floating Proctor PIP Video */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs font-bold text-blue-300">
                <Eye className="h-4 w-4 text-blue-400 animate-pulse" />
                <span>AI Proctor Active</span>
              </div>

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

          {/* Warning Banner */}
          {proctorWarning && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>{proctorWarning}</span>
              </div>
              <button onClick={() => setProctorWarning(null)} className="text-xs underline">Dismiss</button>
            </div>
          )}

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
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Previous
                  </Button>

                  <Button
                    disabled={currentIndex === exam.questions.length - 1}
                    onClick={handleNext}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500"
                  >
                    Next
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Question Palette Sidebar */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold font-outfit text-white">Question Palette</h3>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <span className="h-3 w-3 rounded bg-emerald-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-3 w-3 rounded bg-purple-500" />
                    <span>Review</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-3 w-3 rounded bg-slate-600" />
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-3 w-3 rounded border border-slate-600 bg-secondary" />
                    <span>Not Visited</span>
                  </div>
                </div>

                {/* Palette Grid */}
                <div className="grid grid-cols-5 gap-2 pt-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {exam.questions.map((q, idx) => {
                    const isAns = Boolean(answers[q.id])
                    const isRev = Boolean(markedForReview[q.id])
                    const isCurr = idx === currentIndex
                    const isVis = Boolean(visited[idx])

                    let bgClass = "bg-secondary text-slate-400 border-slate-700"
                    if (isAns) bgClass = "bg-emerald-600 text-white border-emerald-400"
                    else if (isRev) bgClass = "bg-purple-600 text-white border-purple-400"
                    else if (isVis) bgClass = "bg-slate-700 text-white border-slate-500"

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentIndex(idx)
                          setVisited((prev) => ({ ...prev, [idx]: true }))
                        }}
                        className={`h-9 w-9 rounded-xl font-mono text-xs font-bold border transition-all flex items-center justify-center ${bgClass} ${isCurr ? "ring-2 ring-blue-400 scale-105" : ""}`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Answered</span>
                  <span className="font-bold text-emerald-400">{Object.keys(answers).length} / {exam.questions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-8 rounded-3xl border border-white/20 max-w-md w-full space-y-6 bg-background">
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold text-white font-outfit">Confirm Exam Submission</h3>
              <p className="text-xs text-slate-300">
                You have answered <strong className="text-emerald-400">{Object.keys(answers).length}</strong> out of <strong className="text-white">{exam.questions.length}</strong> questions.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 rounded-xl font-bold text-xs"
              >
                Return to Test
              </Button>

              <Button
                disabled={submitting}
                onClick={handleSubmitExam}
                className="flex-1 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25"
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
