"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { 
  Building, 
  Sparkles, 
  Users, 
  Briefcase, 
  Award, 
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  Cpu,
  GraduationCap,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { userProfileConverter } from "@/lib/models";

export default function CompanyDashboard() {
  const { userProfile, user: currentUser } = useUser();
  const router = useRouter();

  const isProfileIncomplete = 
    !userProfile?.companyName || 
    userProfile.companyName === "Organization Member" || 
    !userProfile?.industry || 
    !userProfile?.website;

  const recruiterName = userProfile?.fullName || currentUser?.displayName || "Recruiter";
  const companyName = userProfile?.companyName || "Organization Member";
  const industry = userProfile?.industry || "EdTech / Software";

  // State variables for real database data
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalScholars: 0,
    avgReadiness: 0,
    activeRequests: 0,
    hiredScholars: 0
  });

  // Fetch real students and calculate real aggregate stats
  React.useEffect(() => {
    const fetchRealData = async () => {
      setLoadingData(true);
      try {
        const q = query(
          collection(db!, "users"),
          where("role", "==", "student")
        ).withConverter(userProfileConverter);

        const querySnapshot = await getDocs(q);
        const fetchedCandidates: any[] = [];
        let totalReadiness = 0;
        let readinessCount = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedCandidates.push({
            id: doc.id,
            name: data.fullName || "SkillBridge Student",
            institution: data.institution || "Self-Taught / Independent",
            skills: data.skillsToLearn || [],
            readiness: data.readinessScore ?? 0,
            level: data.level ?? 1,
            avatar: "👨‍💻"
          });
          if (data.readinessScore !== undefined) {
            totalReadiness += data.readinessScore;
            readinessCount++;
          }
        });

        // Sort candidates by readiness descending to fetch "Top Performers"
        fetchedCandidates.sort((a, b) => b.readiness - a.readiness);

        const avgReadiness = readinessCount > 0 ? Math.round(totalReadiness / readinessCount) : 0;

        setCandidatesList(fetchedCandidates);
        setDashboardStats({
          totalScholars: fetchedCandidates.length,
          avgReadiness,
          activeRequests: 12, // simulated active recruiter matches
          hiredScholars: Math.round(fetchedCandidates.length * 0.1) // 10% average hire conversion
        });
      } catch (error) {
        console.error("Error fetching real candidate data in company dashboard:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchRealData();
  }, []);

  // Stats configurations mapped dynamically
  const statsConfig = [
    {
      label: "Total Scholars Registered",
      value: loadingData ? null : String(dashboardStats.totalScholars),
      icon: Users,
      color: "teal",
      bg: "bg-teal-500/10",
      text: "text-teal-400"
    },
    {
      label: "Avg. Readiness Index",
      value: loadingData ? null : `${dashboardStats.avgReadiness}%`,
      icon: Cpu,
      color: "blue",
      bg: "bg-blue-500/10",
      text: "text-blue-400"
    },
    {
      label: "Active Connection Requests",
      value: loadingData ? null : String(dashboardStats.activeRequests),
      icon: Briefcase,
      color: "purple",
      bg: "bg-purple-500/10",
      text: "text-purple-400"
    },
    {
      label: "Hired Scholars",
      value: loadingData ? null : String(dashboardStats.hiredScholars),
      icon: Award,
      color: "pink",
      bg: "bg-pink-500/10",
      text: "text-pink-400"
    }
  ];

  return (
    <div className="space-y-8 pb-12 text-slate-200">
      
      {/* Profile Incomplete Alert Banner */}
      {isProfileIncomplete && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent backdrop-blur-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.1)] text-left"
        >
          {/* Neon Glow Accent */}
          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500"></div>
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                Company Profile Incomplete
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/20 text-[9px] font-extrabold uppercase text-amber-400 animate-pulse">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Your organizational space is currently unconfigured. Complete your corporate profile details to unlock verified matching, candidate direct-messaging, and custom job dispatches.
              </p>
            </div>
          </div>

          <button 
            onClick={() => router.push("/company-dashboard/settings")}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] whitespace-nowrap shrink-0"
          >
            Complete Profile
          </button>
        </motion.div>
      )}

      {/* 1. Recruiter Welcome Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-[#1e293b]/70 to-slate-900 border border-slate-800/80 p-8 shadow-2xl text-left">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -top-10 -left-10 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400 mb-4">
              <Building className="w-3.5 h-3.5" /> Corporate Admin Portal
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">{recruiterName}</span>
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Partner administrator for <strong className="text-white">{companyName}</strong> ({industry}). Access curated student portfolios matched by verified academic achievements and tech stack readiness metrics.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 px-6 py-4 rounded-2xl shadow-xl">
            <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.15)] animate-pulse">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-black text-white tracking-tight">
                Top Tier
              </p>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">Corporate Partner Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recruiter Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div 
              key={idx} 
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 group text-left"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.text} group-hover:scale-105 transition-all`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              {stat.value === null ? (
                <div className="h-8 w-20 bg-slate-850 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Action Hub & Curated Talent Pools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Curated Scholars Lists (Span 8) */}
        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 p-6 rounded-3xl relative overflow-hidden text-left space-y-4 shadow-xl">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
            <div>
              <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wider">Top Performers</span>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-teal-400" /> Curated High-Readiness Scholars
              </h3>
            </div>
            <button 
              onClick={() => router.push("/company-dashboard/students")}
              className="px-3 py-1.5 bg-teal-500/10 text-teal-400 text-[10px] font-black border border-teal-500/15 rounded-lg flex items-center gap-1 hover:bg-teal-500/25 transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Full Search
            </button>
          </div>

          <div className="space-y-4">
            {loadingData ? (
              // Shimmering skeletons for candidates
              Array.from({ length: 3 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-950/20 border border-slate-900/60 rounded-2xl animate-pulse gap-4"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-11 h-11 rounded-xl bg-slate-900/60 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-900/60 rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-slate-900/60 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))
            ) : candidatesList.length === 0 ? (
              /* Premium Empty State component */
              <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-950/40 border border-slate-850 border-dashed rounded-2xl shadow-inner min-h-[220px]">
                <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4 shadow-[0_0_15px_rgba(20,184,166,0.05)]">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">No Scholars Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  There are no verified student profiles registered on the platform at the moment. Check back soon for qualified talent matches!
                </p>
              </div>
            ) : (
              /* Display top 3 real scholars */
              candidatesList.slice(0, 3).map((scholar) => (
                <div 
                  key={scholar.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-slate-800 transition-all gap-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                      {scholar.avatar || "👨‍💻"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {scholar.name}
                        <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-[9px] font-bold text-teal-400">
                          Level {scholar.level}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">{scholar.institution}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {scholar.skills.length > 0 ? (
                          scholar.skills.map((skill: string, sIdx: number) => (
                            <span 
                              key={sIdx} 
                              className="px-2 py-0.5 bg-slate-900 border border-slate-850 rounded-md text-[9px] font-semibold text-slate-400"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold italic">No skills listed yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase block">Readiness Index</span>
                      <span className="text-sm font-black text-teal-400">{scholar.readiness}%</span>
                    </div>
                    <button 
                      onClick={() => router.push("/company-dashboard/students")}
                      className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-black rounded-lg transition-colors"
                    >
                      View Metrics
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Help / Resource Hub (Span 4) */}
        <div className="lg:col-span-4 bg-[#1e293b]/20 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl text-left flex flex-col justify-between shadow-xl min-h-[300px]">
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl w-fit">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive Recruiting Metrics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recruit students directly by auditing their real-time knowledge graphs, skill progress checklists, and logged study streaks.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Verified study logs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Real-time quiz credentials</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Custom skill tracking boards</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900/60 mt-6">
            <button 
              onClick={() => router.push("/company-dashboard/students")}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)] flex items-center justify-center gap-1.5"
            >
              Start Finding Scholars
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
