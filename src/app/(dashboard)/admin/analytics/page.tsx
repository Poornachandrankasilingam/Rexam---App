"use client"

import { ComingSoon } from "@/components/ui/ComingSoon"
import { BarChart3 } from "lucide-react"

export default function AdminAnalyticsPage() {
  return (
    <ComingSoon 
      title="Platform Analytics"
      description="Track platform usage, student performance distribution, batch statistics, and revenue insights."
      backHref="/admin"
      icon={BarChart3}
    />
  )
}
