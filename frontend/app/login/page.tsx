"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { userProfileConverter, UserProfile } from "@/lib/models";
import { seedUserProfile } from "@/lib/curriculumSeeder";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

// Google G logo standard path
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string; submit?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  
  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Validate fields in real-time
  useEffect(() => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (touched.email) {
      if (!email) {
        newErrors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    
    if (touched.password) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }
    }
    
    setErrors(newErrors);
  }, [email, password, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to trigger validation
    setTouched({ email: true, password: true });
    
    // Final check
    const hasErrors = !email || !/\S+@\S+\.\S+/.test(email) || !password || password.length < 6;
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    if (!auth) {
      setErrors((prev) => ({ ...prev, submit: "Firebase is not configured. Please set your credentials in .env.local." }));
      setIsSubmitting(false);
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore profile
      let userRole = "student";
      if (db) {
        const docRef = doc(db, "users", user.uid).withConverter(userProfileConverter);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          userRole = docSnap.data().role || "student";
        }
      }

      setLoginSuccess(true);
      
      // Redirect based on user's role after showing success state
      setTimeout(() => {
        if (userRole === "company") {
          router.push("/company-dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      console.error("Firebase Login Error: ", err);
      let errorMessage = "Invalid email or password. Please try again.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    setErrors({});

    if (!auth || !db || !googleProvider) {
      setErrors((prev) => ({ ...prev, submit: "Firebase is not configured. Please set your credentials in .env.local." }));
      setIsGoogleSubmitting(false);
      return;
    }
    
    try {
      // 1. Authenticate with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Check and provision user profile document in Firestore
      const docRef = doc(db, "users", user.uid).withConverter(userProfileConverter);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          role: "student",
          fullName: user.displayName || "Google User",
          institution: "Not specified",
          gradeLevel: "freshman",
          subjectOfInterest: "General Study",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profilePictureUrl: user.photoURL || "",
          onboardingCompleted: false,
          skillsToLearn: [],
          interests: []
        };
        await setDoc(docRef, userProfile);

        // Seed default CS curriculum
        await seedUserProfile(user.uid, "compsci", user.displayName || "Google User");
      }

      const userRole = docSnap.exists() ? (docSnap.data().role || "student") : "student";

      setLoginSuccess(true);
      
      setTimeout(() => {
        if (userRole === "company") {
          router.push("/company-dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      console.error("Firebase Google Login Error: ", err);
      let errorMessage = "Failed to log in with Google.";
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "The login popup was closed before completing.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      }
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 overflow-hidden selection:bg-teal-500/30">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[200px] bg-gradient-to-b from-transparent via-teal-500/25 to-transparent -z-10 pointer-events-none"></div>

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

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/30 to-blue-500/30 rounded-3xl blur-[12px] opacity-75 -z-10"></div>
        
        <div className="w-full bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!loginSuccess ? (
              <motion.div
                key="login-form"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-sm text-slate-400">
                    Sign in to resume your adaptive learning journey
                  </p>
                </div>

                {!isFirebaseConfigured && (
                  <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 leading-relaxed shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <span className="font-extrabold text-amber-300">⚠️ Setup Connection Required:</span>
                    <p className="mt-1 text-slate-400 font-medium">
                      To enable real logins, copy <code className="text-amber-200 px-1 bg-slate-950/40 rounded font-bold">.env.example</code> to <code className="text-amber-200 px-1 bg-slate-950/40 rounded font-bold">.env.local</code> and fill in your Firebase credentials.
                    </p>
                  </div>
                )}

                {/* Google Sign-in Button */}
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full flex items-center justify-center bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-slate-200 disabled:opacity-50"
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-3 text-teal-400" />
                  ) : (
                    <GoogleIcon />
                  )}
                  {isGoogleSubmitting ? "Connecting to Google..." : "Continue with Google"}
                </motion.button>

                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="px-3 text-xs text-slate-500 uppercase tracking-widest font-bold">Or Email</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>

                {/* Main Form */}
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
                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                        placeholder="you@example.com"
                        className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                          errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
                        } h-12 pl-11 pr-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                        disabled={isSubmitting || isGoogleSubmitting}
                      />
                    </div>
                    {/* Error message */}
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: -5 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -5 }}
                          className="text-xs font-medium text-red-400 pl-1"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                        Password
                      </label>
                      <Link
                        href="/forgot"
                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                        placeholder="••••••••"
                        className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                          errors.password ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
                        } h-12 pl-11 pr-12 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                        disabled={isSubmitting || isGoogleSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {/* Error message */}
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: -5 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -5 }}
                          className="text-xs font-medium text-red-400 pl-1"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center pt-1">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-800 bg-slate-950/50 text-teal-500 focus:ring-teal-500 focus:ring-opacity-20 cursor-pointer accent-teal-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-xs font-medium text-slate-400 select-none cursor-pointer hover:text-slate-300 transition-colors">
                      Remember me on this device
                    </label>
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-400">
                      {errors.submit}
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full flex items-center justify-center bg-teal-500 hover:bg-teal-400 text-slate-950 h-12 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all duration-200 disabled:opacity-50 mt-6"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-900" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Sign In <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </motion.button>

                </form>

                <div className="mt-8 text-center">
                  <p className="text-xs text-slate-500">
                    Don't have an account?{" "}
                    <Link
                      href="/signup"
                      className="font-bold text-white hover:text-teal-400 transition-colors"
                    >
                      Sign Up Free
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(20,184,166,0.3)]"
                >
                  <CheckCircle className="w-10 h-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Login Successful</h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  Preparing your adaptive intelligence curriculum. Redirecting you...
                </p>
                <div className="mt-6 flex items-center justify-center text-teal-400 text-xs font-semibold gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Syncing data...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </motion.div>

      {/* Footer Text */}
      <p className="mt-8 text-xs text-slate-600">
        Secure authentication protected by industry standard encryption.
      </p>
    </div>
  );
}
