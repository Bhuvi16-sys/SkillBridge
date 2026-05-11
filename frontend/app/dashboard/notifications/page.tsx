"use client";

import React, { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Bot, 
  Calendar, 
  ChevronRight, 
  X, 
  GraduationCap, 
  BookOpen, 
  Check, 
  Info,
  Flame,
  Award,
  HelpCircle,
  Undo2
} from "lucide-react";

// Mock Notifications array
const initialNotifications = [
  {
    id: 1,
    type: "missed",
    title: "Missed Objective: Heap Sort practice",
    description: "You missed completing 'Practice Heap Sort sorting questions' yesterday. Let's reschedule this to keep your technical scoring climbing!",
    time: "Yesterday",
    read: false,
    points: 50,
  },
  {
    id: 2,
    type: "weakness",
    title: "Weak Topic Detected: Graph DFS/BFS Cycles",
    description: "Your diagnostic accuracy on Directed Graph BFS Traversals is currently 42%. We suggest compiling a custom remedial recovery pathway immediately.",
    time: "2 hours ago",
    read: false,
    topic: "Graph Traversals (BFS/DFS)",
  },
  {
    id: 3,
    type: "reminder",
    title: "Spaced Review Due: BST node deletions",
    description: "Your spaced repetition review of 'BST deleting nodes cases' is due. Solve 1 conceptual quiz now to sustain memory retention indices.",
    time: "3 hours ago",
    read: false,
    topic: "BST deleting nodes cases",
  },
  {
    id: 4,
    type: "achievement",
    title: "Flame Streak Maintained: 6 Days!",
    description: "Excellent consistency, Alex! Study for 30 minutes today to unlock your consecutive 7-day milestone badge.",
    time: "10:00 AM",
    read: true,
    streak: 6,
  }
];

// Spaced repetition mock card logic
const mockFlashcards = {
  "BST deleting nodes cases": {
    question: "When deleting a BST node with two children, what node should replace it to preserve BST properties?",
    options: [
      "The left child node always",
      "The In-order Successor (min node of right subtree) or In-order Predecessor",
      "The parent node of the target",
      "A newly allocated leaf leaf node with zero value"
    ],
    correctIdx: 1,
    explanation: "Replacing the deleted node with either its In-order Successor or In-order Predecessor preserves the binary search tree property that left subtree < root < right subtree."
  }
};

export default function NotificationsPage() {
  const { 
    notifications, 
    markNotificationRead, 
    clearAllNotifications, 
    addGoal 
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "alerts" | "achieve">("all");
  
  // Flashcard review modal state
  const [activeFlashcard, setActiveFlashcard] = useState<any | null>(null);
  const [flashcardTopic, setFlashcardTopic] = useState("");
  const [selectedCardAns, setSelectedCardAns] = useState<number | null>(null);
  const [cardAnswered, setCardAnswered] = useState(false);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mass action handlers
  const handleMarkAllRead = () => {
    clearAllNotifications();
    triggerToast("All alerts marked as read!");
  };

  const handleClearAll = () => {
    clearAllNotifications();
    triggerToast("Cleared all active notifications!");
  };

  // Single card handlers
  const toggleRead = (id: string) => {
    markNotificationRead(id);
  };

  const deleteNotification = (id: string) => {
    markNotificationRead(id);
    triggerToast("Alert cleared.");
  };

  const handleReschedule = (id: string, text: string) => {
    deleteNotification(id);
    // Physically insert goal into shared study planner context!
    addGoal({
      title: "Heap Sort remedial drill",
      duration: "45 mins",
      priority: "High"
    });
    triggerToast(`📅 Rescheduled! Appended 'Heap Sort remedial drill' to your active Study Planner!`);
  };

  const handleLaunchAI = (id: string) => {
    toggleRead(id);
    triggerToast("Navigating to AI Assistant doubt solver... (redirect simulated)");
  };

  // Spaced Flashcard Modal triggers
  const handleStartFlashcard = (topic: string, notificationId: string) => {
    const card = (mockFlashcards as any)[topic];
    if (card) {
      setFlashcardTopic(topic);
      setActiveFlashcard(card);
      setSelectedCardAns(null);
      setCardAnswered(false);
      toggleRead(notificationId);
    } else {
      triggerToast("Beginning visual flashcard session...");
    }
  };

  const handleSelectCardAns = (idx: number) => {
    if (cardAnswered) return;
    setSelectedCardAns(idx);
    setCardAnswered(true);
  };

  const handleCloseFlashcard = (success: boolean) => {
    setActiveFlashcard(null);
    if (success) {
      triggerToast(`Spaced Review completed successfully! Retained: ${flashcardTopic}`);
    }
  };

  // Filter lists dynamically
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "alerts") return n.type === "missed" || n.type === "weakness";
    if (activeTab === "achieve") return n.type === "spaced";
    return true; // "all"
  });

  return (
    <div className="space-y-6 pb-12 text-slate-200 h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden relative text-left">
      
      {/* Dynamic Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.95 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-6 py-3.5 rounded-xl border border-teal-400 font-extrabold shadow-[0_0_25px_rgba(20,184,166,0.3)] z-50 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 animate-pulse" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Flashcard Modal */}
      <AnimatePresence>
        {activeFlashcard && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-blue-500/20 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative space-y-5 text-left"
            >
              <button
                onClick={() => handleCloseFlashcard(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Spaced Repetition Diagnostic</h4>
                  <p className="text-[10px] text-slate-500">{flashcardTopic}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-white leading-relaxed">
                  {activeFlashcard.question}
                </p>

                <div className="space-y-2">
                  {activeFlashcard.options.map((option: string, idx: number) => {
                    const isSelected = selectedCardAns === idx;
                    const isCorrect = idx === activeFlashcard.correctIdx;
                    
                    let cardStyle = "bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-300";
                    if (cardAnswered) {
                      if (isCorrect) {
                        cardStyle = "bg-teal-950/25 border-teal-500 text-teal-400 font-extrabold";
                      } else if (isSelected) {
                        cardStyle = "bg-red-950/25 border-red-500 text-red-400 font-extrabold";
                      } else {
                        cardStyle = "bg-slate-950/20 border-slate-900 opacity-40";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectCardAns(idx)}
                        disabled={cardAnswered}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors ${cardStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {cardAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 text-xs text-slate-400 leading-relaxed"
                    >
                      <span className={`font-black block uppercase tracking-wide mb-1.5 text-[9px] ${
                        selectedCardAns === activeFlashcard.correctIdx ? "text-teal-400" : "text-red-400"
                      }`}>
                        {selectedCardAns === activeFlashcard.correctIdx ? "✓ Correct Recollection" : "✗ Incorrect Recollection"}
                      </span>
                      {activeFlashcard.explanation}
                      
                      <div className="pt-4 flex justify-end">
                        <button
                          onClick={() => handleCloseFlashcard(selectedCardAns === activeFlashcard.correctIdx)}
                          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                        >
                          Complete Spaced Review Node
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top filter + action row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shrink-0">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "all" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "unread" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "alerts" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Syllabus Risks
          </button>
          <button
            onClick={() => setActiveTab("achieve")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "achieve" ? "bg-teal-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Streaks & Awards
          </button>
        </div>

        {/* Global actions */}
        <div className="flex gap-2.5">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-teal-400" /> Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Main scroll list viewport */}
      <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-4 min-h-0 relative">
        <AnimatePresence initial={false}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              
              // Map types to premium styled indicators
              let iconElement = <Bell className="w-5 h-5 text-teal-400" />;
              let cardGlow = "hover:border-slate-800";
              
              if (notif.type === "missed") {
                iconElement = <AlertTriangle className="w-5 h-5 text-amber-500" />;
                cardGlow = "hover:border-amber-500/20";
              } else if (notif.type === "weakness") {
                iconElement = <AlertTriangle className="w-5 h-5 text-red-500" />;
                cardGlow = "hover:border-red-500/20";
              } else if (notif.type === "spaced") {
                iconElement = <Clock className="w-5 h-5 text-blue-500" />;
                cardGlow = "hover:border-blue-500/20";
              }

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`p-4.5 bg-slate-950/50 rounded-2xl border transition-all flex flex-col md:flex-row gap-4 items-start justify-between relative group ${
                    notif.read ? "border-slate-900 opacity-60" : "border-slate-850/80"
                  } ${cardGlow}`}
                >
                  {/* Left content block */}
                  <div className="flex gap-3.5 text-left flex-1">
                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl shrink-0 mt-0.5">
                      {iconElement}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-xs font-bold ${notif.read ? "text-slate-400" : "text-white"}`}>
                          {notif.title}
                        </h3>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping"></span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-slate-400 leading-normal max-w-3xl">
                        {notif.description}
                      </p>
                      <span className="text-[9px] text-slate-500 font-semibold block pt-1">{notif.timestamp}</span>
                    </div>
                  </div>

                  {/* Right quick actions column */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    
                    {/* Action buttons mapping per type */}
                    {notif.type === "missed" && (
                      <button
                        onClick={() => handleReschedule(notif.id, "Heap Sort practice")}
                        className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-lg text-[10.5px] transition-colors"
                      >
                        Reschedule to Today
                      </button>
                    )}

                    {notif.type === "weakness" && (
                      <button
                        onClick={() => handleLaunchAI(notif.id)}
                        className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-slate-950 text-red-400 font-extrabold border border-red-500/20 rounded-lg text-[10.5px] transition-colors"
                      >
                        Launch AI Solver
                      </button>
                    )}

                    {notif.type === "spaced" && (
                      <button
                        onClick={() => handleStartFlashcard(notif.title || "", notif.id)}
                        className="px-3.5 py-1.5 bg-blue-500/10 hover:bg-blue-500 hover:text-slate-950 text-blue-400 font-extrabold border border-blue-500/20 rounded-lg text-[10.5px] transition-colors"
                      >
                        Begin Spaced Review
                      </button>
                    )}

                    {/* General Close button */}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-slate-600 hover:text-red-400 p-2 rounded-lg transition-colors opacity-10 md:opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col justify-center items-center text-center space-y-4 p-6"
            >
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">All Clear, Alex!</h4>
                <p className="text-xs text-slate-400 max-w-md">
                  You have resolved all task delays, mitigated weak diagnostic alerts, and completed your spaced reviews. Excellent study flow!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
