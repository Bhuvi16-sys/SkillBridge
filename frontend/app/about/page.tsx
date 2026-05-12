import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Compass, ShieldAlert } from 'lucide-react';


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-teal-500/30 flex flex-col justify-between">
      <div>
        <PublicNavbar />

        {/* Hero Header */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] -z-10"></div>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Our Mission is to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Accelerate Human Potential.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              We believe static education is broken. SkillBridge AI builds personalized, adaptive learning paths powered by state-of-the-art Generative AI.
            </p>
          </div>
        </section>

        {/* Vision & Problem Solved */}
        <section className="py-16 border-t border-slate-900">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12">
            
            {/* Vision card */}
            <div className="bg-[#1e293b]/30 backdrop-blur-md border border-slate-800/60 p-8 rounded-2xl relative overflow-hidden">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6">
                <Compass className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">Our Vision</h2>
              <p className="text-slate-400 leading-relaxed">
                We envision a future where learning is perfectly personalized to every individual's unique cognitive profile. By mapping knowledge gaps at an atomic level, we help students skip the fluff, focus on weak points, and master complex subjects 10x faster.
              </p>
            </div>

            {/* Problem Solved card */}
            <div className="bg-[#1e293b]/30 backdrop-blur-md border border-slate-800/60 p-8 rounded-2xl relative overflow-hidden">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">The Problem We Solve</h2>
              <p className="text-slate-400 leading-relaxed">
                Traditional platforms offer linear, non-adaptive courses. If you are struggling with graphs, they throw more graph exercises at you—ignoring the fact that you might actually be struggling with the underlying recursion principles. SkillBridge AI traces, identifies, and targets the root cause.
              </p>
            </div>

          </div>
        </section>

        {/* Platform Overview */}
        <section className="py-20 bg-slate-900/30 border-t border-slate-900">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-12">The Adaptive Learning Engine</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="p-6 rounded-xl bg-[#1e293b]/20 border border-slate-800/40">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-sm">1</div>
                  <h3 className="font-bold text-white">Real-Time Evaluation</h3>
                </div>
                <p className="text-sm text-slate-400">Our engine continuously analyzes your performance, measuring response times and accuracy to build a precise cognitive map.</p>
              </div>

              <div className="p-6 rounded-xl bg-[#1e293b]/20 border border-slate-800/40">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-sm">2</div>
                  <h3 className="font-bold text-white">Gemini Integration</h3>
                </div>
                <p className="text-sm text-slate-400">Using the Gemini API, we distill difficult educational concepts into highly clear, customized study snippets specific to your gaps.</p>
              </div>

              <div className="p-6 rounded-xl bg-[#1e293b]/20 border border-slate-800/40">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-sm">3</div>
                  <h3 className="font-bold text-white">Continuous Improvement</h3>
                </div>
                <p className="text-sm text-slate-400">As you study, our platform dynamic updates, shifting focus to new target areas, tracking mastery and overall growth.</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      <PublicFooter />
    </div>
  );
}
