import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Sparkles, Shield, Cpu, Award, Target, CheckCircle2, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-16 w-full">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen CBT Examination Engine</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-outfit tracking-tight text-white leading-tight">
            Empowering Aspirants with <span className="shimmer-text">AI Precision</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Rexam AI is a computer-based examination and diagnostic platform designed to simulate real national testing environments, automated multilingual OCR ingestion, live AI proctoring, and personalized weak topic coaching.
          </p>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">AI Question Generation & OCR</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload PDF, DOCX, or scanned question paper images. Our intelligent OCR engine extracts questions, options, and solutions instantly with formula support.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Live AI Proctoring</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time monitoring detects missing faces, multiple faces, tab switches, and unauthorized browser actions with automated cumulative risk scoring.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Adaptive Diagnostic Coach</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every accuracy metric and weak topic diagnostic is calculated dynamically from your personal test submissions to build targeted booster drills.
            </p>
          </div>
        </section>

        {/* Call to Action Card */}
        <section className="glass p-10 md:p-12 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-transparent to-cyan-950/20 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-black font-outfit text-white">Ready to Experience the Platform?</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Take a free full-length CBT examination or test your concepts with our interactive AI coach.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="btn-3d-green rounded-2xl px-8 font-bold text-white shadow-lg shadow-emerald-500/25">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/student/exams">
              <Button size="lg" variant="outline" className="rounded-2xl px-8 font-bold text-white border-white/10 hover:bg-white/10">
                View Available Exams
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
