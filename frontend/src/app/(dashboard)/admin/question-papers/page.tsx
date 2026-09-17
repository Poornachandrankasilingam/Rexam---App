"use client"

import { Link } from "react-router-dom"
import { FileSpreadsheet, PlusCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentOcrStudio } from "@/components/ui/DocumentOcrStudio"

export default function QuestionPapersPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-background to-teal-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Gemini Vision AI OCR Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white tracking-tight">
            Document, PDF & Image OCR Studio
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Convert scanned test papers, photos, handwritten notes, and PDF books into online text & structured questions.
          </p>
        </div>

        <Link to="/admin/exams/create">
          <Button className="rounded-2xl px-6 py-2.5 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </Link>
      </div>

      {/* Main Studio Interface */}
      <DocumentOcrStudio />
    </div>
  )
}
