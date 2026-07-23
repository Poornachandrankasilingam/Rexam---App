"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { PenTool } from "lucide-react"

export default function AdminExamsPage() {
  return (
    <ComingSoon 
      title="Manage Exams"
      description="Create, schedule, configure sections, and publish test series for students."
      backHref="/admin"
      icon={PenTool}
    />
  )
}
