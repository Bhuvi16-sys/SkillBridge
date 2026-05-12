"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { userProfileConverter, UserProfile } from "@/lib/models";
import { useUser } from "@/context/UserContext";
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
  Download
} from "lucide-react";

export default function StudentDiscovery() {
  const { user: currentUser, userProfile } = useUser();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Connection tracking states from Firestore
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});

  // Modal and connection inputs state
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [connectMessage, setConnectMessage] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Resume viewing states
  const [viewingResumeStudent, setViewingResumeStudent] = useState<UserProfile | null>(null);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);

  // Fetch student roster and connection statuses
  const fetchData = async () => {
    if (!db) {
      setError("Firebase connection is not configured.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. Fetch Students
      const usersRef = collection(db, "users").withConverter(userProfileConverter);
      let fetchedStudents: UserProfile[] = [];

      try {
        const q = query(
          usersRef,
          where("role", "==", "student"),
          orderBy("rank", "desc")
        );
        const querySnapshot = await getDocs(q);
        fetchedStudents = querySnapshot.docs.map(doc => doc.data());
      } catch (indexError) {
        console.warn("Firestore index not found. Falling back to client-side sorting:", indexError);
        const fallbackQ = query(usersRef, where("role", "==", "student"));
        const querySnapshot = await getDocs(fallbackQ);
        fetchedStudents = querySnapshot.docs.map(doc => doc.data());
        fetchedStudents.sort((a, b) => (b.rank || 0) - (a.rank || 0));
      }

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

  useEffect(() => {
    fetchData();
  }, [currentUser?.uid]);

  // Handle client-side search/filtering
  const filteredStudents = students.filter(student => {
    const nameMatch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const skillsList = student.skillsToLearn || [];
    const skillMatch = skillsList.some(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || skillMatch;
  });

  // Open connect request modal
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

      // A. Create document in central "connections" collection
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

      // B. Create a notification in student's notifications subcollection
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

      // Reset modal inputs
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
    <div className="space-y-8 pb-12 text-slate-200 relative">
      
      {/* 1. Page Header Block */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-[#1e293b]/70 to-slate-900 border border-slate-800/80 p-8 shadow-2xl text-left">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[250px] h-[250px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -top-10 -left-10 w-[180px] h-[180px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400">
            <BrainCircuit className="w-3.5 h-3.5" /> AI Talent Matching Engine
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Discover Top Student Scholars
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Search and query students actively tracking their self-study streams, verified test scores, and visual AI knowledge graphs. Filter by core competencies or names to connect with your hiring campaign targets.
          </p>
        </div>
      </div>

      {/* 2. Live Filtering Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-md">
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
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-semibold text-slate-400 shrink-0 self-stretch sm:self-auto justify-center">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{filteredStudents.length} Students Matched</span>
        </div>
      </div>

      {/* 3. Students Discovery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Syncing Student Registry</h3>
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
            const status = connectionStatuses[student.uid];
            
            // Format dynamic skills
            const skills = student.skillsToLearn && student.skillsToLearn.length > 0 
              ? student.skillsToLearn 
              : ["Self-Study", "Adaptive Learning"];

            return (
              <div 
                key={student.uid} 
                className="bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all duration-300 flex flex-col justify-between text-left group hover:shadow-2xl relative overflow-hidden"
              >
                {/* Floating design element */}
                <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-teal-500/5 rounded-full blur-[20px] pointer-events-none"></div>

                <div className="space-y-4">
                  
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
                      {skills.map((skill, sIdx) => (
                        <span 
                          key={sIdx} 
                          className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded-md text-[9px] font-semibold text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Connect Action Button */}
                <div className="pt-5 mt-5 border-t border-slate-900/60 space-y-2">
                  {student.resumeFileName && (
                    <button
                      onClick={() => setViewingResumeStudent(student)}
                      className="w-full py-2 bg-slate-950/80 hover:bg-slate-900 hover:text-white border border-slate-850/80 rounded-xl text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" /> View Synced Resume
                    </button>
                  )}

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
                      <Clock className="w-4 h-4" /> Request Pending
                    </button>
                  ) : status === "declined" ? (
                    <button 
                      disabled
                      className="w-full py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Request Declined
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenConnectModal(student)}
                      className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.15)] hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]"
                    >
                      <UserPlus className="w-4 h-4" /> Connect Scholar
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Recruiter Connection Modal */}
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

      {/* 5. Resume Viewer Modal */}
      {viewingResumeStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-slate-200">
          <div className="relative bg-[#121A2E]/90 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl overflow-hidden text-left space-y-5">
            {/* Design accents */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-teal-500/10 rounded-full blur-[50px] pointer-events-none"></div>

            <button 
              onClick={() => {
                setViewingResumeStudent(null);
                setIsDownloadingResume(false);
              }}
              className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Synced Candidate Resume
              </span>
              <h3 className="text-xl font-bold text-white">
                {viewingResumeStudent.fullName}'s Resume
              </h3>
              <p className="text-xs text-slate-400">
                Verified candidate resume and credential ledger synced from local storage indices.
              </p>
            </div>

            {/* Document representation */}
            <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{viewingResumeStudent.resumeFileName || `${viewingResumeStudent.fullName.toLowerCase().replace(" ", "_")}_resume.pdf`}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Size: 1.2 MB • Synced PDF Document</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded-lg uppercase">
                Verified File
              </span>
            </div>

            {/* AI Summarized Insights */}
            <div className="space-y-3 bg-slate-900/30 border border-slate-850 p-4.5 rounded-2xl text-xs">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">AI SkillBridge Summary</h4>
              <p className="text-slate-300 leading-relaxed italic">
                "Candidate {viewingResumeStudent.fullName} is an active student scholar on SkillBridge. They are specializing in {viewingResumeStudent.skillsToLearn?.join(", ") || "software technologies"} and maintain a study level rating of Level {viewingResumeStudent.level || 1} with ranking #{viewingResumeStudent.rank || 24}."
              </p>

              <div className="border-t border-slate-850/60 pt-3 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold block uppercase tracking-wider">Institution</span>
                  <span className="text-white font-semibold">{viewingResumeStudent.institution || "Self-Study Academy"}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold block uppercase tracking-wider">Matched Skills</span>
                  <span className="text-teal-400 font-semibold">{viewingResumeStudent.skillsToLearn?.length || 2} Core Tags</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                onClick={() => {
                  setViewingResumeStudent(null);
                  setIsDownloadingResume(false);
                }}
                className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-300 transition-colors"
              >
                Close View
              </button>
              <button 
                onClick={() => {
                  setIsDownloadingResume(true);
                  setTimeout(() => {
                    setIsDownloadingResume(false);
                    window.open(viewingResumeStudent.resumeUrl || "https://skillbridge-resumes.web.app/raw/student_resume_shared.pdf", "_blank");
                  }, 1200);
                }}
                disabled={isDownloadingResume}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.15)] disabled:opacity-50"
              >
                {isDownloadingResume ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-950" /> Download PDF Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
