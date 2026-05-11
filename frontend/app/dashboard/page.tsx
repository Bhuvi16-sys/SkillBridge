"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Clock, 
  Target, 
  Award, 
  TrendingUp, 
  CheckSquare, 
  Bell, 
  Lightbulb, 
  Network, 
  Play, 
  Check, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  Zap, 
  BookOpen, 
  CheckCircle,
  HelpCircle,
  Undo2,
  Loader2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

import { useDashboard } from "@/context/DashboardContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUser } from "@/context/UserContext";
import axios from "axios";

const edges = [
  { from: "algo", to: "ds" },
  { from: "ds", to: "trees" },
  { from: "ds", to: "graphs" },
  { from: "graphs", to: "dp" },
];

export default function StudentDashboard() {
  const { loading, data: user, handleLogHours: legacyHandleLogHours } = useDashboardData();
  const stats = useUser();

  const handleLogHours = async (hours: number) => {
    if (!stats.user) return;
    try {
      await axios.post("/api/user/stats/update", {
        uid: stats.user.uid,
        hours
      });
      await stats.refreshData();
    } catch (error) {
      console.error("Error logging study hours via Axios:", error);
    }
  };

  const { goals: tasks, toggleGoal: handleToggleTask, addGoal, notifications, markNotificationRead, clearAllNotifications, weakTopics, aiSuggestions, logQuizScore } = useDashboard();
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Streaks days tracking
  const streakDays = [
    { name: "Mon", active: true },
    { name: "Tue", active: true },
    { name: "Wed", active: true },
    { name: "Thu", active: true },
    { name: "Fri", active: true },
    { name: "Sat", active: true },
    { name: "Sun", active: user.claimedDaily }, // Syncs with live claimedDaily XP trigger!
  ];

  // Active simulated AI recovery plan
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatedPlanText, setGeneratedPlanText] = useState<string[]>([]);
  const [recoveredGoals, setRecoveredGoals] = useState<any[]>([]);

  // Selected knowledge graph node ID state
  const [selectedNodeId, setSelectedNodeId] = useState<string>("graphs");

  // Dynamic Gemini Study Tip state
  const [geminiTip, setGeminiTip] = useState<string>("Synthesizing personalized Gemini study tips...");
  const [loadingGeminiTip, setLoadingGeminiTip] = useState<boolean>(true);

  React.useEffect(() => {
    if (!stats.user) return;
    const uid = stats.user.uid;
    let active = true;
    const fetchGeminiTip = async () => {
      setLoadingGeminiTip(true);
      try {
        const response = await fetch("/api/gemini/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            masteryIndex: user.masteryIndex,
            weakTopics: weakTopics || []
          })
        });
        const data = await response.json();
        if (active && data.tip) {
          setGeminiTip(data.tip);
        }
      } catch (err) {
        console.error("Failed to fetch Gemini suggestion:", err);
      } finally {
        if (active) setLoadingGeminiTip(false);
      }
    };

    fetchGeminiTip();
    return () => { active = false; };
  }, [stats.user, user.masteryIndex, weakTopics]);

  // Dynamically calculate node values and statuses from real database states (weakTopics & skills)
  const dynamicNodes = React.useMemo(() => {
    return [
      { id: "algo", label: "Algorithms", x: 60, y: 130, desc: "Asymptotic Analysis, Search, Sort" },
      { id: "ds", label: "Data Structures", x: 190, y: 130, desc: "Arrays, Lists, Stacks, Queues" },
      { id: "trees", label: "Trees & BST", x: 320, y: 70, desc: "In-order, Pre-order, BST operations" },
      { id: "graphs", label: "Graphs & DFS", x: 320, y: 190, desc: "BFS/DFS, Topological Sort, Dijkstra" },
      { id: "dp", label: "Dynamic Prog.", x: 450, y: 190, desc: "Memoization, Tabulation, Knapsack" },
    ].map((node) => {
      // 1. Try to find a matching weakTopic from the live database
      const liveWeakTopic = weakTopics?.find((t) => {
        const name = t.name.toLowerCase();
        const label = node.label.toLowerCase();
        return name.includes(label) || label.includes(name) || 
               (node.id === "dp" && name.includes("programming")) ||
               (node.id === "graphs" && name.includes("graph"));
      });

      if (liveWeakTopic) {
        // Map accuracy to node value
        const val = liveWeakTopic.accuracy ?? 10;
        const status = val >= 80 ? "mastered" : val >= 50 ? "improving" : "weak";
        return { ...node, value: val, status };
      }

      // 2. Derive dynamic initial states relative to overall user mastery
      const baseMastery = user.masteryIndex || 0;
      let calculatedValue = 0;
      if (baseMastery > 0) {
        const scaleFactor = node.id === "algo" ? 1.2 : node.id === "ds" ? 1.0 : node.id === "trees" ? 0.7 : 0.4;
        calculatedValue = Math.min(100, Math.max(10, Math.round(baseMastery * scaleFactor)));
      }
      const status = calculatedValue >= 80 ? "mastered" : calculatedValue >= 50 ? "improving" : "weak";

      return { ...node, value: calculatedValue, status };
    });
  }, [weakTopics, user.masteryIndex]);

  const selectedNode = React.useMemo(() => {
    return dynamicNodes.find((n) => n.id === selectedNodeId) || dynamicNodes[3];
  }, [dynamicNodes, selectedNodeId]);

  // Dynamically calculate study distribution based on live user.studyHours from database
  const studyHoursData = React.useMemo(() => {
    const total = user.studyHours || 0.0;
    return [
      { day: "Mon", hours: parseFloat((total * 0.1).toFixed(1)) },
      { day: "Tue", hours: parseFloat((total * 0.15).toFixed(1)) },
      { day: "Wed", hours: parseFloat((total * 0.2).toFixed(1)) },
      { day: "Thu", hours: parseFloat((total * 0.05).toFixed(1)) },
      { day: "Fri", hours: parseFloat((total * 0.12).toFixed(1)) },
      { day: "Sat", hours: parseFloat((total * 0.23).toFixed(1)) },
      { day: "Sun", hours: parseFloat((total * 0.15).toFixed(1)) },
    ];
  }, [user.studyHours]);

  // Dynamically calculate weekly mastery curves scaled to live user.masteryIndex from database
  const weeklyProgressData = React.useMemo(() => {
    const currentMastery = user.masteryIndex || 0;
    return [
      { name: "Week 1", score: Math.round(currentMastery * 0.3), baseline: 0 },
      { name: "Week 2", score: Math.round(currentMastery * 0.5), baseline: 0 },
      { name: "Week 3", score: Math.round(currentMastery * 0.4), baseline: 0 },
      { name: "Week 4", score: Math.round(currentMastery * 0.7), baseline: 0 },
      { name: "Week 5", score: Math.round(currentMastery * 0.85), baseline: 0 },
      { name: "Week 6", score: currentMastery, baseline: 0 },
    ];
  }, [user.masteryIndex]);

  // Compute tasks completions from Firebase dailyTasks response via stats
  const dailyTasks = stats.dailyTasks || [];
  const completedCount = dailyTasks.filter(t => t.completed).length;
  const progressPercent = dailyTasks.length ? Math.round((completedCount / dailyTasks.length) * 100) : 0;

  // States for dynamic Activity Logger
  const [loggerTab, setLoggerTab] = useState<"study" | "quiz">("study");
  const [logHours, setLogHours] = useState<number>(1.0);
  const [logTopic, setLogTopic] = useState<string>("");
  const [quizCorrect, setQuizCorrect] = useState<number>(8);
  const [quizTotal, setQuizTotal] = useState<number>(10);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);

  const handleLogStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (logHours <= 0) return;
    setIsSubmittingLog(true);
    try {
      await handleLogHours(logHours);
      setLogSuccess(`Successfully logged ${logHours} study hours!`);
      setLogHours(1.0);
      setTimeout(() => setLogSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleLogQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quizCorrect < 0 || quizTotal <= 0 || quizCorrect > quizTotal) return;
    const selectedTopic = logTopic || (weakTopics[0]?.name || "General Study");
    setIsSubmittingLog(true);
    try {
      await logQuizScore(quizCorrect, quizTotal, selectedTopic);
      const acc = Math.round((quizCorrect / quizTotal) * 100);
      setLogSuccess(`Quiz registered with ${acc}% score! Assessments Cleared increased!`);
      setQuizCorrect(8);
      setQuizTotal(10);
      setTimeout(() => setLogSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Unmount cleanup for active simulations
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Shimmering gradient backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]"></div>
        
        <div className="flex flex-col items-center gap-4 text-center z-10">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <div>
            <h2 className="text-lg font-bold text-white tracking-wider">SkillBridge AI</h2>
            <p className="text-xs text-slate-400 mt-1">Fetching your personalized dashboard path...</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate Recovery Plan using live Gemini API
  const handleGeneratePlan = async (topicName: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setGeneratingPlan(true);
    setActivePlan(topicName);
    setGeneratedPlanText([
      "Analyzing quiz metrics and identifying concept nodes...",
      "Connecting weak subtopics with Gemini API adaptive models..."
    ]);
    setRecoveredGoals([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "recoveryPlan",
          payload: { topic: topicName }
        })
      });

      if (!res.ok) throw new Error("Gemini AI API returned an error");
      const data = await res.json();

      if (data && data.steps) {
        setRecoveredGoals(data.steps);
        setGeneratedPlanText([
          "🚀 Recovery curriculum successfully compiled by Gemini:",
          ...data.steps.map((step: any, idx: number) => `• Step ${idx + 1}: ${step.title} (${step.duration}) - ${step.priority} Priority`)
        ]);
      } else {
        throw new Error("Invalid schema returned from Gemini API");
      }
    } catch (err: any) {
      console.error("Failed to generate custom recovery path:", err);
      setGeneratedPlanText([
        "❌ Gemini AI recovery synthesis failed.",
        "Please ensure your GEMINI_API_KEY is configured correctly in .env.local and try again."
      ]);
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Writes Gemini goals into user subcollection in Firestore
  const handleInitializeRecoveryPath = async () => {
    if (!recoveredGoals.length) return;
    try {
      for (const goal of recoveredGoals) {
        await addGoal({
          title: goal.title,
          duration: goal.duration,
          priority: goal.priority
        });
      }
      // Reset plan display state on completion
      setActivePlan(null);
      setRecoveredGoals([]);
      setGeneratedPlanText([]);
    } catch (error) {
      console.error("Failed to write dynamic recovery goals to Firestore:", error);
    }
  };

  const removeNotification = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <div className="space-y-8 pb-12 text-slate-200">
      
      {/* 1. Welcome Section & Streak KPI */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-[#1e293b]/70 to-slate-900 border border-slate-800/80 p-8 shadow-2xl">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -top-10 -left-10 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Adaptive Learning Active
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">{user.name}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Your recovery path is currently focused on mastering <strong className="text-white">{weakTopics[0]?.name || "Core Concepts"}</strong>. You are progressing 15% faster than last week!
            </p>
          </div>

          {/* Glowing Streak HUD */}
          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 px-6 py-4 rounded-2xl shadow-xl">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
                {user.streakCount} <span className="text-amber-500 text-sm font-bold uppercase tracking-wide">Days Streak</span>
              </p>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Next landmark: {user.streakCount + 3} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Study Time */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Study Hours</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-all">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {stats.loading ? (
            <div className="h-8 w-28 bg-slate-800/80 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-2xl font-bold text-white tracking-tight">{stats.weeklyStudyHours} Hours</h3>
          )}
        </div>

        {/* Card 2: Mastery Index */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Mastery Index</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <Target className="w-4 h-4" />
            </div>
          </div>
          {stats.loading ? (
            <div className="h-8 w-28 bg-slate-800/80 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-2xl font-bold text-white tracking-tight">{stats.overallMasteryIndex}% Mastery</h3>
          )}
          <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden mt-3.5">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-500" 
              style={{ width: `${stats.loading ? 0 : stats.overallMasteryIndex}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Solved Quizzes */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assessments Cleared</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-all">
              <Award className="w-4 h-4" />
            </div>
          </div>
          {stats.loading ? (
            <div className="h-8 w-28 bg-slate-800/80 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-2xl font-bold text-white tracking-tight">{stats.assessments} Quizzes</h3>
          )}
        </div>

        {/* Card 4: Daily Tasks Tracker */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Daily Tasks Cleared</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-all">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          {stats.loading ? (
            <div className="h-8 w-28 bg-slate-800/80 animate-pulse rounded mb-2"></div>
          ) : (
            <h3 className="text-2xl font-bold text-white tracking-tight">{completedCount}/{dailyTasks.length} Done</h3>
          )}
          <div className="flex justify-between items-center text-xs mt-3 text-slate-400 font-medium">
            {stats.loading ? (
              <div className="h-3.5 w-32 bg-slate-800/80 animate-pulse rounded"></div>
            ) : (
              <>
                <span>{progressPercent}% Complete</span>
                <span>+{completedCount * 50} XP Today</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Dynamic Activity Progression Logger (Premium Glass Widget) */}
      <div className="bg-[#1e293b]/20 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" /> Real-time Progression Hub
            </h3>
            <p className="text-xs text-slate-400">Log actual self-study logs or diagnostic quiz scores. Your streak, stats, and mastery adapt in real-time!</p>
          </div>
          
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850 self-stretch md:self-auto">
            <button
              onClick={() => { setLoggerTab("study"); setLogTopic(weakTopics[0]?.name || "General Study"); }}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loggerTab === "study"
                  ? "bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Log Study
            </button>
            <button
              onClick={() => { setLoggerTab("quiz"); setLogTopic(weakTopics[0]?.name || "General Study"); }}
              className={`flex-1 md:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loggerTab === "quiz"
                  ? "bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Log Quiz
            </button>
          </div>
        </div>

        {logSuccess && (
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs font-semibold text-teal-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin animate-infinite" /> {logSuccess}
          </div>
        )}

        {loggerTab === "study" ? (
          <form onSubmit={handleLogStudy} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject of Focus</label>
              <select
                value={logTopic}
                onChange={(e) => setLogTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
              >
                {weakTopics.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
                <option value="General Study">General Study</option>
              </select>
            </div>

            <div className="md:col-span-4 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Study Hours Logged</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="12"
                  value={logHours}
                  onChange={(e) => setLogHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500 text-xs px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none transition-colors"
                />
                <span className="flex items-center text-xs text-slate-400 font-bold shrink-0 bg-slate-950 px-3 border border-slate-850 rounded-xl">Hrs</span>
              </div>
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={isSubmittingLog}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)] flex items-center justify-center gap-1.5"
              >
                {isSubmittingLog ? "Syncing stats..." : "Log Real Study Hours"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogQuiz} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnostic Topic</label>
              <select
                value={logTopic}
                onChange={(e) => setLogTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 transition-colors"
              >
                {weakTopics.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
                <option value="General Study">General Study</option>
              </select>
            </div>

            <div className="md:col-span-4 text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quiz Questions Correct</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={quizTotal}
                  value={quizCorrect}
                  onChange={(e) => setQuizCorrect(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500 text-xs px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none text-center transition-colors"
                />
                <span className="text-slate-500 font-bold">/</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quizTotal}
                  onChange={(e) => setQuizTotal(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500 text-xs px-3.5 py-2.5 rounded-xl text-slate-200 focus:outline-none text-center transition-colors"
                />
                <span className="text-slate-400 text-xs font-bold shrink-0 bg-slate-950 px-3 border border-slate-850 rounded-xl py-2.5">Correct</span>
              </div>
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={isSubmittingLog}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)] flex items-center justify-center gap-1.5"
              >
                {isSubmittingLog ? "Submitting..." : "Submit Real Quiz Score"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Grid: Weak Topics (Interactive) & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* 3. Weak Topics Panel (ColSpan: 2) */}
        <div className="lg:col-span-2 bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Weak Topics Map
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/15 border border-red-500/20 text-red-400 rounded-full">
                Needs Recovery
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Based on your response analytics, these sub-domains exhibit low accuracy scores. Tap any item to synthesize a recovery schedule with the Gemini API.
            </p>

            <div className="space-y-4">
              {weakTopics.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleGeneratePlan(item.name)}
                  className={`border p-4 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                    activePlan === item.name 
                      ? "bg-teal-950/20 border-teal-500/50" 
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/60"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{item.totalQs} dynamic questions taken</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.severity === "Critical" ? "text-red-400 bg-red-500/10" :
                      item.severity === "High" ? "text-orange-400 bg-orange-500/10" : "text-yellow-400 bg-yellow-500/10"
                    }`}>
                      {item.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.accuracy < 35 ? "bg-red-500" :
                          item.accuracy < 46 ? "bg-orange-500" : "bg-yellow-500"
                        }`} 
                        style={{ width: `${item.accuracy}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-300 w-8 text-right">{item.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated Gemini Recovery Plan Display */}
          <AnimatePresence>
            {activePlan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-5 border-t border-slate-800/80"
              >
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 bg-teal-500/10 rounded text-[9px] font-bold text-teal-400">
                    <Sparkles className="w-3 h-3" /> Gemini AI
                  </div>
                  <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">
                    Recovery Plan: {activePlan}
                  </h5>
                  
                  {generatingPlan ? (
                    <div className="flex items-center gap-2 py-4 text-xs font-semibold text-teal-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing custom lectures...
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      {generatedPlanText.filter(Boolean).map((line, i) => (
                        <p 
                          key={i} 
                          className={
                            line && line.startsWith("🚀") ? "text-teal-400 font-bold mt-2" :
                            line && line.startsWith("•") ? "pl-2 text-slate-400" : "text-slate-400 font-medium"
                          }
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {!generatingPlan && recoveredGoals.length > 0 && (
                    <button 
                      onClick={handleInitializeRecoveryPath}
                      className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Initialize Recovery Path
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 4. AI Recommendations & Curated Resources (ColSpan: 3) */}
        <div className="lg:col-span-3 bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-teal-400" /> AI Suggestions & Resources
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Compiled Live</span>
            </div>

            <div className="space-y-5">
              {aiSuggestions.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-950/40 border border-slate-850 p-4.5 rounded-xl hover:border-slate-800 transition-all duration-200 flex items-start gap-4 group"
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${
                    item.type === "Conceptual" ? "bg-teal-500/10 border border-teal-500/20 text-teal-400" :
                    item.type === "Adaptive Quiz" ? "bg-blue-500/10 border border-blue-500/20 text-blue-400" :
                    "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  }`}>
                    {item.type === "Conceptual" ? <BookOpen className="w-5 h-5" /> :
                     item.type === "Adaptive Quiz" ? <Target className="w-5 h-5" /> :
                     <Zap className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.type === "Conceptual" ? "bg-teal-500/5 text-teal-400" :
                        item.type === "Adaptive Quiz" ? "bg-blue-500/5 text-blue-400" :
                        "bg-purple-500/5 text-purple-400"
                      }`}>{item.type}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.duration}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-end mt-3">
                      <button className={`text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                        item.type === "Conceptual" ? "text-teal-400 hover:text-teal-300" :
                        item.type === "Adaptive Quiz" ? "text-blue-400 hover:text-blue-300" :
                        "text-purple-400 hover:text-purple-300"
                      }`}>
                        {item.linkText} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {aiSuggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500 border border-slate-850 border-dashed rounded-xl">
                  <Lightbulb className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs font-semibold">No resource recommendations found</p>
                  <p className="text-[10px] text-slate-600 mt-1">You can add your interests to get recommended topics.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3 min-h-[64px]">
            <Sparkles className={`w-5 h-5 text-teal-400 shrink-0 ${loadingGeminiTip ? "animate-pulse" : ""}`} />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Gemini Study Coach:</strong> {loadingGeminiTip ? (
                <span className="text-slate-500 italic animate-pulse animate-duration-1000">Analyzing stats and formulating customized tips...</span>
              ) : (
                <span className="text-slate-300">{geminiTip}</span>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Interactive Knowledge Graph & Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* 5. Interactive Knowledge Graph (ColSpan: 3) */}
        <div className="lg:col-span-3 bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-teal-400" /> Mastery Knowledge Graph
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Custom visual node curriculum map</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 rounded-lg text-slate-400">Interactive Node Map</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            
            {/* SVG Render (Col: 3) */}
            <div className="md:col-span-3 bg-slate-950/60 rounded-2xl border border-slate-850/80 p-4 relative flex items-center justify-center min-h-[260px]">
              
              {/* Custom CSS Animation for Edge Pulsing */}
              <style>{`
                @keyframes pulseEdge {
                  0% { stroke-dashoffset: 24; opacity: 0.4; }
                  50% { opacity: 0.8; }
                  100% { stroke-dashoffset: 0; opacity: 0.4; }
                }
                .pulse-path {
                  stroke-dasharray: 6, 4;
                  animation: pulseEdge 12s linear infinite;
                }
              `}</style>

              <svg className="w-full h-full max-w-[480px] aspect-[500/240]" viewBox="0 0 500 240">
                {/* SVG Connections/Edges */}
                {edges.map((edge, idx) => {
                  const fromNode = dynamicNodes.find(n => n.id === edge.from);
                  const toNode = dynamicNodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  const isHighlighted = selectedNodeId === fromNode.id || selectedNodeId === toNode.id;

                  return (
                    <g key={idx}>
                      {/* Highlighted underlay glow */}
                      {isHighlighted && (
                        <line 
                          x1={fromNode.x} y1={fromNode.y} 
                          x2={toNode.x} y2={toNode.y} 
                          stroke="#14b8a6" 
                          strokeWidth="4" 
                          strokeLinecap="round"
                          opacity="0.25"
                          className="blur-sm"
                        />
                      )}
                      {/* Interactive dashed edge */}
                      <line 
                        x1={fromNode.x} y1={fromNode.y} 
                        x2={toNode.x} y2={toNode.y} 
                        stroke={isHighlighted ? "#2dd4bf" : "#334155"} 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                        className="pulse-path"
                      />
                    </g>
                  );
                })}

                {/* SVG Interactive Nodes */}
                {dynamicNodes.map((node) => {
                  const isActive = selectedNodeId === node.id;
                  
                  // Color codes for statuses
                  const nodeColor = 
                    node.status === "mastered" ? "#14b8a6" : 
                    node.status === "improving" ? "#3b82f6" : "#f43f5e";

                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group"
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      {/* Floating hover node ring */}
                      <circle 
                        cx={node.x} cy={node.y} 
                        r={isActive ? "20" : "15"} 
                        fill="transparent" 
                        stroke={nodeColor} 
                        strokeWidth="1" 
                        strokeDasharray={isActive ? "4,2" : "0"}
                        opacity={isActive ? "1" : "0"} 
                        className="transition-all duration-300 animate-spin"
                        style={{ transformOrigin: `${node.x}px ${node.y}px`, animationDuration: "10s" }}
                      />
                      
                      {/* Master Node Circle */}
                      <circle 
                        cx={node.x} cy={node.y} 
                        r="12" 
                        fill={isActive ? nodeColor : "#090d16"} 
                        stroke={nodeColor} 
                        strokeWidth="2.5" 
                        className="transition-all duration-300 group-hover:scale-110 shadow-lg"
                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                      />

                      {/* Sparkle node indicators for weak topics */}
                      {node.status === "weak" && (
                        <circle 
                          cx={node.x + 8} cy={node.y - 8} 
                          r="4" 
                          fill="#f43f5e" 
                          className="animate-ping" 
                        />
                      )}

                      {/* Small node letter indicator */}
                      <text 
                        x={node.x} y={node.y + 4} 
                        fill={isActive ? "#090d16" : "#ffffff"} 
                        fontSize="10" 
                        fontWeight="black" 
                        textAnchor="middle"
                        className="select-none pointer-events-none"
                      >
                        {node.label.substring(0, 1)}
                      </text>

                      {/* Dynamic Text Label */}
                      <text 
                        x={node.x} y={node.y + (node.id === "trees" ? -20 : 25)} 
                        fill={isActive ? "#ffffff" : "#94a3b8"} 
                        fontSize="9.5" 
                        fontWeight={isActive ? "bold" : "medium"} 
                        textAnchor="middle"
                        className="select-none pointer-events-none transition-colors"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Inspector Pane (Col: 2) */}
            <div className="md:col-span-2 space-y-4">
              <AnimatePresence mode="wait">
                {selectedNode ? (
                  <motion.div
                    key={selectedNode.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 
                            selectedNode.status === "mastered" ? "#14b8a6" : 
                            selectedNode.status === "improving" ? "#3b82f6" : "#f43f5e"
                          }}></span>
                          {selectedNode.label}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 capitalize">
                          {selectedNode.status}
                        </span>
                      </div>
                      
                      <p className="text-[10.5px] text-slate-400 leading-relaxed mb-4">
                        {selectedNode.desc}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5 text-slate-300 font-semibold">
                          <span>Knowledge Mastery</span>
                          <span>{selectedNode.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${selectedNode.value}%`,
                              backgroundColor: 
                                selectedNode.status === "mastered" ? "#14b8a6" : 
                                selectedNode.status === "improving" ? "#3b82f6" : "#f43f5e"
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      {selectedNode.status === "weak" ? (
                        <button 
                          onClick={() => handleGeneratePlan(selectedNode.label)}
                          className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Core Weakness: Repair Node
                        </button>
                      ) : (
                        <button className="w-full bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                          Review Concepts
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 border-dashed text-center py-10 text-slate-500 text-xs">
                    <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    Tap on any node to analyze concept metrics
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

        {/* 6. Technical Progress & Hours Charts (ColSpan: 2) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Chart A: Line Progress Analytics */}
          <div className="bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" /> Mastery Progress Curve
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Overall Trend</span>
            </div>

            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgressData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis domain={[40, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
                  <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" name="Mastery Index" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: Study Hours Distribution */}
          <div className="bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Daily Study Distribution
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Daily Hours</span>
            </div>

            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyHoursData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} cursor={{ fill: "#1e293b", opacity: 0.2 }} />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Grid: Daily Tasks & Activity notifications (with streak heat points) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* 7. Daily Checkable Tasks (ColSpan: 3) */}
        <div className="lg:col-span-3 bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-400" /> Daily Objectives
              </h3>
              <div className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-full border border-slate-850">
                {stats.loading ? (
                  <span className="animate-pulse">Syncing...</span>
                ) : (
                  `Today's Progression: ${completedCount}/${dailyTasks.length}`
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Complete these custom learning challenges generated based on your profile weaknesses. Clearing items awards bonus experience points and advances your study streak!
            </p>

            <div className="space-y-3">
              {stats.loading ? (
                // Shimmering Task list skeletons
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border bg-slate-950/20 border-slate-900 animate-pulse">
                    <div className="w-5 h-5 rounded-full bg-slate-800 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 bg-slate-800 rounded w-2/3" />
                      <div className="h-3 bg-slate-800 rounded w-1/4" />
                    </div>
                  </div>
                ))
              ) : (
                dailyTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                      task.completed 
                        ? "bg-teal-950/10 border-teal-500/20 text-slate-400 line-through" 
                        : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/60 hover:border-slate-800"
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-700 hover:border-teal-500/50 shrink-0 mt-0.5 transition-colors" />
                    )}
                    
                    <div className="flex-1">
                      <p className={`text-sm font-semibold transition-colors ${task.completed ? "text-slate-500" : "text-white"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span className={task.completed ? "text-teal-600" : "text-teal-400"}>+{task.priority === "High" ? 75 : 50} XP</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span>{task.duration || "Study task"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 8. Streak Heat Points (Calendar grid) */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> Consecutive Day Calendar Tracker
            </h4>
            
            <div className="grid grid-cols-7 gap-3">
              {streakDays.map((day, idx) => (
                <div 
                  key={day.name} 
                  className={`p-3 rounded-xl flex flex-col items-center justify-center border text-center transition-all ${
                    day.active 
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold shadow-[0_0_12px_rgba(245,158,11,0.1)]" 
                      : idx === 6 
                      ? "bg-slate-950/50 border-teal-500/25 text-teal-400 font-bold animate-pulse" // Today active indicator
                      : "bg-slate-950/20 border-slate-850 text-slate-600 font-medium"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{day.name}</span>
                  {day.active ? (
                    <Flame className="w-4 h-4 fill-current animate-pulse" />
                  ) : idx === 6 ? (
                    <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 9. Smart Notifications & Activity Feed (ColSpan: 2) */}
        <div className="lg:col-span-2 bg-[#1e293b]/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" /> Notifications Feed
              </h3>
              <button 
                onClick={clearAllNotifications}
                className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors"
              >
                Clear Feed
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Live updates regarding customized curriculums, weak node alerts, peer help boards, and coordinator meeting approvals.
            </p>

            <AnimatePresence initial={false}>
              {notifications.filter(n => !n.read).length > 0 ? (
                <div className="space-y-3.5">
                  {notifications.filter(n => !n.read).map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, x: 20 }}
                      className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl relative group overflow-hidden"
                    >
                      {/* Close button */}
                      <button 
                        onClick={() => removeNotification(notif.id)}
                        className="absolute top-2 right-2.5 text-[10px] text-slate-600 hover:text-white transition-colors"
                      >
                        ✕
                      </button>

                      <div className="flex gap-3">
                        <div className="mt-0.5">
                          {notif.type === "weakness" ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                           notif.type === "missed" ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                           <Sparkles className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div className="flex-1 pr-4 min-w-0">
                          <p className="text-xs text-white leading-normal font-bold">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-normal mt-1 font-medium">
                            {notif.description}
                          </p>
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mt-1.5 block">
                            {notif.timestamp}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500 border border-slate-850 border-dashed rounded-xl">
                  <CheckCircle className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs font-semibold">Notifications Feed Clear</p>
                  <p className="text-[10px] text-slate-600 mt-1">We will notify you about your next recovery task.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8">
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 transition-colors text-xs flex items-center justify-center gap-1">
              Configure Alerts Settings
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
