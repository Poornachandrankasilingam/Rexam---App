"use client"

import { motion } from "framer-motion"
import { LucideIcon, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ComingSoonProps {
  title: string
  description?: string
  backHref?: string
  icon?: LucideIcon
}

export function ComingSoon({
  title,
  description = "We are currently hard at work building this module. Check back soon for exciting updates!",
  backHref = "/student",
  icon: iconProp
}: ComingSoonProps) {
  const IconComponent = iconProp || Sparkles

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg text-center"
      >
        <div className="glass p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6 text-primary"
          >
            <IconComponent className="h-10 w-10 animate-pulse" />
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {title}
          </h1>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-primary border border-primary/20 mb-4">
            Under Active Development
          </span>

          <p className="text-muted-foreground leading-relaxed mb-8">
            {description}
          </p>

          <Link href={backHref}>
            <Button size="lg" className="rounded-xl px-6 font-semibold shadow-lg shadow-primary/20 group">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Return to Overview
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
