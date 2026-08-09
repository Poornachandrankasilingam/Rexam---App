import { Navbar } from "@/components/layout/Navbar"
import { Sparkles, Shield, Cpu, Award, Target, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-16 w-full">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300">
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen CBT Examination Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit tracking-tight text-white leading-tight">
            Empowering Aspirants with <span className="text-blue-400">AI-Driven Precision</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg">
            Rexam is a state-of-the-art AI-Powered Government Exam Platform designed to simulate real Computer-Based Testing (CBT) environments, automated OCR question ingestion, live AI proctoring, and deep diagnostic performance analytics.
          </p>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">AI Question Generation & OCR</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload PDF, DOCX, or scanned question paper images. Our intelligent OCR engine extracts questions, options, and solutions instantly.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">Live AI Proctoring</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time monitoring detects missing faces, multiple faces, tab switches, and suspicious gaze events with cumulative malpractice risk scoring.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white">User-Isolated Analytics</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zero fake numbers. Every metric, accuracy score, and weak topic diagnostic is calculated dynamically from your personal database record.
            </p>
          </div>
        </section>

        {/* Categories Supported */}
        <section className="glass p-10 rounded-3xl border border-white/10 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-outfit text-white">Supported Government Exams</h2>
            <p className="text-xs text-slate-400">Tailored question banks & mock test generators for top competitive exams.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {["SSC CGL", "SSC CHSL", "TNPSC", "UPSC", "Banking (IBPS/SBI)", "Railway (RRB)"].map((cat) => (
              <div key={cat} className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs font-bold text-blue-200">
                <CheckCircle2 className="h-4 w-4 mx-auto mb-2 text-blue-400" />
                {cat}
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link to="/register">
              <Button size="lg" className="rounded-full px-8 font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
