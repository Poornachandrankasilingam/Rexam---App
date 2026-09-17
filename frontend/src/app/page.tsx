"use client"

import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ExamSimulator3D } from "@/components/sections/ExamSimulator3D"
import { 
  GraduationCap, 
  CheckCircle2, 
  BookOpen, 
  TrendingUp, 
  Building2,
  Landmark,
  CreditCard,
  Globe2,
  Train,
  Calculator,
  Brain,
  Zap,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Shield,
  Bot,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"

function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="particle" style={style} />
}

function HeroSection() {
  const particles = Array.from({ length: 16 }, () => ({
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 5 + 2}px`,
    height: `${Math.random() * 5 + 2}px`,
    animationDuration: `${Math.random() * 8 + 6}s`,
    animationDelay: `${Math.random() * 5}s`,
    bottom: `${Math.random() * 20}%`,
    opacity: Math.random() * 0.4 + 0.15,
  }))

  return (
    <section className="relative min-h-screen mesh-bg flex items-center overflow-hidden pt-28 pb-16">
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Subtle background tech grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16 items-center w-full relative z-10">
        {/* Left Content */}
        <div className="space-y-8 text-left">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 shadow-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Examination & Coaching Platform
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight font-outfit text-white">
            <span>Master Every</span>
            <br />
            <span className="shimmer-text">Examination</span>
            <br />
            <span className="text-emerald-400/90 text-4xl lg:text-5xl font-light italic">with AI Intelligence</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-md font-medium">
            Adaptive, enterprise-grade CBT exam engine with automated AI proctoring, personalized weak area coaching, and live interactive drills.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="btn-3d-green rounded-2xl px-8 py-6 font-bold text-white shadow-xl shadow-emerald-500/25 text-base">
                <Zap className="w-5 h-5 mr-2 fill-current" />
                Start Preparing Free
              </Button>
            </Link>
            <Link to="/student/exams">
              <Button size="lg" variant="outline" className="rounded-2xl px-8 py-6 font-bold text-white border-white/10 hover:bg-white/10 text-base">
                <Play className="w-4 h-4 mr-2" />
                Explore CBT Exams
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/10">
            <div className="flex -space-x-2">
              {["#10b981", "#06b6d4", "#6366f1", "#8b5cf6"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[#070b13] flex items-center justify-center text-xs font-black shadow-sm"
                  style={{ background: c, color: "#ffffff" }}>
                  {["AK", "SR", "MJ", "PL"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="text-white font-extrabold text-sm font-outfit">500,000+ Aspirants</div>
              <div className="text-slate-400 text-xs font-semibold">Across 120+ top institutions</div>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-white text-xs font-black ml-1">4.9/5 Rating</span>
            </div>
          </div>
        </div>

        {/* Right — 3D Centerpiece Showcase */}
        <div className="relative flex items-center justify-center h-[480px] lg:h-[580px]">
          <div className="orbit-ring" style={{ width: 320, height: 320 }} />
          <div className="orbit-ring" style={{ width: 420, height: 420, opacity: 0.12 }} />
          <div className="orbit-ring" style={{ width: 500, height: 500, opacity: 0.07 }} />

          {[
            { size: 280, duration: "12s", delay: "0s", color: "#10b981", dotSize: 10 },
            { size: 380, duration: "18s", delay: "-6s", color: "#34d399", dotSize: 7 },
            { size: 460, duration: "24s", delay: "-12s", color: "#06b6d4", dotSize: 5 },
          ].map((orb, i) => (
            <div key={i} className="absolute" style={{
              width: orb.size, height: orb.size,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%) rotateX(70deg)",
              transformStyle: "preserve-3d",
            }}>
              <div style={{
                position: "absolute", width: orb.dotSize, height: orb.dotSize,
                borderRadius: "50%", background: orb.color,
                boxShadow: `0 0 10px ${orb.color}, 0 0 20px ${orb.color}`,
                top: "0", left: "50%", transform: "translateX(-50%)",
                animation: `orbit ${orb.duration} linear infinite`,
                animationDelay: orb.delay,
              }} />
            </div>
          ))}

          <div className="absolute rounded-full" style={{
            width: 260, height: 260,
            background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)",
            filter: "blur(20px)",
          }} />

          {/* 3D Floating Logo */}
          <div className="logo-3d-container relative z-10">
            <div className="logo-3d-inner">
              <img src="/logo.png" alt="Rexam AI Logo"
                className="w-72 sm:w-80 h-auto object-contain rounded-3xl"
                style={{ filter: "drop-shadow(0 20px 40px rgba(16,185,129,0.3)) drop-shadow(0 0 80px rgba(16,185,129,0.1))" }}
              />
            </div>
          </div>

          {/* Floating Live Badges */}
          <div className="absolute rounded-2xl px-4 py-3 animate-float-slow shadow-2xl border border-white/10 glass-strong"
            style={{ top: "10%", right: "0", animationDelay: "1s" }}>
            <div className="text-[10px] text-emerald-400 font-mono font-bold mb-0.5">ACCURACY BENCHMARK</div>
            <div className="text-2xl font-black text-white stat-number">98.4%</div>
          </div>

          <div className="absolute rounded-2xl px-4 py-3 animate-float-slow shadow-2xl border border-white/10 glass-strong"
            style={{ bottom: "18%", left: "0", animationDelay: "2.5s" }}>
            <div className="text-[10px] text-cyan-400 font-mono font-bold mb-0.5">QUESTIONS SOLVED</div>
            <div className="text-2xl font-black text-white stat-number">42,871</div>
          </div>

          <div className="absolute rounded-xl px-3.5 py-2 animate-float-slow shadow-2xl border border-white/10 glass-strong"
            style={{ bottom: "8%", right: "8%", animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white font-bold font-mono">AI Neural Engine Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const stats = [
  { label: "Active Students", value: "500K+", icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "Questions Solved", value: "42M+", icon: CheckCircle2, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { label: "Exam Topics", value: "8,400+", icon: BookOpen, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { label: "Pass Rate Boost", value: "94%", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { label: "Institutions", value: "120+", icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
]

function StatsBar() {
  return (
    <section className="relative bg-[#0a0f1d] py-12 overflow-hidden border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4 py-2">
              <div className={`h-11 w-11 mx-auto rounded-2xl ${s.bg} border flex items-center justify-center mb-3 shadow-sm`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="text-3xl lg:text-4xl font-black text-white font-outfit tracking-tight">{s.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: Zap,
    title: "Adaptive AI Engine",
    desc: "Neural AI dynamically pinpoints weak topics, generates tailored remedial quizzes, and scales question difficulty based on accuracy.",
    tag: "Adaptive AI",
  },
  {
    icon: BarChart3,
    title: "Granular Analytics & Diagnostics",
    desc: "Instant breakdown by speed, topic accuracy, time-spent-per-question, and AI-predicted exam readiness scores.",
    tag: "Analytics",
  },
  {
    icon: ShieldCheck,
    title: "Secure Fullscreen CBT Engine",
    desc: "Real-time webcam AI proctoring, tab-switch detection, automated malpractice audit logs, and question palette filters.",
    tag: "Safe CBT",
  },
  {
    icon: Bot,
    title: "AI Coach & Real-Time Mock Drills",
    desc: "Conversational AI tutor that conducts interactive viva drills, explains difficult solutions, and clarifies student doubts 24/7.",
    tag: "AI Coach",
  },
  {
    icon: FileSpreadsheet,
    title: "Multilingual OCR & Paper Importer",
    desc: "Extract question papers from images and PDFs in English, Hindi, and Tamil with automatic formula and option parsing.",
    tag: "OCR Scanner",
  },
  {
    icon: BookOpen,
    title: "Previous Year Question Bank",
    desc: "Over 10,000+ syllabus-accurate PYQs with step-by-step explanations covering GATE, SSC, Banking, and Civil Services.",
    tag: "PYQ Bank",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 bg-[#070b13] section-glow overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 font-bold">
            Platform Capabilities
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white font-outfit">
            Built for <span className="shimmer-text">Aspirants & Institutions</span>
            <br />
            <span className="text-slate-400 font-normal italic text-3xl lg:text-4xl">that demand absolute excellence</span>
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto font-medium">
            Every module engineered for high reliability — from individual student practice to 50,000-candidate institutional examinations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-3d glass rounded-3xl p-7 group cursor-pointer border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="flex items-start gap-4 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <f.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest mt-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors font-outfit">
                {f.title}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">{f.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Explore feature</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up via Google or Email. Configure your target exams (Engineering, Banking, UPSC, SSC)." },
  { num: "02", title: "AI Builds Learning Paths", desc: "The adaptive engine evaluates baseline knowledge and recommends tailored practice mock sets." },
  { num: "03", title: "Practice with Real CBT Engine", desc: "Timed conditions, AI webcam proctoring, instant step-by-step proofs, and continuous auto-save." },
  { num: "04", title: "Track Mastery & Score High", desc: "Granular speed vs accuracy metrics, weak topic alerts, and predictive AI scorecards ensure top ranks." },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 bg-[#0a0f1d] overflow-hidden border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 font-bold">
            Workflow Overview
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white font-outfit">
            From Practice to <span className="shimmer-text">Results</span>
            <br />
            <span className="text-slate-400 font-normal italic text-3xl">in four simple steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step) => (
            <div key={step.num} className="relative group">
              <div className="glass rounded-3xl p-7 h-full card-3d border border-white/10 group-hover:border-emerald-500/40 transition-all shadow-xl">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-sm mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-3 group-hover:text-emerald-400 transition-colors font-outfit">
                  {step.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const subjects = [
  { name: "Computer Science & Engineering", icon: Brain, count: "14,500+ Questions" },
  { name: "SSC (CGL, CHSL, MTS)", icon: Landmark, count: "12,500+ Questions" },
  { name: "Banking & PO (IBPS & SBI)", icon: CreditCard, count: "9,800+ Questions" },
  { name: "UPSC Civil Services", icon: Globe2, count: "7,400+ Questions" },
  { name: "Quantitative Aptitude", icon: Calculator, count: "15,000+ Questions" },
  { name: "Logical & Verbal Reasoning", icon: Zap, count: "11,200+ Questions" },
]

function SubjectsSection() {
  return (
    <section className="relative py-24 bg-[#070b13]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 font-bold">
              Examination Coverage
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight font-outfit">
              Every Major Exam.
              <br />
              <span className="shimmer-text">One Intelligent Platform.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              From competitive national assessments to institutional tests — Rexam provides verified, syllabus-aligned question banks with detailed step-by-step proofs.
            </p>
            <Link to="/student/exams">
              <Button size="lg" className="btn-3d-green rounded-2xl px-8 font-bold text-white shadow-lg shadow-emerald-500/25">
                Browse All Exams
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {subjects.map((s) => (
              <div key={s.name} className="glass rounded-2xl p-5 card-3d group cursor-pointer border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-white font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors font-outfit">{s.name}</div>
                <div className="text-emerald-400 text-xs font-mono font-semibold">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="relative py-28 bg-[#0a0f1d] overflow-hidden border-t border-white/10">
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)",
      }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="flex justify-center mb-4">
          <div className="animate-pulse-glow rounded-3xl p-3 bg-secondary/80 border border-emerald-500/30 shadow-2xl">
            <img src="/logo.png" alt="Rexam AI Logo"
              className="w-16 h-auto object-contain rounded-2xl"
              style={{ filter: "drop-shadow(0 0 20px rgba(16,185,129,0.4))" }}
            />
          </div>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-outfit leading-tight">
          Ready to Elevate Your
          <br />
          <span className="shimmer-text">Examination Performance?</span>
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Join over 500,000 students and leading institutions achieving measurably higher pass rates with Rexam AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="btn-3d-green rounded-2xl px-10 py-6 font-bold text-white shadow-xl shadow-emerald-500/30 text-base">
              Start Free — Instant Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/student/practice">
            <Button size="lg" variant="outline" className="rounded-2xl px-10 py-6 font-bold text-white border-white/10 hover:bg-white/10 text-base">
              Launch CBT Simulator
            </Button>
          </Link>
        </div>

        <p className="text-slate-400 text-xs font-semibold">
          Free tier includes daily mock tests & AI explanations • Instant setup • No credit card required
        </p>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <ExamSimulator3D />
      <FeaturesSection />
      <HowItWorks />
      <SubjectsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
