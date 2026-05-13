"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Users2, 
  Briefcase,
  ChevronRight, 
  Layers, 
  LogOut,
  Sparkles,
  Settings
} from 'lucide-react';

export default function CompanySidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { userProfile, user: currentUser } = useUser();
  const { logout } = useAuth();
  
  const recruiterName = userProfile?.fullName || currentUser?.displayName || "Recruiter";
  const companyName = userProfile?.companyName || "Organization Member";

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
        
        <div className="flex items-center justify-between hover:bg-slate-800/50 p-2 rounded-xl transition-colors mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center text-xl shrink-0">
              💼
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white truncate max-w-[150px]">{recruiterName}</p>
              <p className="text-xs text-slate-500 truncate max-w-[150px]">{companyName}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto sidebar-nav">
        <Link 
          href="/company-dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/company-dashboard" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Home className="w-5 h-5" /> Overview
        </Link>

        <Link 
          href="/company-dashboard/students" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/company-dashboard/students" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Users2 className="w-5 h-5" /> Find Students
        </Link>

        <Link 
          href="/company-dashboard/assessments" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/company-dashboard/assessments" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Briefcase className="w-5 h-5" /> Assessment Scores
        </Link>

        <Link 
          href="/company-dashboard/settings" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
            pathname === "/company-dashboard/settings" 
              ? "bg-teal-500/10 text-teal-400 font-medium" 
              : "hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Settings className="w-5 h-5" /> Profile Settings
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-semibold text-sm mt-2"
        >
          <LogOut className="w-5 h-5" /> Log Out
        </button>
      </nav>

      <div className="p-4 m-4 bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl text-left">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-400" /> Recruiter Hub
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Search qualified student scholars by readiness indexes, verified skills, and completed curriculum achievements.
        </p>
      </div>
    </aside>
    </>
  );
}
