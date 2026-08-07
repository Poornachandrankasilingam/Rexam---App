import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Zap,
  Play
} from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      {/* Radiant Background Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Next-Gen CBT & AI Proctoring Platform</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-outfit text-white leading-[1.1] max-w-5xl mx-auto">
              Master Your <span className="gradient-text italic font-bold">Government Exams</span> <br className="hidden sm:inline" />
              With Precision AI.
            </h1>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed font-normal">
              Empowering aspirants for <span className="text-indigo-400 font-semibold">SSC, UPSC, Banking & Railways</span> with AI proctoring, custom aptitude test generation, and instant step-by-step evaluation.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full h-14 px-9 text-base font-bold shadow-xl shadow-indigo-600/30 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 border border-indigo-400/40 transition-all transform hover:scale-105">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/student/practice">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-base font-bold glass glass-hover text-slate-200 border-white/15">
                  <Play className="h-4 w-4 mr-2 text-emerald-400 fill-current" />
                  View Practice Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Value Proposition Cards Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: ShieldCheck, 
                title: "AI Proctoring Engine", 
                desc: "Real-time webcam facial detection, tab switch warnings, and automated malpractice logs.",
                color: "text-rose-400",
                bg: "bg-rose-500/10 border-rose-500/20"
              },
              { 
                icon: Zap, 
                title: "Custom Aptitude Generator", 
                desc: "Make your own practice sets by subject, difficulty, question count, and live countdown timer.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10 border-indigo-500/20"
              },
              { 
                icon: BrainCircuit, 
                title: "Instant Score & Analytics", 
                desc: "Comprehensive scorecards, accuracy percentile analysis, and step-by-step solution breakdowns.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20"
              },
            ].map((feature) => (
              <div 
                key={feature.title} 
                className="glass glass-hover p-8 rounded-3xl text-left space-y-4 relative group"
              >
                <div className={`h-14 w-14 rounded-2xl ${feature.bg} border flex items-center justify-center transition-all group-hover:scale-110`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold font-outfit text-white group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
