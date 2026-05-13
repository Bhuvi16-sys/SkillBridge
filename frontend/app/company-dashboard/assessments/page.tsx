"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Clock,
  FileText,
  TrendingUp,
  BrainCircuit,
  X,
  Search,
  Filter,
  Award,
  BookOpen,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Play
} from "lucide-react";

interface CandidateScoreItem {
  id: string;
  userId: string;
  candidateName: string;
  testId: string;
  testName: string;
  score: number;
  status: "pending" | "completed";
  updatedAt: string;
}

interface ToastInfo {
  message: string;
  type: "success" | "error";
}

export default function AssessmentsDashboard() {
  const [scores, setScores] = useState<CandidateScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Fetch all assigned and completed tests from our backend API route
  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tests/scores");
      if (res.ok) {
        const data = await res.json();
        // Sort by updatedAt descending
        data.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setScores(data);
      } else {
        throw new Error("Failed to fetch score ledger");
      }
    } catch (err) {
      console.error("Error fetching assessment scores:", err);
      // Fallback: direct firestore retrieval if API fails
      if (db) {
        try {
          const scoresRef = collection(db, "candidate_scores");
          const snap = await getDocs(scoresRef);
          const localScores: CandidateScoreItem[] = [];
          snap.forEach((d) => {
            const data = d.data();
            localScores.push({
              id: d.id,
              userId: data.userId,
              candidateName: data.candidateName || "Scholar",
              testId: data.testId,
              testName: data.testName || "Technical Assessment",
              score: data.score ?? 0,
              status: data.status ?? "pending",
              updatedAt: data.updatedAt || new Date().toISOString()
            });
          });
          localScores.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setScores(localScores);
        } catch (fErr) {
          console.error("Firestore backup fetch failed:", fErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  // Auto-hide toast notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Simulate candidate completing the test with high/mid/low grade to verify neon styles
  const handleSimulateCompletion = async (scoreItem: CandidateScoreItem) => {
    if (!db) return;
    setSimulatingId(scoreItem.id);
    
    try {
      // 1. Generate a premium random grade (between 45% and 98%)
      const grades = [48, 55, 68, 72, 78, 84, 88, 92, 95, 98];
      const simulatedScore = grades[Math.floor(Math.random() * grades.length)];
      const updatedTimestamp = new Date().toISOString();

      // 2. Update the candidate_scores document in Firestore
      const scoreDocRef = doc(db, "candidate_scores", scoreItem.id);
      await updateDoc(scoreDocRef, {
        status: "completed",
        score: simulatedScore,
        updatedAt: updatedTimestamp
      });

      // 3. Reward the Student profile: increment assessmentsCleared and award XP
      try {
        const studentRef = doc(db, "users", scoreItem.userId);
        await updateDoc(studentRef, {
          assessmentsCleared: increment(1),
          xp: increment(250) // Reward standard completion XP
        });
      } catch (studentErr) {
        console.warn("Failed to increment student XP/assessments profile statistics:", studentErr);
      }

      setToast({
        message: `Simulated Candidate ${scoreItem.candidateName} completing "${scoreItem.testName}" with score ${simulatedScore}%! Dynamic stats synchronized.`,
        type: "success"
      });

      // 4. Refresh Scores listing
      await fetchScores();

    } catch (err: any) {
      console.error("Failed to simulate test completion:", err);
      setToast({
        message: "Simulation failed. Please verify firebase write permissions.",
        type: "error"
      });
    } finally {
      setSimulatingId(null);
    }
  };

  // Filter scoring logs based on search and status tabs
  const filteredScores = scores.filter(score => {
    const nameMatch = score.candidateName.toLowerCase().includes(searchQuery.toLowerCase());
    const testMatch = score.testName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "completed") {
      return (nameMatch || testMatch) && score.status === "completed";
    }
    if (statusFilter === "pending") {
      return (nameMatch || testMatch) && score.status === "pending";
    }
    return nameMatch || testMatch;
  });

  // Score Color Grading generator with Neon Accents
  const getScoreColorConfig = (score: number) => {
    if (score >= 80) {
      return {
        text: "text-emerald-400 font-extrabold shadow-emerald-500/20",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        glow: "shadow-[0_0_12px_rgba(52,211,153,0.4)] bg-emerald-400"
      };
    }
    if (score >= 60) {
      return {
        text: "text-amber-400 font-bold shadow-amber-500/20",
        bg: "bg-amber-500/10 border-amber-500/30",
        glow: "shadow-[0_0_12px_rgba(251,191,36,0.4)] bg-amber-400"
      };
    }
    return {
      text: "text-red-400 font-semibold shadow-red-500/20",
      bg: "bg-red-500/10 border-red-500/30",
      glow: "shadow-[0_0_12px_rgba(248,113,113,0.4)] bg-red-400"
    };
  };

  // Analytical summary computations
  const totalAssigned = scores.length;
  const totalCompleted = scores.filter(s => s.status === "completed").length;
  const totalPending = scores.filter(s => s.status === "pending").length;
  const averageScore = totalCompleted > 0 
    ? Math.round(scores.filter(s => s.status === "completed").reduce((acc, s) => acc + s.score, 0) / totalCompleted)
    : 0;

  return (
    <div className="space-y-8 pb-20 text-slate-200 relative">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-4.5 rounded-2xl shadow-2xl border flex items-center gap-3.5 max-w-sm ${
              toast.type === "success" 
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300" 
                : "bg-red-950/90 border-red-500/30 text-red-300"
            }`}
          >
            <div className={`p-1.5 rounded-xl shrink-0 ${toast.type === "success" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <X className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {toast.type === "success" ? "Simulate Success" : "System Alert"}
              </p>
              <p className="text-xs mt-0.5 text-slate-200 font-semibold leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-500 hover:text-white shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Page Header Block */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-[#1e293b]/70 to-slate-900 border border-slate-800/80 p-8 shadow-2xl text-left">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[250px] h-[250px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -top-10 -left-10 w-[180px] h-[180px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400">
              <Award className="w-3.5 h-3.5 animate-pulse" /> Recruiter Assessments Hub
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Assessment Scores & Progress
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Track candidate completion metrics, color-coded score records, and performance indexes. Use the simulations to instantly audit student performance flows in real-time.
            </p>
          </div>

          <button
            onClick={fetchScores}
            className="p-3 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0 flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Score Ledger
          </button>
        </div>
      </div>

      {/* 2. Analytical Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-left">
        {/* Metric 1 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Assigned Exams</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-white">{totalAssigned}</h3>
            <span className="text-xs text-slate-500">tests</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Completed</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-teal-400">{totalCompleted}</h3>
            <span className="text-xs text-teal-500">({totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0}%)</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Pending Intake</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-amber-500">{totalPending}</h3>
            <span className="text-xs text-amber-500">({totalAssigned > 0 ? Math.round((totalPending / totalAssigned) * 100) : 0}%)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Avg Score Grade</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-black text-white flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>{averageScore}%</span>
            </h3>
            <span className="text-xs text-slate-500">completed</span>
          </div>
        </div>
      </div>

      {/* 3. Filtering Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute inset-y-0 left-4 my-auto w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search scores by candidate name or test title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-800 focus:border-teal-500 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none text-slate-100 transition-colors"
          />
        </div>

        {/* Horizontal Status Filter Tabs */}
        <div className="flex bg-slate-950/60 p-1 border border-slate-850 rounded-xl shrink-0 w-full md:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === "all" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
          >
            All Logs
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === "completed" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
          >
            Completed ({scores.filter(s => s.status === "completed").length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === "pending" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
          >
            Pending ({scores.filter(s => s.status === "pending").length})
          </button>
        </div>
      </div>

      {/* 4. Score Ledger Display Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Syncing Assessment Ledger</h3>
            <p className="text-xs text-slate-500 mt-1">Interrogating score registries and indices...</p>
          </div>
        </div>
      ) : filteredScores.length === 0 ? (
        <div className="p-12 bg-slate-900/20 border border-slate-850 rounded-2xl text-center text-slate-400 max-w-lg mx-auto">
          <p className="text-sm italic">No score logs matched your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try assigning a test to students first from the 'Find Students' panel.</p>
        </div>
      ) : (
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-teal-500/5 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60">
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Candidate Scholar</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Assessment Paper</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Status Badge</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Verified Grade</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Last Sync Date</th>
                  <th className="px-6 py-4.5 text-[10px] font-black uppercase text-slate-400 tracking-wider text-center">Interactive Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {filteredScores.map((score) => {
                  const isCompleted = score.status === "completed";
                  const scoreConfig = isCompleted ? getScoreColorConfig(score.score) : null;

                  return (
                    <tr 
                      key={score.id} 
                      className="hover:bg-slate-900/20 transition-all group"
                    >
                      {/* Name Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center text-sm">
                            🧑‍🎓
                          </div>
                          <div>
                            <span className="text-xs font-black text-white group-hover:text-teal-400 transition-colors">
                              {score.candidateName}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">UID: {score.userId.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Test Title Column */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">{score.testName}</span>
                          <span className="text-[10px] text-slate-500">ID: {score.testId.slice(0, 6)}</span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-bold text-amber-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            <span>Pending Intake</span>
                          </span>
                        )}
                      </td>

                      {/* Score Grade Column */}
                      <td className="px-6 py-4">
                        {isCompleted && scoreConfig ? (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 border rounded-lg text-xs ${scoreConfig.bg} ${scoreConfig.text}`}>
                              {score.score}%
                            </span>
                            <div className={`w-1.5 h-1.5 rounded-full ${scoreConfig.glow}`} />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-bold">-</span>
                        )}
                      </td>

                      {/* Timestamp Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{score.updatedAt ? new Date(score.updatedAt).toLocaleDateString() : "Recent"}</span>
                        </div>
                      </td>

                      {/* Interactive Audit Simulations Column */}
                      <td className="px-6 py-4 text-center">
                        {!isCompleted ? (
                          <button
                            onClick={() => handleSimulateCompletion(score)}
                            disabled={simulatingId === score.id}
                            className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500 border border-purple-500/30 hover:border-purple-400 hover:text-slate-950 rounded-xl text-purple-400 text-[10px] font-black transition-all flex items-center justify-center gap-1.5 mx-auto shadow-[0_0_15px_rgba(168,85,247,0.05)] disabled:opacity-50"
                          >
                            {simulatingId === score.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Solving...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 text-purple-400 group-hover:text-slate-950 fill-current" /> Simulate Candidate Complete
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-400/80 flex items-center gap-1 justify-center">
                            <CheckCircle2 className="w-4 h-4 text-teal-400" /> Audit Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
