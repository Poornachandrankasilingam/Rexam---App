"use client"

import { Link } from "react-router-dom"
import { FileSpreadsheet, PlusCircle, Cpu, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function QuestionPapersPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>OCR Paper Repository</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Question Papers Repository</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload and manage raw question papers for automated AI OCR extraction.</p>
        </div>

        <Link to="/admin/exams/create">
          <Button size="lg" className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25">
            <PlusCircle className="h-4 w-4 mr-2" />
            Upload New Paper
          </Button>
        </Link>
      </div>

      <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-4">
        <Cpu className="h-12 w-12 text-blue-400 mx-auto" />
        <h3 className="text-lg font-bold text-white font-outfit">Integrated OCR Question Paper Ingestion</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Rexam OCR supports PDF, DOCX, and scanned images. Select &quot;Create & Publish Exam&quot; to run question extraction.
        </p>
      </div>
    </div>
  )
}
