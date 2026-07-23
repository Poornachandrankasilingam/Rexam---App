"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { BarChart3 } from "lucide-react"

export default function StudentResultsPage() {
  return (
    <ComingSoon 
      title="Performance & Analytics"
      description="Detailed score breakdowns, subject-wise accuracy analysis, and AI study recommendations."
      backHref="/student"
      icon={BarChart3}
    />
  )
}
