"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Play, 
  Layers, 
  Sliders, 
  Award, 
  Zap, 
  ChevronRight, 
  Check, 
  BarChart3,
  Bookmark
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Types
type Question = {
  id: string
  subject: "Quantitative Aptitude" | "Logical Reasoning" | "Verbal Ability" | "Data Interpretation"
  topic: string
  difficulty: "Easy" | "Medium" | "Hard"
  text: string
  options: string[]
  correctIndex: number
  explanation: string
}

type TestState = "CONFIG" | "TEST" | "RESULT"

// Predefined Aptitude Question Bank
const QUESTION_BANK: Question[] = [
  {
    id: "q1",
    subject: "Quantitative Aptitude",
    topic: "Percentages",
    difficulty: "Easy",
    text: "A worker's salary was increased by 20% and then decreased by 20%. What is the net percentage change in salary?",
    options: ["No change", "4% decrease", "4% increase", "2% decrease"],
    correctIndex: 1,
    explanation: "Net Change = A + B + (A × B)/100 = 20 - 20 + (20 × -20)/100 = -4% (a 4% decrease)."
  },
  {
    id: "q2",
    subject: "Quantitative Aptitude",
    topic: "Time & Work",
    difficulty: "Medium",
    text: "A can complete a piece of work in 10 days and B can complete the same work in 15 days. How many days will they take to complete it together?",
    options: ["5 days", "6 days", "7.5 days", "8 days"],
    correctIndex: 1,
    explanation: "Work per day: A = 1/10, B = 1/15. Together per day = 1/10 + 1/15 = (3 + 2)/30 = 5/30 = 1/6. Total time = 6 days."
  },
  {
    id: "q3",
    subject: "Quantitative Aptitude",
    topic: "Profit & Loss",
    difficulty: "Easy",
    text: "An article is sold for ₹720 at a profit of 20%. What was its cost price?",
    options: ["₹550", "₹600", "₹640", "₹650"],
    correctIndex: 1,
    explanation: "Selling Price = CP × (1 + Profit%). ₹720 = CP × 1.2 ⇒ Cost Price = 720 / 1.2 = ₹600."
  },
  {
    id: "q4",
    subject: "Quantitative Aptitude",
    topic: "Speed & Distance",
    difficulty: "Medium",
    text: "A train running at 72 km/h passes a telegraph pole in 15 seconds. What is the length of the train?",
    options: ["300 meters", "250 meters", "360 meters", "200 meters"],
    correctIndex: 0,
    explanation: "Speed in m/s = 72 × (5/18) = 20 m/s. Distance (length) = Speed × Time = 20 m/s × 15 s = 300 meters."
  },
  {
    id: "q5",
    subject: "Quantitative Aptitude",
    topic: "Ratio & Proportion",
    difficulty: "Easy",
    text: "If A : B = 2 : 3 and B : C = 4 : 5, find the ratio A : B : C.",
    options: ["8 : 12 : 15", "6 : 9 : 10", "2 : 3 : 5", "8 : 10 : 15"],
    correctIndex: 0,
    explanation: "Multiply A:B by 4 ⇒ 8 : 12. Multiply B:C by 3 ⇒ 12 : 15. Thus A : B : C = 8 : 12 : 15."
  },
  {
    id: "q6",
    subject: "Logical Reasoning",
    topic: "Number Series",
    difficulty: "Medium",
    text: "Find the next number in the given series: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correctIndex: 1,
    explanation: "The differences are +4, +6, +8, +10, +12. So, 30 + 12 = 42."
  },
  {
    id: "q7",
    subject: "Logical Reasoning",
    topic: "Syllogism",
    difficulty: "Hard",
    text: "Statements: All cats are dogs. All dogs are birds.\nConclusions: I. All cats are birds. II. Some birds are cats.",
    options: ["Only Conclusion I follows", "Only Conclusion II follows", "Both Conclusions I and II follow", "Neither follows"],
    correctIndex: 2,
    explanation: "All cats are dogs + All dogs are birds ⇒ All cats are birds (Conclusion I follows). Since all cats are birds, some birds are cats (Conclusion II follows)."
  },
  {
    id: "q8",
    subject: "Logical Reasoning",
    topic: "Blood Relations",
    difficulty: "Medium",
    text: "Pointing to a photograph, Rohit said, 'She is the mother of my father\'s only daughter.' How is the lady related to Rohit?",
    options: ["Sister", "Mother", "Aunt", "Grandmother"],
    correctIndex: 1,
    explanation: "Rohit's father's only daughter is Rohit's sister. The mother of Rohit's sister is Rohit's mother."
  },
  {
    id: "q9",
    subject: "Logical Reasoning",
    topic: "Coding-Decoding",
    difficulty: "Medium",
    text: "If 'COMPUTER' is written as 'RFUVQNPC', how is 'MEDICINE' written in that code?",
    options: ["EOJDEJFM", "EOJDJEFM", "MFEDICIN", "EOJDJEMF"],
    correctIndex: 1,
    explanation: "Reverse the letters and add +1 to middle letters: COMPUTER -> reverse -> R E T U P M O C; shift inner letters +1."
  },
  {
    id: "q10",
    subject: "Verbal Ability",
    topic: "Antonyms",
    difficulty: "Easy",
    text: "Choose the antonym for the word 'EPHEMERAL':",
    options: ["Permanent", "Transient", "Short-lived", "Fragile"],
    correctIndex: 0,
    explanation: "'Ephemeral' means lasting for a very short time. The opposite (antonym) is 'Permanent'."
  },
  {
    id: "q11",
    subject: "Verbal Ability",
    topic: "Sentence Correction",
    difficulty: "Medium",
    text: "Which of the following sentences is grammatically correct?",
    options: [
      "Neither of the two candidates have completed their application.",
      "Neither of the two candidates has completed his application.",
      "Neither candidate are completing their application.",
      "Neither of two candidates has complete application."
    ],
    correctIndex: 1,
    explanation: "'Neither' is singular and takes a singular verb ('has') and singular pronoun ('his')."
  },
  {
    id: "q12",
    subject: "Data Interpretation",
    topic: "Pie Chart Analysis",
    difficulty: "Hard",
    text: "In a company of 500 employees, 36% are in IT, 24% in Sales, 20% in HR, and 20% in Finance. How many more employees are in IT than in HR?",
    options: ["60", "80", "100", "50"],
    correctIndex: 0,
    explanation: "IT difference from HR = 36% - 20% = 16%. 16% of 500 = 0.16 × 500 = 80 employees."
  }
]

// Featured Promoted Mock Tests
const PROMOTED_MOCKS = [
  {
    id: "pm1",
    title: "Quantitative Aptitude Speed Sprint",
    subject: "Quantitative Aptitude" as const,
    questionsCount: 5,
    timeLimitMins: 5,
    difficulty: "Medium" as const,
    badge: "🔥 Hot Pick",
    description: "High-yield Speed Math, Profit & Loss, and Percentages for campus placements."
  },
  {
    id: "pm2",
    title: "Logical & Analytical Reasoning Mastery",
    subject: "Logical Reasoning" as const,
    questionsCount: 4,
    timeLimitMins: 5,
    difficulty: "Hard" as const,
    badge: "🏆 Top Rated",
    description: "Challenge yourself with Syllogisms, Series, and Blood Relation puzzles."
  },
  {
    id: "pm3",
    title: "Full Placement Aptitude Mock Test",
    subject: "All" as const,
    questionsCount: 8,
    timeLimitMins: 10,
    difficulty: "Medium" as const,
    badge: "⚡ Full Mock",
    description: "All-rounder Aptitude Mock covering Quant, Reasoning, Verbal & DI."
  }
]

export default function StudentPracticePage() {
  const [testState, setTestState] = useState<TestState>("CONFIG")
  const [activeTab, setActiveTab] = useState<"CUSTOM" | "PROMOTED" | "BANK">("CUSTOM")

  // Custom Generator Settings
  const [selectedSubject, setSelectedSubject] = useState<string>("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All")
  const [questionCount, setQuestionCount] = useState<number>(5)
  const [timeLimit, setTimeLimit] = useState<number>(5) // mins

  // Active Test Runtime State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([])
  const [currentQIndex, setCurrentQIndex] = useState<number>(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({})
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(300)
  const [testTitle, setTestTitle] = useState<string>("Custom Aptitude Test")

  // Timer Effect
  useEffect(() => {
    if (testState !== "TEST") return
    if (timeLeftSeconds <= 0) {
      handleSubmitTest()
      return
    }
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [testState, timeLeftSeconds])

  // Generate & Start Custom Test
  const handleStartCustomTest = () => {
    let filtered = [...QUESTION_BANK]
    if (selectedSubject !== "All") {
      filtered = filtered.filter(q => q.subject === selectedSubject)
    }
    if (selectedDifficulty !== "All") {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty)
    }

    if (filtered.length === 0) {
      filtered = [...QUESTION_BANK]
    }

    // Shuffle and pick question count
    const shuffled = [...filtered].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    setActiveQuestions(selected)
    setCurrentQIndex(0)
    setSelectedAnswers({})
    setMarkedForReview({})
    setTimeLeftSeconds(timeLimit * 60)
    setTestTitle(`Custom ${selectedSubject === "All" ? "Aptitude" : selectedSubject} Test`)
    setTestState("TEST")
  }

  // Start Promoted Mock Test
  const handleStartPromotedMock = (mockId: string) => {
    const mock = PROMOTED_MOCKS.find(m => m.id === mockId)
    if (!mock) return

    let filtered = [...QUESTION_BANK]
    if (mock.subject !== "All") {
      filtered = filtered.filter(q => q.subject === mock.subject)
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(mock.questionsCount, shuffled.length))

    setActiveQuestions(selected)
    setCurrentQIndex(0)
    setSelectedAnswers({})
    setMarkedForReview({})
    setTimeLeftSeconds(mock.timeLimitMins * 60)
    setTestTitle(mock.title)
    setTestState("TEST")
  }

  // Answer selection
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: optionIndex }))
  }

  // Toggle Mark for Review
  const toggleMarkForReview = () => {
    setMarkedForReview(prev => ({ ...prev, [currentQIndex]: !prev[currentQIndex] }))
  }

  // Submit test
  const handleSubmitTest = () => {
    setTestState("RESULT")
  }

  // Calculate results
  const calculateResults = () => {
    let correct = 0
    let incorrect = 0
    let unattempted = 0

    activeQuestions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx]
      if (chosen === undefined) {
        unattempted++
      } else if (chosen === q.correctIndex) {
        correct++
      } else {
        incorrect++
      }
    })

    const total = activeQuestions.length
    const score = correct * 2 - incorrect * 0.5
    const accuracy = total - unattempted > 0 ? Math.round((correct / (total - unattempted)) * 100) : 0

    return { total, correct, incorrect, unattempted, score, accuracy }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-8 pb-12">
      {/* TEST CONFIGURATION / PROMOTION HUB */}
      {testState === "CONFIG" && (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden glass p-8 md:p-10 rounded-3xl border border-white/10 bg-gradient-to-r from-primary/20 via-background to-secondary/30">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Mock Test & Aptitude Engine</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Make Your Own Aptitude Questions & Master Mock Tests
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Create customized practice sets tailored to your topic, difficulty, and duration preferences — or attempt curated Mock Tests with real-time exam timers and instant step-by-step solutions.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border/40 pb-4">
            <button
              onClick={() => setActiveTab("CUSTOM")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "CUSTOM" 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Make Own Test</span>
            </button>

            <button
              onClick={() => setActiveTab("PROMOTED")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "PROMOTED" 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Promoted Mock Series</span>
            </button>

            <button
              onClick={() => setActiveTab("BANK")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "BANK" 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Question Bank</span>
            </button>
          </div>

          {/* TAB 1: MAKE OWN APTITUDE TEST BUILDER */}
          {activeTab === "CUSTOM" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-3xl border border-white/10 space-y-8"
            >
              <div>
                <h2 className="text-xl font-bold">Customize Your Aptitude Practice Test</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure subjects, difficulty level, number of questions, and duration.</p>
              </div>

              {/* Subject Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Select Subject / Topic</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {["All", "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "Data Interpretation"].map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setSelectedSubject(subj)}
                      className={`p-3 rounded-2xl border text-xs font-semibold transition-all text-center ${
                        selectedSubject === subj
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border/60 bg-secondary/30 hover:border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  <span>Select Difficulty Level</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {["All", "Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-3 rounded-2xl border text-xs font-semibold transition-all text-center ${
                        selectedDifficulty === diff
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm"
                          : "border-border/60 bg-secondary/30 hover:border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {diff === "All" ? "Mixed Difficulty" : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count & Time Limit Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-5 rounded-2xl bg-secondary/30 border border-border/40">
                  <label className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <HelpCircle className="h-4 w-4 text-amber-500" />
                      <span>Number of Questions</span>
                    </span>
                    <span className="text-primary font-bold">{questionCount} Qs</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    {[5, 10, 15, 20].map(cnt => (
                      <button
                        key={cnt}
                        onClick={() => setQuestionCount(cnt)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          questionCount === cnt
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/80 hover:bg-background text-muted-foreground"
                        }`}
                      >
                        {cnt} Questions
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-5 rounded-2xl bg-secondary/30 border border-border/40">
                  <label className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>Time Limit</span>
                    </span>
                    <span className="text-green-400 font-bold">{timeLimit} Minutes</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    {[5, 10, 15, 30].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setTimeLimit(mins)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          timeLimit === mins
                            ? "bg-green-500 text-white"
                            : "bg-background/80 hover:bg-background text-muted-foreground"
                        }`}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Action */}
              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleStartCustomTest}
                  size="lg" 
                  className="rounded-full px-8 py-6 text-base font-bold shadow-xl shadow-primary/25"
                >
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Generate & Start Custom Test
                </Button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PROMOTED MOCK TEST SERIES */}
          {activeTab === "PROMOTED" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {PROMOTED_MOCKS.map((mock) => (
                <div key={mock.id} className="glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 hover:border-primary/40 transition-all group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {mock.badge}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">{mock.subject}</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{mock.title}</h3>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{mock.description}</p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-semibold text-muted-foreground pt-2">
                      <span className="flex items-center space-x-1">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        <span>{mock.questionsCount} Questions</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-green-400" />
                        <span>{mock.timeLimitMins} Mins</span>
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleStartPromotedMock(mock.id)}
                    className="w-full rounded-2xl py-5 font-bold shadow-md shadow-primary/20"
                  >
                    Start Mock Test
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: QUESTION BANK BROWSER */}
          {activeTab === "BANK" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-3xl border border-white/10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Aptitude Question Repository</h2>
                  <p className="text-sm text-muted-foreground mt-1">Review standard aptitude questions and detailed solutions.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {QUESTION_BANK.length} Questions Available
                </span>
              </div>

              <div className="space-y-4">
                {QUESTION_BANK.map((q, idx) => (
                  <div key={q.id} className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary">{q.subject} • {q.topic}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                        q.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                        q.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="font-medium text-sm text-foreground whitespace-pre-line">Q{idx + 1}. {q.text}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`p-3 rounded-xl border ${
                            oIdx === q.correctIndex 
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold" 
                              : "bg-background/50 border-border/40 text-muted-foreground"
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-background/80 border border-primary/20 text-xs space-y-1">
                      <span className="font-bold text-primary">Explanation:</span>
                      <p className="text-muted-foreground">{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ACTIVE LIVE TEST INTERFACE */}
      {testState === "TEST" && activeQuestions.length > 0 && (
        <div className="space-y-6">
          {/* Test Header Bar */}
          <div className="glass p-4 md:p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-30 bg-background/95 backdrop-blur-md">
            <div>
              <h2 className="font-bold text-lg">{testTitle}</h2>
              <p className="text-xs text-muted-foreground">Question {currentQIndex + 1} of {activeQuestions.length}</p>
            </div>

            <div className="flex items-center space-x-6">
              {/* Countdown Timer */}
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold text-lg">
                <Clock className="h-5 w-5 animate-pulse" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              <Button onClick={handleSubmitTest} variant="default" className="rounded-full font-bold px-6 bg-emerald-600 hover:bg-emerald-700">
                Submit Test
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question Panel */}
            <div className="lg:col-span-3 glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between text-xs font-semibold pb-4 border-b border-border/40">
                <span className="text-primary">{activeQuestions[currentQIndex].subject} • {activeQuestions[currentQIndex].topic}</span>
                <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground">{activeQuestions[currentQIndex].difficulty}</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-bold text-foreground leading-relaxed whitespace-pre-line">
                  {currentQIndex + 1}. {activeQuestions[currentQIndex].text}
                </h3>

                <div className="space-y-3 pt-2">
                  {activeQuestions[currentQIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQIndex] === oIdx
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                          isSelected 
                            ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10" 
                            : "border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/40 text-foreground"
                        }`}
                      >
                        <span className="flex items-center space-x-3">
                          <span className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </span>
                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-border/40">
                <Button
                  onClick={toggleMarkForReview}
                  variant="outline"
                  size="sm"
                  className={`rounded-xl border ${markedForReview[currentQIndex] ? "bg-purple-500/10 border-purple-500 text-purple-400" : ""}`}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  {markedForReview[currentQIndex] ? "Marked for Review" : "Mark for Review"}
                </Button>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    variant="secondary"
                    className="rounded-xl"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentQIndex(prev => Math.min(activeQuestions.length - 1, prev + 1))}
                    disabled={currentQIndex === activeQuestions.length - 1}
                    className="rounded-xl px-6"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Question Palette Sidebar */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-6 h-fit">
              <h4 className="font-bold text-sm">Question Palette</h4>
              
              <div className="grid grid-cols-5 gap-2">
                {activeQuestions.map((_, idx) => {
                  const isCurrent = currentQIndex === idx
                  const isAnswered = selectedAnswers[idx] !== undefined
                  const isMarked = markedForReview[idx]

                  let colorClass = "bg-secondary text-muted-foreground border-border/40"
                  if (isMarked) {
                    colorClass = "bg-purple-500 text-white border-purple-400"
                  } else if (isAnswered) {
                    colorClass = "bg-emerald-500 text-white border-emerald-400"
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-10 rounded-xl font-bold text-xs border transition-all flex items-center justify-center ${colorClass} ${
                        isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs text-muted-foreground pt-4 border-t border-border/40">
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-purple-500" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="h-3 w-3 rounded-full bg-secondary" />
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POST-TEST RESULTS & EXPLANATIONS SCREEN */}
      {testState === "RESULT" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          {/* Performance Summary Banner */}
          {(() => {
            const res = calculateResults()
            return (
              <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-background to-primary/10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-6">
                  <div>
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-2">
                      <Award className="h-4 w-4" />
                      <span>Test Completed</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold">{testTitle} Results</h2>
                  </div>

                  <Button onClick={() => setTestState("CONFIG")} className="rounded-full px-6 font-bold">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Take Another Test
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">Total Score</p>
                    <p className="text-2xl font-extrabold text-primary mt-1">{res.score} pts</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">Accuracy</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1">{res.accuracy}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">Correct</p>
                    <p className="text-2xl font-extrabold text-green-500 mt-1">{res.correct} / {res.total}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">Incorrect / Skipped</p>
                    <p className="text-2xl font-extrabold text-amber-400 mt-1">{res.incorrect} / {res.unattempted}</p>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Question-by-Question Solution Breakdown */}
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Step-by-Step Solution Breakdown</span>
            </h3>

            <div className="space-y-6">
              {activeQuestions.map((q, idx) => {
                const userChoice = selectedAnswers[idx]
                const isCorrect = userChoice === q.correctIndex
                const isUnattempted = userChoice === undefined

                return (
                  <div key={q.id} className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary">{q.subject} • {q.topic}</span>
                      <span className={`px-3 py-1 rounded-full font-bold flex items-center space-x-1 ${
                        isCorrect ? "bg-emerald-500/10 text-emerald-400" :
                        isUnattempted ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        {!isCorrect && !isUnattempted && <XCircle className="h-3.5 w-3.5 mr-1" />}
                        <span>{isCorrect ? "Correct" : isUnattempted ? "Unattempted" : "Incorrect"}</span>
                      </span>
                    </div>

                    <p className="font-medium text-sm md:text-base text-foreground whitespace-pre-line">
                      Q{idx + 1}. {q.text}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {q.options.map((opt, oIdx) => {
                        let optStyle = "bg-background/50 border-border/40 text-muted-foreground"
                        if (oIdx === q.correctIndex) {
                          optStyle = "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold"
                        } else if (oIdx === userChoice) {
                          optStyle = "bg-red-500/15 border-red-500/50 text-red-300 font-semibold"
                        }

                        return (
                          <div key={oIdx} className={`p-3 rounded-xl border flex items-center justify-between ${optStyle}`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {oIdx === q.correctIndex && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                            {oIdx === userChoice && oIdx !== q.correctIndex && <XCircle className="h-4 w-4 text-red-400" />}
                          </div>
                        )
                      })}
                    </div>

                    <div className="p-4 rounded-xl bg-background/80 border border-primary/20 text-xs space-y-1">
                      <span className="font-bold text-primary">Solution & Explanation:</span>
                      <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
