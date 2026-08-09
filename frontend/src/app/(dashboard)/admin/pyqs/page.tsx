"use client"

import { useEffect, useState } from "react"
import { FileText, PlusCircle, Trash2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type PyqItem = {
  id: string
  examName: string
  year: number
  subject: string
  topic?: string
}

export default function AdminPyqsPage() {
  const [pyqs, setPyqs] = useState<PyqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [examName, setExamName] = useState("SSC CGL")
  const [year, setYear] = useState(2024)
  const [subject, setSubject] = useState("General Awareness")
  const [topic, setTopic] = useState("Full Paper")

  useEffect(() => {
    fetchPyqs()
  }, [])

  const fetchPyqs = async () => {
    try {
      setLoading(true)
      const res = await api.get("/admin/pyqs")
      setPyqs(res.data.pyqs || [])
    } catch (err) {
      console.error("Failed to load PYQs", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePyq = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post("/admin/pyqs", { examName, year, subject, topic })
      if (res.data?.pyq) {
        setPyqs([res.data.pyq, ...pyqs])
        setShowModal(false)
      }
    } catch (err) {
      console.error("Failed to create PYQ", err)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <FileText className="h-3.5 w-3.5" />
            <span>PYQ Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Previous Year Papers Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Add, edit, categorize, or delete previous year exam paper sets.</p>
        </div>

        <Button onClick={() => setShowModal(true)} size="lg" className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Previous Year Paper
        </Button>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading PYQs...</div>
        ) : pyqs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="font-bold text-white">No previous year papers added yet.</p>
            <p className="text-xs">Click above to add papers for SSC, TNPSC, UPSC, Banking, or Railway.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pyqs.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-secondary/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">{p.examName}</span>
                  <span className="font-bold text-slate-300">{p.year}</span>
                </div>
                <h4 className="font-bold text-base text-white font-outfit">{p.subject}</h4>
                <p className="text-xs text-slate-400">{p.topic || "Full Question Paper"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePyq} className="glass p-8 rounded-3xl border border-white/20 max-w-md w-full space-y-4 bg-background">
            <h3 className="text-xl font-bold text-white font-outfit">Add Previous Year Paper</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Exam Category</label>
              <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs" />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl text-xs">Cancel</Button>
              <Button type="submit" className="rounded-xl text-xs bg-blue-600 hover:bg-blue-500 font-bold">Save PYQ</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
