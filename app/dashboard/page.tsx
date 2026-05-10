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
  Undo2
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

// Data structures for Recharts
const weeklyProgressData = [
  { name: "Week 1", score: 55, baseline: 50 },
  { name: "Week 2", score: 62, baseline: 50 },
  { name: "Week 3", score: 59, baseline: 50 },
  { name: "Week 4", score: 68, baseline: 50 },
  { name: "Week 5", score: 74, baseline: 50 },
  { name: "Week 6", score: 78, baseline: 50 },
];

const studyHoursData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.8 },
  { day: "Wed", hours: 4.2 },
  { day: "Thu", hours: 1.5 },
  { day: "Fri", hours: 3.0 },
  { day: "Sat", hours: 5.5 },
  { day: "Sun", hours: 4.0 },
];

// Interactive Knowledge Graph node parameters
const nodes = [
  { id: "algo", label: "Algorithms", x: 60, y: 130, status: "mastered", value: 88, desc: "Asymptotic Analysis, Search, Sort" },
  { id: "ds", label: "Data Structures", x: 190, y: 130, status: "mastered", value: 82, desc: "Arrays, Lists, Stacks, Queues" },
  { id: "trees", label: "Trees & BST", x: 320, y: 70, status: "improving", value: 65, desc: "In-order, Pre-order, BST operations" },
  { id: "graphs", label: "Graphs & DFS", x: 320, y: 190, status: "weak", value: 45, desc: "BFS/DFS, Topological Sort, Dijkstra" },
  { id: "dp", label: "Dynamic Prog.", x: 450, y: 190, status: "weak", value: 32, desc: "Memoization, Tabulation, Knapsack" },
];

const edges = [
  { from: "algo", to: "ds" },
  { from: "ds", to: "trees" },
  { from: "ds", to: "graphs" },
  { from: "graphs", to: "dp" },
];

export default function StudentDashboard() {
  const { user, goals: tasks, toggleGoal: handleToggleTask, notifications, markNotificationRead, clearAllNotifications } = useDashboard();
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

  // Weak Topics state
  const [weakTopics, setWeakTopics] = useState([
    { id: "dp", name: "Dynamic Programming", accuracy: 32, totalQs: 15, severity: "Critical" },
    { id: "graphs", name: "Graph Traversals (BFS/DFS)", accuracy: 45, totalQs: 22, severity: "High" },
    { id: "recursion", name: "Recursion & Backtracking", accuracy: 48, totalQs: 18, severity: "Medium" },
  ]);

  // Active simulated AI recovery plan
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatedPlanText, setGeneratedPlanText] = useState<string[]>([]);

  // Selected knowledge graph node state
  const [selectedNode, setSelectedNode] = useState<typeof nodes[0] | null>(nodes[3]); // Default to Graphs

  // Compute tasks completions
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Unmount cleanup for active simulations
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Generate Recovery Plan Simulation
  const handleGeneratePlan = (topicName: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setGeneratingPlan(true);
    setActivePlan(topicName);
    setGeneratedPlanText([]);

    const steps = [
      "Analyzing quiz metrics and identifying concept nodes...",
      "Connecting weak subtopics with Gemini API adaptive models...",
      "🚀 Recovery curriculum successfully compiled:",
      "• Lesson 1: Dynamic Visual tracing of Recursive subtrees (30 min)",
      "• Exercise: Complete 3 Memoization code challenges in Sandbox",
      "• Live Assessment: Unlock 10 Graphs diagnostic questions to boost score"
    ];

    let currentStep = 0;
    intervalRef.current = setInterval(() => {
      if (currentStep < steps.length) {
        setGeneratedPlanText(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setGeneratingPlan(false);
      }
    }, 600);
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
              Your recovery path is currently focused on mastering <strong className="text-white">Dynamic Programming</strong>. You are progressing 15% faster than last week!
            </p>
          </div>

          {/* Glowing Streak HUD */}
          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 px-6 py-4 rounded-2xl shadow-xl">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
                {user.streak} <span className="text-amber-500 text-sm font-bold uppercase tracking-wide">Days Streak</span>
              </p>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Next landmark: {user.streak + 3} Days</p>
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
          <h3 className="text-2xl font-bold text-white tracking-tight">24.5 Hours</h3>
          <p className="text-xs text-teal-400 flex items-center gap-1 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last week
          </p>
        </div>

        {/* Card 2: Mastery Index */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Mastery Index</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">78% Mastery</h3>
          <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden mt-3.5">
            <div className="h-full bg-gradient-to-r from-teal-400 to-blue-500" style={{ width: "78%" }}></div>
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
          <h3 className="text-2xl font-bold text-white tracking-tight">42 Quizzes</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-2 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-teal-400" /> 88% average score
          </p>
        </div>

        {/* Card 4: Daily Tasks Tracker */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Daily Tasks Cleared</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-all">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">{completedCount}/{tasks.length} Done</h3>
          <div className="flex justify-between items-center text-xs mt-3 text-slate-400 font-medium">
            <span>{progressPercent}% Complete</span>
            <span>+{completedCount * 50} XP Today</span>
          </div>
        </div>

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

                  {!generatingPlan && (
                    <button className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
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
              
              {/* Rec 1 */}
              <div className="bg-slate-950/40 border border-slate-850 p-4.5 rounded-xl hover:border-slate-800 transition-colors flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider bg-teal-500/5 px-2 py-0.5 rounded">Conceptual</span>
                    <span className="text-[10px] text-slate-500 font-semibold">15 min read</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">Memoization vs Tabulation: Top-Down DP Visualized</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Unlock Gemini API interactive diagrams detailing subproblem overlays, call-stack executions, and temporal complexity mapping.
                  </p>
                  <div className="flex items-center justify-end mt-3">
                    <button className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1.5">
                      Open Resource <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rec 2 */}
              <div className="bg-slate-950/40 border border-slate-850 p-4.5 rounded-xl hover:border-slate-800 transition-colors flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-500/5 px-2 py-0.5 rounded">Adaptive Quiz</span>
                    <span className="text-[10px] text-slate-500 font-semibold">10 Questions</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">Graph Traversal Traps: DFS Call Stacks</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    A personalized diagnostic quiz targeting BFS structures, adjacency lists, topological cycles, and custom recursion nodes.
                  </p>
                  <div className="flex items-center justify-end mt-3">
                    <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5">
                      Start Diagnostic <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rec 3 */}
              <div className="bg-slate-950/40 border border-slate-850 p-4.5 rounded-xl hover:border-slate-800 transition-colors flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/5 px-2 py-0.5 rounded">Interactive Code</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Intermediate</span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">Backtracking: Maze Solving Pathfinders</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    Examine recursion backtracking trees with interactive visual debug step-ins. Inspect stack frame states in real-time.
                  </p>
                  <div className="flex items-center justify-end mt-3">
                    <button className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5">
                      Launch Sandbox <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Tip:</strong> Tackling <strong className="text-white">DFS Call Stacks</strong> quiz today will fulfill your pending graphs task and retain your study streak active!
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
                  const fromNode = nodes.find(n => n.id === edge.from);
                  const toNode = nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  const isHighlighted = selectedNode?.id === fromNode.id || selectedNode?.id === toNode.id;

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
                {nodes.map((node) => {
                  const isActive = selectedNode?.id === node.id;
                  
                  // Color codes for statuses
                  const nodeColor = 
                    node.status === "mastered" ? "#14b8a6" : 
                    node.status === "improving" ? "#3b82f6" : "#f43f5e";

                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer group"
                      onClick={() => setSelectedNode(node)}
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
                Today's Progression: {completedCount}/{tasks.length}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Complete these custom learning challenges generated based on your profile weaknesses. Clearing items awards bonus experience points and advances your study streak!
            </p>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                    task.completed 
                      ? "bg-teal-950/10 border-teal-500/20 text-slate-400 line-through" 
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-950/60 hover:border-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      task.completed 
                        ? "bg-teal-500 border-teal-500 text-slate-950" 
                        : "border-slate-700 bg-slate-950 hover:border-teal-500/50"
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  
                  <div className="flex-1">
                    <p className={`text-sm font-semibold transition-colors ${task.completed ? "text-slate-500" : "text-white"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span className={task.completed ? "text-teal-600" : "text-teal-400"}>+{task.priority === "High" ? 75 : 50} XP</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span>{task.duration || "Study task"}</span>
                    </div>
                  </div>
                </div>
              ))}
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

// Custom simple loading indicator for plan synthesizing
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
