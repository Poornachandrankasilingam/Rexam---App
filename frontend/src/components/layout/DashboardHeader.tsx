import { useState } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { 
  Search, 
  Bell, 
  Sparkles, 
  ChevronRight, 
  Menu, 
  User, 
  LogOut, 
  Shield, 
  BookOpen, 
  Award,
  Zap
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Generate clean breadcrumb title from path
  const pathParts = location.pathname.split("/").filter(Boolean)
  const roleName = pathParts[0] ? pathParts[0].toUpperCase() : "PORTAL"
  const currentSection = pathParts[1]
    ? pathParts[1].replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Dashboard"

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/student/exams?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b13]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-emerald-400 font-mono font-bold tracking-wider">{roleName}</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-white font-outfit text-sm font-bold truncate max-w-[160px] sm:max-w-xs">
            {currentSection}
          </span>
        </div>
      </div>

      {/* Center: Quick Search Bar (Hidden on tiny screens) */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search examinations, mock drills, PYQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-xl bg-secondary/60 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono font-bold text-slate-400">
            ↵
          </span>
        </div>
      </form>

      {/* Right: AI Engine Status + User Profile Chip */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Live AI Status Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold font-mono">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AI Engine Active</span>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-white/10 transition-all"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white line-clamp-1">{user?.name || "Candidate"}</p>
              <p className="text-[10px] text-emerald-400 font-mono font-semibold">{user?.role || "STUDENT"}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 rounded-2xl glass-strong border border-white/10 shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 z-50"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to={user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? "/admin/settings" : "/student/profile"}
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <User className="h-4 w-4 text-emerald-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/student/results"
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Award className="h-4 w-4 text-cyan-400" />
                <span>My Performance</span>
              </Link>

              <div className="pt-1 border-t border-white/10">
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    logout()
                  }}
                  className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
