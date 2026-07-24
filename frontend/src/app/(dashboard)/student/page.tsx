"use client"

import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Clock, 
  Target, 
  ArrowRight,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Overall Rank", value: "#1,245", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Avg. Accuracy", value: "84%", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Tests Taken", value: "24", icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
  ]

  const upcomingExams = [
    { title: "SSC CGL Tier-1 Mock #4", date: "Tomorrow, 10:00 AM", duration: "60 mins" },
    { title: "Quantitative Aptitude Mastery", date: "05 July, 02:00 PM", duration: "45 mins" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "Aspirant"}! 👋</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your preparation progress for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Upcoming & Recommended */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass p-8 rounded-3xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Upcoming Exams</h2>
              <Button variant="link" className="text-primary">View Calendar</Button>
            </div>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.title} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 border border-border group hover:border-primary/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-background rounded-xl flex items-center justify-center border border-border">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground">{exam.date} • {exam.duration}</p>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-full">Enter Code</Button>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-8 rounded-3xl border border-white/10 bg-primary/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Try AI Mock Test</h2>
                <p className="text-muted-foreground">Generate a custom test based on your weak areas identified by our AI.</p>
              </div>
              <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20">
                Generate Mock
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </section>
        </div>

        {/* Sidebar Content: Weak areas & Leaderboard */}
        <div className="space-y-6">
          <section className="glass p-6 rounded-3xl border border-white/10">
            <h3 className="text-lg font-bold mb-4">Focus Areas (AI)</h3>
            <div className="space-y-4">
              {[
                { subject: "Quant", topic: "Number Systems", progress: 65, color: "bg-emerald-500" },
                { subject: "English", topic: "Error Spotting", progress: 42, color: "bg-amber-500" },
                { subject: "Reasoning", topic: "Syllogism", progress: 78, color: "bg-green-500" },
              ].map((area) => (
                <div key={area.topic} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{area.topic}</span>
                    <span className="text-muted-foreground">{area.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${area.color}`} style={{ width: `${area.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
