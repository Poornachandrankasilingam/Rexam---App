import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, BrainCircuit, ShieldCheck, GraduationCap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6 border border-primary/20">
              <BrainCircuit className="h-4 w-4 mr-2" />
              AI-Powered Exam Preparation
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
              Master Your <span className="text-primary italic">Government Exams</span> <br />
              with Precision AI.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 leading-relaxed">
              The most advanced CBT engine with AI proctoring, OCR-based question uploads, 
              and personalized evaluation for SSC, UPSC, Banking, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/25">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/student/practice">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg font-semibold bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  View Demo Practice
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats/Features area */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: ShieldCheck, title: "AI Proctoring", desc: "Advanced facial recognition & behavior analysis to ensure exam integrity." },
              { icon: GraduationCap, title: "PYQ Bank", desc: "Access thousands of previous year papers for SSC, RRB, and more." },
              { icon: BrainCircuit, title: "AI Evaluation", desc: "Instant subject-wise analysis and AI-driven weak area identification." },
            ].map((feature) => (
              <div key={feature.title} className="glass p-8 rounded-2xl text-left border border-white/10 hover:border-primary/30 transition-all group">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
