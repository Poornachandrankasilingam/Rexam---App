import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  BookOpen, 
  PenTool, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  FileText,
  PlusCircle,
  Users,
  Award,
  Sparkles,
  Layers,
  CreditCard,
  UserCheck,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { logout, user } = useAuth()

  const adminLinks = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Create Exam", href: "/admin/exams/create", icon: PlusCircle },
    { name: "Manage Exams", href: "/admin/exams", icon: PenTool },
    { name: "Question Papers", href: "/admin/question-papers", icon: FileSpreadsheet },
    { name: "Question Bank", href: "/admin/questions", icon: BookOpen },
    { name: "Previous Year Papers", href: "/admin/pyqs", icon: FileText },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Exam Attempts", href: "/admin/attempts", icon: Layers },
    { name: "Proctoring Reports", href: "/admin/proctoring", icon: Shield },
    { name: "Results", href: "/admin/results", icon: Award },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "AI Mock Tests", href: "/admin/ai-mock-tests", icon: Sparkles },
    { name: "Customers", href: "/admin/customers", icon: UserCheck },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const studentLinks = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Available Exams", href: "/student/exams", icon: PenTool },
    { name: "My Exams", href: "/student/my-exams", icon: Layers },
    { name: "Previous Year Papers", href: "/student/pyqs", icon: FileText },
    { name: "AI Mock Tests", href: "/student/mock-tests", icon: Sparkles },
    { name: "Results", href: "/student/results", icon: Award },
    { name: "Performance Analytics", href: "/student/analytics", icon: BarChart3 },
    { name: "AI Reports", href: "/student/reports", icon: HelpCircle },
    { name: "Profile", href: "/student/profile", icon: UserCheck },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ]

  const links = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? adminLinks : studentLinks

  return (
    <div className="w-64 border-r border-blue-500/20 glass flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <img 
              src="/logo.jpg" 
              alt="Rexam Logo" 
              width={36} 
              height={36} 
              className="relative h-9 w-9 rounded-xl object-cover border border-white/30 shadow-md" 
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight font-outfit text-white">
            REXAM<span className="text-blue-400">.AI</span>
          </span>
        </Link>
      </div>

      {/* User Badge */}
      <div className="px-5 py-3 border-b border-white/5 bg-blue-950/20">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || "Aspirant"}</p>
            <p className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider mt-0.5">{user?.role || "STUDENT"}</p>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50 flex-shrink-0" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive = pathname === link.href
          const LinkIcon = link.icon
          return (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative",
                isActive 
                  ? "btn-3d-blue text-white shadow-md shadow-blue-500/30 border border-blue-400/40" 
                  : "text-slate-300 hover:bg-blue-500/10 hover:text-white"
              )}
            >
              {LinkIcon && (
                <LinkIcon className={cn("h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
              )}
              <span className="font-semibold truncate">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3.5 py-2.5 w-full rounded-xl text-xs font-bold text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
