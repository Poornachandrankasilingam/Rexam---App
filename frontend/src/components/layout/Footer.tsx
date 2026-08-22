import React from "react"
import { Link } from "react-router-dom"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { Heart, Globe, Share2, Code2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-emerald-500/20 bg-[#020b07] text-slate-400 text-xs relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Info (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo size="md" />
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Rexam-AI is an intelligent exam platform empowering aspirants across India for SSC, Banking, UPSC, and Railways competitive examinations with precision AI.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://github.com/Poornachandrankasilingam/Rexam---App" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/40 transition-colors">
                <Code2 className="h-4 w-4 text-emerald-400" />
              </a>
              <a href="#" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/40 transition-colors">
                <Globe className="h-4 w-4 text-teal-400" />
              </a>
              <a href="#" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400/40 transition-colors">
                <Share2 className="h-4 w-4 text-cyan-400" />
              </a>
            </div>
          </div>

          {/* Study Modules */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-outfit">Study Modules</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">Mock Test Series</Link></li>
              <li><Link to="/student/practice" className="hover:text-emerald-400 transition-colors">Aptitude Generator</Link></li>
              <li><Link to="/student/pyqs" className="hover:text-emerald-400 transition-colors">Previous Year Papers</Link></li>
              <li><Link to="/student/analytics" className="hover:text-emerald-400 transition-colors">AI Performance Coach</Link></li>
            </ul>
          </div>

          {/* Exam Portals */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-outfit">Target Exams</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">SSC CGL & CHSL</Link></li>
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">IBPS & SBI Banking</Link></li>
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">UPSC Civil Services</Link></li>
              <li><Link to="/student/exams" className="hover:text-emerald-400 transition-colors">Railways RRB NTPC</Link></li>
            </ul>
          </div>

          {/* Account & Company */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-outfit">Quick Access</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In Portal</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Create Account</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Rexam-AI</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Support & Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Rexam-AI. Study Purpose | Intelligent Learning Platform.</p>
          <p className="flex items-center space-x-1">
            <span>Built with precision &</span>
            <Heart className="h-3 w-3 text-rose-500 fill-current inline" />
            <span>for Aspirants across India</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
