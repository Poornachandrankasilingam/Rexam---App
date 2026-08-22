"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ExamSimulator3D } from "@/components/sections/ExamSimulator3D"

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

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#166534]">
          <Link to="/" className="hover:text-[#16a34a] transition-colors duration-200">Home</Link>
          <a href="#features" className="hover:text-[#16a34a] transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-[#16a34a] transition-colors duration-200">How It Works</a>
          <Link to="/student/exams" className="hover:text-[#16a34a] transition-colors duration-200">Exam Series</Link>
          <Link to="/student/pyqs" className="hover:text-[#16a34a] transition-colors duration-200">PYQs Bank</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <button className="text-sm text-[#166534] hover:text-[#15803d] transition-colors px-4 py-2 font-bold">
              Sign In
            </button>
          </Link>
          <Link to="/register">
            <button className="btn-primary text-sm font-bold text-white px-5 py-2.5 rounded-full shadow-md shadow-green-600/20">
              Get Started Free
            </button>
          </Link>
        </div>

        <button className="md:hidden text-[#166534]" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden nav-blur border-t border-green-100 px-6 py-4 flex flex-col gap-4">
          <Link to="/" className="text-[#166534] text-sm font-semibold py-1 hover:text-[#16a34a]">Home</Link>
          <a href="#features" className="text-[#166534] text-sm font-semibold py-1 hover:text-[#16a34a]" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-[#166534] text-sm font-semibold py-1 hover:text-[#16a34a]" onClick={() => setMenuOpen(false)}>How It Works</a>
          <Link to="/student/exams" className="text-[#166534] text-sm font-semibold py-1 hover:text-[#16a34a]">Available Exams</Link>
          <Link to="/student/pyqs" className="text-[#166534] text-sm font-semibold py-1 hover:text-[#16a34a]">PYQs Bank</Link>
          <div className="pt-2 border-t border-green-100 flex flex-col gap-2">
            <Link to="/login" className="w-full">
              <button className="w-full text-sm text-[#166534] py-2 font-bold rounded-xl border border-green-200">
                Sign In
              </button>
            </Link>
            <Link to="/register" className="w-full">
              <button className="btn-primary w-full text-sm font-bold text-white px-5 py-2.5 rounded-full">
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
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-mono text-[#15803d] uppercase tracking-widest border border-green-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            Enterprise 3D AI Study Platform
          </div>

          <h1 className="text-5xl lg:text-7xl font-black leading-[0.98] tracking-tight"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            <span className="text-[#0a2e1a]">Master Every</span>
            <br />
            <span className="shimmer-text">Exam with AI</span>
            <br />
            <span className="text-[#166534]/70 text-4xl lg:text-5xl font-normal italic">Intelligence</span>
          </h1>

          <p className="text-[#166534]/80 text-lg leading-relaxed max-w-md font-normal">
            Rexam-AI delivers adaptive, enterprise-grade exam preparation powered by intelligent
            learning algorithms — personalized to each student, scalable to every institution.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/register">
              <button className="btn-primary text-white font-bold px-8 py-4 rounded-2xl text-base flex items-center gap-2 shadow-lg shadow-green-600/25">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Learning Free
              </button>
            </Link>
            <Link to="/student/practice">
              <button className="glass border border-[#16a34a]/30 text-[#15803d] font-bold px-8 py-4 rounded-2xl text-base hover:bg-[#16a34a]/10 transition-all flex items-center gap-2 shadow-sm">
                <svg className="w-5 h-5 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 pt-4 border-t border-green-100">
            <div className="flex -space-x-2">
              {["#16a34a", "#4ade80", "#86efac", "#bbf7d0"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold shadow-sm"
                  style={{ background: c, color: "#052e16" }}>
                  {["AK", "SR", "MJ", "PL"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="text-[#0a2e1a] font-bold text-sm">500K+ Students</div>
              <div className="text-[#166534]/60 text-xs">across 120+ institutions</div>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-4 h-4 text-[#16a34a]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-[#166534]/70 text-xs font-bold ml-1">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Right — 3D Centerpiece Showcase */}
        <div className="relative flex items-center justify-center h-[480px] lg:h-[580px]">
          <div className="orbit-ring" style={{ width: 320, height: 320 }} />
          <div className="orbit-ring" style={{ width: 420, height: 420, opacity: 0.12 }} />
          <div className="orbit-ring" style={{ width: 500, height: 500, opacity: 0.07 }} />

          {[
            { size: 280, duration: "12s", delay: "0s", color: "#16a34a", dotSize: 10 },
            { size: 380, duration: "18s", delay: "-6s", color: "#4ade80", dotSize: 7 },
            { size: 460, duration: "24s", delay: "-12s", color: "#166534", dotSize: 5 },
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
            background: "radial-gradient(circle, rgba(22,163,74,0.2) 0%, rgba(74,222,128,0.08) 40%, transparent 70%)",
            filter: "blur(20px)",
          }} />

          {/* 3D Floating Logo */}
          <div className="logo-3d-container relative z-10">
            <div className="logo-3d-inner">
              <img src="/logo.png" alt="Rexam-AI Logo"
                className="w-72 sm:w-80 h-auto object-contain"
                style={{ filter: "drop-shadow(0 20px 40px rgba(22,163,74,0.35)) drop-shadow(0 0 80px rgba(22,163,74,0.15))" }}
              />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute glass-strong rounded-2xl px-4 py-3 animate-float-slow shadow-lg border border-green-200"
            style={{ top: "10%", right: "0", animationDelay: "1s" }}>
            <div className="text-[10px] text-[#166534]/70 font-mono font-bold mb-0.5">ACCURACY SCORE</div>
            <div className="text-2xl font-black text-[#16a34a] stat-number">98.4%</div>
          </div>

          <div className="absolute glass-strong rounded-2xl px-4 py-3 animate-float-slow shadow-lg border border-green-200"
            style={{ bottom: "18%", left: "0", animationDelay: "2.5s" }}>
            <div className="text-[10px] text-[#166534]/70 font-mono font-bold mb-0.5">QUESTIONS SOLVED</div>
            <div className="text-2xl font-black text-[#0a2e1a] stat-number">24,871</div>
          </div>

          <div className="absolute glass rounded-xl px-3.5 py-2 animate-float-slow shadow-md border border-green-200"
            style={{ bottom: "8%", right: "8%", animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
              <span className="text-xs text-[#166534] font-bold">AI Neural Engine Online</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const stats = [
  { label: "Active Students", value: "500K+", icon: "👩‍🎓" },
  { label: "Questions Solved", value: "42M+", icon: "✅" },
  { label: "Exam Topics", value: "8,400+", icon: "📚" },
  { label: "Pass Rate Improvement", value: "94%", icon: "🚀" },
  { label: "Institutions", value: "120+", icon: "🏛️" },
]

function StatsBar() {
  return (
    <section className="relative bg-white py-12 overflow-hidden border-y border-green-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-3xl px-8 py-8 grid grid-cols-2 md:grid-cols-5 gap-8 shadow-sm border border-green-200">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-[#16a34a] stat-number">{s.value}</div>
              <div className="text-[#166534]/60 text-xs font-bold mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    title: "Adaptive AI Engine",
    desc: "Proprietary neural engine learns each student's strengths and gaps in real time, dynamically adjusting question difficulty and topic weighting.",
    tag: "Core AI",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: "Deep Performance Analytics",
    desc: "Dashboard-grade reporting for students, instructors, and administrators — track mastery by topic, time-on-task, and predictive exam readiness scores.",
    tag: "Analytics",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    title: "Curriculum-Aligned Content",
    desc: "10,000+ exam-accurate questions curated by domain experts across medical, engineering, law, finance, and academic boards worldwide.",
    tag: "Content",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    title: "Universal Multilingual OCR",
    desc: "Extract handwritten notes and printed PDF question papers across English, Hindi, and Tamil with instant formula parsing.",
    tag: "OCR Scanner",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    title: "AI Tutor & Solution Keys",
    desc: "24/7 AI-powered explanations that explain concepts step-by-step, answer doubts, and pinpoint misconceptions.",
    tag: "AI Tutor",
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
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
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-mono text-[#15803d] uppercase tracking-widest border border-green-200">
            Platform Capabilities
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-[#0a2e1a]"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Built for <span className="shimmer-text">Aspirants & Institutions</span>
            <br />
            <span className="text-[#166534]/60 font-normal italic text-3xl lg:text-4xl">that demand excellence</span>
          </h2>
          <p className="text-[#166534]/70 text-lg max-w-2xl mx-auto">
            Every feature engineered for precision mastery — from individual student practice to 50,000-seat institutional CBT testing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-3d bg-white rounded-3xl p-7 group cursor-pointer border border-green-100 hover:border-green-300 transition-colors shadow-sm hover:shadow-md">
              <div className="flex items-start gap-4 mb-5">
                <div className="feature-icon-wrap w-12 h-12 rounded-2xl flex items-center justify-center text-[#16a34a] flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-xs font-mono text-[#16a34a] uppercase tracking-widest mt-1 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 font-bold">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0a2e1a] mb-3 group-hover:text-[#16a34a] transition-colors">
                {f.title}
              </h3>
              <p className="text-[#166534]/70 text-sm leading-relaxed">{f.desc}</p>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#16a34a] group-hover:translate-x-1 transition-transform">
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
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-mono text-[#15803d] uppercase tracking-widest border border-green-200">
            How It Works
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-[#0a2e1a]"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            From Practice to <span className="shimmer-text">Results</span>
            <br />
            <span className="text-[#166534]/60 font-normal italic text-3xl">in four simple steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px step-connector" />

          {steps.map((step) => (
            <div key={step.num} className="relative group">
              <div className="bg-white rounded-3xl p-7 h-full card-3d border border-green-100 group-hover:border-green-300 transition-colors duration-300 shadow-sm">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-sm mb-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(22,163,74,0.15), rgba(74,222,128,0.08))",
                    border: "1px solid rgba(22,163,74,0.25)",
                    color: "#16a34a",
                  }}>
                  {step.num}
                </div>
                <h3 className="text-[#0a2e1a] font-bold text-lg mb-3 group-hover:text-[#16a34a] transition-colors">
                  {step.title}
                </h3>
                <p className="text-[#166534]/70 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const subjects = [
  { name: "SSC (CGL, CHSL, MTS)", icon: "🏛️", count: "12,500+ Questions" },
  { name: "Banking (IBPS & SBI PO)", icon: "💳", count: "9,800+ Questions" },
  { name: "UPSC Civil Services", icon: "🇮🇳", count: "7,400+ Questions" },
  { name: "Railways RRB NTPC", icon: "🚆", count: "8,200+ Questions" },
  { name: "Quantitative Aptitude", icon: "🔢", count: "15,000+ Questions" },
  { name: "Logical & Verbal Reasoning", icon: "🧠", count: "11,200+ Questions" },
]

function SubjectsSection() {
  return (
    <section className="relative py-24 bg-[#f0fdf4]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-mono text-[#15803d] uppercase tracking-widest border border-green-200">
              Exam Coverage
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#0a2e1a] leading-tight"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Every Major Exam.
              <br />
              <span className="shimmer-text">One Intelligent Platform.</span>
            </h2>
            <p className="text-[#166534]/70 text-base leading-relaxed">
              From competitive government exams to full-length institutional test series — Rexam-AI covers them all with
              expert-verified, syllabus-accurate question banks updated regularly.
            </p>
            <Link to="/student/exams">
              <button className="btn-primary text-white font-bold px-7 py-3.5 rounded-2xl text-sm shadow-md shadow-green-600/20">
                Browse All Exams →
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {subjects.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-5 card-3d group cursor-pointer border border-green-100 hover:border-green-300 transition-colors shadow-sm">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="text-[#0a2e1a] font-bold text-sm mb-1 group-hover:text-[#16a34a] transition-colors">{s.name}</div>
                <div className="text-[#166534]/60 text-xs font-mono font-medium">{s.count}</div>
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
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(22,163,74,0.15) 0%, transparent 70%)",
      }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="flex justify-center mb-4">
          <div className="animate-pulse-glow rounded-full p-2.5 bg-white/80 border border-green-200 shadow-md">
            <img src="/logo.png" alt="Rexam-AI"
              className="w-20 h-auto object-contain"
              style={{ filter: "drop-shadow(0 0 20px rgba(22,163,74,0.4))" }}
            />
          </div>
        </div>

        <h2 className="text-5xl lg:text-7xl font-black leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          <span className="shimmer-text">Ready to Transform</span>
          <br />
          <span className="text-[#0a2e1a]">Exam Outcomes?</span>
        </h2>

        <p className="text-[#166534]/80 text-xl max-w-xl mx-auto leading-relaxed font-normal">
          Join 500,000+ students and 120+ institutions achieving measurably higher pass rates with Rexam-AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <button className="btn-primary text-white font-bold px-10 py-5 rounded-2xl text-base shadow-xl shadow-green-600/30">
              Start Free — No Credit Card
            </button>
          </Link>
          <Link to="/student/practice">
            <button className="bg-white text-[#166534] border border-green-200 font-bold px-10 py-5 rounded-2xl text-base hover:bg-green-50 transition-all shadow-sm">
              Schedule CBT Demo
            </button>
          </Link>
        </div>

        <p className="text-[#166534]/60 text-xs font-semibold">
          Free tier includes daily mock tests & AI explanations · No setup fee · Instant access
        </p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#f0fdf4] border-t border-green-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12 text-left">
          <div className="col-span-2 space-y-4">
            <img src="/logo.png" alt="Rexam-AI" className="h-12 w-auto object-contain" />
            <p className="text-[#166534]/70 text-sm leading-relaxed max-w-xs">
              Intelligent exam preparation for students who aim higher and institutions that demand excellence.
            </p>
          </div>

          {[
            { heading: "Platform", links: [{ label: "Mock Tests", href: "/student/exams" }, { label: "PYQs Bank", href: "/student/pyqs" }, { label: "Aptitude AI", href: "/student/practice" }, { label: "Performance", href: "/student/analytics" }] },
            { heading: "Company", links: [{ label: "About Rexam", href: "/about" }, { label: "Support & Help", href: "/contact" }, { label: "Admin Portal", href: "/admin" }] },
            { heading: "Account", links: [{ label: "Sign In", href: "/login" }, { label: "Register", href: "/register" }, { label: "Forgot Password", href: "/forgot-password" }] },
          ].map((col) => (
            <div key={col.heading} className="space-y-4">
              <h4 className="text-[#0a2e1a] text-xs font-bold uppercase tracking-widest">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.href} className="text-[#166534]/70 text-sm hover:text-[#16a34a] font-medium transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-green-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#166534]/60 text-xs font-medium">
            © 2026 Rexam-AI. All rights reserved. Study Purpose | Intelligent Learning Platform.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="text-xs font-mono text-[#166534]/70 font-semibold">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0a2e1a]">
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
