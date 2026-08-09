"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PenTool, PlusCircle, Trash2, Clock, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type ExamItem = {
  id: string
  title: string
  code: string
  duration: number
  totalMarks: number
  _count: { questions: number; results: number }
  createdAt: string
}

export default function ManageExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/exams")
      setExams(res.data.exams || [])
    } catch (err) {
      console.error("Failed to fetch exams", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam and associated questions?")) return
    try {
      await api.delete(`/admin/exams/${id}`)
      setExams(exams.filter((e) => e.id !== id))
    } catch (err) {
      console.error("Failed to delete exam", err)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <PenTool className="h-3.5 w-3.5" />
            <span>Platform Examination Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Manage Examinations</h1>
          <p className="text-muted-foreground text-sm mt-1">Inspect, copy access codes, or manage published examinations.</p>
        </div>

        <Link to="/admin/exams/create">
          <Button size="lg" className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create & Publish Exam
          </Button>
        </Link>
      </div>

      <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading examinations...</div>
        ) : exams.length === 0 ? (
          <div className="p-12 rounded-2xl bg-secondary/30 border border-white/5 text-center space-y-3">
            <PenTool className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No exams created yet.</h3>
            <p className="text-xs text-slate-400">Click below to create your first examination using the OCR paper workflow.</p>
            <Link to="/admin/exams/create" className="inline-block pt-2">
              <Button className="rounded-full px-8 py-4 font-bold bg-blue-600 hover:bg-blue-500">
                Create Exam
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((ex) => (
              <div key={ex.id} className="p-5 rounded-2xl bg-secondary/30 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-blue-400 px-2.5 py-0.5 rounded bg-blue-500/10 flex items-center">
                      {ex.code}
                      <button onClick={() => copyCode(ex.code)} className="ml-2 text-slate-400 hover:text-white">
                        {copiedCode === ex.code ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </span>
                    <span className="text-xs text-slate-400">{ex.duration} mins</span>
                  </div>
                  <h3 className="font-bold text-base text-white font-outfit">{ex.title}</h3>
                  <p className="text-xs text-slate-400">{ex._count.questions} Questions | {ex.totalMarks} Total Marks</p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {ex._count.results} Submissions
                  </span>
                  <button onClick={() => handleDeleteExam(ex.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
