"use client";

import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { useState } from 'react';
import { Mail, MessageSquare, CheckCircle2, ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "How does the Gemini API personalization work?",
    answer: "Our system records your answers and patterns. We supply these insights to the Gemini API which dynamically writes personalized explanations, designs study guides, and generates custom quiz structures tailored perfectly to your cognitive state."
  },
  {
    question: "Can SkillBridge AI be used for any subject?",
    answer: "Currently, our models are optimized for technical domains like Software Engineering, Algorithms, and Data Structures. We plan to roll out full support for math, physics, and humanities in Q3 2026."
  },
  {
    question: "Is there a free tier or trial?",
    answer: "Yes! You can test our diagnostic assessments and weak topic mapping completely free. Advanced features such as unlimited AI practice, mentor matching, and customized study planners are part of our Pro tier."
  },
  {
    question: "Is my personal study data private?",
    answer: "Absolutely. We encrypt all user metrics and strictly use anonymous identifiers when orchestrating personal curriculums through the Gemini API. We never sell your educational data."
  }
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-teal-500/30 flex flex-col justify-between">
      <div>
        <PublicNavbar />

        {/* Hero Area */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] -z-10"></div>
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              We'd Love to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Hear From You.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Have questions about our AI platform, integration options, or pricing plans? Reach out and our team will get back to you shortly.
            </p>
          </div>
        </section>

        {/* Contact Form & Socials */}
        <section className="py-12 max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-12 border-t border-slate-900">
          
          {/* Form Column (3/5) */}
          <div className="md:col-span-3 bg-[#1e293b]/30 backdrop-blur-md border border-slate-800/60 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-teal-400" /> Send a Message
            </h2>

            {submitted ? (
              <div className="bg-teal-500/10 border border-teal-500/30 p-6 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Message Sent Successfully!</h4>
                  <p className="text-sm text-slate-400">Thank you for reaching out. An AI solutions representative will respond to your email shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input required type="text" placeholder="Alex R." className="w-full bg-[#0f172a] border border-slate-800 focus:border-teal-500/50 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input required type="email" placeholder="alex@skillbridge.edu" className="w-full bg-[#0f172a] border border-slate-800 focus:border-teal-500/50 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</label>
                  <input required type="text" placeholder="Partnership, Platform Inquiry, Support..." className="w-full bg-[#0f172a] border border-slate-800 focus:border-teal-500/50 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message</label>
                  <textarea required rows={5} placeholder="Tell us how we can help..." className="w-full bg-[#0f172a] border border-slate-800 focus:border-teal-500/50 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors resize-none" />
                </div>
                <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors">
                  Submit Form
                </button>
              </form>
            )}
          </div>

          {/* Socials Column (2/5) */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-[#1e293b]/30 backdrop-blur-md border border-slate-800/60 p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-400" /> Contact Info
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Prefer direct communication? Drop us an email, or connect with our developers on open source community platforms.
              </p>
              <div className="text-sm space-y-2">
                <p className="text-slate-300"><strong>Inquiries:</strong> support@skillbridge.ai</p>
                <p className="text-slate-300"><strong>Corporate:</strong> contact@skillbridge.ai</p>
              </div>
            </div>

            <div className="bg-[#1e293b]/30 backdrop-blur-md border border-slate-800/60 p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Connect With Us</h3>
              <p className="text-sm text-slate-400 mb-6">Join our socials to track updates, read engineering logs, and share feedback.</p>
              <div className="flex gap-4">
                <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/30 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Twitter / X" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/30 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/30 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </section>

        {/* FAQs */}
        <section className="py-20 border-t border-slate-900 max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
            <MessageSquare className="w-8 h-8 text-teal-400" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#1e293b]/20 border border-slate-850 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)} 
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-[#1e293b]/40 transition-colors"
                >
                  <span className="font-bold text-white text-sm md:text-base">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-sm text-slate-400 leading-relaxed border-t border-slate-800/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
