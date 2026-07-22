"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { PenTool } from "lucide-react"

export default function StudentExamsPage() {
  return (
    <ComingSoon 
      title="My Exams"
      description="View, register, and launch upcoming CBT mock tests and live examinations."
      backHref="/student"
      icon={PenTool}
    />
  )
}
