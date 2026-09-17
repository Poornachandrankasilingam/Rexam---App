import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { FloatingAiCoach } from "@/components/ui/FloatingAiCoach";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar Navigation */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top Header */}
        <DashboardHeader onMobileMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-[#070b13] dashboard-mesh-bg">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Performance Assistant */}
      <FloatingAiCoach />
    </div>
  );
}
