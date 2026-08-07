"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  PenTool, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Copy, 
  Eye, 
  X, 
  Check, 
  Award, 
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"

type AdminExam = {
  id: string
  code: string
  title: string
  subject: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passingMarks: number
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"
  candidatesCount: number
}

const INITIAL_ADMIN_EXAMS: AdminExam[] = [
  {
    id: "ae1",
    code: "SSC-CGL-01",
    title: "SSC CGL Tier-1 Official Mock",
    subject: "Staff Selection Commission",
    duration: 60,
    totalQuestions: 25,
    totalMarks: 50,
    passingMarks: 20,
    status: "PUBLISHED",
    candidatesCount: 1240
  },
  {
    id: "ae2",
    code: "UPSC-GS-01",
    title: "UPSC Prelims GS Mock Series 2026",
    subject: "Civil Services Exam",
    duration: 120,
    totalQuestions: 40,
    totalMarks: 100,
    passingMarks: 40,
    status: "PUBLISHED",
    candidatesCount: 4500
  },
  {
    id: "ae3",
    code: "RRB-GROUP-D",
    title: "Railway Group D Special Set A",
    subject: "Indian Railways Exam",
    duration: 90,
    totalQuestions: 30,
    totalMarks: 60,
    passingMarks: 24,
    status: "DRAFT",
    candidatesCount: 0
  }
]

export default function AdminExamsPage() {
  const [exams, setExams] = useState<AdminExam[]>(INITIAL_ADMIN_EXAMS)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)

  // Form Fields
  const [formTitle, setFormTitle] = useState("")
  const [formCode, setFormCode] = useState("")
  const [formSubject, setFormSubject] = useState("")
  const [formDuration, setFormDuration] = useState(60)
  const [formTotalQuestions, setFormTotalQuestions] = useState(25)
  const [formTotalMarks, setFormTotalMarks] = useState(50)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleOpenCreateModal = () => {
    setEditingExamId(null)
    setFormTitle("")
    setFormCode("")
    setFormSubject("Quantitative Aptitude")
    setFormDuration(60)
    setFormTotalQuestions(25)
    setFormTotalMarks(50)
    setShowCreateModal(true)
  }

  const handleOpenEditModal = (exam: AdminExam) => {
    setEditingExamId(exam.id)
    setFormTitle(exam.title)
    setFormCode(exam.code)
    setFormSubject(exam.subject)
    setFormDuration(exam.duration)
    setFormTotalQuestions(exam.totalQuestions)
    setFormTotalMarks(exam.totalMarks)
    setShowCreateModal(true)
  }

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formCode) return

    if (editingExamId) {
      setExams(prev => prev.map(ex => ex.id === editingExamId ? {
        ...ex,
        title: formTitle,
        code: formCode.toUpperCase(),
        subject: formSubject,
        duration: Number(formDuration),
        totalQuestions: Number(formTotalQuestions),
        totalMarks: Number(formTotalMarks),
      } : ex))
      showToast(`Updated examination ${formTitle}!`)
    } else {
      const newExam: AdminExam = {
        id: `ae-${Date.now()}`,
        code: formCode.toUpperCase(),
        title: formTitle,
        subject: formSubject,
        duration: Number(formDuration),
        totalQuestions: Number(formTotalQuestions),
        totalMarks: Number(formTotalMarks),
        passingMarks: Math.round(Number(formTotalMarks) * 0.4),
        status: "PUBLISHED",
        candidatesCount: 0
      }
      setExams(prev => [newExam, ...prev])
      showToast(`Successfully created examination ${formTitle}!`)
    }

    setShowCreateModal(false)
  }

  const handleToggleStatus = (examId: string) => {
    setExams(prev => prev.map(ex => {
      if (ex.id === examId) {
        const nextStatus = ex.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
        showToast(`Changed status of ${ex.title} to ${nextStatus}`)
        return { ...ex, status: nextStatus }
      }
      return ex
    }))
  }

  const handleDeleteExam = (examId: string, title: string) => {
    setExams(prev => prev.filter(ex => ex.id !== examId))
    showToast(`Deleted ${title}`)
  }

  const handleDuplicateExam = (exam: AdminExam) => {
    const dup: AdminExam = {
      ...exam,
      id: `ae-dup-${Date.now()}`,
      code: `${exam.code}-COPY`,
      title: `${exam.title} (Copy)`,
      status: "DRAFT",
      candidatesCount: 0
    }
    setExams(prev => [dup, ...prev])
    showToast(`Duplicated ${exam.title}`)
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
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Examinations</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure CBT exam papers, adjust pass criteria, publish test series, and track candidate registrations.</p>
        </div>

        <Button 
          onClick={handleOpenCreateModal}
          size="lg" 
          className="rounded-full px-6 shadow-lg shadow-primary/20 font-bold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Exam
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2">
          {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterStatus === st
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "ALL" ? "All Statuses" : st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exam code or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/40 border border-border/60 text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Exam Management Table */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-secondary/40 text-muted-foreground text-xs">
                <th className="px-6 py-4 font-semibold">Exam Code & Title</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Duration / Marks</th>
                <th className="px-6 py-4 font-semibold">Candidates</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      {exam.code}
                    </span>
                    <p className="font-bold text-foreground text-sm mt-1">{exam.title}</p>
                  </td>

                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{exam.subject}</td>

                  <td className="px-6 py-4 text-xs font-medium space-y-1">
                    <p className="text-foreground">{exam.duration} Mins • {exam.totalQuestions} Qs</p>
                    <p className="text-muted-foreground">{exam.totalMarks} Marks (Pass: {exam.passingMarks})</p>
                  </td>

                  <td className="px-6 py-4 font-extrabold text-foreground">{exam.candidatesCount} Aspirants</td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(exam.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        exam.status === "PUBLISHED" 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}
                    >
                      {exam.status}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        onClick={() => handleOpenEditModal(exam)}
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl px-2.5"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => handleDuplicateExam(exam)}
                        variant="secondary" 
                        size="sm" 
                        className="rounded-xl px-2.5"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => handleDeleteExam(exam.id, exam.title)}
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl px-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-lg w-full space-y-6 relative"
          >
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold">{editingExamId ? "Edit Examination" : "Create New Examination"}</h3>
              <p className="text-xs text-muted-foreground">Specify exam code, question limits, and duration.</p>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Exam Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SSC-CGL-02"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm font-mono font-bold uppercase focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Subject / Stream</label>
                  <input
                    type="text"
                    placeholder="e.g. Quantitative Aptitude"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. Comprehensive Placement Mock 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Duration (Mins)</label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Total Questions</label>
                  <input
                    type="number"
                    value={formTotalQuestions}
                    onChange={(e) => setFormTotalQuestions(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Total Marks</label>
                  <input
                    type="number"
                    value={formTotalMarks}
                    onChange={(e) => setFormTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20">
                  {editingExamId ? "Save Changes" : "Create Exam"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
