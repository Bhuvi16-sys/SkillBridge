"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Sparkles, Loader2, KeyRound, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Email validation
  useEffect(() => {
    if (touched) {
      if (!email) {
        setError("Email address is required");
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Please enter a valid email address");
      } else {
        setError("");
      }
    }
  }, [email, touched]);

  // Handle Resend countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }

    setIsSubmitting(true);

    // Simulate sending recovery link API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setCountdown(60);
      setCanResend(false);
    }, 1800);
  };

  const handleResend = () => {
    if (!canResend) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setCountdown(60);
      setCanResend(false);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 overflow-hidden selection:bg-teal-500/30">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* Floating Sparkles Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 group-hover:bg-teal-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.15)] group-hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]">
            <Sparkles className="w-6 h-6 text-teal-400" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            SkillBridge AI
          </span>
        </Link>
      </motion.div>

      {/* Forgot Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/30 to-blue-500/30 rounded-3xl blur-[12px] opacity-75 -z-10"></div>
        
        <div className="w-full bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="forgot-form"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Reset Password</h2>
                    <p className="text-xs text-slate-400">Recover your SkillBridge AI account access</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Enter the email address associated with your account and we'll send you a secure link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched(true)}
                        placeholder="you@example.com"
                        className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                          error ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
                        } h-12 pl-11 pr-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: -5 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -5 }}
                          className="text-xs font-medium text-red-400 pl-1"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Send Reset Link Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center bg-teal-500 hover:bg-teal-400 text-slate-950 h-12 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all duration-200 disabled:opacity-50 mt-6"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-900" />
                    ) : (
                      "Send Recovery Link"
                    )}
                  </motion.button>
                </form>

                {/* Return to Login */}
                <div className="mt-8 pt-4 border-t border-slate-800/50 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Return to Sign In
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(20,184,166,0.3)]"
                >
                  <CheckCircle className="w-10 h-10" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">Check Your Email</h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm mb-6">
                  We have sent a secure password recovery link to:<br/>
                  <strong className="text-teal-400 break-all">{email}</strong>
                </p>

                <div className="w-full space-y-4">
                  {/* Back to Login Button */}
                  <Link href="/login" className="block w-full">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white h-12 rounded-xl text-sm font-semibold border border-slate-700 transition-all"
                    >
                      Return to Login
                    </motion.button>
                  </Link>

                  {/* Resend Link Section */}
                  <p className="text-xs text-slate-500">
                    Didn't receive the email?{" "}
                    {canResend ? (
                      <button
                        onClick={handleResend}
                        disabled={isSubmitting}
                        className="text-teal-400 hover:text-teal-300 font-bold hover:underline bg-transparent border-none outline-none cursor-pointer"
                      >
                        {isSubmitting ? "Sending..." : "Resend Link"}
                      </button>
                    ) : (
                      <span>Resend available in <strong className="text-slate-400">{countdown}s</strong></span>
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </motion.div>

      {/* Footer Text */}
      <p className="mt-8 text-xs text-slate-600">
        Secure password encryption standards apply.
      </p>
    </div>
  );
}
