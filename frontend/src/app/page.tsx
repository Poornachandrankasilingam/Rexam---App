"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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
  FileSpreadsheet
} from "lucide-react"

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-blur shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="Rexam-AI" className="h-10 w-auto object-contain drop-shadow-sm" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-800">
          <Link to="/" className="hover:text-emerald-600 transition-colors duration-200">Home</Link>
          <a href="#features" className="hover:text-emerald-600 transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-emerald-600 transition-colors duration-200">How It Works</a>
          <Link to="/student/exams" className="hover:text-emerald-600 transition-colors duration-200">Exam Series</Link>
          <Link to="/student/pyqs" className="hover:text-emerald-600 transition-colors duration-200">PYQs Bank</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <button className="text-sm text-slate-800 hover:text-emerald-700 transition-colors px-4 py-2 font-black">
              Sign In
            </button>
          </Link>
          <Link to="/register">
            <button className="btn-primary text-sm font-black text-white px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/20">
              Get Started Free
            </button>
          </Link>
        </div>

        <button className="md:hidden text-slate-800" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden nav-blur border-t border-slate-200 px-6 py-4 flex flex-col gap-4">
          <Link to="/" className="text-slate-800 text-sm font-bold py-1 hover:text-emerald-600">Home</Link>
          <a href="#features" className="text-slate-800 text-sm font-bold py-1 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-slate-800 text-sm font-bold py-1 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>How It Works</a>
          <Link to="/student/exams" className="text-slate-800 text-sm font-bold py-1 hover:text-emerald-600">Available Exams</Link>
          <Link to="/student/pyqs" className="text-slate-800 text-sm font-bold py-1 hover:text-emerald-600">PYQs Bank</Link>
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <Link to="/login" className="w-full">
              <button className="w-full text-sm text-slate-800 py-2 font-black rounded-xl border border-slate-200">
                Sign In
              </button>
            </Link>
            <Link to="/register" className="w-full">
              <button className="btn-primary w-full text-sm font-black text-white px-5 py-2.5 rounded-full">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="particle" style={style} />
}

function HeroSection() {
  const particles = Array.from({ length: 14 }, () => ({
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 5 + 2}px`,
    height: `${Math.random() * 5 + 2}px`,
    animationDuration: `${Math.random() * 8 + 6}s`,
    animationDelay: `${Math.random() * 5}s`,
    bottom: `${Math.random() * 20}%`,
    opacity: Math.random() * 0.4 + 0.15,
  }))

  return (
    <section className="relative min-h-screen mesh-bg flex items-center overflow-hidden pt-24 pb-16">
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(22,163,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16 items-center w-full relative z-10">
        {/* Left Content */}
        <div className="space-y-8 text-left">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 shadow-sm font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Enterprise 3D AI Study Platform
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-[0.98] tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            <span className="text-slate-900">Master Every</span>
            <br />
            <span className="shimmer-text">Exam with AI</span>
            <br />
            <span className="text-emerald-800/80 text-4xl lg:text-5xl font-normal italic">Intelligence</span>
          </h1>

          <p className="text-slate-700 text-lg leading-relaxed max-w-md font-medium">
            Rexam-AI delivers adaptive, enterprise-grade exam preparation powered by intelligent
            learning algorithms — personalized to each student, scalable to every institution.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/register">
              <button className="btn-primary text-white font-black px-8 py-4 rounded-2xl text-base flex items-center gap-2 shadow-lg shadow-emerald-600/25">
                <Zap className="w-5 h-5 fill-current" />
                Start Learning Free
              </button>
            </Link>
            <Link to="/student/practice">
              <button className="bg-white border border-slate-200 text-slate-800 font-black px-8 py-4 rounded-2xl text-base hover:bg-emerald-50 hover:border-emerald-300 transition-all flex items-center gap-2 shadow-sm">
                <span>Watch CBT Demo</span>
              </button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
            <div className="flex -space-x-2">
              {["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-black shadow-sm"
                  style={{ background: c, color: "#064e3b" }}>
                  {["AK", "SR", "MJ", "PL"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="text-slate-900 font-black text-sm">500K+ Students</div>
              <div className="text-slate-600 text-xs font-semibold">across 120+ institutions</div>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-slate-800 text-xs font-black ml-1">4.9/5</span>
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
            { size: 460, duration: "24s", delay: "-12s", color: "#059669", dotSize: 5 },
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
            background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(52,211,153,0.06) 40%, transparent 70%)",
            filter: "blur(20px)",
          }} />

          {/* 3D Floating Logo */}
          <div className="logo-3d-container relative z-10">
            <div className="logo-3d-inner">
              <img src="/logo.png" alt="Rexam-AI Logo"
                className="w-72 sm:w-80 h-auto object-contain"
                style={{ filter: "drop-shadow(0 20px 40px rgba(16,185,129,0.3)) drop-shadow(0 0 80px rgba(16,185,129,0.1))" }}
              />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute rounded-2xl px-4 py-3 animate-float-slow shadow-xl border border-slate-200 bg-white"
            style={{ top: "10%", right: "0", animationDelay: "1s" }}>
            <div className="text-[10px] text-slate-700 font-mono font-black mb-0.5">ACCURACY SCORE</div>
            <div className="text-2xl font-black text-emerald-600 stat-number">98.4%</div>
          </div>

          <div className="absolute rounded-2xl px-4 py-3 animate-float-slow shadow-xl border border-slate-200 bg-white"
            style={{ bottom: "18%", left: "0", animationDelay: "2.5s" }}>
            <div className="text-[10px] text-slate-700 font-mono font-black mb-0.5">QUESTIONS SOLVED</div>
            <div className="text-2xl font-black text-slate-900 stat-number">24,871</div>
          </div>

          <div className="absolute rounded-xl px-3.5 py-2 animate-float-slow shadow-lg border border-slate-200 bg-white"
            style={{ bottom: "8%", right: "8%", animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-900 font-black">AI Neural Engine Online</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const stats = [
  { label: "Active Students", value: "500K+", icon: GraduationCap, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { label: "Questions Solved", value: "42M+", icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
  { label: "Exam Topics", value: "8,400+", icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  { label: "Pass Rate Boost", value: "94%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  { label: "Institutions", value: "120+", icon: Building2, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
]

function StatsBar() {
  return (
    <section className="relative bg-slate-50 py-12 overflow-hidden border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4 py-2">
              <div className={`h-11 w-11 mx-auto rounded-2xl ${s.bg} border flex items-center justify-center mb-3 shadow-sm`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="text-3xl lg:text-4xl font-black text-slate-900 font-outfit tracking-tight">{s.value}</div>
              <div className="text-xs font-black text-slate-800 uppercase tracking-wider mt-1.5">{s.label}</div>
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
    desc: "Proprietary neural engine learns each student's strengths and gaps in real time, dynamically adjusting question difficulty and topic weighting.",
    tag: "Core AI",
  },
  {
    icon: BarChart3,
    title: "Deep Performance Analytics",
    desc: "Dashboard-grade reporting for students, instructors, and administrators — track mastery by topic, time-on-task, and predictive exam readiness scores.",
    tag: "Analytics",
  },
  {
    icon: BookOpen,
    title: "Curriculum-Aligned Content",
    desc: "10,000+ exam-accurate questions curated by domain experts across medical, engineering, law, finance, and academic boards worldwide.",
    tag: "Content",
  },
  {
    icon: FileSpreadsheet,
    title: "Universal Multilingual OCR",
    desc: "Extract handwritten notes and printed PDF question papers across English, Hindi, and Tamil with instant formula parsing.",
    tag: "OCR Scanner",
  },
  {
    icon: Sparkles,
    title: "AI Tutor & Solution Keys",
    desc: "24/7 AI-powered explanations that explain concepts step-by-step, answer doubts, and pinpoint misconceptions.",
    tag: "AI Tutor",
  },
  {
    icon: ShieldCheck,
    title: "Safe CBT Exam Engine",
    desc: "Anti-malpractice lock, tab-switching warnings, automated audit logs, and instant evaluating scorecards.",
    tag: "Safe CBT",
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 bg-[#f0fdf4] section-glow overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 font-bold">
            Platform Capabilities
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Built for <span className="shimmer-text">Aspirants & Institutions</span>
            <br />
            <span className="text-emerald-800/80 font-normal italic text-3xl lg:text-4xl">that demand excellence</span>
          </h2>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto font-medium">
            Every feature engineered for precision mastery — from individual student practice to 50,000-seat institutional CBT testing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-3d bg-white rounded-3xl p-7 group cursor-pointer border border-slate-200 hover:border-emerald-400 transition-colors shadow-sm hover:shadow-md">
              <div className="flex items-start gap-4 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <f.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-emerald-800 uppercase tracking-widest mt-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-black">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors font-outfit">
                {f.title}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">{f.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-xs font-black text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>Explore capability</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up via 1-click Google or Email. Configure your target exams (SSC, Banking, UPSC, Railways)." },
  { num: "02", title: "AI Builds Learning Paths", desc: "The adaptive engine evaluates your baseline knowledge and generates personalized diagnostic practice sets." },
  { num: "03", title: "Practice with Real CBT Engine", desc: "Timed conditions, instant step-by-step AI proofs, and daily streak tracking keep your preparation sharp." },
  { num: "04", title: "Track Mastery & Rank High", desc: "Speed vs accuracy metrics, weak area alerts, and predictive exam readiness scorecards ensure success." },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 font-bold">
            How It Works
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            From Practice to <span className="shimmer-text">Results</span>
            <br />
            <span className="text-emerald-800/80 font-normal italic text-3xl">in four simple steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px step-connector" />

          {steps.map((step) => (
            <div key={step.num} className="relative group">
              <div className="bg-white rounded-3xl p-7 h-full card-3d border border-slate-200 group-hover:border-emerald-300 transition-colors duration-300 shadow-sm">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-sm mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700">
                  {step.num}
                </div>
                <h3 className="text-slate-900 font-black text-lg mb-3 group-hover:text-emerald-700 transition-colors font-outfit">
                  {step.title}
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const subjects = [
  { name: "SSC (CGL, CHSL, MTS)", icon: Landmark, count: "12,500+ Questions" },
  { name: "Banking (IBPS & SBI PO)", icon: CreditCard, count: "9,800+ Questions" },
  { name: "UPSC Civil Services", icon: Globe2, count: "7,400+ Questions" },
  { name: "Railways RRB NTPC", icon: Train, count: "8,200+ Questions" },
  { name: "Quantitative Aptitude", icon: Calculator, count: "15,000+ Questions" },
  { name: "Logical & Verbal Reasoning", icon: Brain, count: "11,200+ Questions" },
]

function SubjectsSection() {
  return (
    <section className="relative py-24 bg-[#f0fdf4]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 font-bold">
              Exam Coverage
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Every Major Exam.
              <br />
              <span className="shimmer-text">One Intelligent Platform.</span>
            </h2>
            <p className="text-slate-700 text-base leading-relaxed font-medium">
              From competitive government exams to full-length institutional test series — Rexam-AI covers them all with
              expert-verified, syllabus-accurate question banks updated regularly.
            </p>
            <Link to="/student/exams">
              <button className="btn-primary text-white font-black px-7 py-3.5 rounded-2xl text-sm shadow-md shadow-emerald-600/20">
                Browse All Exams →
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {subjects.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-5 card-3d group cursor-pointer border border-slate-200 hover:border-emerald-300 transition-colors shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-slate-900 font-black text-sm mb-1 group-hover:text-emerald-700 transition-colors">{s.name}</div>
                <div className="text-emerald-700 text-xs font-mono font-bold">{s.count}</div>
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
    <section className="relative py-28 overflow-hidden" style={{
      background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 35%, #dcfce7 100%)"
    }}>
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)",
      }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="flex justify-center mb-4">
          <div className="animate-pulse-glow rounded-full p-2.5 bg-white/90 border border-emerald-200 shadow-md">
            <img src="/logo.png" alt="Rexam-AI"
              className="w-20 h-auto object-contain"
              style={{ filter: "drop-shadow(0 0 20px rgba(16,185,129,0.4))" }}
            />
          </div>
        </div>

        <h2 className="text-5xl lg:text-7xl font-black leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          <span className="shimmer-text">Ready to Transform</span>
          <br />
          <span className="text-slate-900">Exam Outcomes?</span>
        </h2>

        <p className="text-slate-800 text-xl max-w-xl mx-auto leading-relaxed font-semibold">
          Join 500,000+ students and 120+ institutions achieving measurably higher pass rates with Rexam-AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <button className="btn-primary text-white font-black px-10 py-5 rounded-2xl text-base shadow-xl shadow-emerald-600/30">
              Start Free — No Credit Card
            </button>
          </Link>
          <Link to="/student/practice">
            <button className="bg-white text-slate-900 border border-slate-200 font-black px-10 py-5 rounded-2xl text-base hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm">
              Schedule CBT Demo
            </button>
          </Link>
        </div>

        <p className="text-slate-700 text-xs font-bold">
          Free tier includes daily mock tests & AI explanations · No setup fee · Instant access
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12 text-left">
          <div className="col-span-2 space-y-4">
            <img src="/logo.png" alt="Rexam-AI" className="h-12 w-auto object-contain" />
            <p className="text-slate-700 text-sm leading-relaxed max-w-xs font-medium">
              Intelligent exam preparation for students who aim higher and institutions that demand excellence.
            </p>
          </div>

          {[
            { heading: "Platform", links: [{ label: "Mock Tests", href: "/student/exams" }, { label: "PYQs Bank", href: "/student/pyqs" }, { label: "Aptitude AI", href: "/student/practice" }, { label: "Performance", href: "/student/analytics" }] },
            { heading: "Company", links: [{ label: "About Rexam", href: "/about" }, { label: "Support & Help", href: "/contact" }, { label: "Admin Portal", href: "/admin" }] },
            { heading: "Account", links: [{ label: "Sign In", href: "/login" }, { label: "Register", href: "/register" }, { label: "Forgot Password", href: "/forgot-password" }] },
          ].map((col) => (
            <div key={col.heading} className="space-y-4">
              <h4 className="text-slate-900 text-xs font-black uppercase tracking-widest">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.href} className="text-slate-700 text-sm hover:text-emerald-700 font-bold transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs font-bold">
            © 2026 Rexam-AI. All rights reserved. Study Purpose | Intelligent Learning Platform.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-800 font-black">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
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
