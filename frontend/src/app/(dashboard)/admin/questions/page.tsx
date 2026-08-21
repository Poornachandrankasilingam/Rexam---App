"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle, 
  FileText, 
  Sparkles, 
  X, 
  Check,
  Globe,
  Cpu,
  Layers,
  Wand2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type QuestionItem = {
  id: string
  subject: string
  topic: string
  difficulty: "Easy" | "Medium" | "Hard"
  text: string
  options: string[]
  correctIndex: number
  explanation: string
  language?: string
}

const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: "q-admin-1",
    subject: "Quantitative Aptitude",
    topic: "Percentages",
    difficulty: "Easy",
    text: "If A's salary is 25% more than B's salary, then by how much percentage is B's salary less than A's?",
    options: ["20%", "25%", "15%", "18%"],
    correctIndex: 0,
    explanation: "Percentage less = [25 / (100 + 25)] × 100 = (25 / 125) × 100 = 20%."
  },
  {
    id: "q-admin-2",
    subject: "Logical Reasoning",
    topic: "Syllogism",
    difficulty: "Medium",
    text: "Statements: All Men are Mortal. Socrates is a Man. Conclusion: Socrates is Mortal.",
    options: ["Valid", "Invalid", "Uncertain", "None of these"],
    correctIndex: 0,
    explanation: "Classic deductive syllogism: Major premise + Minor premise = Valid Conclusion."
  },
  {
    id: "q-admin-3",
    subject: "Verbal Ability",
    topic: "Synonyms",
    difficulty: "Easy",
    text: "Select the synonym for 'CANDID':",
    options: ["Frank", "Secretive", "Deceitful", "Shy"],
    correctIndex: 0,
    explanation: "'Candid' means truthful and straightforward; frank."
  },
  {
    id: "q-admin-4",
    subject: "General Awareness",
    topic: "Indian Polity",
    difficulty: "Medium",
    text: "भारतीय संविधान के किस अनुच्छेद में विधि के समक्ष समानता का अधिकार दिया गया है?",
    options: ["अनुच्छेद 14", "अनुच्छेद 19", "अनुच्छेद 21", "अनुच्छेद 32"],
    correctIndex: 0,
    explanation: "अनुच्छेद 14 कानून के समक्ष समानता और विधियों के समान संरक्षण का अधिकार देता है।",
    language: "Hindi / Devanagari"
  }
]

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  "Quantitative Aptitude": [
    "ALL",
    "Profit & Loss",
    "Speed, Time & Distance",
    "Simple & Compound Interest",
    "Time & Work",
    "Percentages & Ratio",
    "Number Systems",
    "Mensuration & Geometry"
  ],
  "Logical Reasoning": [
    "ALL",
    "Syllogism",
    "Blood Relations",
    "Coding-Decoding",
    "Number & Letter Series",
    "Direction Sense",
    "Seating Arrangement",
    "Analogy & Classification"
  ],
  "Verbal Ability": [
    "ALL",
    "Synonyms & Antonyms",
    "Grammar & Spotting Errors",
    "Sentence Improvement",
    "Idioms & Phrases",
    "Reading Comprehension"
  ],
  "General Awareness": [
    "ALL",
    "Indian Polity & Governance",
    "Indian History",
    "Geography & Environment",
    "General Science",
    "Current Affairs"
  ]
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(INITIAL_QUESTIONS)
  const [selectedSubject, setSelectedSubject] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [showOcrModal, setShowOcrModal] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)

  // Manual Question Form
  const [subject, setSubject] = useState("Quantitative Aptitude")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [text, setText] = useState("")
  const [opt0, setOpt0] = useState("")
  const [opt1, setOpt1] = useState("")
  const [opt2, setOpt2] = useState("")
  const [opt3, setOpt3] = useState("")
  const [correctIndex, setCorrectIndex] = useState(0)
  const [explanation, setExplanation] = useState("")

  // AI Generator State
  const [aiSubject, setAiSubject] = useState("Quantitative Aptitude")
  const [aiTopic, setAiTopic] = useState("ALL")
  const [aiDifficulty, setAiDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM")
  const [aiCount, setAiCount] = useState(5)
  const [aiLanguage, setAiLanguage] = useState("English")
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // OCR Modal States
  const [ocrText, setOcrText] = useState("")
  const [ocrError, setOcrError] = useState("")
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text || !opt0 || !opt1) return

    const newQ: QuestionItem = {
      id: `q-new-${Date.now()}`,
      subject,
      topic: topic || "General",
      difficulty,
      text,
      options: [opt0, opt1, opt2 || "Option C", opt3 || "Option D"],
      correctIndex: Number(correctIndex),
      explanation: explanation || "Verified standard answer key."
    }

    setQuestions(prev => [newQ, ...prev])
    setShowAddModal(false)
    resetForm()
    showToast("Added new question to repository!")
  }

  // Handle AI Question Generation
  const handleGenerateAi = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAiGenerating(true)

    try {
      const res = await api.post("/admin/questions/ai-generate", {
        subject: aiSubject,
        topic: aiTopic === "ALL" ? undefined : aiTopic,
        difficulty: aiDifficulty,
        count: aiCount,
        language: aiLanguage
      })

      if (res.data?.questions && res.data.questions.length > 0) {
        const generated: QuestionItem[] = res.data.questions.map((q: any, idx: number) => {
          const correctIdx = q.options.findIndex((o: any) => o.isCorrect)
          return {
            id: `ai-gen-${Date.now()}-${idx}`,
            subject: q.subject || aiSubject,
            topic: q.topic || "AI Generated",
            difficulty: q.difficulty === "HARD" ? "Hard" : q.difficulty === "EASY" ? "Easy" : "Medium",
            text: q.text,
            options: q.options.map((o: any) => o.text),
            correctIndex: correctIdx >= 0 ? correctIdx : 0,
            explanation: q.explanation || "Detailed step-by-step solution by Rexam AI.",
            language: q.language || aiLanguage
          }
        })

        setQuestions(prev => [...generated, ...prev])
        setShowAiModal(false)
        showToast(`✨ Generated ${generated.length} AI questions in ${aiSubject}!`)
      }
    } catch (err: any) {
      showToast("Failed to generate AI questions. Please try again.")
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleOcrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      setOcrText(content || `Uploaded: ${file.name}\n1. Sample Question from ${file.name}?\nA. Option A (correct)\nB. Option B\nC. Option C\nD. Option D`)
    }
    reader.readAsText(file)
  }

  const handleOcrUpload = async () => {
    if (!ocrText.trim()) return
    setIsOcrProcessing(true)
    setOcrError("")

    try {
      const res = await api.post("/admin/exams/ocr-extract", {
        textContent: ocrText,
        subject: "General Awareness"
      })

      if (res.data?.questions && res.data.questions.length > 0) {
        const extracted: QuestionItem[] = res.data.questions.map((q: any, idx: number) => {
          const correctIdx = q.options.findIndex((o: any) => o.isCorrect)
          return {
            id: `q-ocr-${Date.now()}-${idx}`,
            subject: q.subject || "General Awareness",
            topic: q.topic || "OCR Extraction",
            difficulty: q.difficulty === "HARD" ? "Hard" : q.difficulty === "EASY" ? "Easy" : "Medium",
            text: q.text,
            options: q.options.map((o: any) => o.text),
            correctIndex: correctIdx >= 0 ? correctIdx : 0,
            explanation: q.explanation || "Extracted via Universal Multilingual OCR.",
            language: res.data.detectedLanguage
          }
        })

        setQuestions(prev => [...extracted, ...prev])
        setShowOcrModal(false)
        setOcrText("")
        showToast(`Successfully extracted ${extracted.length} questions (${res.data.detectedLanguage})!`)
      }
    } catch (err: any) {
      setOcrError(err.response?.data?.message || "OCR extraction failed. Please check question paper format.")
    } finally {
      setIsOcrProcessing(false)
    }
  }

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
    showToast("Deleted question from repository")
  }

  const resetForm = () => {
    setText("")
    setTopic("")
    setOpt0("")
    setOpt1("")
    setOpt2("")
    setOpt3("")
    setExplanation("")
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSubject = selectedSubject === "ALL" || q.subject === selectedSubject
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.topic.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSubject && matchesSearch
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
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI Question Engine & Repository</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Question Bank & AI Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate dynamic exam questions for Quantitative Aptitude, Logical Reasoning, and Verbal Ability, or upload test papers via OCR.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button 
            onClick={() => setShowAiModal(true)}
            className="rounded-full px-5 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 text-white"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            AI Generate Questions
          </Button>

          <Button 
            onClick={() => setShowOcrModal(true)}
            variant="outline" 
            className="rounded-full px-5 border-dashed font-bold hover:border-primary/50"
          >
            <Upload className="h-4 w-4 mr-2 text-primary" />
            Universal OCR Upload
          </Button>

          <Button 
            onClick={() => setShowAddModal(true)}
            variant="secondary"
            className="rounded-full px-5 font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Manual
          </Button>
        </div>
      </div>

      {/* Search & Subject Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {(["ALL", "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "General Awareness"] as const).map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedSubject === subj
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {subj === "ALL" ? "All Subjects" : subj}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/40 border border-border/60 text-xs focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div key={q.id} className="glass p-6 rounded-3xl border border-white/10 space-y-4 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary">{q.subject} • {q.topic}</span>
                {q.language && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold">
                    {q.language}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  q.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                  q.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {q.difficulty}
                </span>
                <button 
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-muted-foreground hover:text-red-400 p-1 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="font-semibold text-sm text-foreground">Q{idx + 1}. {q.text}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {q.options.map((opt, oIdx) => (
                <div 
                  key={oIdx} 
                  className={`p-3 rounded-xl border ${
                    oIdx === q.correctIndex 
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold" 
                      : "bg-background/50 border-border/40 text-muted-foreground"
                  }`}
                >
                  {String.fromCharCode(65 + oIdx)}. {opt}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 text-xs text-muted-foreground border border-border/40">
              <span className="font-bold text-primary">Explanation: </span>
              <span>{q.explanation}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-xl w-full space-y-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setShowAiModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 mb-1">
                <Wand2 className="h-3.5 w-3.5" />
                <span>AI Question Generator</span>
              </div>
              <h3 className="text-2xl font-bold">Generate Questions via Rexam AI</h3>
              <p className="text-xs text-muted-foreground">Select your subject, targeted topic, difficulty, and quantity. Rexam AI creates exam-grade questions with solutions in seconds.</p>
            </div>

            <form onSubmit={handleGenerateAi} className="space-y-4 text-xs font-semibold">
              {/* Subject */}
              <div className="space-y-1">
                <label className="text-muted-foreground">Subject Area</label>
                <select
                  value={aiSubject}
                  onChange={(e) => {
                    setAiSubject(e.target.value)
                    setAiTopic("ALL")
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm focus:outline-none focus:border-indigo-400 font-bold"
                >
                  <option value="Quantitative Aptitude">Quantitative Aptitude (Mathematics & Calculation)</option>
                  <option value="Logical Reasoning">Logical Reasoning (Deduction, Series, Relations)</option>
                  <option value="Verbal Ability">Verbal Ability & Reasoning (English Grammar & Vocab)</option>
                  <option value="General Awareness">General Awareness (Polity, History, Science)</option>
                </select>
              </div>

              {/* Topic & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Target Topic</label>
                  <select
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                  >
                    {(TOPIC_SUGGESTIONS[aiSubject] || ["ALL"]).map(t => (
                      <option key={t} value={t}>{t === "ALL" ? "All Topics (Balanced Mix)" : t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Difficulty Level</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                  >
                    <option value="EASY">Easy (Beginner / Tier-1)</option>
                    <option value="MEDIUM">Medium (Standard Exam Level)</option>
                    <option value="HARD">Hard (Advanced Problem Solving)</option>
                  </select>
                </div>
              </div>

              {/* Count & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Number of Questions</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Language / Medium</label>
                  <select
                    value={aiLanguage}
                    onChange={(e) => setAiLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setShowAiModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isAiGenerating}
                  className="rounded-xl px-8 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isAiGenerating ? "Generating Questions..." : `Generate ${aiCount} Questions`}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manual Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-xl w-full space-y-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold">Add Question to Repository</h3>
              <p className="text-xs text-muted-foreground">Enter question text, options, and answer key explanation.</p>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Logical Reasoning">Logical Reasoning</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                    <option value="General Awareness">General Awareness</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Percentages"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Question Text</label>
                <textarea
                  rows={3}
                  placeholder="Enter full question text in any language..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Option A</label>
                  <input
                    type="text"
                    value={opt0}
                    onChange={(e) => setOpt0(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Option B</label>
                  <input
                    type="text"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Option C</label>
                  <input
                    type="text"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Option D</label>
                  <input
                    type="text"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Correct Option</label>
                <select
                  value={correctIndex}
                  onChange={(e) => setCorrectIndex(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-xs font-bold text-emerald-400"
                >
                  <option value={0}>Option A is Correct</option>
                  <option value={1}>Option B is Correct</option>
                  <option value={2}>Option C is Correct</option>
                  <option value={3}>Option D is Correct</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground">Step-by-Step Explanation</label>
                <textarea
                  rows={2}
                  placeholder="Enter detailed solution steps..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20">
                  Save Question
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* OCR Bulk Upload Modal */}
      {showOcrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-3xl border border-white/10 max-w-lg w-full space-y-5 relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setShowOcrModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">Universal Multilingual OCR Extraction</h3>
              <p className="text-xs text-muted-foreground">Upload test paper files or paste raw OCR text in any language (English, Hindi, Tamil, Telugu, Bilingual).</p>
            </div>

            {/* File Upload Box */}
            <div className="p-6 border-2 border-dashed border-primary/30 rounded-2xl text-center space-y-2 bg-primary/5">
              <input
                type="file"
                accept=".pdf,.docx,.txt,image/*"
                onChange={handleOcrFileUpload}
                className="block mx-auto text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">Supports PDF, DOCX, TXT, PNG, JPG, JPEG files</p>
            </div>

            {/* Text Paste Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Or Paste Raw Question Paper Text:</label>
              <textarea
                rows={6}
                placeholder="1. Question text here...&#10;(A) Option 1 (correct)&#10;(B) Option 2&#10;(C) Option 3&#10;(D) Option 4&#10;&#10;प्रश्न २: हिंदी प्रश्न यहाँ लिखें...&#10;(क) विकल्प १ (correct)&#10;(ख) विकल्प २"
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/80 text-foreground font-mono text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {ocrError && <p className="text-xs text-red-400 font-semibold">{ocrError}</p>}

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowOcrModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={handleOcrUpload} 
                disabled={isOcrProcessing || !ocrText.trim()}
                className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20"
              >
                <Cpu className="h-4 w-4 mr-2" />
                {isOcrProcessing ? "Extracting Multilingual..." : "Start Universal OCR Extraction"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
