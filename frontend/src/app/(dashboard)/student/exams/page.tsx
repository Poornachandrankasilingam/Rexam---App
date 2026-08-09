"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PenTool, Search, Clock, Award, Key, ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type ExamItem = {
  id: string
  title: string
  description: string
  code: string
  duration: number
  totalMarks: number
  passingMarks: number
  totalQuestions: number
  createdAt: string
}

export default function AvailableExamsPage() {
  const navigate = useNavigate()
  const [exams, setExams] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [examCode, setExamCode] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    fetchAvailableExams()
  }, [])

  const fetchAvailableExams = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/exams")
      setExams(res.data.exams || [])
    } catch (err) {
      console.error("Failed to fetch exams", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnterExamByCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!examCode.trim()) return
    setErrorMsg("")
    setSearching(true)
    try {
      const res = await api.get(`/student/exams/code/${examCode.trim()}`)
      const targetExam = res.data.exam
      if (targetExam) {
        navigate(`/student/exam/${targetExam.id}/cbt`)
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || `Exam code "${examCode}" not found.`)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <PenTool className="h-3.5 w-3.5" />
            <span>Computer-Based Examination Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Available Examinations</h1>
          <p className="text-muted-foreground text-sm mt-1">Select an exam or enter your unique exam access code to begin.</p>
        </div>
      </div>

      {/* Enter Exam Code Card */}
      <section className="glass p-6 rounded-3xl border border-blue-500/30 bg-blue-950/20 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-outfit">Enter Exam Code</h2>
            <p className="text-xs text-slate-300">If your admin provided an access code (e.g., REX-84920), enter it below.</p>
          </div>
        </div>

        <form onSubmit={handleEnterExamByCode} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. REX-84920"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-2xl bg-secondary/50 border border-white/10 text-white font-mono text-sm font-bold placeholder:font-sans focus:outline-none focus:border-blue-400 uppercase tracking-widest"
          />
          <Button type="submit" disabled={searching} size="lg" className="rounded-2xl px-8 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
            {searching ? "Verifying..." : "Start CBT Exam"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
            {errorMsg}
          </p>
        )}
      </section>

      {/* Available Exams Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold font-outfit text-white">Published Examinations</h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading available exams...</div>
        ) : exams.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <Sparkles className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No published exams currently available</h3>
            <p className="text-xs text-slate-400">Your admin has not published any live tests yet. Try entering a custom exam code or practice AI mock tests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="glass p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {exam.code}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {exam.duration} mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-outfit leading-snug">{exam.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2">{exam.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{exam.totalQuestions} Questions</span>
                    <span className="font-bold text-emerald-400">{exam.totalMarks} Marks</span>
                  </div>

                  <Button
                    onClick={() => navigate(`/student/exam/${exam.id}/cbt`)}
                    className="w-full rounded-xl font-bold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20"
                  >
                    Start Exam
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
