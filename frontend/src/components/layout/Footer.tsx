import React from "react"
import { Link } from "react-router-dom"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { Heart, Globe, Share2, Code2, Bot } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070b13] text-slate-400 text-xs relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <BrandLogo size="md" />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Rexam AI is an adaptive examination and AI diagnostic platform empowering students and educational institutions with computer-based test engines and AI performance coaching.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://github.com/Poornachandrankasilingam/Rexam---App" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/40 transition-colors">
                <Code2 className="h-4 w-4 text-emerald-400" />
              </a>
              <a href="#" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/40 transition-colors">
                <Globe className="h-4 w-4 text-cyan-400" />
              </a>
              <a href="#" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/40 transition-colors">
                <Bot className="h-4 w-4 text-purple-400" />
              </a>
            </div>
          </div>

          {/* Study Modules */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-outfit">Platform Features</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">Available Examinations</Link></li>
              <li><Link to="/student/ai-coach" className="hover:text-emerald-400 transition-colors">AI Performance Coach</Link></li>
              <li><Link to="/student/practice" className="hover:text-emerald-400 transition-colors">Practice Arena</Link></li>
              <li><Link to="/student/pyqs" className="hover:text-emerald-400 transition-colors">Previous Year Papers</Link></li>
              <li><Link to="/student/analytics" className="hover:text-emerald-400 transition-colors">Analytics & Insights</Link></li>
            </ul>
          </div>

          {/* Target Exams */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-outfit">Target Exams</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">Computer Science & GATE</Link></li>
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">General Aptitude & Reasoning</Link></li>
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">SSC & Banking Portals</Link></li>
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">UPSC & State Services</Link></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-outfit">Quick Access</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Candidate Sign In</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Create Free Account</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Platform</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Support & Contact</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Administrator Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© 2026 Rexam AI. All rights reserved. Adaptive Examination & Proctoring Intelligence.</p>
          <p className="flex items-center space-x-1">
            <span>Engineered with precision &</span>
            <Heart className="h-3 w-3 text-rose-500 fill-current inline" />
            <span>for Aspirants Worldwide</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
