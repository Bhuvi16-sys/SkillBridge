"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { DashboardProvider } from "@/context/DashboardContext";
import { Loader2, Sparkles } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-4 animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.15)]">
          <Sparkles className="w-8 h-8 text-teal-400" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-teal-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Avoid rendering dashboard content while redirecting
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-[#0B1120] text-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 lg:ml-[280px] flex flex-col h-screen overflow-hidden relative z-0">
          <TopNavbar />
          <main className="flex-1 overflow-y-auto p-8 pt-2">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
