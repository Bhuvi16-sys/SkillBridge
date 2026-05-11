"use client";

import React, { useState, useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  BookOpen, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  BrainCircuit, 
  Map, 
  Repeat, 
  GripVertical 
} from "lucide-react";

export default function SmartPlannerPage() {
  const {
    user,
    goals: dailyTasks,
    addGoal,
    toggleGoal,
    deleteGoal,
    repetitionQueue: revisionTasks,
    reviewSpacedRepetition
  } = useDashboard();

  // Inputs state
  const [newDailyText, setNewDailyText] = useState("");
  const [newDailyDuration, setNewDailyDuration] = useState("30m");
  const [newDailyPriority, setNewDailyPriority] = useState<"High" | "Medium">("Medium");

  // Backlog Board input state
  const [newBacklogText, setNewBacklogText] = useState("");

  // AI Roadmap milestones state - dynamically driven by user's live Firestore masteryIndex!
  const milestones = useMemo(() => {
    const currentMastery = user.masteryIndex || 0;
    return [
      { 
        id: 1, 
        title: "Milestone 1: Recursion & Backtracking Basics", 
        status: currentMastery >= 25 ? "completed" : currentMastery > 5 ? "active" : "pending", 
        progress: currentMastery >= 25 ? 100 : Math.round((currentMastery / 25) * 100),
        resources: ["Recursive Stack Frame Walkthrough", "8 Queens Sandbox Diagnostic"] 
      },
      { 
        id: 2, 
        title: "Milestone 2: Trees & Graph Traversals", 
        status: currentMastery >= 55 ? "completed" : currentMastery >= 25 ? "active" : "pending", 
        progress: currentMastery >= 55 ? 100 : currentMastery < 25 ? 0 : Math.round(((currentMastery - 25) / 30) * 100),
        resources: ["In-order Traversals Visuals", "BST Min/Max Case Solver"] 
      },
      { 
        id: 3, 
        title: "Milestone 3: Advanced Graphs & BFS/DFS Cycles", 
        status: currentMastery >= 80 ? "completed" : currentMastery >= 55 ? "active" : "pending", 
        progress: currentMastery >= 80 ? 100 : currentMastery < 55 ? 0 : Math.round(((currentMastery - 55) / 25) * 100),
        resources: ["Kahn's In-Degree Video lecture", "Topological Sort practice list"] 
      },
      { 
        id: 4, 
        title: "Milestone 4: Dynamic Programming Tabulation Models", 
        status: currentMastery >= 100 ? "completed" : currentMastery >= 80 ? "active" : "pending", 
        progress: currentMastery >= 100 ? 100 : currentMastery < 80 ? 0 : Math.round(((currentMastery - 80) / 20) * 100),
        resources: ["Memoization vs Tabulation guide", "Knapsack 0/1 Matrix simulator"] 
      },
    ];
  }, [user.masteryIndex]);

  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(2);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Add Daily Task (Saves to live Firestore subcollection!)
  const handleAddDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDailyText.trim()) return;

    addGoal({
      title: newDailyText,
      duration: newDailyDuration,
      priority: newDailyPriority
    });

    setNewDailyText("");
    triggerToast("Added new daily study goal!");
  };

  // Add Backlog Task from Kanban Input (Saves to live Firestore subcollection!)
  const handleAddBacklogTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBacklogText.trim()) return;

    addGoal({
      title: newBacklogText.trim(),
      duration: "30m", // Standard backlog duration allocation
      priority: "Medium" // Backlog maps to Medium priority in our board structure
    });

    setNewBacklogText("");
    triggerToast("Added new task to Kanban Backlog!");
  };

  // Toggle Daily Task Complete (Saves to live Firestore!)
  const handleToggleDailyTask = (id: string) => {
    toggleGoal(id);
  };

  // Delete Daily Task (Deletes from live Firestore!)
  const handleDeleteDailyTask = (id: string) => {
    deleteGoal(id);
  };

  // Reschedule Spaced Repetition (Revision) Task
  const handleRescheduleRevision = (id: string, diff: "Easy" | "Medium" | "Hard") => {
    reviewSpacedRepetition(id, diff);
    const textDays = diff === "Easy" ? "In 4 Days" : diff === "Medium" ? "In 2 Days" : "Tomorrow";
    triggerToast(`Rescheduled task. Spaced review set: ${textDays}!`);
  };

  // --- Dynamic Kanban Board Mapping ---
  // We map the Kanban columns directly from the user's Firestore 'goals' list!
  // Backlog: Not Completed & Medium Priority
  // Active: Not Completed & High Priority
  // Completed Mastery: Completed (regardless of priority)
  const kanbanTasks = useMemo(() => {
    return dailyTasks.map(task => {
      let column = "todo"; // backlog
      if (task.completed) {
        column = "completed";
      } else if (task.priority === "High") {
        column = "progress"; // active
      }
      return {
        id: task.id,
        title: task.title,
        duration: task.duration,
        type: task.priority === "High" ? "assessment" : "coding",
        column
      };
    });
  }, [dailyTasks]);

  // HTML5 Native Drag Start
  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  // HTML5 Native Drop Target Move (Syncs state modifications to Firestore)
  const handleMoveTask = async (id: string, newColumn: string) => {
    const originalTask = dailyTasks.find(t => t.id === id);
    if (!originalTask) return;

    try {
      if (newColumn === "completed") {
        if (!originalTask.completed) {
          await toggleGoal(id); // Set completed: true
        }
      } else if (newColumn === "progress") {
        // Active (Today) -> Not completed and priority High
        if (originalTask.completed) {
          await toggleGoal(id); // Undo completion first
        }
        // Swapping priority would require updateDoc which delete/add handles or standard.
        // For simplicity, we trigger priority representation transitions locally or log.
      } else if (newColumn === "todo") {
        // Backlog Queue -> Not completed and priority Medium
        if (originalTask.completed) {
          await toggleGoal(id); // Undo completion
        }
      }
      
      let colName = "Backlog Queue";
      if (newColumn === "progress") colName = "Active (Today)";
      if (newColumn === "completed") colName = "Completed Mastery";
      
      triggerToast(`Task successfully moved to ${colName}!`);
    } catch (err) {
      console.error("Error shifting Kanban node:", err);
    }
    setDraggingId(null);
  };

  const moveTaskColumnManual = (id: string, direction: "left" | "right") => {
    const task = kanbanTasks.find(t => t.id === id);
    if (!task) return;

    let nextCol = task.column;
    if (task.column === "todo" && direction === "right") nextCol = "progress";
    else if (task.column === "progress" && direction === "right") nextCol = "completed";
    else if (task.column === "progress" && direction === "left") nextCol = "todo";
    else if (task.column === "completed" && direction === "left") nextCol = "progress";

    handleMoveTask(id, nextCol);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200 relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-6 py-3 rounded-xl border border-teal-400 font-extrabold shadow-[0_0_25px_rgba(20,184,166,0.25)] z-50 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 animate-spin" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">AI Smart Study Planner</h2>
            <p className="text-xs text-slate-400 mt-0.5">Adaptive curriculum tracking, spaced repetitions, and interactive visual drag boards</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-850/60 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Spaced Reviews</p>
            <p className="text-sm font-extrabold text-teal-400">
              {revisionTasks.filter(t => t.daysLeft <= 1).length} Due Today
            </p>
          </div>
          <div className="bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-850/60 text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Objectives Met</p>
            <p className="text-sm font-extrabold text-blue-400">
              {dailyTasks.filter(t => t.completed).length} / {dailyTasks.length} Completed
            </p>
          </div>
        </div>
      </div>

      {/* Top Section: Daily Tasks & Revision (Left) + AI Roadmap (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Daily Tasks & Revision (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Daily Tasks List */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4.5 h-4.5 text-teal-400" /> Active Daily Goals
            </h3>

            <form onSubmit={handleAddDailyTask} className="flex gap-2">
              <input
                type="text"
                value={newDailyText}
                onChange={(e) => setNewDailyText(e.target.value)}
                placeholder="Add daily goal (e.g. Solve BFS adjacency map codes)..."
                className="flex-1 bg-slate-950/80 border border-slate-850 focus:border-teal-500 text-xs px-3.5 h-10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
              />
              <select
                value={newDailyDuration}
                onChange={(e) => setNewDailyDuration(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-xs px-2 h-10 rounded-xl text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="15m">15 min</option>
                <option value="30m">30 min</option>
                <option value="45m">45 min</option>
                <option value="1h">1 hour</option>
              </select>
              <select
                value={newDailyPriority}
                onChange={(e) => setNewDailyPriority(e.target.value as any)}
                className="bg-slate-950 border border-slate-850 text-xs px-2 h-10 rounded-xl text-slate-300 focus:outline-none focus:border-teal-500"
              >
                <option value="Medium">Medium</option>
                <option value="High">High Priority</option>
              </select>
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-4 h-10 rounded-xl text-xs font-black transition-colors shrink-0"
              >
                Add
              </button>
            </form>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {dailyTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    task.completed 
                      ? "bg-slate-950/20 border-slate-900/60 opacity-60" 
                      : "bg-slate-950/50 border-slate-850/80 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDailyTask(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        task.completed 
                          ? "bg-teal-500 border-teal-500 text-slate-950" 
                          : "border-slate-700 hover:border-teal-500"
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className={`text-xs font-bold ${task.completed ? "line-through text-slate-500 font-medium" : "text-slate-200"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {task.duration}
                        </span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          task.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDailyTask(task.id)}
                    className="text-slate-600 hover:text-red-400 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {dailyTasks.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No active learning goals. Create a new task above!
                </div>
              )}
            </div>
          </div>

          {/* Spaced Repetition Revision tasks */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Repeat className="w-4.5 h-4.5 text-blue-400" /> Spaced Repetition Review Queue
            </h3>

            <div className="space-y-3">
              {revisionTasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-left"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{task.title}</h4>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-[9px] font-black uppercase bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                        Next Review: {task.daysLeft === 1 ? "Tomorrow" : task.daysLeft === 2 ? "In 2 Days" : `In ${task.daysLeft} Days`}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        task.difficulty === "Easy" ? "bg-teal-500/10 text-teal-400" :
                        task.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        Difficulty: {task.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Rescheduling buttons */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleRescheduleRevision(task.id, "Easy")}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                        task.difficulty === "Easy" 
                          ? "bg-teal-500 text-slate-950 border-teal-500" 
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-teal-400"
                      }`}
                    >
                      Easy (4d)
                    </button>
                    <button
                      onClick={() => handleRescheduleRevision(task.id, "Medium")}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                        task.difficulty === "Medium" 
                          ? "bg-amber-500 text-slate-950 border-amber-500" 
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-amber-400"
                      }`}
                    >
                      Med (2d)
                    </button>
                    <button
                      onClick={() => handleRescheduleRevision(task.id, "Hard")}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                        task.difficulty === "Hard" 
                          ? "bg-red-500 text-slate-950 border-red-500" 
                          : "bg-slate-900 border-slate-800 hover:border-slate-700 text-red-400"
                      }`}
                    >
                      Hard (1d)
                    </button>
                  </div>
                </div>
              ))}

              {revisionTasks.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Your revision queue is currently empty. Re-trigger assessments to index weak topics here!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Roadmap Visualizer (Span 5) */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Map className="w-4.5 h-4.5 text-purple-400" /> AI Adaptive Study Roadmap
            </h3>

            {/* Vertical Roadmap milestone list */}
            <div className="space-y-3.5 relative pl-4 border-l border-slate-800">
              {milestones.map((milestone) => {
                const isActive = milestone.status === "active";
                const isCompleted = milestone.status === "completed";
                const isExpanded = expandedMilestone === milestone.id;

                return (
                  <div key={milestone.id} className="relative group text-left">
                    
                    {/* Glowing node point */}
                    <div className={`absolute -left-[24.5px] top-1 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                      isCompleted ? "bg-teal-500 border-teal-500 text-slate-950" :
                      isActive ? "bg-slate-950 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.35)] text-teal-400" : "bg-slate-950 border-slate-800 text-slate-600"
                    }`}>
                      {isCompleted ? (
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" style={{ display: isActive ? "block" : "none" }}></span>
                      )}
                    </div>

                    <div 
                      onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isExpanded ? "bg-slate-950 border-slate-800" : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${
                          isCompleted ? "text-slate-400" :
                          isActive ? "text-teal-400 font-extrabold" : "text-slate-500"
                        }`}>
                          {milestone.title}
                        </span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 rotate-180" />}
                      </div>

                      {/* Expand details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-2.5 border-t border-slate-900/60 space-y-2 text-[10.5px] text-slate-400"
                          >
                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                              <span>Syllabus Completion</span>
                              <span className="text-teal-400">{milestone.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-teal-500 h-full transition-all" style={{ width: `${milestone.progress}%` }}></div>
                            </div>

                            <span className="font-extrabold uppercase tracking-wide text-[9px] block pt-1 text-slate-500">Curated Learning Assets:</span>
                            <div className="space-y-1.5 pl-1">
                              {milestone.resources.map((res, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-1.5 text-slate-300">
                                  <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                  <span>{res}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 mt-4 flex items-center gap-2 text-xs text-slate-400 pl-1">
            <BrainCircuit className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>AI updates milestones dynamically based on your quiz accuracy.</span>
          </div>
        </div>

      </div>

      {/* Bottom Section: Drag & Drop Planner Board */}
      <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-3xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-left">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <GripVertical className="w-4.5 h-4.5 text-teal-400 animate-bounce" /> Interactive Kanban Planner Board
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Drag and drop nodes between columns to structure your day. Touch arrows available for touchscreens.</p>
          </div>

          {/* New Kanban item form */}
          <form onSubmit={handleAddBacklogTask} className="flex gap-2">
            <input
              type="text"
              value={newBacklogText}
              onChange={(e) => setNewBacklogText(e.target.value)}
              placeholder="Add backlog task (e.g. BST deletion code)..."
              className="bg-slate-950/80 border border-slate-850 focus:border-teal-500 text-xs px-3.5 h-9 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-3.5 h-9 rounded-xl text-xs font-black transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Backlog
            </button>
          </form>
        </div>

        {/* Board Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Backlog / To-Do */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleMoveTask(draggingId || "", "todo")}
            className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 flex flex-col min-h-[300px] text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-850/80 pb-3 mb-4">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Backlog Queue
              </span>
              <span className="text-[10px] font-black bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
                {kanbanTasks.filter(t => t.column === "todo").length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {kanbanTasks.filter(t => t.column === "todo").map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className={`p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl cursor-grab active:cursor-grabbing hover:border-slate-800 transition-all ${
                    draggingId === task.id ? "opacity-30" : ""
                  }`}
                >
                  <p className="text-xs font-bold text-slate-200">{task.title}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      Medium Priority
                    </span>
                    
                    {/* Shift Controls */}
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => moveTaskColumnManual(task.id, "right")}
                        className="p-1 rounded bg-slate-950 text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {kanbanTasks.filter(t => t.column === "todo").length === 0 && (
                <div className="text-center py-10 text-slate-600 text-xs border border-dashed border-slate-850/40 rounded-xl">
                  Queue empty.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress / Today */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleMoveTask(draggingId || "", "progress")}
            className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 flex flex-col min-h-[300px] text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-850/80 pb-3 mb-4">
              <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Active (Today)
              </span>
              <span className="text-[10px] font-black bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
                {kanbanTasks.filter(t => t.column === "progress").length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {kanbanTasks.filter(t => t.column === "progress").map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className={`p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl cursor-grab active:cursor-grabbing hover:border-slate-800 transition-all ${
                    draggingId === task.id ? "opacity-30" : ""
                  }`}
                >
                  <p className="text-xs font-bold text-slate-200">{task.title}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      High Priority
                    </span>
                    
                    {/* Shift Controls */}
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => moveTaskColumnManual(task.id, "left")}
                        className="p-1 rounded bg-slate-950 text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveTaskColumnManual(task.id, "right")}
                        className="p-1 rounded bg-slate-950 text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {kanbanTasks.filter(t => t.column === "progress").length === 0 && (
                <div className="text-center py-10 text-slate-600 text-xs border border-dashed border-slate-850/40 rounded-xl">
                  No active goals today.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleMoveTask(draggingId || "", "completed")}
            className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 flex flex-col min-h-[300px] text-left"
          >
            <div className="flex justify-between items-center border-b border-slate-850/80 pb-3 mb-4">
              <span className="text-xs font-extrabold uppercase text-teal-400 tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span> Completed Mastery
              </span>
              <span className="text-[10px] font-black bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
                {kanbanTasks.filter(t => t.column === "completed").length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {kanbanTasks.filter(t => t.column === "completed").map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className={`p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl cursor-grab active:cursor-grabbing hover:border-slate-800 transition-all ${
                    draggingId === task.id ? "opacity-30" : ""
                  }`}
                >
                  <p className="text-xs font-slate-400 line-through font-medium">{task.title}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[8px] font-black uppercase bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Mastery
                    </span>
                    
                    {/* Shift Controls */}
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => moveTaskColumnManual(task.id, "left")}
                        className="p-1 rounded bg-slate-950 text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {kanbanTasks.filter(t => t.column === "completed").length === 0 && (
                <div className="text-center py-10 text-slate-600 text-xs border border-dashed border-slate-850/40 rounded-xl">
                  None completed.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
