import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function PublicNavbar() {
  return (
    <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-teal-500" />
          <span className="text-xl font-bold tracking-tight text-white">SkillBridge AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#features" className="hover:text-teal-400 transition-colors">Features</Link>
          <Link href="/#workflow" className="hover:text-teal-400 transition-colors">How it Works</Link>
          <Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </nav>
  );
}
