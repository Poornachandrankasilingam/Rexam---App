"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { FileText } from "lucide-react"

export default function StudentPYQsPage() {
  return (
    <ComingSoon 
      title="Previous Year Question Bank"
      description="Access solved previous year question papers for SSC, UPSC, Banking, and RRB."
      backHref="/student"
      icon={FileText}
    />
  )
}
