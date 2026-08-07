import { Link } from "react-router-dom"
import { Menu, X, ArrowRight, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: "Exams Portal", href: "/student/exams" },
    { name: "Aptitude Engine", href: "/student/practice" },
    { name: "PYQs Bank", href: "/student/pyqs" },
    { name: "Score Analytics", href: "/student/results" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-blue-500/20 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
              <img 
                src="/logo.jpg" 
                alt="Rexam Logo" 
                width={36} 
                height={36} 
                className="relative h-9 w-9 rounded-xl object-cover border border-white/30 shadow-lg" 
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-outfit text-white">
              REXAM<span className="text-blue-400">.AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-semibold text-slate-200 hover:text-blue-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-3 border-l border-white/10 pl-6">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full px-5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-blue-500/10">
                  Sign In
                </Button>
              </Link>

              <Link to="/register">
                <Button size="sm" className="btn-3d-blue rounded-full px-6 text-sm font-bold text-white">
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-blue-500/20 px-4 pt-4 pb-6 space-y-4">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:bg-blue-500/10 hover:text-blue-400 transition-all"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <Link to="/login" className="block w-full" onClick={() => setIsOpen(false)}>
              <Button variant="secondary" className="w-full rounded-xl py-3 font-semibold text-white">
                Sign In
              </Button>
            </Link>
            <Link to="/register" className="block w-full" onClick={() => setIsOpen(false)}>
              <Button className="btn-3d-blue w-full rounded-xl py-3 font-bold text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
