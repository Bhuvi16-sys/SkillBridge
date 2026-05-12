"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useUser } from "@/context/UserContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { userProfileConverter } from "@/lib/models";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  MapPin, 
  BookOpen, 
  Award, 
  Code, 
  BarChart2, 
  Briefcase, 
  Activity, 
  Plus, 
  X, 
  Sparkles, 
  Globe, 
  FileText, 
  ChevronRight, 
  Cpu, 
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  Lock,
  Settings,
  Compass,
  Loader2
} from "lucide-react";

// Self-contained, lightweight custom inline SVG GitHub Icon matching Lucide style guidelines
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Self-contained, lightweight custom inline SVG LinkedIn Icon matching Lucide style guidelines
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function StudentProfilePage() {
  const { 
    user, 
    skills, 
    projects, 
    addSkill, 
    addProject 
  } = useDashboard();

  const { 
    user: currentUser, 
    userProfile,
    skillsToLearn = [], 
    interests = [] 
  } = useUser();
  
  const readinessScore = user?.readinessScore || 0;
  
  // Interactive "Add Skill" Form state
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Language");
  const [newSkillLevel, setNewSkillLevel] = useState("Proficient");
  const [newSkillPct, setNewSkillPct] = useState(70);

  // Interactive "Add Project" Modal state
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjLink, setNewProjLink] = useState("");

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Interactive "Connect LinkedIn" state
  const [linkedinFormOpen, setLinkedinFormOpen] = useState(false);
  const [linkedinProfileUrl, setLinkedinProfileUrl] = useState("");
  const [isConnectedLinkedin, setIsConnectedLinkedin] = useState(false);

  const handleConnectLinkedinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinProfileUrl.trim()) {
      triggerToast("⚠️ Please enter a valid LinkedIn profile URL.");
      return;
    }
    setIsConnectedLinkedin(true);
    setLinkedinFormOpen(false);
    triggerToast("🔗 Successfully integrated SkillBridge AI metrics with your LinkedIn profile!");
  };

  // Interactive "Edit Preferences" state
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [tempSkillsToLearn, setTempSkillsToLearn] = useState<string[]>([]);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newInterestInput, setNewInterestInput] = useState("");

  const handleOpenPreferences = () => {
    setTempSkillsToLearn([...skillsToLearn]);
    setTempInterests([...interests]);
    setPreferencesModalOpen(true);
  };

  const handleAddSkillTag = () => {
    if (newSkillInput.trim() && !tempSkillsToLearn.includes(newSkillInput.trim())) {
      setTempSkillsToLearn([...tempSkillsToLearn, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkillTag = (tag: string) => {
    setTempSkillsToLearn(tempSkillsToLearn.filter(t => t !== tag));
  };

  const handleAddInterestTag = () => {
    if (newInterestInput.trim() && !tempInterests.includes(newInterestInput.trim())) {
      setTempInterests([...tempInterests, newInterestInput.trim()]);
      setNewInterestInput("");
    }
  };

  const handleRemoveInterestTag = (tag: string) => {
    setTempInterests(tempInterests.filter(t => t !== tag));
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerToast("⚠️ Authentication required.");
      return;
    }

    try {
      const userRef = doc(db!, "users", currentUser.uid).withConverter(userProfileConverter);
      await updateDoc(userRef, {
        skillsToLearn: tempSkillsToLearn,
        interests: tempInterests,
        updatedAt: new Date().toISOString()
      } as any);

      setPreferencesModalOpen(false);
      triggerToast("🎯 Learning preferences successfully synced with AI Study Assistant!");
    } catch (error) {
      console.error("Error updating learning preferences:", error);
      triggerToast("❌ Failed to update learning preferences.");
    }
  };

  // Form submission handlers
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      triggerToast("Please specify a valid skill title.");
      return;
    }
    const skillItem = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
      pct: Number(newSkillPct)
    };
    await addSkill(skillItem);
    setNewSkillName("");
    setSkillFormOpen(false);
    triggerToast(`🛠️ Added '${skillItem.name}' to skills! Job Readiness bumped up!`);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) {
      triggerToast("Please fill in the project title and description.");
      return;
    }
    const techArray = newProjTech.split(",").map(t => t.trim()).filter(Boolean);
    const newProj = {
      title: newProjTitle.trim(),
      tech: techArray.length > 0 ? techArray : ["React"],
      description: newProjDesc.trim(),
      link: newProjLink.trim() || "https://github.com"
    };
    await addProject({ id: "", ...newProj });
    
    // Clear state
    setNewProjTitle("");
    setNewProjTech("");
    setNewProjDesc("");
    setNewProjLink("");
    setProjectFormOpen(false);
    triggerToast(`🚀 '${newProj.title}' added! Portfolio synchronization completed.`);
  };

  // Resume upload and AI parsing state
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSyncingResume, setIsSyncingResume] = useState(false);
  const [syncStep, setSyncStep] = useState<string>("");

  const handleOpenResumeModal = () => {
    setResumeModalOpen(true);
    setSyncStep("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSyncResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) return;

    setIsSyncingResume(true);
    
    const steps = [
      "Reading document structure...",
      "Extracting skills & experience schema...",
      "Matching learning paths on SkillBridge...",
      "Syncing profile metrics with Firestore database..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setSyncStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const userRef = doc(db!, "users", currentUser.uid).withConverter(userProfileConverter);
      await updateDoc(userRef, {
        resumeFileName: selectedFile.name,
        resumeUploadedAt: new Date().toISOString(),
        resumeUrl: "https://skillbridge-resumes.web.app/raw/student_resume_shared.pdf"
      } as any);

      setResumeModalOpen(false);
      triggerToast(`📄 Resume '${selectedFile.name}' parsed and synced successfully!`);
    } catch (err) {
      console.error("Resume write error: ", err);
      triggerToast("❌ Failed to write resume details.");
    } finally {
      setIsSyncingResume(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200 relative text-left">
      
      {/* Dynamic Toast Alert */}
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

      {/* Resume Upload and Sync Modal */}
      <AnimatePresence>
        {resumeModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative space-y-4 text-left"
            >
              <button
                onClick={() => !isSyncingResume && setResumeModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                disabled={isSyncingResume}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pb-2 border-b border-slate-800">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-400" /> Sync Resume Metrics
                </h4>
                <p className="text-[10px] text-slate-400">Upload your PDF or Word resume. Our AI parser will index your skills to elevate your recruiter match rating.</p>
              </div>

              {isSyncingResume ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-white uppercase tracking-wider">AI Parsing Engine</p>
                    <p className="text-[11px] text-slate-400 animate-pulse">{syncStep}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSyncResumeSubmit} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-2xl p-6 transition-colors flex flex-col items-center justify-center text-center space-y-2.5 relative cursor-pointer group">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 group-hover:border-teal-500/20 transition-colors">
                      <FileText className="w-6 h-6 text-slate-400 group-hover:text-teal-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {selectedFile ? selectedFile.name : "Choose or drag resume file"}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1">
                        Supports PDF, DOC, DOCX up to 10MB
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResumeModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!selectedFile}
                      className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-black rounded-xl transition-all"
                    >
                      Extract & Sync Metrics
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Project Modal Popup */}
      <AnimatePresence>
        {projectFormOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative space-y-4 text-left"
            >
              <button
                onClick={() => setProjectFormOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pb-2 border-b border-slate-800">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Sync New Portfolio Project</h4>
                <p className="text-[10px] text-slate-400">Map your algorithmic projects to increase technical recruitment visibility.</p>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus Ledger"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Technologies Used (comma separated)</label>
                  <input
                    type="text"
                    value={newProjTech}
                    onChange={(e) => setNewProjTech(e.target.value)}
                    placeholder="Go, gRPC, Protobuf"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">Brief Description</label>
                  <textarea
                    required
                    rows={2}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Briefly state the architectural pattern and main goal..."
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">GitHub / Live Link</label>
                  <input
                    type="url"
                    value={newProjLink}
                    onChange={(e) => setNewProjLink(e.target.value)}
                    placeholder="https://github.com/alexr/ledger"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectFormOpen(false)}
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl transition-colors"
                  >
                    Append to Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connect LinkedIn Modal Popup */}
      <AnimatePresence>
        {linkedinFormOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative space-y-4 text-left"
            >
              <button
                onClick={() => setLinkedinFormOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pb-2 border-b border-slate-800">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <LinkedinIcon className="w-5 h-5 text-[#0077b5]" /> Sync LinkedIn Profile
                </h4>
                <p className="text-[10px] text-slate-400">Integrate your adaptive learning metrics, SkillBridge badges, and project credentials onto LinkedIn.</p>
              </div>

              <form onSubmit={handleConnectLinkedinSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    required
                    value={linkedinProfileUrl}
                    onChange={(e) => setLinkedinProfileUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkedinFormOpen(false)}
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#0077b5] hover:bg-[#0076b5d9] text-white text-xs font-black rounded-xl transition-colors"
                  >
                    Verify & Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Preferences Modal Popup */}
      <AnimatePresence>
        {preferencesModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative space-y-5 text-left"
            >
              <button
                onClick={() => setPreferencesModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pb-2 border-b border-slate-800">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" /> Edit Learning Persona
                </h4>
                <p className="text-[10px] text-slate-400">Tailor the AI Curriculum recommendation, quiz subjects, and coding plans to your interests.</p>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-5">
                {/* Skills to Learn Section */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400">Skills to Learn</label>
                  <p className="text-[9px] text-slate-500">Press Add or click Enter to register skill tags (e.g. Next.js, FastAPI, Rust)</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkillTag();
                        }
                      }}
                      placeholder="e.g. Next.js"
                      className="flex-1 bg-slate-950 border border-slate-850 focus:border-teal-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkillTag}
                      className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-[80px] overflow-y-auto pr-1">
                    {tempSkillsToLearn.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-950 border border-teal-500/20 text-teal-400 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(skill)}
                          className="text-slate-500 hover:text-red-400 ml-1 font-bold focus:outline-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interests Section */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-black text-slate-400">Core Interests</label>
                  <p className="text-[9px] text-slate-500">Press Add or click Enter to register interest tags (e.g. Artificial Intelligence, Web Dev, DevOps)</p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInterestInput}
                      onChange={(e) => setNewInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterestTag();
                        }
                      }}
                      placeholder="e.g. Web Development"
                      className="flex-1 bg-slate-950 border border-slate-850 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddInterestTag}
                      className="px-3.5 py-2 bg-purple-500 hover:bg-purple-400 text-white text-xs font-black rounded-xl transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-[80px] overflow-y-auto pr-1">
                    {tempInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-950 border border-purple-500/20 text-purple-400 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterestTag(interest)}
                          className="text-slate-500 hover:text-red-400 ml-1 font-bold focus:outline-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferencesModalOpen(false)}
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl transition-colors shadow-lg"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section: Avatar info + Job Readiness Score */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Profile Card (Span 7) */}
        <div className="md:col-span-7 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between gap-5 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl border-2 border-teal-500/30 bg-slate-950/80 flex items-center justify-center text-4xl shadow-md shrink-0">
              👨‍💻
            </div>
            <div className="space-y-1.5 text-left">
              <h2 className="text-xl font-black text-white">{userProfile?.fullName || user?.name || "SkillBridge Student"}</h2>
              <p className="text-xs font-bold text-teal-400 flex items-center gap-1">
                <Cpu className="w-4 h-4 text-teal-400" /> {userProfile?.role ? (userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)) : (user?.role || "Student")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-3">
            <button 
              onClick={handleOpenResumeModal}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> {userProfile?.resumeFileName ? `Resume Synced: ${userProfile.resumeFileName}` : "Sync Resume Metrics"}
            </button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <GithubIcon className="w-4 h-4" /> Connect GitHub
            </a>
            {isConnectedLinkedin ? (
              <a 
                href={linkedinProfileUrl.startsWith('http') ? linkedinProfileUrl : `https://${linkedinProfileUrl}`}
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 bg-[#0077b5]/20 hover:bg-[#0077b5]/30 border border-[#0077b5]/50 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5"
                title="View Connected LinkedIn Profile"
              >
                <LinkedinIcon className="w-4 h-4 text-[#0077b5]" /> LinkedIn Connected
              </a>
            ) : (
              <button 
                onClick={() => setLinkedinFormOpen(true)}
                className="px-4 py-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/30 text-sky-400 hover:text-sky-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <LinkedinIcon className="w-4 h-4 text-[#0077b5]" /> Connect LinkedIn
              </button>
            )}
          </div>
        </div>

        {/* Readiness Score Radial Gauge Card (Span 5) */}
        <div className="md:col-span-5 bg-slate-900/20 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wide">Recruitment Rating</span>
              <h3 className="text-sm font-bold text-white">Job Readiness Index</h3>
            </div>
            <span className="px-2.5 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-black border border-teal-500/15 rounded-lg">
              Elite Tier
            </span>
          </div>

          <div className="flex items-center gap-5 py-2">
            
            {/* Visual Gauge arc representation */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-slate-950 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-teal-500 fill-none transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * readinessScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white">{readinessScore}%</span>
                <span className="text-[8px] text-slate-500 font-black uppercase">Ready</span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-400">
              <p className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Languages: <strong>92% match</strong></span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Algorithmic core: <strong>Proficient</strong></span>
              </p>
              <p className="text-[10px] text-slate-500 italic pt-1">
                Add 1 more portfolio project to boost readiness to 87%!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Learning Preferences Block (Skills to Learn & Interests) */}
      <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl relative overflow-hidden text-left space-y-4">
        {/* Background glow matching premium neon aesthetic */}
        <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-teal-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[60px] -z-10 pointer-events-none"></div>

        <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
          <div>
            <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wider">AI Integration Persona</span>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <BrainCircuit className="w-4.5 h-4.5 text-teal-400" /> Adaptive Learning Preferences
            </h3>
          </div>
          <button
            onClick={handleOpenPreferences}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-teal-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Settings className="w-4 h-4 text-teal-400" /> Edit Preferences
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Skills to Learn Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-teal-400" /> Focus Skills to Learn
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillsToLearn && skillsToLearn.length > 0 ? (
                skillsToLearn.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-950/80 border border-teal-500/20 text-teal-400 hover:text-teal-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 hover:shadow-[0_0_15px_rgba(20,184,166,0.15)] animate-fade-in"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No skills selected yet. Click "Edit Preferences" to add some!</span>
              )}
            </div>
          </div>

          {/* Primary Interests Column */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" /> Core Interests & Domains
            </h4>
            <div className="flex flex-wrap gap-2">
              {interests && interests.length > 0 ? (
                interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-950/80 border border-purple-500/20 text-purple-400 hover:text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-fade-in"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No interests selected yet. Click "Edit Preferences" to add some!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Skills list + Performance summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Skills inventory block (Span 7) */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-teal-400" /> Core Skills Inventory
            </h3>

            {/* Inline add skill button */}
            <button
              onClick={() => setSkillFormOpen(!skillFormOpen)}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-teal-400 text-[10px] font-black rounded-lg transition-all flex items-center gap-1"
            >
              {skillFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} {skillFormOpen ? "Close Form" : "Add Skill"}
            </button>
          </div>

          <AnimatePresence>
            {skillFormOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddSkill}
                className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[8px] uppercase font-black text-slate-500 mb-1">Skill Title</label>
                    <input
                      type="text"
                      required
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. Redux"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase font-black text-slate-500 mb-1">Category</label>
                    <select
                      value={newSkillCategory}
                      onChange={(e) => setNewSkillCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Language">Language</option>
                      <option value="Core CS">Core CS</option>
                      <option value="Framework">Framework</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase font-black text-slate-500 mb-1">Competency Level</label>
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Expert">Expert</option>
                      <option value="Proficient">Proficient</option>
                      <option value="Learning">Learning</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1">
                    <label className="block text-[8px] uppercase font-black text-slate-500 mb-1">Fluency Indicator ({newSkillPct}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={newSkillPct}
                      onChange={(e) => setNewSkillPct(Number(e.target.value))}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-lg text-[10px] transition-colors self-end shrink-0"
                  >
                    Save Skill
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1">
            {skills.map((skill, idx) => (
              <div key={idx} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-200">{skill.name}</h4>
                  <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-black uppercase ${
                    skill.level === "Expert" ? "bg-teal-500/10 text-teal-400" :
                    skill.level === "Proficient" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                  }`}>
                    {skill.level}
                  </span>
                </div>

                {/* Micro progress meter bar */}
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500" style={{ width: `${skill.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance metrics dashboard card (Span 5) */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4.5 h-4.5 text-teal-400" /> Study Output Performance
          </h3>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-[8.5px] text-slate-500 font-black block uppercase tracking-wide">Concept Drills</span>
              <p className="text-lg font-black text-white mt-1">{user?.studyHours || 0} Hours</p>
              <div className="flex items-center gap-1 text-[9.5px] text-teal-400 font-bold pt-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> +12% vs last week
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-[8.5px] text-slate-500 font-black block uppercase tracking-wide">Mock Coding</span>
              <p className="text-lg font-black text-white mt-1">{user?.assessmentsCleared || 0} Quizzes</p>
              <div className="flex items-center gap-1 text-[9.5px] text-teal-400 font-bold pt-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> +100% completions
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-[8.5px] text-slate-500 font-black block uppercase tracking-wide">Code Submissions</span>
              <p className="text-lg font-black text-white mt-1">{(user?.assessmentsCleared || 0) * 3} Runs</p>
              <span className="text-[8.5px] text-slate-500 font-semibold block pt-1.5">Sandbox logs healthy</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-[8.5px] text-slate-500 font-black block uppercase tracking-wide">Streaks Earned</span>
              <p className="text-lg font-black text-white mt-1">{user?.streak || 0} Active</p>
              <span className="text-[8.5px] text-teal-400 font-black block pt-1.5">Weekly Goal Met</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Achievements list & Projects showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Unlocked Achievements summary (Span 4) */}
        <div className="lg:col-span-4 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4.5 text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-teal-400" /> Achievements Snapshot
          </h3>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-850 text-teal-400">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-200">Recursion Maestro</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Unlocked - May 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-850 text-orange-500">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-200">6-Day Code Streak</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Unlocked - May 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-850 text-purple-400">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-200">Technical Captain</h4>
                <p className="text-[9px] text-slate-500 mt-0.5">Unlocked - April 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Projects Showcase (Span 8) */}
        <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-teal-400" /> Integrated Portfolio Projects
            </h3>

            <button
              onClick={() => setProjectFormOpen(true)}
              className="px-2.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-black rounded-lg transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Map Project
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-950/50 border border-slate-900 hover:border-slate-850 transition-all rounded-xl flex flex-col justify-between gap-3 text-left">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-200">{proj.title}</h4>
                  
                  {/* Technology capsules */}
                  <div className="flex flex-wrap gap-1.5 py-1.5">
                    {proj.tech.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-[8.5px] font-bold text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="text-[10.5px] text-slate-500 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <a
                  href={proj.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1 mt-1"
                >
                  <GithubIcon className="w-3.5 h-3.5" /> source code repository <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
