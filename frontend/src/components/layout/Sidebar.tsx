import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  BookOpen, 
  PenTool, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const { logout, user } = useAuth()

  const links = user?.role === "ADMIN" ? [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Exams", href: "/admin/exams", icon: PenTool },
    { name: "Question Bank", href: "/admin/questions", icon: BookOpen },
    { name: "Malpractice", href: "/admin/malpractice", icon: Shield },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ] : [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "My Exams", href: "/student/exams", icon: PenTool },
    { name: "Practice", href: "/student/practice", icon: BookOpen },
    { name: "PYQs", href: "/student/pyqs", icon: FileText },
    { name: "Results", href: "/student/results", icon: BarChart3 },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ]

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.jpg" alt="Rexam Logo" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-xl font-bold tracking-tight"> REXAM </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          const LinkIcon = link.icon
          return (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {LinkIcon && <LinkIcon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />}
              <span className="font-medium">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}
