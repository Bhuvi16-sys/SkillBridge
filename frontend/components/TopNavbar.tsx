"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useUser } from "@/context/UserContext";
import { Settings, Bell, Menu, Briefcase } from "lucide-react";

export default function TopNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { role, userProfile } = useUser();

  // Safely consume DashboardContext ONLY if within DashboardProvider
  let unreadCount = 0;
  try {
    const dashboard = useDashboard();
    if (dashboard && dashboard.notifications) {
      unreadCount = dashboard.notifications.filter(n => !n.read).length;
    }
  } catch (e) {
    // Gracefully handle corporate recruiter portals where useDashboard is not present
  }

  // Dynamically map page titles in the header based on sub-routes
  let pageTitle = "Dashboard";
  
  if (role === "company") {
    pageTitle = "Corporate Portal";
    if (pathname === "/company-dashboard") pageTitle = "Corporate Recruitment Hub";
    if (pathname === "/company-dashboard/students") pageTitle = "Find Student Scholars";
    if (pathname === "/company-dashboard/connections") pageTitle = "My Scholar Connections";
  } else {
    if (pathname === "/dashboard/assistant") pageTitle = "AI Assistant Hub";
    if (pathname === "/dashboard/planner") pageTitle = "AI Study Planner";
    if (pathname === "/dashboard/analytics") pageTitle = "Performance Analytics";
    if (pathname === "/dashboard/notifications") pageTitle = "Notification Center";
    if (pathname === "/dashboard/achievements") pageTitle = "Achievements & Leaderboard";
    if (pathname === "/dashboard/profile") pageTitle = "Student Profile";
    if (pathname === "/dashboard/settings") pageTitle = "Settings & Preferences";
  }

  return (
    <header className="h-[72px] flex items-center justify-between px-8 w-full border-b border-slate-800/40 bg-[#0B1120]/40 backdrop-blur-md">
      <div className="flex items-center gap-4 text-left">
        <button 
          onClick={onMenuClick}
          className="text-slate-400 hover:text-white lg:hidden p-1 rounded-lg hover:bg-slate-800/40 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-white tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-5">
        {role === "company" ? (
          <>
            {/* Elegant Recruiter Quick Stats */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-semibold text-teal-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{userProfile?.companyName || "Organization Member"} Recruiter</span>
            </div>
            
            <Link href="/company-dashboard" title="View Company Dashboard">
              <div className="w-8 h-8 rounded-full border border-slate-700 hover:border-teal-400 bg-slate-950/80 flex items-center justify-center text-sm transition-all cursor-pointer shadow-md select-none">
                💼
              </div>
            </Link>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </header>
  );
}
