"use client"

import React, { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { 
  FileText, 
  Upload, 
  Camera, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  Layers, 
  Loader2, 
  RotateCcw,
  Zap,
  Globe,
  FileSpreadsheet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

interface ExtractedQuestion {
  text: string
  subject: string
  topic?: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  marks: number
  negativeMarks: number
  explanation: string
  options: Array<{ text: string; isCorrect: boolean }>
  detectedLanguage?: string
}

interface OcrResult {
  success: boolean
  totalExtracted: number
  detectedLanguage: string
  questions: ExtractedQuestion[]
  rawTextPreview: string
  warnings: string[]
}

export function DocumentOcrStudio() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)
  const [activeTab, setActiveTab] = useState<"TEXT" | "QUESTIONS">("TEXT")
  const [copied, setCopied] = useState(false)
  const [subject, setSubject] = useState("Quantitative Aptitude")
  const [isCameraActive, setIsCameraActive] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
    setOcrResult(null)
  }

  // Camera capture
  const startCamera = async () => {
    try {
      setIsCameraActive(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (e) {
      alert("Unable to access camera. Please check browser permissions.")
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL("image/jpeg")
      setFilePreview(dataUrl)

      // Stop camera stream
      const stream = video.srcObject as MediaStream
      stream?.getTracks().forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  const handleRunOcr = async () => {
    if (!selectedFile && !filePreview) return

    setIsProcessing(true)

    try {
      let base64Data = filePreview || ""
      let mimeType = selectedFile?.type || "image/jpeg"

      if (!base64Data && selectedFile) {
        base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(selectedFile)
        })
      }

      const res = await api.post("/admin/ocr/extract", {
        fileBase64: base64Data,
        mimeType,
        subject
      })

      setOcrResult(res.data)
      if (res.data.questions && res.data.questions.length > 0) {
        setActiveTab("QUESTIONS")
      }
    } catch (err: any) {
      console.error("OCR Extraction failed:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyFullText = () => {
    if (ocrResult?.rawTextPreview) {
      navigator.clipboard.writeText(ocrResult.rawTextPreview)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadTextFile = () => {
    if (!ocrResult?.rawTextPreview) return
    const blob = new Blob([ocrResult.rawTextPreview], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `rexam-ocr-extracted-${Date.now()}.txt`
    link.click()
  }

  const handleCreateExamFromOcr = () => {
    if (!ocrResult || !ocrResult.questions) return
    localStorage.setItem("rexam_ocr_prefill_questions", JSON.stringify(ocrResult.questions))
    navigate("/admin/exams/create")
  }

  return (
    <div className="space-y-8">
      {/* Upload / Capture Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Uploader Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Upload Paper / Image</span>
              </h3>
              <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Gemini Vision AI
              </span>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">Exam Subject / Domain</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Logical Reasoning">Logical Reasoning</option>
                <option value="English & Verbal Ability">English & Verbal Ability</option>
                <option value="General Awareness & Science">General Awareness & Science</option>
                <option value="General Studies / UPSC">General Studies / UPSC</option>
                <option value="Engineering & Technology">Engineering & Technology</option>
              </select>
            </div>

            {/* Drag & Drop Area */}
            {!isCameraActive ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-emerald-50/30 space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {filePreview ? (
                  <div className="space-y-2">
                    <img
                      src={filePreview}
                      alt="Paper Preview"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-slate-200"
                    />
                    <p className="text-xs font-bold text-slate-700">Click to replace file</p>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-2 py-4">
                    <FileText className="h-10 w-10 text-emerald-600 mx-auto" />
                    <p className="text-xs font-black text-slate-900">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{Math.round(selectedFile.size / 1024)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-black text-slate-900">Click to browse or drop file here</p>
                    <p className="text-[10px] text-slate-500 font-medium">Supports PDF, PNG, JPG, WEBP question sheets</p>
                  </div>
                )}
              </div>
            ) : (
              /* Live Camera View */
              <div className="space-y-3">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl border border-slate-200 bg-black aspect-video object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <Button onClick={capturePhoto} className="btn-3d-green w-full rounded-xl font-bold text-white">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
                className="flex-1 rounded-xl text-xs font-bold border-slate-200 text-slate-800 hover:bg-slate-50"
              >
                <Camera className="h-4 w-4 mr-2 text-emerald-600" />
                Use Camera
              </Button>

              <Button
                onClick={handleRunOcr}
                disabled={(!selectedFile && !filePreview) || isProcessing}
                className="flex-1 btn-3d-green rounded-xl font-bold text-white shadow-md shadow-emerald-600/25 text-xs"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Text...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2 fill-current" />
                    Extract Online Text
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Results Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5 min-h-[460px] flex flex-col justify-between">
            {/* Header & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab("TEXT")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === "TEXT"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Online Plain Text
                </button>
                <button
                  onClick={() => setActiveTab("QUESTIONS")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === "QUESTIONS"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Structured Questions ({ocrResult?.totalExtracted || 0})
                </button>
              </div>

              {ocrResult && (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                    <Globe className="h-3 w-3 inline mr-1" />
                    {ocrResult.detectedLanguage}
                  </span>
                  <button
                    onClick={copyFullText}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1"
                    title="Copy extracted text"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={downloadTextFile}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                    title="Download as .txt"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 py-2 overflow-y-auto max-h-[380px] custom-scrollbar">
              {!ocrResult ? (
                <div className="py-20 text-center space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">No Document Processed Yet</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                    Upload a question paper image, PDF, or take a photo to extract text, mathematical formulas, and structured questions online.
                  </p>
                </div>
              ) : activeTab === "TEXT" ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {ocrResult.rawTextPreview}
                </div>
              ) : (
                /* Structured Questions List */
                <div className="space-y-4">
                  {ocrResult.questions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-black">
                          Q{idx + 1}
                        </span>
                        <span className="text-emerald-700">Marks: +{q.marks} | -{q.negativeMarks}</span>
                      </div>

                      <h5 className="text-xs sm:text-sm font-black text-slate-900 font-outfit">{q.text}</h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                              opt.isCorrect
                                ? "bg-emerald-100/70 border-emerald-300 text-emerald-900"
                                : "bg-white border-slate-200 text-slate-800"
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                            {opt.isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 flex-shrink-0" />}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700">
                          <span className="font-bold text-emerald-800">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {ocrResult && ocrResult.questions.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {ocrResult.totalExtracted} Questions ready for publishing
                </span>

                <Button
                  onClick={handleCreateExamFromOcr}
                  className="btn-3d-green rounded-xl font-bold text-white text-xs px-6"
                >
                  <span>Create Exam with these Questions</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
