"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  Calculator, 
  Brain, 
  BookOpen, 
  Globe, 
  RefreshCw, 
  CheckCircle,
  Cpu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card3D } from "@/components/ui/Card3D"

export function AiGeneratorPlayground() {
  const [subject, setSubject] = useState("Quantitative Aptitude")
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM")
  const [language, setLanguage] = useState("English")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCard, setGeneratedCard] = useState({
    subject: "Quantitative Aptitude",
    topic: "Time & Work",
    difficulty: "MEDIUM",
    language: "English",
    text: "A can finish a project in 12 days and B can finish the same project in 18 days. If they work together for 4 days, what fraction of the project is left?",
    options: ["1/3", "4/9", "5/9", "7/18"],
    correctAnswer: "4/9",
    explanation: "A's 1-day work = 1/12. B's 1-day work = 1/18. Combined 1-day work = 1/12 + 1/18 = (3+2)/36 = 5/36. In 4 days, work done = 4 × (5/36) = 20/36 = 5/9. Remaining work = 1 - 5/9 = 4/9."
  })

  const handleGenerate = () => {
    setIsGenerating(true)

    setTimeout(() => {
      if (subject === "Quantitative Aptitude") {
        setGeneratedCard({
          subject: "Quantitative Aptitude",
          topic: "Percentages & Ratios",
          difficulty,
          language,
          text: language === "Hindi" 
            ? "यदि A का वेतन B के वेतन से 25% अधिक है, तो B का वेतन A के वेतन से कितने प्रतिशत कम है?"
            : "If A's salary is 25% more than B's salary, then by what percentage is B's salary less than A's?",
          options: ["20%", "25%", "16.66%", "33.33%"],
          correctAnswer: "20%",
          explanation: "Let B = 100 => A = 125. Difference = 25. Percentage less = (25 / 125) × 100 = 20%."
        })
      } else if (subject === "Logical Reasoning") {
        setGeneratedCard({
          subject: "Logical Reasoning",
          topic: "Blood Relations",
          difficulty,
          language,
          text: language === "Hindi"
            ? "एक तस्वीर की ओर इशारा करते हुए राहुल ने कहा, 'वह मेरे दादाजी के इकलौते बेटे की बेटी है।' तस्वीर वाली महिला का राहुल से क्या संबंध है?"
            : "Pointing to a photograph, Rahul said, 'She is the daughter of the only son of my grandfather.' How is the woman in the photograph related to Rahul?",
          options: ["Sister", "Mother", "Cousin", "Aunt"],
          correctAnswer: "Sister",
          explanation: "Grandfather's only son is Rahul's father. The daughter of Rahul's father is Rahul's sister."
        })
      } else {
        setGeneratedCard({
          subject: "Verbal Ability",
          topic: "Synonyms & Contextual Vocab",
          difficulty,
          language,
          text: "Choose the word most nearly OPPOSITE in meaning to 'METICULOUS':",
          options: ["Careless", "Thorough", "Precise", "Methodical"],
          correctAnswer: "Careless",
          explanation: "'Meticulous' means showing great attention to detail. Its direct antonym is 'Careless' or 'Sloppy'."
        })
      }
      setIsGenerating(false)
    }, 600)
  }

  const subjects = [
    { name: "Quantitative Aptitude", icon: Calculator },
    { name: "Logical Reasoning", icon: Brain },
    { name: "Verbal Ability", icon: BookOpen }
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-[#04130d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>AI Neural Generator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-outfit text-white tracking-tight">
            Generate <span className="gradient-text">Exam-Standard Questions</span> in Seconds
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Choose your subject, difficulty level, and regional language to generate verified questions powered by Gemini, Groq, and NVIDIA NIM.
          </p>
        </div>

        {/* Generator Controls and Preview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Workspace (5 Cols) */}
          <div className="lg:col-span-5">
            <Card3D depth={10} glowColor="teal">
              <div className="space-y-6">
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Configure Generator</span>
                </h3>

                {/* Subject Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Select Subject</label>
                  <div className="grid grid-cols-1 gap-2">
                    {subjects.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setSubject(s.name)}
                        className={`flex items-center space-x-3 p-3 rounded-2xl border text-xs font-bold transition-all text-left ${
                          subject === s.name
                            ? "bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/20"
                            : "bg-slate-950/40 border-white/10 text-slate-400 hover:border-emerald-500/30"
                        }`}
                      >
                        <s.icon className={`h-4 w-4 ${subject === s.name ? "text-emerald-400" : "text-slate-500"}`} />
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty & Language Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-white/15 text-xs text-white font-semibold focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                      <Globe className="h-3 w-3 text-emerald-400" />
                      <span>Language</span>
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950/60 border border-white/15 text-xs text-white font-semibold focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                    </select>
                  </div>
                </div>

                {/* Trigger Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-3d-green w-full rounded-2xl py-3.5 font-bold text-white shadow-xl shadow-emerald-500/25"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Synthesizing AI Question..." : "Generate 3D Question"}</span>
                </Button>
              </div>
            </Card3D>
          </div>

          {/* Generated 3D Question Card Preview (7 Cols) */}
          <div className="lg:col-span-7">
            <Card3D depth={20} glowColor="emerald" className="h-full flex flex-col justify-between">
              <div className="space-y-5">
                {/* Meta Header */}
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                      {generatedCard.subject}
                    </span>
                    <span className="text-xs font-semibold text-teal-300">{generatedCard.topic}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    {generatedCard.difficulty} • {generatedCard.language}
                  </span>
                </div>

                {/* Question */}
                <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {generatedCard.text}
                </h4>

                {/* Option Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {generatedCard.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                        opt === generatedCard.correctAnswer
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/10"
                          : "bg-slate-950/40 border-white/10 text-slate-300"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {opt === generatedCard.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 ml-1" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-400/30 space-y-1">
                  <p className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">Step-by-Step AI Solution:</p>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {generatedCard.explanation}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center pt-4 mt-4 border-t border-white/5">
                ⚡ Generated with sub-100ms latency via high-throughput inference engine.
              </p>
            </Card3D>
          </div>
        </div>
      </div>
    </section>
  )
}
