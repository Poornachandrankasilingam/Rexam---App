import { Link } from "react-router-dom"
import { Menu, X, ArrowRight, Sparkles, BookOpen, Bot } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/ui/BrandLogo"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Available Exams", href: "/student/exams" },
    { name: "AI Coach & Mocking", href: "/student/ai-coach" },
    { name: "PYQs Bank", href: "/student/pyqs" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b13]/85 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 3D Logo Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-3 border-l border-white/10 pl-6">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-full px-5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>

              <Link to="/register">
                <Button size="sm" className="btn-3d-green rounded-full px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-white/10 px-4 pt-4 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <Link to="/login" className="block w-full" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full rounded-xl py-3 font-semibold text-white border-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/register" className="block w-full" onClick={() => setIsOpen(false)}>
              <Button className="btn-3d-green w-full rounded-xl py-3 font-bold text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
