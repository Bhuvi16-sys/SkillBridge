import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { ArrowRight, Brain, Target, TrendingUp, Sparkles, CheckCircle2, Zap, Quote } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-teal-500/30 flex flex-col justify-between">
      <div>
        <PublicNavbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/20 rounded-full blur-[120px] -z-10"></div>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-teal-400 font-medium mb-8">
              <Sparkles className="w-4 h-4" /> Powered by Gemini API
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Stop Guessing. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Start Mastering.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              SkillBridge AI is an adaptive learning intelligence platform. We detect your weak topics instantly and generate a personalized recovery plan to ensure you pass your exams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto text-base font-semibold bg-white text-slate-900 px-8 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                Try the Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#workflow" className="w-full sm:w-auto text-base font-medium text-white px-8 py-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-all">
                See How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Screenshots / Mockup Section */}
        <section className="py-10 max-w-6xl mx-auto px-6">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Dashboard Dashboard" 
              className="rounded-xl w-full h-[500px] object-cover object-top opacity-80"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-800/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligence that adapts to you</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Traditional learning platforms offer static courses. SkillBridge AI dynamically changes based on your performance.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Weak Topic Detection</h3>
              <p className="text-slate-400 leading-relaxed">Our engine analyzes your practice tests to identify the exact sub-topics you are struggling with before you even realize it.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Suggestions</h3>
              <p className="text-slate-400 leading-relaxed">Powered by Gemini API, get highly contextual explanations and resources specifically tailored to your current knowledge gaps.</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Recovery Plans</h3>
              <p className="text-slate-400 leading-relaxed">We automatically generate step-by-step action plans to turn your weakest subjects into your strongest ones.</p>
            </div>
          </div>
        </section>

        {/* How it Works / AI Workflow */}
        <section id="workflow" className="py-24 bg-slate-900/30 border-y border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8">The AI Workflow</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold">1</div>
                      <div className="w-px h-full bg-slate-800 my-2"></div>
                    </div>
                    <div className="pb-4">
                      <h4 className="text-lg font-bold text-white mb-2">Practice Test</h4>
                      <p className="text-slate-400">Take a diagnostic quiz. We collect thousands of data points on your response times, answer patterns, and confidence levels.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center text-sm font-bold">2</div>
                      <div className="w-px h-full bg-slate-800 my-2"></div>
                    </div>
                    <div className="pb-4">
                      <h4 className="text-lg font-bold text-white mb-2">Analytics & Detection</h4>
                      <p className="text-slate-400">Our model analyzes the results to isolate your specific weak points down to the atomic concept level.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold">3</div>
                    </div>
                    <div className="pb-4">
                      <h4 className="text-lg font-bold text-white mb-2">Recovery Plan Generation</h4>
                      <p className="text-slate-400">The Gemini API orchestrates a personalized study curriculum to patch your knowledge gaps efficiently.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
                <div className="relative bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center"><Zap className="w-6 h-6 text-teal-400"/></div>
                    <div>
                      <h4 className="font-bold">Improvement Tracking</h4>
                      <p className="text-sm text-slate-400">Live synchronization</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-teal-500 w-3/4"></div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-1/2"></div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 w-5/6"></div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">You've improved by 25% in Data Structures since following the generated recovery plan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Trusted by Top Students</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl relative">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-800 opacity-50" />
              <p className="text-lg text-slate-300 mb-6 relative z-10">"SkillBridge AI completely changed how I study. Instead of re-reading textbooks, I just took tests, and the AI told me exactly what 3 paragraphs I needed to study. It saved me hundreds of hours."</p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?img=32" alt="Sarah J." className="w-12 h-12 rounded-full border-2 border-slate-700" />
                <div>
                  <p className="font-bold text-white">Sarah J.</p>
                  <p className="text-sm text-slate-500">Computer Science Major</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl relative">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-800 opacity-50" />
              <p className="text-lg text-slate-300 mb-6 relative z-10">"The Weak Topic Detection is basically magic. It realized I was failing dynamic programming questions not because of DP, but because my recursion fundamentals were weak."</p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?img=12" alt="Michael T." className="w-12 h-12 rounded-full border-2 border-slate-700" />
                <div>
                  <p className="font-bold text-white">Michael T.</p>
                  <p className="text-sm text-slate-500">Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden border-t border-slate-800/50">
          <div className="absolute inset-0 bg-teal-500/5"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to accelerate your learning?</h2>
            <p className="text-xl text-slate-400 mb-10">Join thousands of students using AI to study smarter, not harder.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-lg font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 px-8 py-4 rounded-xl transition-colors shadow-lg shadow-teal-500/25">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
