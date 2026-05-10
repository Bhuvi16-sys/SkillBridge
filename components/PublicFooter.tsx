import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-teal-500" />
          <span className="font-bold tracking-tight">SkillBridge AI</span>
        </div>
        <p className="text-slate-500 text-sm">© 2026 SkillBridge AI. Built with Next.js & Gemini.</p>
        <div className="flex gap-4 text-sm text-slate-400">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
