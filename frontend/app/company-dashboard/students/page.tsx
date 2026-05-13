"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { userProfileConverter, UserProfile } from "@/lib/models";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  GraduationCap, 
  Trophy, 
  Cpu, 
  Sparkles, 
  UserPlus, 
  CheckCircle2, 
  Loader2,
  MapPin,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  X,
  Clock,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  Award,
  ChevronRight,
  Globe,
  Briefcase,
  Layers,
  Code,
  Send
} from "lucide-react";

// Local interfaces for subcollections
interface ProjectItem {
  id: string;
  title: string;
  description: string;
  gitUrl?: string;
  demoUrl?: string;
  tags: string[];
  createdAt: string;
}

interface SkillItem {
  id: string;
  name: string;
  level: number;
  xp: number;
  category: string;
}

interface ToastInfo {
  message: string;
  type: "success" | "error";
}

export default function StudentDiscovery() {
  const { user: currentUser, userProfile } = useUser();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Connection tracking states from Firestore
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});

  // Multi-select checkboxes state
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Detailed profile modal states
  const [viewingProfileCandidate, setViewingProfileCandidate] = useState<UserProfile | null>(null);
  const [candidateProjects, setCandidateProjects] = useState<ProjectItem[]>([]);
  const [candidateSkills, setCandidateSkills] = useState<SkillItem[]>([]);
  const [loadingProfileDetails, setLoadingProfileDetails] = useState(false);
  const [profileTab, setProfileTab] = useState<"academics" | "skills" | "projects">("academics");

  // Send Assessment Test states
  const [tests, setTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [assigningTest, setAssigningTest] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [showSendTestModal, setShowSendTestModal] = useState(false);

  // Stylized success/error toast state
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Connect Invitation Modal states
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Fetch student roster and connection statuses
  const fetchData = async () => {
    if (!db) {
      setError("Firebase connection is not configured.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. Fetch Students using our new RESTful API route first, fallback to Firestore
      let fetchedStudents: UserProfile[] = [];
      try {
        const response = await fetch("/api/candidates");
        if (response.ok) {
          fetchedStudents = await response.json();
          console.log("Successfully fetched candidates from API gateway");
        } else {
          throw new Error("API failed");
        }
      } catch (apiErr) {
        console.warn("API route failed, falling back to direct Firestore fetch:", apiErr);
        const usersRef = collection(db, "users").withConverter(userProfileConverter);
        const q = query(usersRef, where("role", "==", "student"));
        const querySnapshot = await getDocs(q);
        fetchedStudents = querySnapshot.docs.map(doc => doc.data());
      }

      // Sort primarily by assessmentsCleared descending, secondarily by XP descending
      fetchedStudents.sort((a, b) => {
        const aTests = a.assessmentsCleared ?? 0;
        const bTests = b.assessmentsCleared ?? 0;
        if (bTests !== aTests) return bTests - aTests;
        return (b.xp ?? 0) - (a.xp ?? 0);
      });

      // Assign rank dynamically based on real student performance position
      fetchedStudents = fetchedStudents.map((student, index) => ({
        ...student,
        rank: index + 1
      }));

      setStudents(fetchedStudents);

      // 2. Fetch existing recruiter connections to check status of students
      if (currentUser?.uid) {
        const connectionsRef = collection(db, "connections");
        const connQ = query(connectionsRef, where("recruiterId", "==", currentUser.uid));
        const connSnap = await getDocs(connQ);
        const statuses: Record<string, string> = {};
        connSnap.forEach((doc) => {
          const data = doc.data();
          statuses[data.studentId] = data.status;
        });
        setConnectionStatuses(statuses);
      }

    } catch (err: any) {
      console.error("Error fetching students/connections:", err);
      setError("Failed to load platform data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available tests from backend API (with auto-seeding on DB side if empty)
  const fetchTests = async () => {
    setLoadingTests(true);
    try {
      const res = await fetch("/api/tests");
      if (res.ok) {
        const data = await res.json();
        setTests(data);
        if (data.length > 0) {
          setSelectedTestId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch available tests:", err);
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTests();
  }, [currentUser?.uid]);

  // Auto-hide toast notifications after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch candidate's specific projects & skills when "View Profile" is triggered
  const handleOpenProfileModal = async (student: UserProfile) => {
    setViewingProfileCandidate(student);
    setProfileTab("academics");
    setCandidateProjects([]);
    setCandidateSkills([]);
    
    if (!db) return;
    
    setLoadingProfileDetails(true);
    try {
      // 1. Fetch Projects subcollection: users/{uid}/projects
      const projectsRef = collection(db, "users", student.uid, "projects");
      const projSnap = await getDocs(projectsRef);
      const projs: ProjectItem[] = [];
      projSnap.forEach((docSnap) => {
        const data = docSnap.data();
        projs.push({
          id: docSnap.id,
          title: data.title || "Project Work",
          description: data.description || "",
          gitUrl: data.gitUrl ?? "",
          demoUrl: data.demoUrl ?? "",
          tags: data.tags || [],
          createdAt: data.createdAt || ""
        });
      });
      setCandidateProjects(projs);

      // 2. Fetch Skills subcollection: users/{uid}/skills
      const skillsRef = collection(db, "users", student.uid, "skills");
      const skillSnap = await getDocs(skillsRef);
      const sks: SkillItem[] = [];
      skillSnap.forEach((docSnap) => {
        const data = docSnap.data();
        sks.push({
          id: docSnap.id,
          name: data.name || "",
          level: data.level || 1,
          xp: data.xp || 0,
          category: data.category || "General"
        });
      });
      setCandidateSkills(sks);

    } catch (err) {
      console.error("Error fetching candidate details subcollections:", err);
    } finally {
      setLoadingProfileDetails(false);
    }
  };

  // Handle individual candidate checkbox select toggle
  const handleToggleSelectCandidate = (uid: string) => {
    setSelectedCandidateIds(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  // Handle select/deselect all matching candidates
  const handleSelectAllCandidates = () => {
    const visibleIds = filteredStudents.map(s => s.uid);
    const allVisibleSelected = visibleIds.every(id => selectedCandidateIds.includes(id));

    if (allVisibleSelected) {
      // Deselect only the currently visible ones
      setSelectedCandidateIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select all visible ones, merging with already selected ones
      setSelectedCandidateIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Wire up to API Gateway: POST /api/tests/send
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId || selectedCandidateIds.length === 0) return;

    setAssigningTest(true);
    try {
      const res = await fetch("/api/tests/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          candidateIds: selectedCandidateIds,
          testId: selectedTestId
        })
      });

      if (res.ok) {
        setToast({
          message: `Successfully assigned assessment to ${selectedCandidateIds.length} candidate(s)! Dynamic alerts dispatched.`,
          type: "success"
        });
        // Reset states
        setSelectedCandidateIds([]);
        setShowSendTestModal(false);
      } else {
        const errData = await res.json();
        setToast({
          message: `Failed to dispatch assessment: ${errData.error || "Server error"}`,
          type: "error"
        });
      }
    } catch (err: any) {
      console.error("Error sending test:", err);
      setToast({
        message: "Network error sending test. Please verify endpoint connectivity.",
        type: "error"
      });
    } finally {
      setAssigningTest(false);
    }
  };

  // Filter candidates client-side based on search query
  const filteredStudents = students.filter(student => {
    const nameMatch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const skillsList = student.skillsToLearn || [];
    const skillMatch = skillsList.some(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || skillMatch;
  });

  // Open invitation connect request modal
  const handleOpenConnectModal = (student: UserProfile) => {
    setSelectedStudent(student);
    setConnectMessage(`Hi ${student.fullName},\n\nWe love your portfolio on SkillBridge! Your academic progress and tech skills match our current hiring requirements. Let's connect!`);
  };

  // Send real-time Connection handshake to Firestore
  const handleSendConnectionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !currentUser || !db) return;

    setIsSubmittingRequest(true);

    try {
      const recruiterName = userProfile?.fullName || currentUser.displayName || "Recruiter";
      const companyName = userProfile?.companyName || "Organization Member";

      // Create document in central "connections" collection
      const connectionRef = await addDoc(collection(db, "connections"), {
        recruiterId: currentUser.uid,
        recruiterName,
        companyName,
        studentId: selectedStudent.uid,
        studentName: selectedStudent.fullName,
        message: connectMessage,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      // Create notification in student's notifications subcollection
      await addDoc(collection(db, "users", selectedStudent.uid, "notifications"), {
        type: "connection_request",
        title: `Connection Request from ${recruiterName}`,
        description: `${recruiterName} from ${companyName} wants to connect with you: "${connectMessage}"`,
        timestamp: "Just now",
        createdAt: new Date().toISOString(),
        read: false,
        connectionId: connectionRef.id,
        status: "pending",
        recruiterName,
        companyName,
        message: connectMessage
      });

      // Update local status map
      setConnectionStatuses(prev => ({
        ...prev,
        [selectedStudent.uid]: "pending"
      }));

      setSelectedStudent(null);
      setConnectMessage("");
    } catch (err) {
      console.error("Failed to submit connection request:", err);
      alert("Error sending connection request. Please try again.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

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
                {toast.type === "success" ? "Campaign Dispatch" : "System Alert"}
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
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400">
            <BrainCircuit className="w-3.5 h-3.5" /> AI Talent Pool Management
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Discover Student Scholars
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Search, select, and filter candidates actively tracking self-study schedules and verified assessments on SkillBridge. Select multiple candidates to send custom tests and interview schedules in bulk.
          </p>
        </div>
      </div>

      {/* 2. Interactive Search, Filters, and Primary Action */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute inset-y-0 left-4 my-auto w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search scholars by name or core skills (e.g. React, Python, TypeScript)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-800 focus:border-teal-500 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none text-slate-100 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          {/* Send Assessment (Primary Action Button) */}
          <button
            onClick={() => {
              if (selectedCandidateIds.length === 0) {
                setToast({
                  message: "Please select at least one candidate checkbox to dispatch assessments.",
                  type: "error"
                });
              } else {
                setShowSendTestModal(true);
              }
            }}
            className="flex-1 md:flex-none px-4 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]"
          >
            <Send className="w-4 h-4 text-slate-950" /> Send Assessment
          </button>

          {/* Select All Toggle button */}
          <button
            onClick={handleSelectAllCandidates}
            className="px-4 py-3 bg-slate-950 border border-slate-850 hover:border-slate-750 text-xs font-bold text-slate-300 rounded-xl transition-all shrink-0"
          >
            {filteredStudents.length > 0 && filteredStudents.every(s => selectedCandidateIds.includes(s.uid))
              ? "Deselect All"
              : "Select All"}
          </button>

          <div className="hidden lg:flex items-center gap-2 px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs font-semibold text-slate-400 shrink-0">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{filteredStudents.length} Match</span>
          </div>
        </div>
      </div>

      {/* Bulk Action Sticky Bottom Bar */}
      <AnimatePresence>
        {selectedCandidateIds.length > 0 && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0e1726]/90 backdrop-blur-xl border border-teal-500/30 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.15)] flex items-center justify-between gap-8 max-w-2xl w-[90%]"
          >
            <div className="text-left">
              <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-wider block">Candidate Batch</span>
              <p className="text-sm font-black text-white">{selectedCandidateIds.length} scholars selected</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedCandidateIds([])}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-xs font-bold text-slate-300 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => setShowSendTestModal(true)}
                className="px-4.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-lg transition-colors shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              >
                Assign Test
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Candidates Discovery Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Syncing Candidate Registry</h3>
            <p className="text-xs text-slate-500 mt-1">Interrogating user profile indices...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400 text-sm font-semibold max-w-md mx-auto">
          {error}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 bg-slate-900/20 border border-slate-850 rounded-2xl text-center text-slate-400 max-w-lg mx-auto">
          <p className="text-sm italic">No student scholars matched your search query.</p>
          <p className="text-xs text-slate-500 mt-1">Try expanding your keyword definitions or searching by alternative subjects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const isSelected = selectedCandidateIds.includes(student.uid);
            const status = connectionStatuses[student.uid];
            const skills = student.skillsToLearn && student.skillsToLearn.length > 0 
              ? student.skillsToLearn 
              : ["Self-Study", "Adaptive Learning"];

            return (
              <div 
                key={student.uid} 
                className={`bg-slate-900/40 backdrop-blur-md border ${isSelected ? "border-teal-500/60 shadow-[0_0_15px_rgba(20,184,166,0.05)]" : "border-slate-800 hover:border-slate-700"} p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between text-left group hover:shadow-2xl relative overflow-hidden`}
              >
                {/* Checkbox Overlay in Corner */}
                <div className="absolute top-4 left-4 z-10">
                  <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectCandidate(student.uid)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-teal-500 focus:ring-teal-500/40 cursor-pointer accent-teal-500"
                  />
                </div>

                {/* Floating design element */}
                <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-teal-500/5 rounded-full blur-[20px] pointer-events-none"></div>

                <div className="space-y-4 pl-6">
                  
                  {/* Header Row: Avatar and basic title */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-850 group-hover:border-teal-400 flex items-center justify-center text-2xl transition-colors shrink-0">
                      🧑‍🎓
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white group-hover:text-teal-400 transition-colors">
                        {student.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-600" /> {student.institution || "Self-Study Scholar"}
                      </p>
                    </div>
                  </div>

                  {/* Rank / Rating Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Skill Level</span>
                      <span className="font-extrabold text-white flex items-center gap-1 mt-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> Level {student.level || 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Study Rank</span>
                      <span className="font-extrabold text-teal-400 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-teal-400" /> Rank #{student.rank || 24}
                      </span>
                    </div>
                  </div>

                  {/* Core skills */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Target Competencies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 3).map((skill, sIdx) => (
                        <span 
                          key={sIdx} 
                          className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded-md text-[9px] font-semibold text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-850 rounded-md text-[9px] font-bold text-slate-500">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Connect & View Profile Buttons */}
                <div className="pt-5 mt-5 border-t border-slate-900/60 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenProfileModal(student)}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 hover:text-white border border-slate-850 rounded-xl text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" /> View Profile
                  </button>

                  {status === "accepted" ? (
                    <button 
                      disabled
                      className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Connected
                    </button>
                  ) : status === "pending" ? (
                    <button 
                      disabled
                      className="w-full py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-4 h-4" /> Pending
                    </button>
                  ) : status === "declined" ? (
                    <button 
                      disabled
                      className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Declined
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenConnectModal(student)}
                      className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]"
                    >
                      <UserPlus className="w-4 h-4" /> Connect
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. SLEEK GLASSMORPHIC VIEW PROFILE SIDE DRAWER / MODAL */}
      <AnimatePresence>
        {viewingProfileCandidate && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-end">
            {/* Overlay background close trigger */}
            <div className="absolute inset-0" onClick={() => setViewingProfileCandidate(null)}></div>

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="relative w-full max-w-xl h-full bg-[#0d1527]/90 backdrop-blur-3xl border-l border-slate-800 shadow-2xl overflow-y-auto flex flex-col z-10 text-left"
            >
              {/* Luxury Light Highlights */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800/80 flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                    🧑‍🎓
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      {viewingProfileCandidate.fullName}
                      <span className="px-2.5 py-0.5 bg-teal-500/10 border border-teal-500/20 text-[9px] font-bold rounded-full text-teal-400">
                        Rank #{viewingProfileCandidate.rank}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-600" /> {viewingProfileCandidate.institution || "Self-Study Scholar"}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setViewingProfileCandidate(null)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="px-6 py-1 bg-slate-950/40 border-b border-slate-900/60 flex gap-4 relative z-10 shrink-0">
                <button
                  onClick={() => setProfileTab("academics")}
                  className={`py-3 text-xs font-bold transition-all relative ${profileTab === "academics" ? "text-teal-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Overview & Stats
                  {profileTab === "academics" && (
                    <motion.div layoutId="profileActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
                  )}
                </button>
                <button
                  onClick={() => setProfileTab("skills")}
                  className={`py-3 text-xs font-bold transition-all relative ${profileTab === "skills" ? "text-teal-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Technical Skills ({candidateSkills.length || (viewingProfileCandidate.skillsToLearn?.length ?? 0)})
                  {profileTab === "skills" && (
                    <motion.div layoutId="profileActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
                  )}
                </button>
                <button
                  onClick={() => setProfileTab("projects")}
                  className={`py-3 text-xs font-bold transition-all relative ${profileTab === "projects" ? "text-teal-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Projects Ledger ({candidateProjects.length})
                  {profileTab === "projects" && (
                    <motion.div layoutId="profileActiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
                  )}
                </button>
              </div>

              {/* Drawer Body Contents */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 relative z-10">
                {loadingProfileDetails ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    <p className="text-xs text-slate-500">Retrieving academic and credentials indices...</p>
                  </div>
                ) : (
                  <>
                    {/* 1. OVERVIEW & STATS TAB */}
                    {profileTab === "academics" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Bio box */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-teal-400" /> Scholar Bio & Objective
                          </h4>
                          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs text-slate-300 leading-relaxed italic">
                            "{viewingProfileCandidate.bio || "Active self-taught software engineering student focusing on building real world solutions, logging daily coding streaks, and clearing custom diagnostic skill assessments."}"
                          </div>
                        </div>

                        {/* Visual statistics grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Mastery Index</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-black text-white">{viewingProfileCandidate.masteryIndex ?? 0}%</span>
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                                <TrendingUp className="w-3 h-3 mr-0.5" /> High
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-400 h-full rounded-full" style={{ width: `${viewingProfileCandidate.masteryIndex ?? 0}%` }}></div>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Readiness Score</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-black text-teal-400">{viewingProfileCandidate.readinessScore ?? 78}%</span>
                              <span className="text-[10px] text-slate-400">Verified</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-full rounded-full" style={{ width: `${viewingProfileCandidate.readinessScore ?? 78}%` }}></div>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Study logged hours</span>
                            <div className="text-xl font-black text-white flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span>{viewingProfileCandidate.studyHours ?? 0.0} Hrs</span>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-1">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Assessments cleared</span>
                            <div className="text-xl font-black text-white flex items-center gap-1.5">
                              <Award className="w-4.5 h-4.5 text-amber-500" />
                              <span>{viewingProfileCandidate.assessmentsCleared ?? 0} Solved</span>
                            </div>
                          </div>
                        </div>

                        {/* Resume File link card */}
                        <div className="p-4.5 bg-gradient-to-br from-[#122238] to-[#0c1424] border border-blue-500/20 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                              <FileText className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="text-left">
                              <h4 className="text-xs font-black text-white">
                                {viewingProfileCandidate.resumeFileName || `${viewingProfileCandidate.fullName.toLowerCase().replace(" ", "_")}_resume.pdf`}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Size: 1.2 MB • Verified PDF Ledger</p>
                            </div>
                          </div>
                          
                          {viewingProfileCandidate.resumeUrl ? (
                            <button
                              onClick={() => window.open(viewingProfileCandidate.resumeUrl, "_blank")}
                              className="px-3.5 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-950" /> Download
                            </button>
                          ) : (
                            <button
                              onClick={() => window.open("https://skillbridge-resumes.web.app/raw/student_resume_shared.pdf", "_blank")}
                              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Sample Resume
                            </button>
                          )}
                        </div>

                        {/* Extra Context */}
                        <div className="p-4 bg-[#141d2f]/40 border border-slate-850 rounded-2xl grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Grade / Academic Year</span>
                            <span className="text-slate-200 font-semibold">{viewingProfileCandidate.gradeLevel || "Undergraduate Year 3"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Main Focus of Study</span>
                            <span className="text-teal-400 font-semibold">{viewingProfileCandidate.subjectOfInterest || "Computer Science"}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 2. TECHNICAL SKILLS TAB */}
                    {profileTab === "skills" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Subcollection Skills Ledger */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-teal-400" /> Active Verified Skills
                          </h4>
                          
                          {candidateSkills.length === 0 ? (
                            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-center text-xs text-slate-500 italic">
                              No specific skills logged in verification queue. Showing target focus tags below.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {candidateSkills.map((skill) => (
                                <div key={skill.id} className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
                                  <div>
                                    <h5 className="text-xs font-black text-white">{skill.name}</h5>
                                    <span className="text-[9px] text-slate-500 uppercase font-semibold">{skill.category}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-[9px] font-bold text-teal-400 rounded-md">
                                      Level {skill.level}
                                    </span>
                                    <span className="text-[9px] text-slate-500 block mt-1">{skill.xp} XP</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Onboarding Focus Tags */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-purple-400" /> Focus Topics of Interest
                          </h4>
                          <div className="p-4.5 bg-slate-950/20 border border-slate-850 rounded-2xl space-y-4">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-wider mb-2">Core Target Skills</span>
                              <div className="flex flex-wrap gap-1.5">
                                {(viewingProfileCandidate.skillsToLearn && viewingProfileCandidate.skillsToLearn.length > 0
                                  ? viewingProfileCandidate.skillsToLearn 
                                  : ["JavaScript", "React", "System Design", "NodeJS"]
                                ).map((skill, idx) => (
                                  <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-semibold">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-wider mb-2">Interests & Domains</span>
                              <div className="flex flex-wrap gap-1.5">
                                {(viewingProfileCandidate.interests && viewingProfileCandidate.interests.length > 0
                                  ? viewingProfileCandidate.interests 
                                  : ["Fullstack Development", "AI Integration", "Performance Benchmarks"]
                                ).map((interest, idx) => (
                                  <span key={idx} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/15 rounded-lg text-xs text-purple-400 font-semibold">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 3. PAST PROJECTS TAB */}
                    {profileTab === "projects" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-1">
                          <Briefcase className="w-3.5 h-3.5 text-teal-400" /> Visual Project Ledger
                        </h4>

                        {candidateProjects.length === 0 ? (
                          <div className="p-8 bg-slate-950/40 border border-slate-850 rounded-2xl text-center text-xs text-slate-500 italic space-y-2">
                            <Layers className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                            <p>No project repositories registered yet for this scholar.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {candidateProjects.map((proj) => (
                              <div key={proj.id} className="p-4 bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-2xl text-left space-y-3 transition-colors relative group">
                                <div className="absolute top-4 right-4 flex gap-1.5">
                                  {proj.gitUrl && (
                                    <a 
                                      href={proj.gitUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-1.5 bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors"
                                      title="GitHub Source"
                                    >
                                      <Globe className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {proj.demoUrl && (
                                    <a 
                                      href={proj.demoUrl} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-1.5 bg-teal-500/10 border border-teal-500/25 text-teal-400 hover:bg-teal-500/20 rounded-lg transition-colors"
                                      title="Live Preview"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>

                                <div className="space-y-1 pr-14">
                                  <h5 className="text-sm font-black text-white group-hover:text-teal-400 transition-colors">{proj.title}</h5>
                                  <p className="text-[11px] text-slate-500">Registered: {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : "Recent"}</p>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {proj.tags.map((tag, tIdx) => (
                                    <span key={tIdx} className="px-2 py-0.5 bg-slate-900 border border-slate-850 text-[9px] font-semibold text-slate-400 rounded-md">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Sticky Footer Actions */}
              <div className="p-6 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex gap-3 relative z-10 shrink-0">
                <button
                  onClick={() => setViewingProfileCandidate(null)}
                  className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                >
                  Close Profile
                </button>
                <button
                  onClick={() => {
                    const studentToConnect = viewingProfileCandidate;
                    setViewingProfileCandidate(null);
                    handleOpenConnectModal(studentToConnect);
                  }}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                >
                  <UserPlus className="w-4 h-4 text-slate-950" /> Connect Scholar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Central Recruiter Connect Invitation Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative bg-[#121A2E]/90 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl overflow-hidden text-left">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-teal-500/10 rounded-full blur-[50px] pointer-events-none"></div>

            <button 
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleSendConnectionRequest} className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Recruiting Invitation
                </span>
                <h3 className="text-xl font-bold text-white">
                  Connect with {selectedStudent.fullName}
                </h3>
                <p className="text-xs text-slate-400">
                  Introduce your team and outline study project collaborations or internship vacancies.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                  🧑‍🎓
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">{selectedStudent.fullName}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{selectedStudent.institution || "Self-Study Scholar"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Candidate Connection Message
                </label>
                <textarea 
                  rows={4}
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  placeholder="Share a brief description of why you want to connect..."
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-teal-500 rounded-2xl p-4 text-xs focus:outline-none text-slate-100 placeholder-slate-600 transition-colors"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)] disabled:opacity-50"
                >
                  {isSubmittingRequest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Handshaking...
                    </>
                  ) : (
                    <>
                      Send Connection Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Send Assessment Test Modal */}
      {showSendTestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-[#121A2E]/90 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl overflow-hidden text-left"
          >
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-teal-500/10 rounded-full blur-[50px] pointer-events-none"></div>

            <button 
              onClick={() => setShowSendTestModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleSendTest} className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" /> Campaign Assessment Dispatch
                </span>
                <h3 className="text-xl font-bold text-white">
                  Send Technical Assessment
                </h3>
                <p className="text-xs text-slate-400">
                  Select an industry-grade technical test to assign to the selected scholars. They will be notified immediately.
                </p>
              </div>

              {/* Selected candidates overview */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Recipients ({selectedCandidateIds.length})
                </label>
                <div className="max-h-24 overflow-y-auto p-3 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-wrap gap-1.5">
                  {students
                    .filter(s => selectedCandidateIds.includes(s.uid))
                    .map(s => (
                      <span key={s.uid} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300">
                        🧑‍🎓 {s.fullName}
                      </span>
                    ))}
                </div>
              </div>

              {/* Test Dropdown selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Choose Assessment Test
                </label>
                {loadingTests ? (
                  <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-850 rounded-2xl text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Loading available tests from ledger...</span>
                  </div>
                ) : (
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-teal-500 rounded-2xl p-4 text-xs focus:outline-none text-slate-100 transition-colors cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a technical test...</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id}>
                        ⚡ {test.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowSendTestModal(false)}
                  className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={assigningTest || !selectedTestId}
                  className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)] disabled:opacity-50"
                >
                  {assigningTest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Dispatching...
                    </>
                  ) : (
                    <>
                      Send Assessment Test
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
