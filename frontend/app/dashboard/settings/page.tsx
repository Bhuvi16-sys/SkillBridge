"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import { 
  User, 
  Bell, 
  Palette, 
  Lock, 
  Save, 
  Trash2, 
  Download, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Globe,
  Settings
} from "lucide-react";

// Mock available themes
const themes = [
  {
    id: "emerald",
    name: "Emerald Abyss",
    primary: "from-teal-500 to-emerald-400",
    bg: "bg-[#0B1120]",
    accent: "text-teal-400",
    border: "border-teal-500/30",
    desc: "Sleek dark slate paired with deep teal glows (Active Theme)"
  },
  {
    id: "neon",
    name: "Neon Cyberpunk",
    primary: "from-fuchsia-500 to-purple-500",
    bg: "bg-[#090514]",
    accent: "text-fuchsia-400",
    border: "border-fuchsia-500/30",
    desc: "Dark charcoal coupled with high-voltage violet highlights"
  },
  {
    id: "space",
    name: "Deep Space",
    primary: "from-blue-600 to-indigo-400",
    bg: "bg-[#040815]",
    accent: "text-blue-400",
    border: "border-blue-500/30",
    desc: "Stellar cosmic space layout featuring royal indigo accents"
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "theme" | "privacy">("account");
  
  // Account Form states
  const [displayName, setDisplayName] = useState("Alex R.");
  const [email, setEmail] = useState("alex.r@stanford.edu");
  const [cohort, setCohort] = useState("Stanford Cohort B");
  const [bio, setBio] = useState("Aspiring Software Architect, currently drilling Dynamic Programming algorithms and BST structures.");

  // Password fields state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Notifications toggles
  const [notifyEmailSummary, setNotifyEmailSummary] = useState(true);
  const [notifyStreakReminder, setNotifyStreakReminder] = useState(true);
  const [notifyWeakTopicAlert, setNotifyWeakTopicAlert] = useState(true);
  const [notifyRepetitionAlert, setNotifyRepetitionAlert] = useState(false);

  // Theme selection
  const [selectedThemeId, setSelectedThemeId] = useState("emerald");

  // Privacy controls
  const [privacyPublicLeaderboard, setPrivacyPublicLeaderboard] = useState(true);
  const [privacyShareWithRecruiters, setPrivacyShareWithRecruiters] = useState(true);
  const [privacyAnalyticsAnonymized, setPrivacyAnalyticsAnonymized] = useState(false);

  // Downloading state simulation
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // Delete modal state
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset progress state and hook
  const { resetProgress } = useDashboard();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleConfirmResetProgress = async () => {
    setConfirmReset(false);
    try {
      await resetProgress();
      triggerToast("🧹 Study progress metrics successfully reset to zero!");
    } catch (err) {
      console.error("Error resetting progress:", err);
      triggerToast("❌ Failed to reset study progress.");
    }
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) {
      triggerToast("Display name and email are mandatory fields!");
      return;
    }
    triggerToast("💾 Account profile parameters saved successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      triggerToast("Please specify both current and new passwords.");
      return;
    }
    triggerToast("🔑 Password credential updated and synchronized!");
    setCurrentPass("");
    setNewPass("");
  };

  const handleSaveNotifications = () => {
    triggerToast("🔔 Alert routing frequencies successfully configured.");
  };

  const handleSelectTheme = (themeId: string, themeName: string) => {
    setSelectedThemeId(themeId);
    triggerToast(`🎨 Visual theme shifted to '${themeName}'! Syncing configurations...`);
  };

  const handleDownloadSnapshot = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(10);
    triggerToast("📥 Starting profile data snapshot aggregation...");

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadProgress(null);
            triggerToast("✅ Snapshot file download completed: skillbridge_alexr.json");
          }, 500);
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const handlePurgeLogs = () => {
    setConfirmDelete(false);
    triggerToast("🗑️ All sandbox execution and trace logs purged successfully.");
  };

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

      {/* Confirmation modal for log purging */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-red-500/30 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative space-y-4 text-left"
            >
              <div className="flex items-center gap-3 text-red-400">
                <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Irreversible Action</h4>
                  <p className="text-[10px] text-red-400/80">Purge Sandbox Trace Logs</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                You are about to delete all compiled sandbox history, loop tracers, and code error logs. This will clean your statistics cache and cannot be undone.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurgeLogs}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-colors"
                >
                  Wipe Logs
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation modal for progress resetting */}
      <AnimatePresence>
        {confirmReset && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-amber-500/30 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative space-y-4 text-left"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Reset Progress</h4>
                  <p className="text-[10px] text-amber-400/80">Wipe Learning Stats</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to reset all your learning statistics? Your study hours, mastery index, levels, and assessments cleared will be set to 0. This cannot be undone.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmResetProgress}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Tab Selection Column (Span 4) */}
        <div className="lg:col-span-4 bg-slate-900/20 border border-slate-800 p-4.5 rounded-2xl space-y-2 text-left">
          <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wider mb-2 pl-2">System Configs</span>
          
          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === "account" 
                ? "bg-teal-500/10 text-teal-400 font-bold border-l-2 border-teal-400" 
                : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-4.5 h-4.5" /> Account Profile
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === "notifications" 
                ? "bg-teal-500/10 text-teal-400 font-bold border-l-2 border-teal-400" 
                : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            <Bell className="w-4.5 h-4.5" /> Alarm Preferences
          </button>

          <button
            onClick={() => setActiveTab("theme")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === "theme" 
                ? "bg-teal-500/10 text-teal-400 font-bold border-l-2 border-teal-400" 
                : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            <Palette className="w-4.5 h-4.5" /> Theme Preferences
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === "privacy" 
                ? "bg-teal-500/10 text-teal-400 font-bold border-l-2 border-teal-400" 
                : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4.5 h-4.5" /> Privacy & Controls
          </button>
        </div>

        {/* Tab Content Display Container (Span 8) */}
        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl text-left">
          
          {/* TAB 1: ACCOUNT PROFILE */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-850">
                <h3 className="text-base font-black text-white">Account & Profile Settings</h3>
                <p className="text-[11px] text-slate-500">Manage your credentials, school cohorts, and system portfolio handles.</p>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Email Account</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Active Study Cohort</label>
                  <input
                    type="text"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Professional Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save General Info
                  </button>
                </div>
              </form>

              {/* Password update segment */}
              <div className="pt-6 border-t border-slate-850 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Reset Credentials</h4>
                  <p className="text-[10px] text-slate-500">Configure safety criteria for system portal logins.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Current Password</label>
                      <input
                        type={showPass ? "text" : "password"}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-7 text-slate-500 hover:text-white"
                      >
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">New Secure Password</label>
                      <input
                        type={showPass ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Sync Password Change
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ALARM NOTIFICATIONS PREFERENCES */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-850">
                <h3 className="text-base font-black text-white">Alarm Notification Preferences</h3>
                <p className="text-[11px] text-slate-500">Configure alert channels and push priority thresholds.</p>
              </div>

              <div className="space-y-4">
                
                {/* Toggle card 1 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <div className="space-y-1 text-left max-w-sm">
                    <h4 className="text-xs font-bold text-slate-200">Weekly Progress Analytics Email</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Dispatches comprehensive digests evaluating weekly loop metrics and concept masteries on Friday evenings.</p>
                  </div>
                  <button
                    onClick={() => setNotifyEmailSummary(!notifyEmailSummary)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                      notifyEmailSummary ? "bg-teal-500" : "bg-slate-900"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      notifyEmailSummary ? "translate-x-5" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>

                {/* Toggle card 2 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <div className="space-y-1 text-left max-w-sm">
                    <h4 className="text-xs font-bold text-slate-200">Daily Consistency Streak reminders</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Alerts you 3 hours prior to daily calendar cuts to protect streak multiplier points.</p>
                  </div>
                  <button
                    onClick={() => setNotifyStreakReminder(!notifyStreakReminder)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                      notifyStreakReminder ? "bg-teal-500" : "bg-slate-900"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      notifyStreakReminder ? "translate-x-5" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>

                {/* Toggle card 3 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <div className="space-y-1 text-left max-w-sm">
                    <h4 className="text-xs font-bold text-slate-200">Weak Topic Loop alerts</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Notifies you if standard sandbox submissions reveal systemic weaknesses in algorithm traversals.</p>
                  </div>
                  <button
                    onClick={() => setNotifyWeakTopicAlert(!notifyWeakTopicAlert)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                      notifyWeakTopicAlert ? "bg-teal-500" : "bg-slate-900"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      notifyWeakTopicAlert ? "translate-x-5" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>

                {/* Toggle card 4 */}
                <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
                  <div className="space-y-1 text-left max-w-sm">
                    <h4 className="text-xs font-bold text-slate-200">Spaced Repetition Review pushes</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Fires system cards in real-time as scheduled card repetitions become ready for active recall.</p>
                  </div>
                  <button
                    onClick={() => setNotifyRepetitionAlert(!notifyRepetitionAlert)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 cursor-pointer ${
                      notifyRepetitionAlert ? "bg-teal-500" : "bg-slate-900"
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      notifyRepetitionAlert ? "translate-x-5" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={handleSaveNotifications}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl transition-colors"
                  >
                    Save Alert Channels
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: PALETTE COLOR THEMES */}
          {activeTab === "theme" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-850">
                <h3 className="text-base font-black text-white">Visual Portal Themes</h3>
                <p className="text-[11px] text-slate-500">Customize the colors, backgrounds, and shadows across all dashboard hubs.</p>
              </div>

              <div className="space-y-4">
                {themes.map((theme) => (
                  <div 
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id, theme.name)}
                    className={`p-4 border rounded-2xl flex items-center justify-between gap-5 transition-all cursor-pointer ${
                      selectedThemeId === theme.id 
                        ? `bg-slate-950/80 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.15)]` 
                        : "bg-slate-950/30 border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.primary} shrink-0 shadow-inner flex items-center justify-center text-slate-950`}>
                        <Palette className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white">{theme.name}</h4>
                          {selectedThemeId === theme.id && (
                            <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[8px] font-black uppercase rounded-full">Active</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{theme.desc}</p>
                      </div>
                    </div>

                    <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center shrink-0">
                      {selectedThemeId === theme.id && (
                        <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Theme Mockup Visualizer Preview */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] uppercase font-black text-slate-500 block">Theme Live Preview Mockup</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-850/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 font-semibold">
                    <div className={`w-6.5 h-6.5 rounded-lg bg-gradient-to-br flex items-center justify-center text-slate-950 font-black ${
                      selectedThemeId === "emerald" ? "from-teal-500 to-emerald-400" :
                      selectedThemeId === "neon" ? "from-fuchsia-500 to-purple-500" : "from-blue-600 to-indigo-400"
                    }`}>
                      89
                    </div>
                    <span>CS Skill Mastery Scoreboard</span>
                  </div>

                  <span className={`text-[9px] font-black uppercase ${
                    selectedThemeId === "emerald" ? "text-teal-400" :
                    selectedThemeId === "neon" ? "text-fuchsia-400" : "text-blue-400"
                  }`}>
                    Syncing Done
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & COMPLIANCE CONTROLS */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-850">
                <h3 className="text-base font-black text-white">Privacy Controls & Data Compliance</h3>
                <p className="text-[11px] text-slate-500">Control data permissions, share indicators, and wipe history traces.</p>
              </div>

              <div className="space-y-4">
                
                {/* Privacy Card 1 */}
                <div className="flex items-start justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl gap-4">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-slate-200">Public Leaderboard Visibility</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Allows your current levels, study flame streaks, and weekly XP ratings to be listed on public brackets.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyPublicLeaderboard}
                    onChange={(e) => setPrivacyPublicLeaderboard(e.target.checked)}
                    className="w-4.5 h-4.5 rounded bg-slate-950 border border-slate-850 text-teal-500 accent-teal-500 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>

                {/* Privacy Card 2 */}
                <div className="flex items-start justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl gap-4">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-slate-200">Share Job Readiness with Recruitment Pools</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Enables the portal to match your 89% readiness indexes and projects to corporate recruiters querying candidates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyShareWithRecruiters}
                    onChange={(e) => setPrivacyShareWithRecruiters(e.target.checked)}
                    className="w-4.5 h-4.5 rounded bg-slate-950 border border-slate-850 text-teal-500 accent-teal-500 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>

                {/* Privacy Card 3 */}
                <div className="flex items-start justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-xl gap-4">
                  <div className="space-y-1 text-left">
                    <h4 className="text-xs font-bold text-slate-200">Anonymize Diagnostic Analytics</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Strips personal names from conceptual quiz responses sent to training models evaluating standard curriculum flows.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyAnalyticsAnonymized}
                    onChange={(e) => setPrivacyAnalyticsAnonymized(e.target.checked)}
                    className="w-4.5 h-4.5 rounded bg-slate-950 border border-slate-850 text-teal-500 accent-teal-500 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>

                {/* Download and Purge Section */}
                <div className="pt-6 border-t border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Download Card */}
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 flex flex-col justify-between text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">Download Profile Snapshot</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Extract all your metrics, project links, and test records in structured JSON format.</p>
                    </div>

                    {downloadProgress !== null ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                        </div>
                        <span className="text-[8.5px] text-teal-400 font-bold">Compiling Snapshot ({downloadProgress}%)</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleDownloadSnapshot}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-200 hover:text-white text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Data
                      </button>
                    )}
                  </div>

                  {/* Reset Progress Card */}
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 flex flex-col justify-between text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-400">Reset Study Progress</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Reset your study hours, mastery index, level, and quizzes back to zero to start learning fresh.</p>
                    </div>

                    <button
                      onClick={() => setConfirmReset(true)}
                      className="w-full py-2 bg-amber-950 hover:bg-amber-900 border border-amber-900/30 text-amber-200 hover:text-amber-100 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Activity className="w-3.5 h-3.5" /> Reset My Progress
                    </button>
                  </div>

                  {/* Purge Card */}
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3 flex flex-col justify-between text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-red-400">Purge Sandbox History</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Permanently erase all compiled code files, trace outputs, and compile diagnostics history.</p>
                    </div>

                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-900/30 text-red-200 hover:text-red-100 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Wipe System Logs
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
