"use client"

import { Link } from "react-router-dom"
import { FileSpreadsheet, PlusCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentOcrStudio } from "@/components/ui/DocumentOcrStudio"

export default function QuestionPapersPage() {
  return (
    <div className="space-y-8 pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>Gemini Vision AI OCR Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 tracking-tight">
            Document, PDF & Image OCR Studio
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
            Convert scanned test papers, photos, handwritten notes, and PDF books into online text & structured questions.
          </p>
        </div>

        <Link to="/admin/exams/create">
          <Button className="btn-3d-green rounded-xl px-6 py-2.5 font-bold text-white shadow-md shadow-emerald-600/25">
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
