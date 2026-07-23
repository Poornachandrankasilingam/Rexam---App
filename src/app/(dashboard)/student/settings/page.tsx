"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { Settings } from "lucide-react"

export default function StudentSettingsPage() {
  return (
    <ComingSoon 
      title="Student Settings"
      description="Manage your profile information, password, target exams, and email notification preferences."
      backHref="/student"
      icon={Settings}
    />
  )
}
