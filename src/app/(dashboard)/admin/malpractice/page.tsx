"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { Shield } from "lucide-react"

export default function AdminMalpracticePage() {
  return (
    <ComingSoon 
      title="Proctoring & Malpractice Logs"
      description="Review AI proctoring alerts, flag suspicious eye/face movements, tab switches, and audio detection logs."
      backHref="/admin"
      icon={Shield}
    />
  )
}
