"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { userProfileConverter } from "@/lib/models";
import { 
  Building2, 
  Save, 
  Globe, 
  Sparkles, 
  Briefcase, 
  Users, 
  Tag, 
  ShieldCheck,
  User,
  AlertCircle
} from "lucide-react";

export default function CompanySettingsPage() {
  const { user, userProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");

  // Set initial form values when userProfile is loaded
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || "");
      setCompanyName(
        userProfile.companyName === "Organization Member"
          ? ""
          : userProfile.companyName || ""
      );
      setWebsite(userProfile.website || "");
      setIndustry(userProfile.industry || "");
      setCompanySize(userProfile.companySize || "");
    }
  }, [userProfile]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerToast("⚠️ Authentication required.");
      return;
    }

    if (!fullName.trim() || !companyName.trim() || !website.trim() || !industry.trim()) {
      triggerToast("⚠️ Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db!, "users", user.uid).withConverter(userProfileConverter);
      
      await updateDoc(userRef, {
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        website: website.trim(),
        industry: industry.trim(),
        companySize: companySize,
        updatedAt: new Date().toISOString()
      } as any);

      triggerToast("🚀 Company profile parameters successfully synchronized!");
    } catch (error) {
      console.error("Error updating company profile:", error);
      triggerToast("❌ Failed to update company settings.");
    } finally {
      setLoading(false);
    }
  };

  const industryOptions = [
    "EdTech / Software",
    "Finance / FinTech",
    "Healthcare / Biotech",
    "E-Commerce / Retail",
    "Defense / Aerospace",
    "Consulting / Services",
    "Other Tech / Software"
  ];

  const companySizeOptions = [
    "1 - 10 employees",
    "11 - 50 employees",
    "51 - 200 employees",
    "201 - 500 employees",
    "501 - 1000 employees",
    "1000+ employees"
  ];

  return (
    <div className="space-y-6 pb-12 text-slate-200 relative text-left">
      {/* Toast Alert Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-6 py-3.5 rounded-xl border border-teal-400 font-extrabold shadow-[0_0_25px_rgba(20,184,166,0.3)] z-50 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 animate-bounce" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header */}
      <div className="pb-4 border-b border-slate-800/40">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-teal-400" />
          Corporate Profile Settings
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          Configure your organizational details and recruiter identity parameters to unlock direct matching indexes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Settings Form Panel (Span 8) */}
        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/50 pb-2">
                Personal Identity
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-400" /> Full Name <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">
                    Email Account
                  </label>
                  <input
                    type="email"
                    disabled
                    value={userProfile?.email || user?.email || ""}
                    className="w-full bg-slate-950/50 border border-slate-850/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 focus:outline-none cursor-not-allowed"
                    title="Account email address cannot be modified directly"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/50 pb-2">
                Organizational Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" /> Company Name <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe, Inc."
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-teal-400" /> Website <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://stripe.com"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-teal-400" /> Industry <span className="text-teal-400">*</span>
                  </label>
                  <select
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-600">Select Industry</option>
                    {industryOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-950 text-white">{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-teal-400" /> Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="" className="text-slate-600">Select Company Size</option>
                    {companySizeOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-950 text-white">{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800/40">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.25)] flex items-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Corporate Profile
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info/Status Column (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Indicator Card */}
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-teal-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Partner Verification
                </h4>
                <p className="text-[10px] text-slate-500">Recruiter Space Security</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <p>
                By maintaining an accurate and fully filled company profile, you gain access to SkillBridge’s premium features:
              </p>
              <ul className="space-y-2.5 pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold select-none">•</span>
                  <span><strong>Verified Matching:</strong> Your profile is indexed to student scholars by relevance and skills.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold select-none">•</span>
                  <span><strong>Secure Outreach:</strong> Safe recruiter direct-messaging is unlocked once fields are confirmed.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Need help Card */}
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-400" />
              Need Assistance?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For any institutional configurations, role updates, or custom student assessment dispatches, contact our partnership support at:
              <br />
              <strong className="text-teal-400 block mt-2 hover:underline cursor-pointer">
                partnerships@skillbridge.edu
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
