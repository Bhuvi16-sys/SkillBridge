"use client";

import Link from 'next/link';
import { Sparkles, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PublicNavbar() {
  const { user, userProfile, loading, logout } = useAuth();

  return (
    <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Sparkles className="w-6 h-6 text-teal-500 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-400 transition-colors">SkillBridge AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#features" className="hover:text-teal-400 transition-colors">Features</Link>
          <Link href="/#workflow" className="hover:text-teal-400 transition-colors">How it Works</Link>
          <Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
              <span>Checking session...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                Hi, {userProfile?.fullName || user.displayName || 'Learner'}
              </span>
              <Link 
                href="/dashboard" 
                className="text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-slate-950 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-teal-400 transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-slate-950 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]">
                Sign Up Free
              </Link>
              <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
              <Link href="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hidden sm:block">
                Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
