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
import { BrandLogo } from "@/components/ui/BrandLogo"

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
    <div className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-40 shadow-sm">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <Link to="/">
          <BrandLogo size="md" />
        </Link>
      </div>

      {/* User Badge */}
      <div className="px-5 py-3 border-b border-slate-100 bg-emerald-50/70">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-black text-slate-900 truncate">{user?.name || "Aspirant"}</p>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">{user?.role || "STUDENT"}</p>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm flex-shrink-0" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar bg-white">
        {links.map((link) => {
          const isActive = pathname === link.href
          const LinkIcon = link.icon
          return (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative",
                isActive 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500 font-black" 
                  : "text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 font-bold"
              )}
            >
              {LinkIcon && (
                <LinkIcon 
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110 flex-shrink-0",
                    isActive ? "text-white" : "text-emerald-600"
                  )} 
                />
              )}
              <span className="truncate">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
