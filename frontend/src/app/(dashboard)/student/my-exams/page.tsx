"use client"

import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Layers, Clock, Award, CheckCircle2, ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type AttemptItem = {
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

export default function MyExamsPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState<AttemptItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyResults()
  }, [])

  const fetchMyResults = async () => {
    try {
      setLoading(true)
      const res = await api.get("/student/results")
      setResults(res.data.results || [])
    } catch (err) {
      console.error("Failed to load my exams", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <Layers className="h-3.5 w-3.5" />
            <span>Attempt History & Scorecards</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">My Exams</h1>
          <p className="text-muted-foreground text-sm mt-1">Review all your completed examination attempts and detailed performance metrics.</p>
        </div>

        <Link to="/student/exams">
          <Button size="lg" className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
            <Play className="h-4 w-4 mr-2 fill-current" />
            Take Available Exam
          </Button>
        </Link>
      </div>

      <section className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-xl font-bold font-outfit text-white">Completed Exam Submissions</h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading attempt history...</div>
        ) : results.length === 0 ? (
          <div className="p-12 rounded-2xl bg-secondary/30 border border-white/5 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Layers className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No exams attempted yet.</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You haven&apos;t completed any tests under your account. Select an available exam or enter an exam code to start.
              </p>
            </div>
            <Link to="/student/exams" className="inline-block pt-2">
              <Button className="rounded-full px-8 py-5 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
                Browse Available Exams
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((res) => (
              <div key={res.id} className="p-5 rounded-2xl bg-secondary/30 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-500/40 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">
                      {res.code}
                    </span>
                    <span className="text-xs text-slate-400">Date: {new Date(res.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-base text-white font-outfit">{res.examTitle}</h4>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span>Correct: <strong className="text-emerald-400">{res.correct}</strong></span>
                    <span>Wrong: <strong className="text-rose-400">{res.incorrect}</strong></span>
                    <span>Duration: {res.timeSpent}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-blue-400">{res.score} / {res.totalMarks} pts</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {res.accuracy}% Accuracy
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/results`)}
                    className="rounded-xl font-bold border-white/20 text-xs"
                  >
                    View Scorecard
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
