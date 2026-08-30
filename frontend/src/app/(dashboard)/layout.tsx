import { Sidebar } from "@/components/layout/Sidebar";
import { FloatingAiCoach } from "@/components/ui/FloatingAiCoach";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-[#f8fafc] text-slate-900">
        <div className="max-w-6xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
      <FloatingAiCoach />
    </div>
  );
}
