"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { seedUserProfile } from "@/lib/curriculumSeeder";
import { userProfileConverter, UserProfile } from "@/lib/models";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building, 
  School, 
  Briefcase, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  GraduationCap, 
  BookOpen,
  Users2
} from "lucide-react";

// Google G logo standard path
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

type Role = "student" | "company";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  
  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  
  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Student fields
  const [studentName, setStudentName] = useState("");
  const [institution, setInstitution] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subjectOfInterest, setSubjectOfInterest] = useState("");
  
  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 4
  const [strengthLabel, setStrengthLabel] = useState("");

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Monitor password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setStrengthLabel("");
      return;
    }
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 10) strength += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
    
    const labels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
    setStrengthLabel(labels[strength]);
  }, [password]);

  // Real-time Validation Effect
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (role === "student") {
      if (touched.studentName && !studentName.trim()) {
        newErrors.studentName = "Full Name is required";
      }
      if (touched.institution && !institution.trim()) {
        newErrors.institution = "Institution name is required";
      }
      if (touched.gradeLevel && !gradeLevel) {
        newErrors.gradeLevel = "Please select your current level";
      }
    } else {
      if (touched.companyName && !companyName.trim()) {
        newErrors.companyName = "Company Name is required";
      }
      if (touched.contactName && !contactName.trim()) {
        newErrors.contactName = "Contact Name is required";
      }
      if (touched.industry && !industry) {
        newErrors.industry = "Please select your industry";
      }
      if (touched.website && website.trim() && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(website)) {
        newErrors.website = "Please enter a valid website URL";
      }
    }
    
    if (touched.email) {
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Invalid email format";
      }
    }
    
    if (touched.password) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
  }, [
    role, 
    email, 
    password, 
    studentName, 
    institution, 
    gradeLevel, 
    companyName, 
    contactName, 
    industry, 
    website, 
    touched
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {
      email: true,
      password: true,
    };
    
    if (role === "student") {
      allTouched.studentName = true;
      allTouched.institution = true;
      allTouched.gradeLevel = true;
    } else {
      allTouched.companyName = true;
      allTouched.contactName = true;
      allTouched.industry = true;
    }
    setTouched(allTouched);

    // Run final validation check
    const hasSharedErrors = !email || !/\S+@\S+\.\S+/.test(email) || !password || password.length < 6 || !termsAccepted;
    let hasRoleErrors = false;
    
    if (role === "student") {
      hasRoleErrors = !studentName.trim() || !institution.trim() || !gradeLevel;
    } else {
      hasRoleErrors = !companyName.trim() || !contactName.trim() || !industry;
    }

    if (hasSharedErrors || hasRoleErrors) {
      if (!termsAccepted) {
        setErrors((prev) => ({ ...prev, terms: "You must accept the terms and conditions" }));
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    if (!auth || !db) {
      setErrors((prev) => ({ ...prev, submit: "Firebase is not configured. Please set your credentials in .env.local." }));
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Set the displayName in Auth Profile
      const fullName = role === "student" ? studentName : contactName;
      await updateProfile(user, { displayName: fullName });

      // 3. Write Extra Info into Cloud Firestore 'users' collection using type-safe model converter
      const userProfile: UserProfile = role === "student" ? {
        uid: user.uid,
        email: user.email || "",
        role: "student",
        fullName,
        institution,
        gradeLevel,
        subjectOfInterest: subjectOfInterest || "General Study",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profilePictureUrl: user.photoURL || "",
        onboardingCompleted: false,
        skillsToLearn: [],
        interests: []
      } : {
        uid: user.uid,
        email: user.email || "",
        role: "company",
        fullName,
        companyName,
        industry,
        companySize: companySize || "1-10",
        website: website || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profilePictureUrl: user.photoURL || "",
        onboardingCompleted: true,
        skillsToLearn: [],
        interests: []
      };

      const userDocRef = doc(db, "users", user.uid).withConverter(userProfileConverter);
      await setDoc(userDocRef, userProfile);

      // Seed user-scoped dashboard subcollections with initial interest-relevant template
      const interestPath = role === "student" ? (subjectOfInterest || "compsci") : "system_design";
      await seedUserProfile(user.uid, interestPath, fullName);

      setSignupSuccess(true);
      
      setTimeout(() => {
        if (role === "company") {
          router.push("/company-dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1800);
    } catch (err: any) {
      console.error("Firebase Registration Error: ", err);
      let errorMessage = "An unexpected error occurred during signup. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use by another account.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please provide a valid email address.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "A network error occurred. Please check your internet connection.";
      }
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
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

      // 2. Check if a profile document exists in Firestore using type-safe converter
      const docRef = doc(db, "users", user.uid).withConverter(userProfileConverter);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create default student profile for new Google signups
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

        // Seed user-scoped dashboard subcollections with default computer science/programming curriculum
        await seedUserProfile(user.uid, "compsci", user.displayName || "Google User");
      }

      setSignupSuccess(true);
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    } catch (err: any) {
      console.error("Firebase Google Signup Error: ", err);
      let errorMessage = "Failed to sign up with Google. Please try again.";
      if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "The sign-up window was closed before finishing.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network connection failed. Please check your internet connection.";
      }
      setErrors((prev) => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 overflow-hidden selection:bg-teal-500/30">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[300px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent -z-10 pointer-events-none"></div>

      {/* Brand Header */}
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

      {/* Main Registration Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.1 }}
        className="w-full max-w-lg relative"
      >
        {/* Glow border background element */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/30 to-purple-500/30 rounded-3xl blur-[12px] opacity-75 -z-10"></div>
        
        <div className="w-full bg-slate-900/75 border border-slate-800/80 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!signupSuccess ? (
              <motion.div
                key="signup-content"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                  <p className="text-sm text-slate-400">
                    Get full access to personalized curriculum suggestions and tracking
                  </p>
                </div>

                {!isFirebaseConfigured && (
                  <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 leading-relaxed shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <span className="font-extrabold text-amber-300">⚠️ Setup Connection Required:</span>
                    <p className="mt-1 text-slate-400 font-medium">
                      To enable real registrations, copy <code className="text-amber-200 px-1 bg-slate-950/40 rounded font-bold">.env.example</code> to <code className="text-amber-200 px-1 bg-slate-950/40 rounded font-bold">.env.local</code> and fill in your Firebase credentials.
                    </p>
                  </div>
                )}

                {/* Role Switcher Tabs */}
                <div className="relative flex p-1.5 bg-slate-950/80 border border-slate-800 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setRole("student"); setTouched({}); }}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-3.5 px-4 rounded-lg relative z-10 transition-colors ${
                      role === "student" ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" /> Student Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole("company"); setTouched({}); }}
                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-3.5 px-4 rounded-lg relative z-10 transition-colors ${
                      role === "company" ? "text-slate-950" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Building className="w-4 h-4" /> Company Portal
                  </button>
                  
                  {/* Sliding Indicator Pill */}
                  <motion.div
                    className="absolute top-1.5 bottom-1.5 left-1.5 right-1.5 rounded-lg bg-teal-400"
                    layout
                    initial={false}
                    animate={{
                      width: "calc(50% - 3px)",
                      x: role === "student" ? 0 : "100%",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    style={{ zIndex: 0 }}
                  />
                </div>

                {/* Google Quick Sign-Up */}
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGoogleSignup}
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full flex items-center justify-center bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-slate-200 disabled:opacity-50"
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-3 text-teal-400" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continue with Google
                </motion.button>

                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="px-3 text-xs text-slate-500 uppercase tracking-widest font-bold">Or Register Details</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Animated Inputs Container based on selected role */}
                  <AnimatePresence mode="wait">
                    {role === "student" ? (
                      <motion.div
                        key="student-fields"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Student Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-teal-400" /> Full Name
                          </label>
                          <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, studentName: true }))}
                            placeholder="John Doe"
                            className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                              errors.studentName ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
                            } h-11 px-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                          />
                          {errors.studentName && (
                            <p className="text-xs text-red-400 font-medium pl-1">{errors.studentName}</p>
                          )}
                        </div>

                        {/* Institution */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                            <School className="w-3.5 h-3.5 text-teal-400" /> Institution / University
                          </label>
                          <input
                            type="text"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, institution: true }))}
                            placeholder="Stanford University"
                            className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                              errors.institution ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
                            } h-11 px-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                          />
                          {errors.institution && (
                            <p className="text-xs text-red-400 font-medium pl-1">{errors.institution}</p>
                          )}
                        </div>

                        {/* Grade and Goal Double Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                              Level / Grade
                            </label>
                            <select
                              value={gradeLevel}
                              onChange={(e) => setGradeLevel(e.target.value)}
                              onBlur={() => setTouched((prev) => ({ ...prev, gradeLevel: true }))}
                              className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                                errors.gradeLevel ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-teal-500"
                              } h-11 px-3.5 rounded-xl text-sm text-slate-300 focus:outline-none transition-all duration-200`}
                            >
                              <option value="" disabled className="bg-slate-900 text-slate-500">Select level</option>
                              <option value="freshman" className="bg-slate-900">Freshman / 1st Year</option>
                              <option value="sophomore" className="bg-slate-900">Sophomore / 2nd Year</option>
                              <option value="junior" className="bg-slate-900">Junior / 3rd Year</option>
                              <option value="senior" className="bg-slate-900">Senior / 4th Year</option>
                              <option value="postgrad" className="bg-slate-900">Post-Graduate</option>
                              <option value="professional" className="bg-slate-900">Professional</option>
                            </select>
                            {errors.gradeLevel && (
                              <p className="text-xs text-red-400 font-medium pl-1">{errors.gradeLevel}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                              Main Interest
                            </label>
                            <select
                              value={subjectOfInterest}
                              onChange={(e) => setSubjectOfInterest(e.target.value)}
                              className="w-full bg-slate-950/50 hover:bg-slate-950 border border-slate-800 focus:border-teal-500 h-11 px-3.5 rounded-xl text-sm text-slate-300 focus:outline-none transition-all duration-200"
                            >
                              <option value="" className="bg-slate-900">General Study</option>
                              <option value="compsci" className="bg-slate-900">Computer Science</option>
                              <option value="datasci" className="bg-slate-900">Data Analytics</option>
                              <option value="system_design" className="bg-slate-900">System Design</option>
                              <option value="math" className="bg-slate-900">Mathematics</option>
                              <option value="engineering" className="bg-slate-900">Engineering</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="company-fields"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Company Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-purple-400" /> Company Name
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, companyName: true }))}
                            placeholder="Acme Learning Corp"
                            className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                              errors.companyName ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                            } h-11 px-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                          />
                          {errors.companyName && (
                            <p className="text-xs text-red-400 font-medium pl-1">{errors.companyName}</p>
                          )}
                        </div>

                        {/* Contact Person Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-purple-400" /> Admin Contact Name
                          </label>
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, contactName: true }))}
                            placeholder="Sarah Jenkins"
                            className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                              errors.contactName ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                            } h-11 px-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                          />
                          {errors.contactName && (
                            <p className="text-xs text-red-400 font-medium pl-1">{errors.contactName}</p>
                          )}
                        </div>

                        {/* Company Size & Industry Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                              Industry
                            </label>
                            <select
                              value={industry}
                              onChange={(e) => setIndustry(e.target.value)}
                              onBlur={() => setTouched((prev) => ({ ...prev, industry: true }))}
                              className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                                errors.industry ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-purple-500"
                              } h-11 px-3.5 rounded-xl text-sm text-slate-300 focus:outline-none transition-all duration-200`}
                            >
                              <option value="" disabled className="bg-slate-900 text-slate-500">Industry</option>
                              <option value="edtech" className="bg-slate-900">EdTech / Education</option>
                              <option value="software" className="bg-slate-900">Tech / Software</option>
                              <option value="finance" className="bg-slate-900">Fintech / Finance</option>
                              <option value="consulting" className="bg-slate-900">Consulting</option>
                              <option value="other" className="bg-slate-900">Other Sector</option>
                            </select>
                            {errors.industry && (
                              <p className="text-xs text-red-400 font-medium pl-1">{errors.industry}</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                              Team Size
                            </label>
                            <select
                              value={companySize}
                              onChange={(e) => setCompanySize(e.target.value)}
                              className="w-full bg-slate-950/50 hover:bg-slate-950 border border-slate-800 focus:border-purple-500 h-11 px-3.5 rounded-xl text-sm text-slate-300 focus:outline-none transition-all duration-200"
                            >
                              <option value="1-10" className="bg-slate-900">1 - 10 employees</option>
                              <option value="11-50" className="bg-slate-900">11 - 50 employees</option>
                              <option value="51-200" className="bg-slate-900">51 - 200 employees</option>
                              <option value="200+" className="bg-slate-900">200+ employees</option>
                            </select>
                          </div>
                        </div>

                        {/* Company Website */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-purple-400" /> Corporate Website (Optional)
                          </label>
                          <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            onBlur={() => setTouched((prev) => ({ ...prev, website: true }))}
                            placeholder="https://acme.com"
                            className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                              errors.website ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-purple-500"
                            } h-11 px-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                          />
                          {errors.website && (
                            <p className="text-xs text-red-400 font-medium pl-1">{errors.website}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Shared Login Credentials Section */}
                  <div className="border-t border-slate-800/60 pt-4 mt-4 space-y-4">
                    
                    {/* Core Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-teal-400" /> {role === "company" ? "Corporate Email" : "Email Address"}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                        placeholder={role === "company" ? "admin@acme.com" : "you@example.com"}
                        className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                          errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" : "border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
                        } h-11 px-4 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-400 font-medium pl-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Core Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-teal-400" /> Create Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                          placeholder="At least 6 characters"
                          className={`w-full bg-slate-950/50 hover:bg-slate-950 border ${
                            errors.password ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-teal-500"
                          } h-11 pl-4 pr-12 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4.5 px-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {password && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
                            <span className="text-slate-500">Strength:</span>
                            <span className={
                              passwordStrength <= 1 ? "text-red-400" : 
                              passwordStrength === 2 ? "text-orange-400" : 
                              passwordStrength === 3 ? "text-yellow-400" : "text-teal-400"
                            }>
                              {strengthLabel}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 h-1">
                            {[1, 2, 3, 4].map((index) => (
                              <div
                                key={index}
                                className={`rounded-full transition-all duration-500 ${
                                  index <= passwordStrength
                                    ? passwordStrength <= 1
                                      ? "bg-red-500"
                                      : passwordStrength === 2
                                      ? "bg-orange-500"
                                      : passwordStrength === 3
                                      ? "bg-yellow-500"
                                      : "bg-teal-500"
                                    : "bg-slate-800"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {errors.password && (
                        <p className="text-xs text-red-400 font-medium pl-1">{errors.password}</p>
                      )}
                    </div>

                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-start">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          if (e.target.checked && errors.terms) {
                            setErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.terms;
                              return copy;
                            });
                          }
                        }}
                        className="w-4 h-4 mt-0.5 rounded border-slate-800 bg-slate-950/50 text-teal-500 focus:ring-teal-500 focus:ring-opacity-20 cursor-pointer accent-teal-500"
                      />
                      <label htmlFor="terms" className="ml-2.5 text-xs font-medium text-slate-400 select-none cursor-pointer leading-tight">
                        I agree to the{" "}
                        <Link href="#terms" className="text-slate-300 underline hover:text-white">Terms of Service</Link>
                        {" "}and{" "}
                        <Link href="#privacy" className="text-slate-300 underline hover:text-white">Privacy Policy</Link>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-xs text-red-400 font-medium pl-6">{errors.terms}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-400">
                      {errors.submit}
                    </div>
                  )}

                  {/* Create Account Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting || isGoogleSubmitting}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-slate-950 h-12 rounded-xl text-sm font-extrabold shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:shadow-[0_0_35px_rgba(20,184,166,0.35)] transition-all duration-200 disabled:opacity-50 mt-6"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-900" />
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Register Account <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </motion.button>

                </form>

                <div className="mt-8 text-center">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-bold text-white hover:text-teal-400 transition-colors"
                    >
                      Log In here
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-blue-500 p-0.5 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(20,184,166,0.35)]"
                >
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-teal-400">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Registration Complete!</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  Welcome to <strong className="text-white">SkillBridge AI</strong>, {role === "student" ? studentName : companyName}! Setting up your dashboard intelligence...
                </p>
                
                <div className="mt-6 flex items-center justify-center text-teal-400 text-xs font-semibold gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Provisioning workspace...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </motion.div>

      {/* Trust Signatures */}
      <div className="mt-8 flex items-center gap-6 opacity-30 select-none text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Adaptive Curriculum</span>
        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
        <span className="flex items-center gap-1.5"><Users2 className="w-4 h-4" /> Workspace Sync</span>
      </div>
    </div>
  );
}
