"use client"

import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card3D } from "@/components/ui/Card3D"

export function CtaSection3D() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#04130d] to-[#020b07]">
      {/* Radiant Glow Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-600/20 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <Card3D depth={25} glowColor="emerald" className="p-8 sm:p-14 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-lg shadow-emerald-500/10">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Start Free • No Credit Card Required</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-outfit text-white leading-tight">
              Ready to <span className="gradient-text">Ace Your Exam</span> on the First Attempt?
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto">
              Join thousands of aspirants using Rexam-AI for daily CBT practice, AI performance diagnostics, and automated question generation.
            </p>

            {/* Checkpoints */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Instant Score Reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>10,000+ Verified PYQs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Multilingual Support</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="btn-3d-green w-full sm:w-auto rounded-full h-14 px-10 text-base font-bold text-white shadow-2xl shadow-emerald-500/30">
                  <span>Create Free Account</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/student/practice" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="glass glass-hover w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold text-white border-emerald-400/30">
                  Launch Practice Demo
                </Button>
              </Link>
            </div>
          </div>
        </Card3D>
      </div>
    </section>
  )
}
