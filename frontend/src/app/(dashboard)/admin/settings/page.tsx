"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <ComingSoon 
      title="Admin Settings"
      description="Configure system parameters, RBAC roles, institute branding, and proctoring threshold scores."
      backHref="/admin"
      icon={Settings}
    />
  )
}
