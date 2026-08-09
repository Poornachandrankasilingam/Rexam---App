"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Cpu, Play, CheckCircle2, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export default function AIMockTestsPage() {
  const navigate = useNavigate()

  const [category, setCategory] = useState("SSC CGL")
  const [subject, setSubject] = useState("General Awareness")
  const [difficulty, setDifficulty] = useState("MEDIUM")
  const [questionCount, setQuestionCount] = useState(20)
  const [generating, setGenerating] = useState(false)

  const examCategories = ["SSC CGL", "SSC CHSL", "TNPSC", "UPSC", "Banking (IBPS/SBI)", "Railway (RRB)"]
  const subjectsList = ["General Awareness", "Quantitative Aptitude", "English Language", "Logical Reasoning"]
  const difficulties = ["EASY", "MEDIUM", "HARD"]
  const counts = [10, 20, 50, 100]

  const handleGenerateMockTest = async () => {
    try {
      setGenerating(true)
      const res = await api.post("/student/ai-mock/generate", {
        category,
        subject,
        difficulty,
        count: questionCount
      })

      const mockData = res.data?.mockTest
      if (mockData) {
        // Save test as draft practice in backend & redirect
        const saveRes = await api.post("/student/results", {
          examTitle: mockData.title,
          score: 0,
          totalMarks: mockData.totalMarks,
          correct: 0,
          incorrect: 0,
          timeSpent: mockData.duration * 60
        })
        navigate("/student/exams")
      }
    } catch (err) {
      console.error("Failed to generate AI mock test", err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/10 via-background to-blue-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dynamic AI Test Generator</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">AI Mock Test Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">Customize exam category, subject, difficulty, and question count to create instant targeted practice tests.</p>
        </div>
      </div>

      {/* Generator Controls Card */}
      <div className="glass p-8 rounded-3xl border border-white/10 space-y-8">
        {/* Step 1: Select Exam Category */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-white font-outfit flex items-center">
            <Sliders className="h-4 w-4 mr-2 text-blue-400" />
            1. Select Target Exam Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {examCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                  category === cat
                    ? "bg-blue-600/20 border-blue-400 text-white shadow-md shadow-blue-500/20"
                    : "bg-secondary/30 border-white/10 text-slate-300 hover:bg-secondary/60"
                }`}
              >
                <span>{cat}</span>
                {category === cat && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Subject */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-white font-outfit">2. Select Subject Domain</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectsList.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubject(sub)}
                className={`p-3.5 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                  subject === sub
                    ? "bg-purple-600/20 border-purple-400 text-white shadow-md shadow-purple-500/20"
                    : "bg-secondary/30 border-white/10 text-slate-300 hover:bg-secondary/60"
                }`}
              >
                <span>{sub}</span>
                {subject === sub && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Difficulty & Count */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-white font-outfit">3. Difficulty Level</label>
            <div className="flex gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all ${
                    difficulty === diff
                      ? "bg-indigo-600/20 border-indigo-400 text-white shadow-md shadow-indigo-500/20"
                      : "bg-secondary/30 border-white/10 text-slate-300"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-white font-outfit">4. Number of Questions</label>
            <div className="flex gap-2">
              {counts.map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold border transition-all ${
                    questionCount === cnt
                      ? "bg-emerald-600/20 border-emerald-400 text-white shadow-md shadow-emerald-500/20"
                      : "bg-secondary/30 border-white/10 text-slate-300"
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 border-t border-white/10">
          <Button
            disabled={generating}
            onClick={handleGenerateMockTest}
            size="lg"
            className="w-full rounded-2xl py-6 font-bold text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-blue-500/25"
          >
            {generating ? "Generating AI Mock Test..." : `Generate ${questionCount} Questions Mock Test`}
            <Play className="ml-2 h-5 w-5 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  )
}
