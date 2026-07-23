"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { BookOpen } from "lucide-react"

export default function AdminQuestionsPage() {
  return (
    <ComingSoon 
      title="Question Bank Management"
      description="Upload questions via PDF/OCR, tag topics, define answer keys, and manage AI question generation."
      backHref="/admin"
      icon={BookOpen}
    />
  )
}
