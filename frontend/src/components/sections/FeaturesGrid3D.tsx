"use client"

import React from "react"
import { 
  Zap, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  BookOpen, 
  Sparkles
} from "lucide-react"
import { Card3D } from "@/components/ui/Card3D"

export function FeaturesGrid3D() {
  const features = [
    {
      icon: Zap,
      title: "Tri-Engine AI Intelligence",
      tagline: "Gemini 2.5 • Groq • NVIDIA NIM",
      desc: "Instant question generation, adaptive difficulty scaling, and automated mathematical solution proofs.",
      glow: "emerald" as const
    },
    {
      icon: FileText,
      title: "Universal Multilingual OCR",
      tagline: "English • Hindi • Tamil",
      desc: "Upload physical question paper scans or PDFs with automatic formula parsing and option extraction.",
      glow: "teal" as const
    },
    {
      icon: BarChart3,
      title: "AI Performance Coach",
      tagline: "0-100 Readiness Score",
      desc: "Granular diagnostic analytics identifying weak areas, speed bottlenecks, and 7-day adaptive improvement plans.",
      glow: "cyan" as const
    },
    {
      icon: ShieldCheck,
      title: "Safe Exam Environment",
      tagline: "Tamper-Proof CBT Flow",
      desc: "Full-screen lock, tab-switching warnings, automated malpractice logging, and reliable auto-save state recovery.",
      glow: "mint" as const
    },
    {
      icon: BookOpen,
      title: "10,000+ Exam PYQs Bank",
      tagline: "SSC • UPSC • Banking • Railways",
      desc: "Curated previous year papers categorized by exam tier, subject, and topic with full solution keys.",
      glow: "emerald" as const
    },
    {
      icon: Sparkles,
      title: "Instant Score & Percentile",
      tagline: "Real-Time Ranking",
      desc: "Get comprehensive result breakdown within 100ms of exam submission with sectional marks and time analysis.",
      glow: "teal" as const
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#04130d] via-[#061e15] to-[#04130d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Enterprise Feature Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-outfit text-white tracking-tight">
            Built for <span className="gradient-text">Precision Exam Mastery</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Engineered with modern 3D architecture, lightning-fast inference, and an intuitive user experience for aspirants and institutions.
          </p>
        </div>

        {/* 3D Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Card3D key={i} depth={15} glowColor={f.glow}>
              <div className="space-y-4 text-left">
                {/* 3D Icon Badge */}
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <f.icon className="h-7 w-7 text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 font-mono">
                    {f.tagline}
                  </span>
                  <h3 className="text-xl font-bold font-outfit text-white">
                    {f.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  )
}
