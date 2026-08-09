"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusCircle, Upload, FileText, Cpu, CheckCircle2, Trash2, Key, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type ParsedQuestion = {
  text: string
  subject: string
  difficulty: string
  marks: number
  explanation: string
  options: Array<{ text: string; isCorrect: boolean }>
}

export default function CreateExamPage() {
  const navigate = useNavigate()

  // Step 1: Meta, Step 2: Upload/OCR, Step 3: Question Review
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Meta state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState(60)
  const [totalMarks, setTotalMarks] = useState(100)
  const [passingMarks, setPassingMarks] = useState(40)

  // OCR Upload state
  const [rawText, setRawText] = useState("")
  const [extracting, setExtracting] = useState(false)
  const [ocrMsg, setOcrMsg] = useState("")

  // Parsed Questions state
  const [questions, setQuestions] = useState<ParsedQuestion[]>([])
  const [saving, setSaving] = useState(false)
  const [publishedCode, setPublishedCode] = useState<string | null>(null)

  // Run OCR processing
  const handleProcessOcr = async () => {
    if (!rawText.trim()) return
    setExtracting(true)
    setOcrMsg("")
    try {
      const res = await api.post("/admin/exams/ocr-extract", {
        textContent: rawText,
        subject: "General Awareness"
      })
      if (res.data?.questions) {
        setQuestions(res.data.questions)
        setStep(3)
      }
    } catch (err: any) {
      setOcrMsg("OCR processing failed. Please verify raw question paper text format.")
    } finally {
      setExtracting(false)
    }
  }

  // File Upload handler (PDF/DOCX/Image text simulation)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      setRawText(content || `Sample Question Paper Loaded from file: ${file.name}\n1. What is the chemical symbol for Gold?\nA. Au (correct)\nB. Ag\nC. Fe\nD. Cu\nExplanation: Au is derived from Latin Aurum.`)
    }
    reader.readAsText(file)
  }

  // Save & Publish Exam
  const handlePublishExam = async () => {
    if (!title || questions.length === 0) return
    setSaving(true)
    try {
      const res = await api.post("/admin/exams/create", {
        title,
        description,
        duration,
        totalMarks,
        passingMarks,
        questions
      })
      if (res.data?.exam) {
        setPublishedCode(res.data.exam.code)
      }
    } catch (err) {
      console.error("Failed to create exam", err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCustomQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "New Custom Question Text",
        subject: "General Awareness",
        difficulty: "MEDIUM",
        marks: 1,
        explanation: "Solution explanation here.",
        options: [
          { text: "Option A", isCorrect: true },
          { text: "Option B", isCorrect: false },
          { text: "Option C", isCorrect: false },
          { text: "Option D", isCorrect: false }
        ]
      }
    ])
  }

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-indigo-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Admin Workflow</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Create & Publish Examination</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload question papers (PDF, DOCX, Image), run OCR extraction, review questions, and generate access codes.</p>
        </div>
      </div>

      {publishedCode ? (
        /* Published Success Card */
        <div className="glass p-10 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-6">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-outfit">Exam Published Successfully!</h2>
            <p className="text-xs text-slate-300">Students can now enter this unique access code in their CBT portal to take the exam.</p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/50 border border-white/10 max-w-xs mx-auto space-y-1">
            <p className="text-xs text-slate-400 font-semibold">Generated Unique Access Code</p>
            <p className="text-2xl font-mono font-extrabold text-emerald-400 tracking-widest">{publishedCode}</p>
          </div>

          <div className="pt-2 flex justify-center space-x-4">
            <Button onClick={() => navigate("/admin/exams")} className="rounded-full px-8 font-bold bg-blue-600 hover:bg-blue-500">
              Manage All Exams
            </Button>
          </div>
        </div>
      ) : (
        <div className="glass p-8 rounded-3xl border border-white/10 space-y-8">
          {/* Progress Steps Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 text-xs font-bold">
            <span className={`px-4 py-2 rounded-full ${step === 1 ? "bg-blue-600 text-white" : "bg-secondary text-slate-400"}`}>
              1. Basic Details
            </span>
            <span className={`px-4 py-2 rounded-full ${step === 2 ? "bg-blue-600 text-white" : "bg-secondary text-slate-400"}`}>
              2. Upload & OCR Processing
            </span>
            <span className={`px-4 py-2 rounded-full ${step === 3 ? "bg-blue-600 text-white" : "bg-secondary text-slate-400"}`}>
              3. Review & Publish
            </span>
          </div>

          {/* STEP 1: BASIC DETAILS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Title</label>
                <input
                  type="text"
                  placeholder="e.g. SSC CGL Tier 1 Mock Test 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Exam Description</label>
                <textarea
                  rows={3}
                  placeholder="Instructions or syllabus overview for candidates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Duration (Mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Passing Marks</label>
                  <input
                    type="number"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-secondary/50 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button disabled={!title.trim()} onClick={() => setStep(2)} className="rounded-2xl px-8 font-bold bg-blue-600 hover:bg-blue-500">
                  Continue to Question Upload
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: UPLOAD & OCR */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl border-2 border-dashed border-blue-500/40 bg-blue-950/10 text-center space-y-4">
                <Upload className="h-10 w-10 text-blue-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Upload Question Paper File (PDF, DOCX, Image)</h3>
                  <p className="text-xs text-slate-400">Select file to automatically parse text content into OCR Engine.</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,image/*"
                  onChange={handleFileUpload}
                  className="block mx-auto text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Question Paper Text Content (OCR Raw Feed)</label>
                <textarea
                  rows={8}
                  placeholder="Paste question paper text here, e.g.&#10;1. Which organ pumps blood in human body?&#10;A. Heart (correct)&#10;B. Brain&#10;C. Liver&#10;D. Lungs"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {ocrMsg && <p className="text-xs text-rose-400 font-semibold">{ocrMsg}</p>}

              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-2xl">Back</Button>
                <Button disabled={extracting || !rawText.trim()} onClick={handleProcessOcr} className="rounded-2xl px-8 font-bold bg-blue-600 hover:bg-blue-500">
                  <Cpu className="h-4 w-4 mr-2" />
                  {extracting ? "Running OCR..." : "Extract Questions via OCR"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & PUBLISH */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-outfit">Extracted Questions ({questions.length})</h3>
                  <p className="text-xs text-slate-400">Review, edit, or remove questions before final publication.</p>
                </div>
                <Button size="sm" onClick={handleAddCustomQuestion} variant="outline" className="rounded-xl text-xs font-bold">
                  + Add Question
                </Button>
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="p-5 rounded-2xl bg-secondary/30 border border-white/10 space-y-3 relative group">
                    <button
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-blue-400 font-outfit">Question {qIdx + 1}</span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions]
                          updated[qIdx].text = e.target.value
                          setQuestions(updated)
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => {
                              const updated = [...questions]
                              updated[qIdx].options.forEach((o, i) => o.isCorrect = i === optIdx)
                              setQuestions(updated)
                            }}
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...questions]
                              updated[qIdx].options[optIdx].text = e.target.value
                              setQuestions(updated)
                            }}
                            className={`w-full px-3 py-1.5 rounded-xl border text-xs ${opt.isCorrect ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-bold" : "bg-secondary/30 border-white/5 text-slate-300"}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-2xl">Back to OCR</Button>
                <Button
                  disabled={saving || questions.length === 0}
                  onClick={handlePublishExam}
                  size="lg"
                  className="rounded-2xl px-8 font-bold bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/25"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {saving ? "Publishing..." : "Generate Code & Publish Exam"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
