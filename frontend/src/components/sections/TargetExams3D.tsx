"use client"

import React from "react"
import { Link } from "react-router-dom"
import { 
  GraduationCap, 
  Landmark, 
  Building2, 
  Train, 
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Card3D } from "@/components/ui/Card3D"
import { Button } from "@/components/ui/button"

export function TargetExams3D() {
  const categories = [
    {
      title: "SSC Examinations",
      exams: "CGL • CHSL • MTS • CPO • GD Constable",
      icon: GraduationCap,
      questions: "12,500+ Questions",
      mocks: "48 Mock Tests",
      color: "emerald" as const
    },
    {
      title: "Banking & Insurance",
      exams: "IBPS PO • SBI Clerk • RBI Grade B • LIC AAO",
      icon: Landmark,
      questions: "9,800+ Questions",
      mocks: "35 Mock Tests",
      color: "teal" as const
    },
    {
      title: "UPSC & Civil Services",
      exams: "Prelims GS-1 • CSAT Paper-2 • CDS • NDA",
      icon: Building2,
      questions: "7,400+ Questions",
      mocks: "28 Mock Tests",
      color: "cyan" as const
    },
    {
      title: "Railways (RRB)",
      exams: "RRB NTPC • Group D • ALP & Technician",
      icon: Train,
      questions: "8,200+ Questions",
      mocks: "30 Mock Tests",
      color: "mint" as const
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden bg-[#04130d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Target Categories</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-outfit text-white tracking-tight">
              Curated for <span className="gradient-text">Top Competitive Exams</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Master the exact pattern and syllabus of India's premier government recruitment examinations.
            </p>
          </div>

          <Link to="/student/exams">
            <Button variant="outline" className="glass glass-hover rounded-2xl px-6 font-bold text-emerald-300 border-emerald-400/30">
              <span>View All Available Exams</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* 3D Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <Card3D key={i} depth={15} glowColor={cat.color} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/15">
                  <cat.icon className="h-6 w-6 text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-outfit text-white">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {cat.exams}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="text-emerald-400 font-bold">{cat.questions}</span>
                  <span className="text-slate-400">{cat.mocks}</span>
                </div>

                <Link to="/student/exams" className="block w-full">
                  <Button size="sm" className="btn-3d-green w-full rounded-xl text-xs font-bold text-white">
                    Explore Tests
                  </Button>
                </Link>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  )
}
