"use client";

import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
