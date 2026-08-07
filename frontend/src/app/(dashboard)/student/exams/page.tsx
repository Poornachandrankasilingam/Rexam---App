"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  PenTool, 
  Play, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Key, 
  Search, 
  Filter, 
  Award, 
  FileText, 
  ArrowRight, 
  X, 
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

type ExamItem = {
  id: string
  code: string
  title: string
  subject: string
  duration: number // mins
  totalQuestions: number
  totalMarks: number
  date: string
  status: "LIVE" | "UPCOMING" | "COMPLETED"
  score?: number
}

const INITIAL_EXAMS: ExamItem[] = [
  {
    id: "ex1",
    code: "SSC-CGL-01",
    title: "SSC CGL Tier-1 Full Mock #4",
    subject: "Combined Graduate Level",
    duration: 60,
    totalQuestions: 25,
    totalMarks: 50,
    date: "Today, Live Now",
    status: "LIVE"
  },
  {
    id: "ex2",
    code: "QUANT-101",
    title: "Quantitative Aptitude Mastery Test",
    subject: "Mathematics & Statistics",
    duration: 45,
    totalQuestions: 20,
    totalMarks: 40,
    date: "Tomorrow, 10:00 AM",
    status: "UPCOMING"
  },
  {
    id: "ex3",
    code: "REASON-202",
    title: "Logical Reasoning & Puzzle Challenge",
    subject: "Analytical Reasoning",
    duration: 30,
    totalQuestions: 15,
    totalMarks: 30,
    date: "05 Aug 2026",
    status: "COMPLETED",
    score: 26
  },
  {
    id: "ex4",
    code: "BANK-PO-03",
    title: "IBPS Bank PO Prelims Speed Mock",
    subject: "Banking & Finance",
    duration: 60,
    totalQuestions: 30,
    totalMarks: 60,
    date: "12 Aug 2026",
    status: "UPCOMING"
  }
]

export default function StudentExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>(INITIAL_EXAMS)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "LIVE" | "UPCOMING" | "COMPLETED">("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal State
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [inputCode, setInputCode] = useState("")
  const [codeError, setCodeError] = useState("")

  // Registration Toast State
  const [registeredIds, setRegisteredIds] = useState<Record<string, boolean>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) {
      setCodeError("Please enter a valid exam code")
      return
    }
    
    // Find exam or create custom code entry
    const codeUpper = inputCode.trim().toUpperCase()
    const found = exams.find(e => e.code.toUpperCase() === codeUpper)

    if (found) {
      setShowCodeModal(false)
      setInputCode("")
      setCodeError("")
      showToast(`Successfully registered for ${found.title}!`)
    } else {
      // Add custom exam code to list
      const newExam: ExamItem = {
        id: `custom-${Date.now()}`,
        code: codeUpper,
        title: `Custom Test (${codeUpper})`,
        subject: "Special Examination",
        duration: 45,
        totalQuestions: 20,
        totalMarks: 40,
        date: "Live Now",
        status: "LIVE"
      }
      setExams(prev => [newExam, ...prev])
      setShowCodeModal(false)
      setInputCode("")
      setCodeError("")
      showToast(`Access granted for Exam Code ${codeUpper}!`)
    }
  }

  const handleRegister = (examId: string, examTitle: string) => {
    setRegisteredIds(prev => ({ ...prev, [examId]: true }))
    showToast(`You have successfully registered for ${examTitle}!`)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredExams = exams.filter(e => {
    const matchesStatus = filterStatus === "ALL" || e.status === filterStatus
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

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
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-background to-secondary/30">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <PenTool className="h-3.5 w-3.5" />
            <span>CBT Examination Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Examinations & Mocks</h1>
          <p className="text-muted-foreground text-sm mt-1">Register for upcoming tests, enter access codes, or attempt live exams.</p>
        </div>

        <Button 
          onClick={() => setShowCodeModal(true)}
          size="lg" 
          className="rounded-full px-6 shadow-lg shadow-primary/20 font-bold"
        >
          <Key className="h-4 w-4 mr-2" />
          Enter Exam Code
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {(["ALL", "LIVE", "UPCOMING", "COMPLETED"] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "ALL" ? "All Exams" : status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exam title or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/40 border border-border/60 text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.map((exam) => {
          const isRegistered = registeredIds[exam.id]

          return (
            <div 
              key={exam.id}
              className="glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary border border-border/60 text-primary font-mono">
                    {exam.code}
                  </span>
                  <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                    exam.status === "LIVE" ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" :
                    exam.status === "UPCOMING" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                  }`}>
                    {exam.status === "LIVE" ? "🔴 Live Now" : exam.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{exam.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{exam.subject}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-semibold pt-2 text-muted-foreground border-t border-border/40">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{exam.duration} Mins</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{exam.totalQuestions} Qs</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>{exam.totalMarks} Marks</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {exam.status === "LIVE" && (
                  <Link to="/student/practice">
                    <Button className="w-full rounded-2xl py-5 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                      <Play className="h-4 w-4 mr-2 fill-current" />
                      Start Exam Now
                    </Button>
                  </Link>
                )}

                {exam.status === "UPCOMING" && (
                  <Button 
                    onClick={() => handleRegister(exam.id, exam.title)}
                    variant={isRegistered ? "outline" : "default"}
                    disabled={isRegistered}
                    className={`w-full rounded-2xl py-5 font-bold ${isRegistered ? "border-emerald-500 text-emerald-400" : ""}`}
                  >
                    {isRegistered ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Registered
                      </>
                    ) : (
                      "Register for Exam"
                    )}
                  </Button>
                )}

                {exam.status === "COMPLETED" && (
                  <Link to="/student/results">
                    <Button variant="secondary" className="w-full rounded-2xl py-5 font-bold">
                      View Scorecard ({exam.score}/{exam.totalMarks})
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Enter Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-md w-full space-y-6 relative"
          >
            <button 
              onClick={() => setShowCodeModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Enter Exam Code</h3>
              <p className="text-xs text-muted-foreground">Enter the unique code provided by your institute or instructor to join a private test.</p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="e.g. SSC-2026 or QUANT-101"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm uppercase font-mono font-bold tracking-wider focus:outline-none focus:border-primary"
                />
                {codeError && <p className="text-xs text-red-400 font-semibold">{codeError}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowCodeModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20">
                  Access Exam
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
