"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, 
  Flame, 
  Trophy, 
  Crown, 
  Lock, 
  Sparkles, 
  Star, 
  X, 
  Heart, 
  Zap
} from "lucide-react";

export default function AchievementsPage() {
  const { 
    user, 
    claimDailyBoost, 
    leaderboard: liveLeaderboard,
    cheerCompetitor,
    goals
  } = useDashboard();
  
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<"weekly" | "alltime">("weekly");
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const completedTasksCount = goals ? goals.filter(g => g.completed).length : 0;
  const totalTasksCount = goals ? goals.length : 0;

  // Compute dynamic ranking tier based on real-time accomplishments!
  const userRank = useMemo(() => {
    const hours = user.studyHours || 0;
    const quizzes = user.assessmentsCleared || 0;
    const streak = user.streak || 0;
    const xp = user.xp || 0;

    if (xp >= 1500 && hours >= 15 && quizzes >= 6 && streak >= 5) {
      return {
        title: "Full-stack Arch-Mage",
        icon: Crown,
        color: "text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
        desc: "You have scaled the highest peak of computational mastery.",
        nextTier: "Max Level Reached",
        progressToNext: 100
      };
    } else if (xp >= 800 && hours >= 8 && quizzes >= 3) {
      return {
        title: "Algorithm Grandmaster",
        icon: Trophy,
        color: "text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
        desc: "Dynamic programming structures and complex graph lifecycles flow through you.",
        nextTier: "Full-stack Arch-Mage",
        progressToNext: Math.min(100, Math.round(((xp / 1500) * 0.4 + (hours / 15) * 0.3 + (quizzes / 6) * 0.3) * 100))
      };
    } else if (xp >= 300 && hours >= 3 && quizzes >= 1) {
      return {
        title: "Elite Code-Builder",
        icon: Zap,
        color: "text-teal-400 border-teal-500/20 bg-teal-500/5 shadow-[0_0_15px_rgba(20,184,166,0.1)]",
        desc: "Active workflow structures are operational. Your diagnostic scores are scaling.",
        nextTier: "Algorithm Grandmaster",
        progressToNext: Math.min(100, Math.round(((xp / 800) * 0.4 + (hours / 8) * 0.3 + (quizzes / 3) * 0.3) * 100))
      };
    } else {
      return {
        title: "Novice Scholar",
        icon: Star,
        color: "text-blue-400 border-blue-500/20 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
        desc: "Welcome to the CS Arena! Attend quizzes, complete goals, and log study hours to scale ranks.",
        nextTier: "Elite Code-Builder",
        progressToNext: Math.min(100, Math.round(((xp / 300) * 0.4 + (hours / 3) * 0.3 + (quizzes / 1) * 0.3) * 100))
      };
    }
  }, [user, completedTasksCount]);

  // Determine badges unlock state dynamically based on user's real Firestore stats!
  const badges = useMemo(() => {
    return [
      {
        id: "b1",
        name: "Recursion Rookie",
        description: "Successfully log your first study sessions and start your software learning path.",
        unlocked: user.studyHours > 0 || user.assessmentsCleared > 0,
        category: "coding",
        icon: Star,
        color: (user.studyHours > 0 || user.assessmentsCleared > 0)
          ? "from-teal-500 to-emerald-500 text-teal-400 border-teal-500/20"
          : "from-slate-850 to-slate-900/60 text-slate-500 border-slate-800",
        bonus: "+150 XP rewarded",
      },
      {
        id: "b2",
        name: "Graph Overlord",
        description: "Dedicate 5 or more study hours towards algorithms and code structures.",
        unlocked: user.studyHours >= 5.0,
        category: "graphs",
        icon: Sparkles,
        color: user.studyHours >= 5.0
          ? "from-purple-500 to-indigo-500 text-purple-400 border-purple-500/20"
          : "from-slate-850 to-slate-900/60 text-slate-500 border-slate-800",
        bonus: "+250 XP rewarded",
      },
      {
        id: "b3",
        name: "Speed Demon",
        description: "Successfully complete your first 2 diagnostic topic quizzes.",
        unlocked: user.assessmentsCleared >= 2,
        category: "quiz",
        icon: Zap,
        color: user.assessmentsCleared >= 2
          ? "from-amber-500 to-orange-500 text-amber-400 border-amber-500/20"
          : "from-slate-850 to-slate-900/60 text-slate-500 border-slate-800",
        bonus: "+100 XP rewarded",
      },
      {
        id: "b4",
        name: "DP Mastermind",
        description: "Perform consistent study sprints and clear at least 5 assessments.",
        unlocked: user.assessmentsCleared >= 5,
        category: "dp",
        icon: Trophy,
        color: user.assessmentsCleared >= 5
          ? "from-teal-500 to-blue-500 text-teal-400 border-teal-500/20"
          : "from-slate-850 to-slate-900/60 text-slate-500 border-slate-800",
        bonus: "Reward: +500 XP & DP Avatar",
      },
      {
        id: "b5",
        name: "Leaderboard Legend",
        description: "Earn more than 1500 total XP and rank high on the active CS Arena bracket.",
        unlocked: user.xp >= 1500,
        category: "social",
        icon: Crown,
        color: user.xp >= 1500
          ? "from-rose-500 to-pink-500 text-rose-400 border-rose-500/20"
          : "from-slate-850 to-slate-900/60 text-slate-500 border-slate-800",
        bonus: "Reward: +1000 XP & Golden Banner",
      }
    ];
  }, [user]);

  // Claim XP button
  const handleClaimXp = () => {
    if (user.claimedDaily) return;
    claimDailyBoost();
    triggerToast("✨ Daily Boost Claimed! +100 XP rewarded and study streak incremented!");
  };

  // Send Cheer greeting to a real user in the Firestore database
  const handleSendCheer = async (id: string, name: string, isYou: boolean) => {
    if (isYou) {
      triggerToast("Self-cheering is healthy! You have inspired yourself.");
      return;
    }
    try {
      await cheerCompetitor(id);
      triggerToast(`❤️ Cheered ${name}! Sparkle greeting delivered successfully!`);
    } catch (error) {
      console.error("Failed to send cheer:", error);
    }
  };

  // Map live leaderboard with ranking indices based primarily on test results!
  const activeLeaderboard = useMemo(() => {
    // Sort primarily by assessmentsCleared, secondarily by XP!
    const sorted = [...liveLeaderboard].sort((a, b) => {
      const aTests = a.assessmentsCleared ?? 0;
      const bTests = b.assessmentsCleared ?? 0;
      if (bTests !== aTests) return bTests - aTests;
      return b.xp - a.xp;
    });

    let mapped = sorted.map((player, index) => ({
      id: player.id,
      rank: index + 1,
      name: player.name,
      xp: player.xp,
      assessmentsCleared: player.assessmentsCleared ?? 0,
      cheerCount: player.cheers ?? 0,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`,
      isYou: player.name === user.name || player.id === user.email
    }));

    // Pin the authenticated user at the very top
    const userIndex = mapped.findIndex(p => p.isYou);
    if (userIndex > 0) {
      const userItem = mapped[userIndex];
      const filtered = mapped.filter(p => !p.isYou);
      mapped = [userItem, ...filtered];
    }

    return mapped;
  }, [liveLeaderboard, user.name, user.email, user.assessmentsCleared]);

  // Return level values
  const currentLevel = user.level;
  const levelProgress = (user.xp / user.totalXpNeeded) * 100;
  const xpNeeded = user.totalXpNeeded - user.xp;

  return (
    <div className="space-y-6 pb-12 text-slate-200 relative text-left">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-6 py-3.5 rounded-xl border border-teal-400 font-extrabold shadow-[0_0_25px_rgba(20,184,166,0.3)] z-50 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 animate-spin" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl relative space-y-4 text-center"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                <selectedBadge.icon className="w-8 h-8 text-teal-400" />
              </div>

              <div>
                <h4 className="text-sm font-black text-white">{selectedBadge.name}</h4>
                <span className="text-[10px] font-black uppercase text-teal-400 mt-1 block">
                  {selectedBadge.unlocked ? "✓ Achieved Badge" : "🔒 Locked Badge"}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedBadge.description}
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-xs text-slate-300">
                <span className="text-[9px] text-slate-500 font-black uppercase block tracking-wider">Rewards Tier</span>
                <strong className="text-teal-400 font-bold">{selectedBadge.bonus}</strong>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-xs font-bold rounded-xl transition-colors border border-slate-850"
              >
                Dismiss Overview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Cards (XP Points Meter + Flame Streak) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Card: XP & Level (Span 8) */}
        <div className="md:col-span-8 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-5 text-left">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wide">Gamified Ranking</span>
                <h2 className="text-lg font-black text-white">Level {currentLevel} CS Explorer</h2>
              </div>
            </div>

            {/* Daily XP Boost Button */}
            <button
              onClick={handleClaimXp}
              disabled={user.claimedDaily}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm shrink-0 ${
                user.claimedDaily 
                  ? "bg-slate-950 border border-slate-850 text-slate-500 cursor-not-allowed" 
                  : "bg-teal-500 hover:bg-teal-400 text-slate-950 hover:scale-105"
              }`}
            >
              {user.claimedDaily ? "Boost Claimed (Streak Maintained)" : "Claim Daily Boost (+100 XP)"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-bold text-slate-300">{user.xp} Total XP earned</span>
              <span className="font-black text-teal-400">{xpNeeded} XP to Level {currentLevel + 1}</span>
            </div>
            
            {/* Level Progress bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-850/60 p-0.5">
              <div className="bg-teal-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" style={{ width: `${levelProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Right Card: Streak count (Span 4) */}
        <div className="md:col-span-4 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wide">Daily Consistency</span>
            <h3 className="text-2xl font-black text-white flex items-center gap-1.5">
              <Flame className="w-7 h-7 text-orange-500 fill-orange-500 animate-pulse" /> {user.streak} Days
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal">Maintain your streak to unlock the competitive bonus multiplier!</p>
          </div>

          <div className="grid grid-cols-7 gap-1 bg-slate-950 p-2 rounded-xl border border-slate-850">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
              const active = dayNum <= user.streak;
              return (
                <div 
                  key={dayNum} 
                  className={`w-3.5 h-6 rounded-md flex flex-col justify-end items-center transition-all ${
                    active ? "bg-orange-500 text-white" : "bg-slate-900 text-slate-700"
                  }`}
                  title={active ? "Day studied!" : "Study day pending"}
                >
                  <span className="text-[7px] font-black mb-0.5">{dayNum}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Real-time Arena Progress & Dynamic Ranking Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Rank Badge (Span 5) */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col justify-between gap-4 ${userRank.color}`}>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CS Arena Class</span>
              <h3 className="text-xl font-black text-white">{userRank.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">{userRank.desc}</p>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/40 text-teal-400 shrink-0">
              <userRank.icon className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/40">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
              <span>PROGRESS TO NEXT CLASS</span>
              <span>{userRank.progressToNext}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-900">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${userRank.progressToNext}%` }}></div>
            </div>
            <span className="text-[9px] font-black text-teal-400 uppercase tracking-wide block">{userRank.nextTier !== "Max Level Reached" ? `Next Target: ${userRank.nextTier}` : "MAX RANK ACHIEVED 🎉"}</span>
          </div>
        </div>

        {/* Real-time CS Metrics Grid (Span 7) */}
        <div className="lg:col-span-7 bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 p-6 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-center text-left">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">QUIZZES CLEARED</span>
            <p className="text-xl font-black text-white mt-1">{user.assessmentsCleared || 0}</p>
            <span className="text-[10px] text-teal-400 font-bold mt-1">Diagnostic Score Live</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-center text-left">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">HOURS SPENT</span>
            <p className="text-xl font-black text-white mt-1">{user.studyHours || 0} hrs</p>
            <span className="text-[10px] text-purple-400 font-bold mt-1">Sprint Logging Active</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-center text-left">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">ACTIVE STREAK</span>
            <p className="text-xl font-black text-white mt-1">{user.streak || 0} days</p>
            <span className="text-[10px] text-orange-400 font-bold mt-1">Daily Study Gained</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-center text-left">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">GOALS COMPLETED</span>
            <p className="text-xl font-black text-white mt-1">{completedTasksCount} / {totalTasksCount}</p>
            <span className="text-[10px] text-blue-400 font-bold mt-1">Kanban Nodes Moved</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-center text-left">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">TOTAL EXPERIENCE</span>
            <p className="text-xl font-black text-white mt-1">{user.xp || 0} XP</p>
            <span className="text-[10px] text-yellow-400 font-bold mt-1">Score multiplier active</span>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-center text-left col-span-2 sm:col-span-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">COHORT POSITION</span>
            <p className="text-xl font-black text-white mt-1">Top 15%</p>
            <span className="text-[10px] text-pink-400 font-bold mt-1">Interactive CS Bracket</span>
          </div>
        </div>
      </div>

      {/* Row 2: Badges Grid (Left) & Competitors Leaderboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Badges Gallery Grid (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-teal-400" /> SkillBridge Badges Archive
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
            {badges.map((badge) => {
              const IconComp = badge.icon;
              
              return (
                <div 
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-all flex items-center gap-3.5 text-left ${
                    badge.unlocked 
                      ? `bg-slate-950 border-slate-850 ${badge.color}` 
                      : "bg-slate-950/40 border-slate-900 opacity-50 hover:opacity-80"
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-slate-950 border flex items-center justify-center shrink-0 ${
                    badge.unlocked ? "border-slate-850" : "border-slate-900"
                  }`}>
                    {badge.unlocked ? (
                      <IconComp className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-700" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200">{badge.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug truncate max-w-[160px]">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competitors Leaderboard (Span 5) */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-[420px] text-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Crown className="w-4.5 h-4.5 text-yellow-400" /> Weekly CS Arena
              </h3>

              {/* Leaderboard tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0">
                <button
                  onClick={() => setLeaderboardTab("weekly")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    leaderboardTab === "weekly" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setLeaderboardTab("alltime")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    leaderboardTab === "alltime" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All-Time
                </button>
              </div>
            </div>

            {/* List users */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {activeLeaderboard.map((player) => {
                let rankStyle = "text-slate-500 font-bold bg-slate-950 border border-slate-900";
                if (player.rank === 1) rankStyle = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black";
                if (player.rank === 2) rankStyle = "bg-slate-300/10 text-slate-300 border-slate-300/20 font-black";
                if (player.rank === 3) rankStyle = "bg-orange-500/10 text-orange-400 border-orange-500/20 font-black";

                return (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      player.isYou 
                        ? "bg-teal-500/5 border-teal-500/20 shadow-sm animate-pulse" 
                        : "bg-slate-950/40 border-slate-900/60 hover:border-slate-850"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md text-[10px] flex items-center justify-center shrink-0 ${rankStyle}`}>
                        {player.rank}
                      </span>
                      <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full border border-slate-800" />
                      <div>
                        <p className={`text-xs font-bold ${player.isYou ? "text-teal-400" : "text-slate-200"}`}>
                          {player.name} {player.isYou && "(You)"}
                        </p>
                        <span className="text-[10px] font-bold text-slate-500">{player.xp} XP • {player.assessmentsCleared} Tests</span>
                      </div>
                    </div>

                    {/* Interactive Cheer Greeting buttons */}
                    <button
                      onClick={() => handleSendCheer(player.id, player.name, player.isYou)}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black border transition-colors flex items-center gap-1 shrink-0 ${
                        player.isYou 
                          ? "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed" 
                          : "bg-slate-950 hover:bg-red-500/10 border-slate-850 text-red-400 hover:border-red-500/20"
                      }`}
                      disabled={player.isYou}
                    >
                      <Heart className="w-3 h-3 fill-red-400/10" /> Cheer ({player.cheerCount})
                    </button>
                  </div>
                );
              })}

              {activeLeaderboard.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Awaiting competitors grid syncing...
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-850 flex items-center gap-2 text-xs text-slate-400 pl-1 mt-4">
            <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
            <span>Top 3 Weekly ranks unlock the Diamond badge on Sunday!</span>
          </div>
        </div>

      </div>

    </div>
  );
}
