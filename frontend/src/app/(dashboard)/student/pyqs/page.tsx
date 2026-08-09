"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Filter, BookOpen, Clock, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type PyqItem = {
  id: string
  examName: string
  year: number
  subject: string
  topic?: string
}

export default function StudentPyqsPage() {
  const navigate = useNavigate()
  const [pyqs, setPyqs] = useState<PyqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState("ALL")
  const [selectedYear, setSelectedYear] = useState("ALL")

  const categories = ["ALL", "SSC CGL", "SSC CHSL", "TNPSC", "UPSC", "Banking", "Railway", "Other"]
  const years = ["ALL", "2024", "2023", "2022", "2021", "2020"]

  useEffect(() => {
    fetchPyqs()
  }, [selectedExam, selectedYear])

  const fetchPyqs = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/pyqs", {
        params: { exam: selectedExam, year: selectedYear }
      })
      setPyqs(res.data.pyqs || [])
    } catch (err) {
      console.error("Failed to load PYQs", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartPyqMock = async (pyq: PyqItem) => {
    try {
      const mockRes = await api.post("/student/ai-mock/generate", {
        category: pyq.examName,
        subject: pyq.subject,
        difficulty: "MEDIUM",
        count: 20
      })

      if (mockRes.data?.mockTest) {
        navigate("/student/exams")
      }
    } catch (e) {
      console.error("Failed to start PYQ mock", e)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <FileText className="h-3.5 w-3.5" />
            <span>Government Exam Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Previous Year Question Papers</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse, filter by year & exam category, and attempt previous papers as mock tests.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass p-6 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-300 mr-2 flex items-center">
            <Filter className="h-3.5 w-3.5 mr-1 text-blue-400" /> Exam Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedExam(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedExam === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-secondary/40 text-slate-300 hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-300">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-white/10 text-xs font-bold text-white focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-slate-900">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Papers Grid */}
      <section className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading question papers...</div>
        ) : pyqs.length === 0 ? (
          <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No previous year papers found</h3>
            <p className="text-xs text-slate-400">Try adjusting your exam category or year filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pyqs.map((pyq) => (
              <div key={pyq.id} className="glass p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {pyq.examName}
                    </span>
                    <span className="text-xs font-bold text-slate-300">{pyq.year}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white font-outfit">{pyq.subject}</h3>
                  <p className="text-xs text-slate-400">{pyq.topic || "Full Question Set with Solutions"}</p>
                </div>

                <Button
                  onClick={() => handleStartPyqMock(pyq)}
                  className="w-full rounded-xl font-bold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                  Attempt as Mock Test
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
