"use client"

import { Sparkles, Cpu } from "lucide-react"

export default function AIMockTestManagementPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/10 via-background to-blue-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Mock Test Controls</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">AI Mock Test Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure AI prompt templates, difficulty parameters, and question bank caches.</p>
        </div>
      </div>

      <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-3">
        <Cpu className="h-10 w-10 text-purple-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">AI Generator Status: Active</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          AI Mock Test Generator is configured and serving dynamic SSC, TNPSC, UPSC, Banking, and Railway question sets.
        </p>
      </div>
    </div>
  )
}
