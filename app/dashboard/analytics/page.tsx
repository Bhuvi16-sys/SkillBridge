"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Target, 
  AlertTriangle, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  Code2, 
  BrainCircuit, 
  CheckCircle,
  FileSpreadsheet,
  Gauge
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";

// 1. Performance data points filtered by subject
const performanceDataAll = [
  { name: "Week 1", score: 55, baseline: 50 },
  { name: "Week 2", score: 62, baseline: 50 },
  { name: "Week 3", score: 58, baseline: 52 },
  { name: "Week 4", score: 71, baseline: 52 },
  { name: "Week 5", score: 68, baseline: 54 },
  { name: "Week 6", score: 78, baseline: 55 },
];

const performanceDataAlgo = [
  { name: "Week 1", score: 48, baseline: 50 },
  { name: "Week 2", score: 55, baseline: 50 },
  { name: "Week 3", score: 52, baseline: 50 },
  { name: "Week 4", score: 68, baseline: 50 },
  { name: "Week 5", score: 65, baseline: 50 },
  { name: "Week 6", score: 82, baseline: 50 },
];

const performanceDataDS = [
  { name: "Week 1", score: 62, baseline: 50 },
  { name: "Week 2", score: 68, baseline: 52 },
  { name: "Week 3", score: 64, baseline: 54 },
  { name: "Week 4", score: 74, baseline: 54 },
  { name: "Week 5", score: 71, baseline: 55 },
  { name: "Week 6", score: 75, baseline: 55 },
];

// 2. Topic Mastery Radar coordinates
const radarData = [
  { subject: "Recursion", A: 80, B: 85, fullMark: 100 },
  { subject: "Graphs & BFS", A: 45, B: 85, fullMark: 100 },
  { subject: "Dynamic Prog.", A: 32, B: 85, fullMark: 100 },
  { subject: "Trees & BST", A: 65, B: 85, fullMark: 100 },
  { subject: "Sorting", A: 88, B: 85, fullMark: 100 },
];

// 3. Double-Axis Productivity data (Weekly study hours vs Code submissions)
const productivityWeekCurrent = [
  { day: "Mon", hours: 2.5, submissions: 4 },
  { day: "Tue", hours: 3.8, submissions: 7 },
  { day: "Wed", hours: 4.2, submissions: 9 },
  { day: "Thu", hours: 1.5, submissions: 2 },
  { day: "Fri", hours: 3.0, submissions: 5 },
  { day: "Sat", hours: 5.5, submissions: 12 },
  { day: "Sun", hours: 4.0, submissions: 8 },
];

const productivityWeekLast = [
  { day: "Mon", hours: 1.8, submissions: 2 },
  { day: "Tue", hours: 2.2, submissions: 4 },
  { day: "Wed", hours: 3.5, submissions: 6 },
  { day: "Thu", hours: 2.0, submissions: 3 },
  { day: "Fri", hours: 1.5, submissions: 2 },
  { day: "Sat", hours: 4.0, submissions: 7 },
  { day: "Sun", hours: 3.2, submissions: 5 },
];

// 4. Github-style Contribution Heatmap grids (5 weeks x 7 days)
// intensity: 0 = none, 1 = low, 2 = moderate, 3 = high, 4 = heavy
const heatmapGrid = [
  [
    { day: "Mon", hours: 2.0, intensity: 2 },
    { day: "Tue", hours: 3.5, intensity: 3 },
    { day: "Wed", hours: 1.5, intensity: 1 },
    { day: "Thu", hours: 0.0, intensity: 0 },
    { day: "Fri", hours: 4.2, intensity: 4 },
    { day: "Sat", hours: 5.0, intensity: 4 },
    { day: "Sun", hours: 3.0, intensity: 3 },
  ],
  [
    { day: "Mon", hours: 1.0, intensity: 1 },
    { day: "Tue", hours: 2.5, intensity: 2 },
    { day: "Wed", hours: 4.0, intensity: 4 },
    { day: "Thu", hours: 1.8, intensity: 1 },
    { day: "Fri", hours: 0.0, intensity: 0 },
    { day: "Sat", hours: 6.2, intensity: 4 },
    { day: "Sun", hours: 2.8, intensity: 2 },
  ],
  [
    { day: "Mon", hours: 3.0, intensity: 3 },
    { day: "Tue", hours: 1.2, intensity: 1 },
    { day: "Wed", hours: 2.2, intensity: 2 },
    { day: "Thu", hours: 4.5, intensity: 4 },
    { day: "Fri", hours: 3.8, intensity: 3 },
    { day: "Sat", hours: 0.0, intensity: 0 },
    { day: "Sun", hours: 5.5, intensity: 4 },
  ],
  [
    { day: "Mon", hours: 2.2, intensity: 2 },
    { day: "Tue", hours: 3.8, intensity: 3 },
    { day: "Wed", hours: 4.2, intensity: 4 },
    { day: "Thu", hours: 1.5, intensity: 1 },
    { day: "Fri", hours: 3.0, intensity: 3 },
    { day: "Sat", hours: 5.5, intensity: 4 },
    { day: "Sun", hours: 4.0, intensity: 3 }, // Current Week
  ],
];

// Weak conceptual subtopics data
const initialWeakSubtopics = [
  { 
    id: "dp-knapsack", 
    topic: "Dynamic Programming", 
    subtopic: "Knapsack 0/1 Matrix tabulation", 
    accuracy: 28, 
    timeSpent: "2h 45m",
    mistakeReason: "Incorrect matrix dimension initialization for padding boundary cases (dp[0][j])."
  },
  { 
    id: "graphs-cycles", 
    topic: "Graph Traversals", 
    subtopic: "Directed BFS topological cycle traces", 
    accuracy: 42, 
    timeSpent: "3h 10m",
    mistakeReason: "Confusing undirected loop parent checks with directed in-degree subtraction checks."
  },
  { 
    id: "trees-deletes", 
    topic: "Trees & BST", 
    subtopic: "BST deletion predecessor/successor replacement", 
    accuracy: 58, 
    timeSpent: "1h 50m",
    mistakeReason: "Failing to properly re-link subtrees when deleted target possesses both left and right children."
  }
];

export default function AnalyticsPage() {
  const [performanceSubject, setPerformanceSubject] = useState<"all" | "algo" | "ds">("all");
  const [productivityWeek, setProductivityWeek] = useState<"current" | "last">("current");
  const [weakSubtopics, setWeakSubtopics] = useState(initialWeakSubtopics);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ day: string; hours: number } | null>({ day: "Sun (Today)", hours: 4.0 });

  const [generatingRemedial, setGeneratingRemedial] = useState<string | null>(null);
  const [remedialSuccess, setRemedialSuccess] = useState<string | null>(null);

  // Filter performance metrics
  const getPerformanceData = () => {
    if (performanceSubject === "algo") return performanceDataAlgo;
    if (performanceSubject === "ds") return performanceDataDS;
    return performanceDataAll;
  };

  const { addGoal } = useDashboard();

  // Switch productivity week data
  const getProductivityData = () => {
    return productivityWeek === "current" ? productivityWeekCurrent : productivityWeekLast;
  };

  // Mock adaptive remedial plan generation
  const handleGenerateRemedialPlan = (subtopicId: string, subtopicName: string) => {
    setGeneratingRemedial(subtopicId);
    setRemedialSuccess(null);

    setTimeout(() => {
      setGeneratingRemedial(null);
      
      // Inject high-priority dynamic goal to study planner
      addGoal({
        title: `Remedial: ${subtopicName}`,
        duration: "45 min",
        priority: "High"
      });

      setRemedialSuccess(`🚀 Remedial action successfully added! Created a high-priority diagnostic path in your Study Planner for '${subtopicName}'.`);
      setTimeout(() => setRemedialSuccess(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200 relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {remedialSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-6 py-4 rounded-xl border border-teal-400 font-extrabold shadow-[0_0_30px_rgba(20,184,166,0.3)] z-50 text-xs flex items-center gap-2 max-w-xl text-center"
          >
            <Sparkles className="w-5 h-5 shrink-0" /> {remedialSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Card */}
      <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">System Performance Analytics</h2>
            <p className="text-xs text-slate-400">Comprehensive study consistency metrics, radar mastery grids, and deep algorithmic diagnostic scopes</p>
          </div>
        </div>

        <div className="hidden sm:flex gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/60 flex items-center gap-2.5">
            <Target className="w-4 h-4 text-teal-400" />
            <div className="text-left">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Target accuracy</span>
              <span className="text-xs font-black text-white">85.0% Overall</span>
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/60 flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <div className="text-left">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Learning Speed</span>
              <span className="text-xs font-black text-white">+14.2% / Wk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Performance Chart (Left) & Spaced Repetition Heatmap (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Performance AreaChart Progression (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[380px]">
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-teal-400" />
              <h3 className="text-sm font-bold text-white text-left">Mastery Score Progression</h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setPerformanceSubject("all")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  performanceSubject === "all" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPerformanceSubject("algo")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  performanceSubject === "algo" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Algos
              </button>
              <button
                onClick={() => setPerformanceSubject("ds")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  performanceSubject === "ds" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Structures
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getPerformanceData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[30, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b1120", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: "11px" }}
                  itemStyle={{ color: "#14b8a6", fontSize: "11px", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" name="Your Mastery Index" />
                <Line type="monotone" dataKey="baseline" stroke="#475569" strokeDasharray="5 5" name="Class Baseline" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Consistency Heatmap (Span 5) */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[380px] text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Daily Study Consistency</h3>
            </div>
            <p className="text-[11px] text-slate-400">Click cells to check hours spent on specific study days</p>
          </div>

          {/* GitHub Style Contribution Grid */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="grid grid-flow-col gap-2">
              {heatmapGrid.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-2">
                  {week.map((cell, cIdx) => {
                    let intensityBg = "bg-slate-950 border-slate-900";
                    if (cell.intensity === 1) intensityBg = "bg-teal-500/10 border-teal-500/20";
                    if (cell.intensity === 2) intensityBg = "bg-teal-500/20 border-teal-500/30";
                    if (cell.intensity === 3) intensityBg = "bg-teal-500/40 border-teal-500/50";
                    if (cell.intensity === 4) intensityBg = "bg-teal-500 text-slate-950 border-teal-400";

                    const isSelected = selectedHeatmapCell?.day === `${cell.day} (Week ${wIdx + 1})`;

                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setSelectedHeatmapCell({ day: `${cell.day} (Week ${wIdx + 1})`, hours: cell.hours })}
                        className={`w-7 h-7 rounded-md border transition-all ${intensityBg} ${
                          isSelected ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105 hover:border-slate-700"
                        }`}
                        title={`${cell.day} Week ${wIdx + 1}: ${cell.hours}h`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Grid Legend indicators */}
            <div className="flex items-center gap-2.5 text-[10px] text-slate-500">
              <span>Less</span>
              <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-900"></span>
              <span className="w-3.5 h-3.5 rounded bg-teal-500/10 border border-teal-500/20"></span>
              <span className="w-3.5 h-3.5 rounded bg-teal-500/20 border border-teal-500/30"></span>
              <span className="w-3.5 h-3.5 rounded bg-teal-500/40 border border-teal-500/50"></span>
              <span className="w-3.5 h-3.5 rounded bg-teal-500 border border-teal-400"></span>
              <span>More</span>
            </div>
          </div>

          {/* Interactive display panel */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500 block text-[9px] font-black uppercase tracking-wider">Date Tracked:</span>
              <span className="font-bold text-slate-200">{selectedHeatmapCell?.day || "N/A"}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[9px] font-black uppercase tracking-wider">Intensity Metrics:</span>
              <span className="font-extrabold text-teal-400">{selectedHeatmapCell?.hours.toFixed(1) || 0} Hours Studied</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Topic Mastery Radar (Left) & Productivity Line/Bar Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topic Mastery RadarChart (Span 5) */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[380px] text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4.5 h-4.5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Conceptual Topic Mastery</h3>
            </div>
            <p className="text-[11px] text-slate-400">Compares current index (teal) with targeted interview standards (slate)</p>
          </div>

          <div className="flex-1 min-h-0 w-full flex justify-center items-center py-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1e293b/80" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} fontWeight="bold" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="Alex R. (Actual)" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} />
                <Radar name="Syllabus Target" dataKey="B" stroke="#475569" fill="#475569" fillOpacity={0.05} strokeDasharray="3 3" />
                <Legend wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Double-Axis Productivity (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[380px]">
          <div className="flex justify-between items-center pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-blue-400" />
              <h3 className="text-sm font-bold text-white text-left">Study Hours vs Sandbox Submissions</h3>
            </div>

            {/* Week Toggler */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
              <button
                onClick={() => setProductivityWeek("current")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  productivityWeek === "current" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Current Week
              </button>
              <button
                onClick={() => setProductivityWeek("last")}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  productivityWeek === "last" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Last Week
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getProductivityData()} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b/40" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#64748b" fontSize={10} tickLine={false} name="Hours" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={10} tickLine={false} name="Submits" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0b1120", borderColor: "#1e293b", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                />
                <Bar yAxisId="left" dataKey="hours" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Hours Studied" />
                <Line yAxisId="right" type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={3} name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Weak Topic Analysis Panel */}
      <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-3xl space-y-5 text-left">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Granular Weak Topic Analysis
          </h3>
          <p className="text-xs text-slate-400">Pinpoints direct conceptual leaks identified from your test submissions & suggests action paths.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weakSubtopics.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-950/50 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all text-left"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-500 block">{item.topic}</span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1 leading-normal">{item.subtopic}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-extrabold text-[9px]">
                    {item.accuracy}% Acc
                  </span>
                </div>

                <div className="text-[10.5px] space-y-2 text-slate-400">
                  <p className="leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-900">
                    <strong className="text-slate-300 block mb-1">Common Core Mistake:</strong>
                    {item.mistakeReason}
                  </p>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                    <Clock className="w-3.5 h-3.5 text-teal-400" /> Time spent: {item.timeSpent}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900/60 mt-4">
                <button
                  onClick={() => handleGenerateRemedialPlan(item.id, item.subtopic)}
                  disabled={generatingRemedial === item.id}
                  className="w-full py-2 bg-teal-500/10 hover:bg-teal-500 hover:text-slate-950 border border-teal-500/20 text-teal-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  {generatingRemedial === item.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling syllabus...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Initialize Action Plan
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Simple loader svg
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
