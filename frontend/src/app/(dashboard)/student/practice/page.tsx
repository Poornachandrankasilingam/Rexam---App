"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { BookOpen } from "lucide-react"

export default function StudentPracticePage() {
  return (
    <ComingSoon 
      title="Practice Engine"
      description="Adaptive AI question practice mode organized by subject, topic, and difficulty."
      backHref="/student"
      icon={BookOpen}
    />
  )
}
