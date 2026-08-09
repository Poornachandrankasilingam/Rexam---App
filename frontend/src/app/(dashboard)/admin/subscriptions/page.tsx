"use client"

import { CreditCard, CheckCircle2, Star } from "lucide-react"

export default function SubscriptionManagementPage() {
  const plans = [
    { name: "Free Tier", price: "₹0 / mo", description: "Access to standard PYQs and practice tests", active: true },
    { name: "Pro Aspirant", price: "₹499 / mo", description: "Unlimited CBT exams, AI mock test generator, & AI proctoring reports", active: false },
    { name: "Institutional", price: "Custom", description: "Bulk student management & custom OCR exam creation", active: false },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="glass p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-background to-emerald-500/10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Monetization & Plans</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-white">Subscription Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage subscription tiers, feature access levels, and subscriber lists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.name} className="glass p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white font-outfit">{p.name}</h3>
                {p.active && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Default</span>}
              </div>
              <p className="text-2xl font-extrabold text-blue-400 font-outfit">{p.price}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
