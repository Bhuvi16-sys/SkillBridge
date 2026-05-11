"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { Palette, Settings, Bell, Menu } from "lucide-react";

export default function TopNavbar() {
  const pathname = usePathname();
  const { notifications } = useDashboard();

  // Get active unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Dynamically map page titles in the header based on sub-routes
  let pageTitle = "Dashboard";
  if (pathname === "/dashboard/assistant") pageTitle = "AI Assistant Hub";
  if (pathname === "/dashboard/planner") pageTitle = "AI Study Planner";
  if (pathname === "/dashboard/analytics") pageTitle = "Performance Analytics";
  if (pathname === "/dashboard/notifications") pageTitle = "Notification Center";
  if (pathname === "/dashboard/achievements") pageTitle = "Achievements & Leaderboard";
  if (pathname === "/dashboard/profile") pageTitle = "Student Profile";
  if (pathname === "/dashboard/settings") pageTitle = "Settings & Preferences";

  return (
    <header className="h-[72px] flex items-center justify-between px-8 w-full border-b border-slate-800/40 bg-[#0B1120]/40 backdrop-blur-md">
      <div className="flex items-center gap-4 text-left">
        <button className="text-slate-400 hover:text-white lg:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-5">
        <Link 
          href="/dashboard/settings" 
          className="text-slate-400 hover:text-white transition-colors" 
          title="Customize Theme"
        >
          <Palette className="w-5 h-5" />
        </Link>
        <Link 
          href="/dashboard/settings" 
          className="text-slate-400 hover:text-white transition-all duration-200" 
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>
        
        {/* Glowing notification count link linking straight to Notification Center */}
        <Link 
          href="/dashboard/notifications" 
          className="relative text-slate-400 hover:text-white transition-all duration-200"
          title="Notification Center"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {unreadCount}
            </span>
          )}
        </Link>
        
        <Link href="/dashboard/profile" title="View Profile">
          <div className="w-8 h-8 rounded-full border border-slate-700 hover:border-teal-400 bg-slate-950/80 flex items-center justify-center text-sm transition-all cursor-pointer ml-2 shadow-md select-none">
            👨‍💻
          </div>
        </Link>
      </div>
    </header>
  );
}
