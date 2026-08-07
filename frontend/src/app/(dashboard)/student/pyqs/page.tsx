"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, 
  Download, 
  Play, 
  Search, 
  Calendar, 
  CheckCircle, 
  BookOpen, 
  Award, 
  X, 
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

type PYQItem = {
  id: string
  examCategory: "SSC" | "UPSC" | "Banking" | "Railways"
  title: string
  year: number
  shift: string
  totalQuestions: number
  marks: number
  downloadUrl: string
}

const PYQ_LIST: PYQItem[] = [
  {
    id: "pyq1",
    examCategory: "SSC",
    title: "SSC CGL Tier-1 Official Paper 2025",
    year: 2025,
    shift: "Shift 1 (08 Dec)",
    totalQuestions: 25,
    marks: 50,
    downloadUrl: "#"
  },
  {
    id: "pyq2",
    examCategory: "Banking",
    title: "IBPS PO Prelims Memory Based Paper",
    year: 2024,
    shift: "Shift 2 (14 Oct)",
    totalQuestions: 30,
    marks: 60,
    downloadUrl: "#"
  },
  {
    id: "pyq3",
    examCategory: "UPSC",
    title: "UPSC CSE Prelims GS Paper-1",
    year: 2024,
    shift: "Full Set",
    totalQuestions: 20,
    marks: 40,
    downloadUrl: "#"
  },
  {
    id: "pyq4",
    examCategory: "Railways",
    title: "RRB NTPC CBT-2 Stage Test",
    year: 2023,
    shift: "Shift 3 (22 Nov)",
    totalQuestions: 25,
    marks: 50,
    downloadUrl: "#"
  }
]

export default function StudentPYQsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [selectedYear, setSelectedYear] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // PDF Preview Modal State
  const [previewPaper, setPreviewPaper] = useState<PYQItem | null>(null)
  const [downloadToast, setDownloadToast] = useState<string | null>(null)

  const handleDownload = (paperTitle: string) => {
    setDownloadToast(`Started download for ${paperTitle}...`)
    setTimeout(() => setDownloadToast(null), 3000)
  }

  const filteredPapers = PYQ_LIST.filter(p => {
    const matchesCategory = selectedCategory === "ALL" || p.examCategory === selectedCategory
    const matchesYear = selectedYear === "ALL" || p.year.toString() === selectedYear
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.examCategory.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesYear && matchesSearch
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Download Toast */}
      <AnimatePresence>
        {downloadToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-semibold shadow-2xl flex items-center space-x-3 border border-emerald-400/40"
          >
            <Download className="h-5 w-5 animate-bounce" />
            <span>{downloadToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/10 via-background to-secondary/30">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
          <FileText className="h-3.5 w-3.5" />
          <span>Solved Previous Year Question Papers</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">PYQ Repository & Answer Keys</h1>
        <p className="text-muted-foreground text-sm mt-1">Access solved past papers with detailed step-by-step solutions or practice them online under real exam timing.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "SSC", "Banking", "UPSC", "Railways"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search PYQ paper..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/40 border border-border/60 text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* PYQ Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPapers.map((paper) => (
          <div 
            key={paper.id}
            className="glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {paper.examCategory} • {paper.year}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{paper.shift}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{paper.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Official question paper with verified answer keys & explanations.</p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold text-muted-foreground pt-2 border-t border-border/40">
                <span className="flex items-center space-x-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <span>{paper.totalQuestions} Questions</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  <span>{paper.marks} Marks</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Link to="/student/practice" className="flex-1">
                <Button className="w-full rounded-2xl py-5 font-bold shadow-md shadow-primary/20">
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Practice Online
                </Button>
              </Link>
              <Button 
                onClick={() => setPreviewPaper(paper)}
                variant="outline" 
                className="rounded-2xl py-5 font-bold px-4 border-border/80"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => handleDownload(paper.title)}
                variant="secondary" 
                className="rounded-2xl py-5 font-bold px-4"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Solution Preview Modal */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-xl w-full space-y-6 relative max-h-[85vh] overflow-y-auto"
          >
            <button 
              onClick={() => setPreviewPaper(null)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {previewPaper.examCategory} • {previewPaper.year}
              </span>
              <h3 className="text-xl font-bold">{previewPaper.title}</h3>
              <p className="text-xs text-muted-foreground">Sample solved questions from this paper:</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
                <p className="font-bold text-foreground">Q1. Solve: 15% of 400 + 25% of 800 = ?</p>
                <p className="text-emerald-400 font-semibold">Answer: 260</p>
                <p className="text-muted-foreground">Solution: (15/100 × 400) + (25/100 × 800) = 60 + 200 = 260.</p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 space-y-2">
                <p className="font-bold text-foreground">Q2. Statements: All A are B. Some B are C.</p>
                <p className="text-emerald-400 font-semibold">Answer: Some B are A follows.</p>
                <p className="text-muted-foreground">Solution: Since all A are B, the converse statement 'Some B are A' is logically valid.</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
              <Button variant="ghost" onClick={() => setPreviewPaper(null)} className="rounded-xl">
                Close
              </Button>
              <Button onClick={() => { handleDownload(previewPaper.title); setPreviewPaper(null); }} className="rounded-xl font-bold">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
