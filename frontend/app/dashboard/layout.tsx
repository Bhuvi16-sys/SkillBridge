"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { DashboardProvider } from "@/context/DashboardContext";
import { useUser } from "@/context/UserContext";
import { Loader2, Sparkles } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, skillsToLearn, interests } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (role === "company") {
        router.push("/company-dashboard");
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
          <Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...
        </div>
      </div>
    );
  }

  if (!user || role === "company") {
    return null; // Avoid rendering dashboard content while redirecting
  }

  const isProfileIncomplete = !skillsToLearn?.length || !interests?.length;

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-[#0B1120] text-slate-100 font-sans">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-[280px] flex flex-col h-screen overflow-hidden relative z-0">
          <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 pt-2">
            {isProfileIncomplete && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 backdrop-blur-md p-4 rounded-xl mb-6 mx-6 mt-6 flex justify-between items-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm font-semibold text-left">
                    Action Required: Complete your profile by adding your skills and interests to unlock personalized AI features.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-black transition-colors shrink-0"
                >
                  Complete Profile Now
                </button>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
