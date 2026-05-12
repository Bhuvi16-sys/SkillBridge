"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanySidebar from "@/components/CompanySidebar";
import TopNavbar from "@/components/TopNavbar";
import { useUser } from "@/context/UserContext";
import { Loader2, Sparkles } from "lucide-react";

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role && role !== "company") {
        router.push("/dashboard");
      }
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4 animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.15)]">
          <Sparkles className="w-8 h-8 text-teal-400" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-teal-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Verifying Recruiter Credentials...
        </div>
      </div>
    );
  }

  if (!user || role !== "company") {
    return null; // Avoid rendering content during redirect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B1120] text-slate-100 font-sans">
      <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-[280px] flex flex-col h-screen overflow-hidden relative z-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
