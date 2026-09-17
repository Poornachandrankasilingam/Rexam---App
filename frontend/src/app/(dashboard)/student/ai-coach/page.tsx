"use client"

import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { 
  Bot, 
  Send, 
  Sparkles, 
  Brain, 
  Trophy, 
  Target, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Copy, 
  Check, 
  Flame, 
  ShieldCheck, 
  ArrowRight,
  BookOpen,
  Zap,
  HelpCircle,
  Award,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

type ChatMode = "COACH" | "MOCKING"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  scoreAwarded?: number
  maxMarks?: number
  feedback?: string
  correctAnswer?: string
  isFinalSummary?: boolean
}

interface MockState {
  isActive: boolean
  targetExam: string
  subject: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  totalQuestions: number
  currentQuestionIndex: number
  score: number
  maxPossibleScore: number
  currentQuestionText: string
  isComplete: boolean
}

export default function AiCoachPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<ChatMode>("COACH")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello ${user?.name || "Aspirant"}! 👋 I am your **Rexam AI Coach & Mock Examiner**.\n\nI can:\n- **Solve any question step-by-step** with mathematical formulas and speed tricks.\n- **Explain tough concepts** in Quant, Reasoning, English, and General Studies.\n- **Conduct a Real-Time Mock Interview / Viva Drill** with instant scoring and feedback!\n\nHow would you like to prepare today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Mock Session Configuration & State
  const [mockTargetExam, setMockTargetExam] = useState("SSC CGL")
  const [mockSubject, setMockSubject] = useState("Quantitative Aptitude")
  const [mockDifficulty, setMockDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM")
  const [mockTotalQuestions, setMockTotalQuestions] = useState(5)
  const [mockState, setMockState] = useState<MockState>({
    isActive: false,
    targetExam: "SSC CGL",
    subject: "Quantitative Aptitude",
    difficulty: "MEDIUM",
    totalQuestions: 5,
    currentQuestionIndex: 0,
    score: 0,
    maxPossibleScore: 50,
    currentQuestionText: "",
    isComplete: false
  })

  const [engineStatus, setEngineStatus] = useState<{ connected: boolean; primaryModel: string; activeProviders: string[] }>({
    connected: true,
    primaryModel: "Gemini 3.6 Flash / Groq",
    activeProviders: ["Google Gemini", "Groq"]
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    api.get("/student/ai-coach/status").then(res => {
      if (res.data?.success) {
        setEngineStatus({
          connected: res.data.connected,
          primaryModel: res.data.primaryModel || "Multi-LLM Active",
          activeProviders: res.data.activeProviders || []
        })
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Text to Speech
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        return
      }
      const cleanText = text.replace(/[*#_`]/g, "")
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.05
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Voice Recognition (STT)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = "en-IN"
      recognition.interimResults = false
      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
      }
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      recognition.start()
    } catch (e) {
      setIsListening(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Quick Prompt Chips
  const coachPrompts = [
    "⚡ Give me the 3-second shortcut for Profit & Loss discount questions",
    "🧠 Explain Syllogism 'Some A are B' conclusion rules with examples",
    "📊 What is the optimal 60-minute time distribution for SSC CGL Tier 1?",
    "🎯 How to solve Blood Relations family tree puzzles quickly?",
    "📖 Explain the top 10 most repeated English grammar rules for banking exams"
  ]

  const handleSendCoachMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage
    if (!textToSend.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage("")
    setIsLoading(true)

    try {
      const chatHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }))

      const res = await api.post("/student/ai-chat/message", {
        message: userMsg.content,
        chatHistory,
        targetExam: mockTargetExam
      })

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data.reply || "I have analyzed your query.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ I encountered a temporary connection issue. Please verify your internet connection or try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  // Start Real-Time Mock Interview / Viva Drill
  const handleStartMockDrill = async () => {
    setIsLoading(true)
    const initialMock: MockState = {
      isActive: true,
      targetExam: mockTargetExam,
      subject: mockSubject,
      difficulty: mockDifficulty,
      totalQuestions: mockTotalQuestions,
      currentQuestionIndex: 1,
      score: 0,
      maxPossibleScore: mockTotalQuestions * 10,
      currentQuestionText: "",
      isComplete: false
    }

    try {
      const res = await api.post("/student/ai-chat/mock-turn", {
        targetExam: mockTargetExam,
        subject: mockSubject,
        difficulty: mockDifficulty,
        totalQuestions: mockTotalQuestions,
        currentQuestionIndex: 0
      })

      const qText = res.data.nextQuestion || "What is the primary governing principle of this subject?"
      initialMock.currentQuestionText = qText

      setMockState(initialMock)

      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `🎯 **${mockTargetExam} Mock Viva Drill Started!**\n**Subject:** ${mockSubject} | **Difficulty:** ${mockDifficulty}\n**Total Questions:** ${mockTotalQuestions} (10 Marks each)\n\n---\n\n### 📝 **Question 1 of ${mockTotalQuestions}:**\n${qText}\n\n*Type or speak your answer below. I will evaluate your precision, award marks, and provide model solutions.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  // Submit Answer to Current Mock Question
  const handleSubmitMockAnswer = async () => {
    if (!inputMessage.trim() || isLoading) return

    const studentAnswerText = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: studentAnswerText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages((prev) => [...prev, userMsg])

    try {
      const res = await api.post("/student/ai-chat/mock-turn", {
        targetExam: mockState.targetExam,
        subject: mockState.subject,
        difficulty: mockState.difficulty,
        totalQuestions: mockState.totalQuestions,
        currentQuestionIndex: mockState.currentQuestionIndex,
        previousQuestion: mockState.currentQuestionText,
        studentAnswer: studentAnswerText
      })

      const scoreAwarded = res.data.scoreAwarded ?? 7
      const newScore = mockState.score + scoreAwarded
      const isComplete = res.data.isComplete || mockState.currentQuestionIndex >= mockState.totalQuestions

      let botContent = `### 📊 **Evaluation (Marks: ${scoreAwarded}/10)**\n**Feedback:** ${res.data.feedback || "Good response."}\n\n**💡 Ideal Model Answer:**\n${res.data.correctAnswer || "Standard reference solution."}`

      if (isComplete) {
        botContent += `\n\n---\n\n## 🏆 **MOCK DRILL COMPLETED!**\n### **Final Score: ${newScore} / ${mockState.maxPossibleScore} (${Math.round((newScore / mockState.maxPossibleScore) * 100)}%)**\n\n**Verdict & Coach Advice:**\n${res.data.finalSummary || "Consistent performance across fundamentals. Focus on time pressure accuracy."}`
      } else if (res.data.nextQuestion) {
        botContent += `\n\n---\n\n### 📝 **Question ${mockState.currentQuestionIndex + 1} of ${mockState.totalQuestions}:**\n${res.data.nextQuestion}`
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botContent,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        scoreAwarded,
        maxMarks: 10,
        feedback: res.data.feedback,
        correctAnswer: res.data.correctAnswer,
        isFinalSummary: isComplete
      }

      setMessages((prev) => [...prev, botMsg])

      setMockState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        score: newScore,
        currentQuestionText: res.data.nextQuestion || "",
        isComplete
      }))
    } catch (err: any) {
      console.error("Mock answer evaluation error", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSession = () => {
    setMockState({
      isActive: false,
      targetExam: "SSC CGL",
      subject: "Quantitative Aptitude",
      difficulty: "MEDIUM",
      totalQuestions: 5,
      currentQuestionIndex: 0,
      score: 0,
      maxPossibleScore: 50,
      currentQuestionText: "",
      isComplete: false
    })
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Session reset! I am ready. You can ask doubts or start a new Real-Time Mocking Drill.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ])
  }

  return (
    <div className="space-y-6 pb-12 text-slate-100 font-sans">
      {/* Top Banner Header */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>24/7 AI Performance & Viva Coach</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">
            Rexam AI Universal Performance Coach
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Instant doubt solving, formula derivations, concept breakdowns, and live oral viva exam simulation.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1.5 rounded-2xl bg-secondary/80 border border-white/10 self-stretch md:self-auto shadow-lg relative z-10">
          <button
            onClick={() => setMode("COACH")}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === "COACH"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>AI Coach Mode</span>
          </button>
          <button
            onClick={() => setMode("MOCKING")}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              mode === "MOCKING"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Live Mocking Drill</span>
          </button>
        </div>
      </div>

      {/* Mocking Mode Configuration Card */}
      {mode === "MOCKING" && !mockState.isActive && (
        <div className="glass p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-transparent shadow-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg font-bold">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-outfit">Configure Oral Mock Exam Drill</h3>
              <p className="text-xs text-slate-300">The AI Examiner will interrogate you question-by-question and evaluate your conceptual accuracy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Target Exam</label>
              <select
                value={mockTargetExam}
                onChange={(e) => setMockTargetExam(e.target.value)}
                className="w-full p-3 rounded-2xl bg-secondary/70 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="SSC CGL Tier 1/2">SSC CGL Tier 1/2</option>
                <option value="IBPS / SBI PO & Clerk">IBPS / SBI PO & Clerk</option>
                <option value="UPSC Civil Services CSE">UPSC Civil Services CSE</option>
                <option value="Railways RRB NTPC">Railways RRB NTPC</option>
                <option value="General Aptitude & Reasoning">General Aptitude & Reasoning</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Subject / Module</label>
              <select
                value={mockSubject}
                onChange={(e) => setMockSubject(e.target.value)}
                className="w-full p-3 rounded-2xl bg-secondary/70 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Logical Reasoning">Logical Reasoning</option>
                <option value="English & Verbal Ability">English & Verbal Ability</option>
                <option value="Computer Architecture & OS">Computer Architecture & OS</option>
                <option value="General Awareness & Polity">General Awareness & Polity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Difficulty Level</label>
              <select
                value={mockDifficulty}
                onChange={(e) => setMockDifficulty(e.target.value as any)}
                className="w-full p-3 rounded-2xl bg-secondary/70 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="EASY">Easy (Foundational)</option>
                <option value="MEDIUM">Medium (Exam Standard)</option>
                <option value="HARD">Hard (Advanced & Tricky)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Questions Count</label>
              <select
                value={mockTotalQuestions}
                onChange={(e) => setMockTotalQuestions(Number(e.target.value))}
                className="w-full p-3 rounded-2xl bg-secondary/70 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value={3}>3 Questions (Quick Sprint)</option>
                <option value={5}>5 Questions (Standard Viva)</option>
                <option value={10}>10 Questions (Full Mock)</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleStartMockDrill}
            disabled={isLoading}
            className="btn-3d-green w-full sm:w-auto rounded-2xl px-8 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Mock Session...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2 fill-current" />
                Start Live Mock Drill
              </>
            )}
          </Button>
        </div>
      )}

      {/* Live Mock Scoreboard Banner */}
      {mode === "MOCKING" && mockState.isActive && (
        <div className="glass p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              {mockState.targetExam} • {mockState.subject}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Question {Math.min(mockState.currentQuestionIndex, mockState.totalQuestions)} of {mockState.totalQuestions}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Score Tally</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {mockState.score} / {mockState.maxPossibleScore} pts
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSession}
              className="rounded-xl text-xs font-bold border-white/10 hover:bg-white/10 text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Drill
            </Button>
          </div>
        </div>
      )}

      {/* Main Chat Workspace */}
      <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[600px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.role === "user"
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm ${
                    isUser
                      ? "bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white"
                      : "bg-purple-600 text-white shadow-purple-600/30"
                  }`}
                >
                  {isUser ? user?.name?.charAt(0) || "U" : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 rounded-2xl shadow-lg text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-emerald-600 text-white font-medium rounded-tr-none"
                      : "bg-secondary/70 border border-white/10 text-slate-100 rounded-tl-none space-y-2"
                  }`}
                >
                  {/* Markdown formatted content */}
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {msg.content}
                  </div>

                  {/* Actions Bar for Assistant Replies */}
                  {!isUser && (
                    <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <span>{msg.timestamp}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => speakText(msg.content)}
                          className="hover:text-emerald-400 transition-colors p-1 rounded hover:bg-white/10"
                          title="Read aloud"
                        >
                          {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-emerald-400 transition-colors p-1 rounded hover:bg-white/10"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-secondary/70 border border-white/10 text-xs font-semibold text-slate-300 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Rexam AI is reasoning and formulating explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        {mode === "COACH" && messages.length <= 2 && (
          <div className="pt-4 pb-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar">
            {coachPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendCoachMessage(p)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 text-[11px] font-semibold transition-all flex-shrink-0"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="pt-4 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (mode === "MOCKING" && mockState.isActive && !mockState.isComplete) {
                handleSubmitMockAnswer()
              } else {
                handleSendCoachMessage()
              }
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3.5 rounded-2xl border transition-all ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                  : "bg-secondary/60 text-slate-400 border-white/10 hover:text-white"
              }`}
              title={isListening ? "Listening... click to stop" : "Voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                mode === "MOCKING" && mockState.isActive && !mockState.isComplete
                  ? "Type your answer to the examiner's question..."
                  : "Ask any doubt, question explanation, shortcut, or strategy..."
              }
              className="flex-1 p-3.5 rounded-2xl bg-secondary/60 border border-white/10 text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
            />

            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="btn-3d-green rounded-2xl px-6 py-3.5 font-bold text-white shadow-md shadow-emerald-500/25 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
