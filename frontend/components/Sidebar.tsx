"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDashboard } from '@/context/DashboardContext';
import { 
  Home, 
  Calendar, 
  BarChart2, 
  Award, 
  ChevronRight, 
  TriangleAlert, 
  Bell, 
  ThumbsUp, 
  Layers, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, notifications } = useDashboard();
  const { logout } = useAuth();
  
  // Show up to 3 unread notifications in the sidebar widget
  const activeNotifs = notifications.filter(n => !n.read).slice(0, 3);

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      <aside className={`w-[280px] h-screen bg-[#0B1120]/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col transition-all duration-300 fixed left-0 top-0 z-50 text-slate-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
      <div className="p-6 pb-2">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-teal-400 mb-8">
          <Layers className="w-8 h-8 text-teal-400" />
          SkillBridge
        </Link>
        
        <Link 
          href="/dashboard/profile" 
          className="flex items-center justify-between hover:bg-slate-800/50 p-2 rounded-xl cursor-pointer transition-colors mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900/60 hover:border-teal-400 transition-colors flex items-center justify-center text-xl shrink-0">
              👨‍💻
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-slate-500">Level {user.level} {user.role}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto sidebar-nav">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/dashboard" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" /> Dashboard
        </Link>

        <Link 
          href="/dashboard/assistant" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/dashboard/assistant" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" /> AI Assistant
        </Link>

        <Link 
          href="/dashboard/planner" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/dashboard/planner" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Calendar className="w-5 h-5" /> AI Study Planner
        </Link>

        <Link 
          href="/dashboard/analytics" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/dashboard/analytics" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <BarChart2 className="w-5 h-5" /> Analytics
        </Link>
        <Link 
          href="/dashboard/achievements" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/dashboard/achievements" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Award className="w-5 h-5" /> Achievements
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-semibold text-sm mt-2"
        >
          <LogOut className="w-5 h-5" /> Log Out
        </button>
      </nav>

      <div className="p-4 m-4 bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl text-left">
        <h3 className="text-sm font-bold text-white mb-3">Smart Notifications</h3>
        {activeNotifs.length > 0 ? (
          <div className="space-y-3">
            {activeNotifs.map((notif) => (
              <div key={notif.id} className="flex gap-2 text-xs">
                {notif.type === "weakness" ? (
                  <TriangleAlert className="w-4 h-4 text-amber-500 shrink-0" />
                ) : notif.type === "missed" ? (
                  <Bell className="w-4 h-4 text-purple-400 shrink-0" />
                ) : (
                  <ThumbsUp className="w-4 h-4 text-teal-400 shrink-0" />
                )}
                <p className="text-slate-400">
                  <strong className="text-white">{notif.type === "weakness" ? "Weakness" : notif.type === "missed" ? "Missed" : "Spaced"}: </strong> 
                  {notif.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-xs italic">All notifications cleared!</p>
        )}
      </div>
    </aside>
    </>
  );
}
