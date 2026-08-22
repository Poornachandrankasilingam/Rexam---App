"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw,
  Zap,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card3D } from "@/components/ui/Card3D"

export function ExamSimulator3D() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

  const sampleQuestions = [
    {
      id: 1,
      subject: "Quantitative Aptitude",
      topic: "Profit & Loss",
      difficulty: "MEDIUM",
      text: "A vendor buys lemons at 6 for ₹10 and sells them at 4 for ₹10. What is his overall gain percentage?",
      options: [
        { id: 0, text: "40%" },
        { id: 1, text: "50%" },
        { id: 2, text: "60%" },
        { id: 3, text: "35%" }
      ],
      correctOption: 1,
      explanation: "CP of 1 lemon = ₹10/6 = ₹5/3. SP of 1 lemon = ₹10/4 = ₹5/2. Gain = SP - CP = (5/2) - (5/3) = 5/6. Gain % = ((5/6) / (5/3)) × 100 = (3/6) × 100 = 50%."
    },
    {
      id: 2,
      subject: "Logical Reasoning",
      topic: "Syllogism",
      difficulty: "HARD",
      text: "Statements: All laptops are devices. Some devices are phones. Conclusions: I. Some phones are laptops. II. Some devices are laptops.",
      options: [
        { id: 0, text: "Only Conclusion I follows" },
        { id: 1, text: "Only Conclusion II follows" },
        { id: 2, text: "Both I and II follow" },
        { id: 3, text: "Neither I nor II follows" }
      ],
      correctOption: 1,
      explanation: "Since 'All laptops are devices', it directly implies 'Some devices are laptops' (Conclusion II is valid). But 'Some devices are phones' does not guarantee any overlap between laptops and phones."
    }
  ]

  const currentQ = sampleQuestions[activeQuestionIndex]

  const handleSelect = (index: number) => {
    if (!isSubmitted) {
      setSelectedOption(index)
    }
  }

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setIsSubmitted(true)
    }
  }

  const handleReset = () => {
    setSelectedOption(null)
    setIsSubmitted(false)
    setActiveQuestionIndex((prev) => (prev + 1) % sampleQuestions.length)
  }

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#04130d] via-[#061a12] to-[#04130d]">
      {/* Ambient Lights */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive 3D Simulation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-outfit text-white tracking-tight">
            Experience the <span className="gradient-text">Real CBT Exam Engine</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Try an interactive test question below with instant AI reasoning, step-by-step mathematical proofs, and real-time palette feedback.
          </p>
        </div>

        {/* 3D Exam Simulator Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Question & Options Workspace (8 Cols) */}
          <div className="lg:col-span-8">
            <Card3D depth={15} glowColor="emerald">
              <div className="space-y-6">
                {/* Header Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                      Q{currentQ.id} of {sampleQuestions.length}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{currentQ.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 font-mono">
                      {currentQ.topic}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      Marks: +2.0 | -0.5
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentQ.text}
                  </h3>
                </div>

                {/* 4 Interactive Option Badges */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOption === opt.id
                    const isCorrect = opt.id === currentQ.correctOption
                    let cardBorder = "border-white/10 hover:border-emerald-400/40 bg-slate-950/40 text-slate-200"
                    
                    if (isSelected && !isSubmitted) {
                      cardBorder = "border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20"
                    } else if (isSubmitted) {
                      if (isCorrect) {
                        cardBorder = "border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-md shadow-emerald-500/30"
                      } else if (isSelected && !isCorrect) {
                        cardBorder = "border-rose-500 bg-rose-500/20 text-rose-200"
                      }
                    }

                    return (
                      <motion.div
                        key={opt.id}
                        whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                        whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                        onClick={() => handleSelect(opt.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${cardBorder}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold border ${
                            isSelected 
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold" 
                              : "bg-white/5 border-white/10 text-slate-400"
                          }`}>
                            {String.fromCharCode(65 + opt.id)}
                          </span>
                          <span className="text-sm sm:text-base font-semibold">{opt.text}</span>
                        </div>

                        {isSubmitted && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Submit & Next Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Try Next Question</span>
                  </button>

                  <div className="flex space-x-3">
                    {!isSubmitted ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        className="btn-3d-green rounded-xl px-6 text-sm font-bold text-white"
                      >
                        Submit Answer
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleReset}
                        className="btn-3d-green rounded-xl px-6 text-sm font-bold text-white"
                      >
                        Next Question
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* AI Explanation Accordion Box */}
                <AnimatePresence>
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-400/40 space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <span>AI Step-by-Step Solution Breakdown</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card3D>
          </div>

          {/* Right Status Palette Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card3D depth={10} glowColor="teal">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Exam Palette</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-400/30">
                    ⏱️ 59:45
                  </span>
                </div>

                {/* Question Bubbles Grid */}
                <div className="grid grid-cols-5 gap-2.5">
                  {Array.from({ length: 15 }).map((_, i) => {
                    const isCurrent = i === activeQuestionIndex
                    const isAnswered = i === 0 && isSubmitted
                    return (
                      <div
                        key={i}
                        className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                          isCurrent
                            ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/40 scale-105"
                            : isAnswered
                            ? "bg-emerald-900/60 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-950/60 text-slate-400 border-white/5"
                        }`}
                      >
                        {i + 1}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-2 pt-2 border-t border-emerald-500/20 text-[11px] text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Current Active Question</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-900/80 border border-emerald-400/40" />
                    <span>Answered & Verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-slate-800" />
                    <span>Not Visited</span>
                  </div>
                </div>
              </div>
            </Card3D>

            {/* Quick Practice Tip Badge */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border border-emerald-500/30 text-xs text-slate-300 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-300">
                <Target className="h-4 w-4 text-emerald-400" />
                <span>Diagnostic Accuracy Meter</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Rexam AI logs every question response time, detecting whether you guessed or calculated under time pressure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
