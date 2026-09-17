"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { PenTool, Search, Clock, Award, Key, ArrowRight, CheckCircle, Sparkles, Filter, ShieldCheck } from "lucide-react"
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
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [exams, setExams] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [examCode, setExamCode] = useState("")
  const [searchFilter, setSearchFilter] = useState(initialQuery)
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

  const filteredExams = exams.filter((e) => {
    if (!searchFilter.trim()) return true
    const term = searchFilter.toLowerCase()
    return (
      e.title.toLowerCase().includes(term) ||
      e.code.toLowerCase().includes(term) ||
      (e.description && e.description.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-8 pb-12 text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
            <PenTool className="h-3.5 w-3.5" />
            <span>Computer-Based Examination Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Available Examinations</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Select a published examination below or enter an official institutional access code.</p>
        </div>
      </div>

      {/* Enter Exam Code Card */}
      <section className="glass p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-transparent space-y-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-outfit">Direct Access Code</h2>
            <p className="text-xs text-slate-300">If your administrator provided a unique exam code (e.g., REX-CS-2026), enter it below.</p>
          </div>
        </div>

        <form onSubmit={handleEnterExamByCode} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. REX-CS-2026"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-2xl bg-secondary/60 border border-white/10 text-white font-mono text-sm font-bold placeholder:font-sans focus:outline-none focus:border-emerald-400 uppercase tracking-widest"
          />
          <Button type="submit" disabled={searching} size="lg" className="btn-3d-green rounded-2xl px-8 font-bold text-white shadow-lg shadow-emerald-500/25">
            {searching ? "Verifying..." : "Start Secure CBT"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-4 py-2.5 rounded-xl border border-rose-500/20 animate-in fade-in">
            {errorMsg}
          </p>
        )}
      </section>

      {/* Available Exams Grid with Search Filter */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-extrabold font-outfit text-white">Published Examinations</h2>
            <p className="text-xs text-slate-400 mt-0.5">Explore institutional and national mock test series.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter examinations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading available examinations...</div>
        ) : filteredExams.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3 shadow-xl">
            <Sparkles className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white font-outfit">No examinations match your filter</h3>
            <p className="text-xs text-slate-400">Try adjusting your search keywords or enter a direct exam code above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="glass p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl hover:-translate-y-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {exam.code}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center font-mono font-semibold">
                      <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {exam.duration} mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-outfit leading-snug">{exam.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{exam.description || "Comprehensive timed examination testing key curriculum concepts."}</p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>{exam.totalQuestions} Questions</span>
                    <span className="font-bold text-emerald-400 font-mono">{exam.totalMarks} Total Marks</span>
                  </div>

                  <Button
                    onClick={() => navigate(`/student/exam/${exam.id}/cbt`)}
                    className="w-full rounded-2xl font-bold btn-3d-green shadow-md shadow-emerald-500/20 text-xs py-5"
                  >
                    Start Examination
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
