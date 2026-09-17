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
  FileSpreadsheet,
  Bot,
  X,
  Zap,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { BrandLogo } from "@/components/ui/BrandLogo"

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

type NavItem = {
  name: string
  href: string
  icon: any
  badge?: string
}

type NavCategory = {
  label: string
  items: NavItem[]
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const { logout, user } = useAuth()

  const adminCategories: NavCategory[] = [
    {
      label: "CORE",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "AI Coach & Mocking", href: "/student/ai-coach", icon: Bot, badge: "AI" },
      ]
    },
    {
      label: "EXAM MANAGEMENT",
      items: [
        { name: "Create Exam", href: "/admin/exams/create", icon: PlusCircle },
        { name: "Manage Exams", href: "/admin/exams", icon: PenTool },
        { name: "Question Papers", href: "/admin/question-papers", icon: FileSpreadsheet },
        { name: "Question Bank", href: "/admin/questions", icon: BookOpen },
        { name: "PYQs Bank", href: "/admin/pyqs", icon: FileText },
        { name: "AI Mock Tests", href: "/admin/ai-mock-tests", icon: Sparkles },
      ]
    },
    {
      label: "CANDIDATES & AUDIT",
      items: [
        { name: "Students", href: "/admin/students", icon: Users },
        { name: "Exam Attempts", href: "/admin/attempts", icon: Layers },
        { name: "Proctoring Logs", href: "/admin/proctoring", icon: Shield },
        { name: "Results & Marks", href: "/admin/results", icon: Award },
        { name: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
      ]
    },
    {
      label: "SYSTEM",
      items: [
        { name: "Customers", href: "/admin/customers", icon: UserCheck },
        { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ]
    }
  ]

  const studentCategories: NavCategory[] = [
    {
      label: "OVERVIEW",
      items: [
        { name: "Dashboard", href: "/student", icon: LayoutDashboard },
        { name: "AI Coach & Mocking", href: "/student/ai-coach", icon: Bot, badge: "LIVE" },
      ]
    },
    {
      label: "EXAMINATION ARENA",
      items: [
        { name: "Available Exams", href: "/student/exams", icon: PenTool },
        { name: "My Exams", href: "/student/my-exams", icon: Layers },
        { name: "Practice Arena", href: "/student/practice", icon: Target },
        { name: "Previous Year Papers", href: "/student/pyqs", icon: FileText },
        { name: "AI Mock Tests", href: "/student/mock-tests", icon: Sparkles },
      ]
    },
    {
      label: "INSIGHTS & AI",
      items: [
        { name: "Results & Explanations", href: "/student/results", icon: Award },
        { name: "Performance Analytics", href: "/student/analytics", icon: BarChart3 },
        { name: "AI Diagnosis Reports", href: "/student/reports", icon: HelpCircle },
      ]
    },
    {
      label: "ACCOUNT",
      items: [
        { name: "Profile", href: "/student/profile", icon: UserCheck },
        { name: "Settings", href: "/student/settings", icon: Settings },
      ]
    }
  ]

  const categories = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? adminCategories : studentCategories

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={cn(
        "w-64 bg-[#0a0f1d] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out shadow-2xl",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0a0f1d]">
          <Link to="/" onClick={onCloseMobile}>
            <BrandLogo size="md" />
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Identity Banner */}
        <div className="px-5 py-3 border-b border-white/10 bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate font-outfit">{user?.name || "Candidate"}</p>
              <p className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider mt-0.5">
                {user?.role || "STUDENT"}
              </p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shadow-sm flex-shrink-0" />
          </div>
        </div>

        {/* Categorized Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
          {categories.map((category) => (
            <div key={category.label} className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase font-mono tracking-widest text-slate-400 mb-1.5">
                {category.label}
              </p>

              {category.items.map((link) => {
                const isActive = pathname === link.href
                const LinkIcon = link.icon
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={onCloseMobile}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative",
                      isActive 
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/40 font-extrabold" 
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {LinkIcon && (
                        <LinkIcon 
                          className={cn(
                            "h-4 w-4 transition-transform group-hover:scale-110 flex-shrink-0",
                            isActive ? "text-white" : "text-emerald-400"
                          )} 
                        />
                      )}
                      <span className="truncate">{link.name}</span>
                    </div>

                    {link.badge && (
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase font-mono tracking-wider ml-1",
                        isActive ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      )}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer Logout & Status */}
        <div className="p-3 border-t border-white/10 bg-[#070b13]">
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile()
              logout()
            }}
            className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
