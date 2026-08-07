"use client"

import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function AdminDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Active Aspirants", value: "14,502", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Exams Conducted", value: "342", icon: FileCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Critical Flags", value: "12", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Revenue (MTD)", value: "$4,250", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || "Admin"}. Manage examinations, students, and proctoring logs.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/admin/questions">
            <Button variant="outline" className="rounded-xl border-dashed">
              <Upload className="h-4 w-4 mr-2" />
              OCR Upload
            </Button>
          </Link>
          <Link to="/admin/exams">
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Exams Table */}
        <div className="lg:col-span-2 glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Examinations</h2>
            <Link to="/admin/exams">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/50 text-muted-foreground text-sm">
                  <th className="px-6 py-4 font-medium">Exam Name</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Participants</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "SSC CGL Practice 01", date: "Jun 12, 2026", status: "Completed", count: 1240 },
                  { name: "UPSC Prelims Mock", date: "Jul 05, 2026", status: "Upcoming", count: 4500 },
                  { name: "Railway Group D Set A", date: "Jul 10, 2026", status: "Draft", count: 0 },
                ].map((exam) => (
                  <tr key={exam.name} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{exam.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{exam.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                        exam.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 
                        exam.status === 'Upcoming' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{exam.count}</td>
                    <td className="px-6 py-4">
                      <Link to="/admin/analytics">
                        <Button variant="ghost" size="sm">Report</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Malpractice Feed */}
        <div className="glass rounded-3xl border border-white/10 overflow-hidden h-fit">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Proctoring Feed</h2>
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-6">
            {[
              { userName: "Rahul K.", event: "Multiple Faces Detected", time: "2 mins ago", risk: "High" },
              { userName: "Priya S.", event: "Tab Switched 3x", time: "5 mins ago", risk: "Medium" },
              { userName: "Amit V.", event: "User Left Seat", time: "12 mins ago", risk: "Medium" },
            ].map((feed, idx) => (
              <div key={`${feed.userName}-${idx}`} className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold">{feed.userName}</p>
                  <p className="text-xs text-muted-foreground">{feed.event}</p>
                  <p className="text-[10px] text-muted-foreground">{feed.time}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  feed.risk === 'High' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {feed.risk}
                </span>
              </div>
            ))}
            <Link to="/admin/malpractice" className="block">
              <Button variant="outline" className="w-full rounded-xl">View All Alerts</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
