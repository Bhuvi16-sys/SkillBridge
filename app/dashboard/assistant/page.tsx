"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Code, 
  HelpCircle, 
  Lightbulb, 
  Award, 
  Plus, 
  ChevronRight, 
  Copy, 
  Check, 
  RotateCcw, 
  BookOpen, 
  GraduationCap, 
  Calendar,
  Layers,
  Terminal,
  FileCode,
  ThumbsUp,
  BrainCircuit,
  MessageSquare,
  AlertCircle
} from "lucide-react";

// Pre-defined doubt/code topics for sidebar
const recentDoubts = [
  { id: "bfs-cycle", title: "BFS Graph Cycle Detection", lang: "C++", date: "Today" },
  { id: "memoization", title: "Memoization recursive stack overflow", lang: "Python", date: "Yesterday" },
  { id: "bst-delete", title: "BST deleting nodes cases", lang: "Java", date: "3 days ago" },
];

export default function AIAssistantPage() {
  const { addGoal } = useDashboard();
  const [activeTab, setActiveTab] = useState<"chat" | "solve" | "explain">("chat");
  const [chatTopic, setChatTopic] = useState("BFS Graph Cycle Detection");
  
  // Custom states for chat messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hi Alex! I've indexed your dashboard data. I noticed you're currently working on Graphs: DFS/BFS traversals. How can I help you resolve doubts or debug code today?",
      time: "10:30 AM",
      showActions: false
    },
    {
      id: 2,
      sender: "user",
      text: "I am trying to implement a BFS cycle detection in a directed graph, but my visited array is getting infinite loops. Here is my queue loop.",
      time: "10:31 AM",
      showActions: false
    },
    {
      id: 3,
      sender: "ai",
      text: `In directed graphs, a simple \`visited\` array isn't enough to detect cycles because visiting a node from two different paths is common and doesn't imply a cycle. Instead, you need to track nodes in the **active recursion stack** (or active queue trace) or use **Kahn's Algorithm** (In-degrees). 

Here is a corrected BFS pattern using Kahn's In-Degree method:`,
      code: `// Kahn's Algorithm for Directed Cycle Detection (BFS)
bool hasCycle(int V, vector<int> adj[]) {
    vector<int> inDegree(V, 0);
    for (int i = 0; i < V; i++) {
        for (auto neighbor : adj[i]) {
            inDegree[neighbor]++;
        }
    }

    queue<int> q;
    for (int i = 0; i < V; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    int count = 0; // Count nodes processed
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        count++;

        for (auto neighbor : adj[curr]) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] == 0) q.push(neighbor);
        }
    }

    // If processed count < total vertices, a cycle exists!
    return count != V; 
}`,
      time: "10:32 AM",
      showActions: true // Exposes simplify, quiz, planner actions!
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Structured Doubt Solver State
  const [doubtCode, setDoubtCode] = useState(`def detect_cycle(nodes, edges):
    visited = set()
    queue = []
    
    # Simple BFS cycle finder
    for n in nodes:
        queue.append(n)
        while queue:
            curr = queue.pop(0)
            if curr in visited:
                return True # Cycle!
            visited.add(curr)
            for neigh in edges[curr]:
                queue.append(neigh)
    return False`);
  const [doubtError, setDoubtError] = useState("RecursionError: maximum recursion depth exceeded / Infinite queue loop");
  const [doubtLang, setDoubtLang] = useState("python");
  const [solvingDoubt, setSolvingDoubt] = useState(false);
  const [doubtResult, setDoubtResult] = useState<any | null>(null);

  // Code Explainer State
  const [explainCode, setExplainCode] = useState(`const fibonacci = (n, memo = {}) => {
  if (n <= 1) return n;
  if (n in memo) return memo[n];
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
};`);
  const [explainingCode, setExplainingCode] = useState(false);
  const [explainResult, setExplainResult] = useState<any | null>(null);

  // Active interaction states: Simplify, Quiz, Planner
  const [simplifying, setSimplifying] = useState(false);
  const [simplifiedAnalogy, setSimplifiedAnalogy] = useState<string | null>(null);
  
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizScore, setQuizScore] = useState<{ answered: number; correct: number; done: boolean } | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  const [addingToPlanner, setAddingToPlanner] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, simplifiedAnalogy, activeQuiz]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Submit User Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      sender: "user",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showActions: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    setSimplifiedAnalogy(null);
    setActiveQuiz(null);

    // Simulate AI response synthesis
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = {
        id: messages.length + 2,
        sender: "ai",
        text: `Understood! You are addressing BFS constraints. In directed nodes, standard topological indices are best calculated sequentially. Let's look at the adjacency map. Is this for a directed graph or an undirected structure? Toggling "Generate Quiz" below can help check your understanding on topological queue sorting!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showActions: true
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  // 4. "Explain Simpler" simulation
  const handleExplainSimpler = () => {
    setSimplifying(true);
    setSimplifiedAnalogy(null);
    setActiveQuiz(null);

    setTimeout(() => {
      setSimplifying(false);
      setSimplifiedAnalogy(
        `💡 **Analogy Simplification: BFS Directed Cycle Detection**\n\n` +
        `Imagine a group of friends forwarding a rumor via email, where each person forwards it to specific friends (a directed arrow).\n\n` +
        `• **Standard BFS visited (the mistake)** is like checking off names of people who have ever received the email. If *Bob* gets the email from both *Alice* and *Charlie*, Bob says, 'Hey, I already got this!' under simple BFS. But that's not a cycle! It's just two separate lines of communication reaching him.\n\n` +
        `• **Kahn's Algorithm (In-degree)** is like counting how many letters each person is *expecting* to receive before they are done. When Alice gets zero pending emails, she is finished, writes down her notes, and forwards her letters. If at the end, Bob, Charlie, and Dave are still waiting for each other's emails forever, there is a circular waiting loop (a cycle!).`
      );
    }, 1800);
  };

  // 5. "Generate Quiz" simulation
  const handleGenerateQuiz = () => {
    setSimplifying(false);
    setSimplifiedAnalogy(null);
    setSelectedAnswers({});
    setQuizScore(null);

    const mockQuiz = {
      title: "BFS Graph Cycle Diagnostic",
      questions: [
        {
          id: 1,
          text: "Why is a standard BFS 'visited' checklist insufficient for Directed Graph cycle detection?",
          options: [
            "BFS traversals cannot access directed arrays",
            "Multiple incoming paths to a node can be falsely flagged as cycles",
            "In-degree calculations cannot be done with queue FIFO queues",
            "Directed arrays always require DFS recursions"
          ],
          correctIdx: 1,
          explanation: "In a directed graph, a node can be reached from multiple non-cyclic paths (e.g. A ➔ B ➔ C, and A ➔ C). A simple visited array will trigger a duplicate visit on C, erroneously identifying a cycle."
        },
        {
          id: 2,
          text: "What queue operation indicates a cycle exists in Kahn's algorithm?",
          options: [
            "The queue size exceeds the number of vertices V",
            "The queue becomes empty before we process all V vertices",
            "A vertex inDegree is subtracted into negative counts",
            "The queue pops items in LIFO order"
          ],
          correctIdx: 1,
          explanation: "If there is a cycle, the vertices in the cycle will never reach an in-degree of 0, so they will never enter the queue. Consequently, the queue empties early, and processed node count is < total vertices V."
        }
      ]
    };

    setActiveQuiz(mockQuiz);
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    if (quizScore?.done) return;
    
    setSelectedAnswers(prev => {
      const updated = { ...prev, [qIdx]: oIdx };
      
      // Calculate final score if all questions answered
      const allQs = activeQuiz.questions;
      const isAllDone = Object.keys(updated).length === allQs.length;
      
      if (isAllDone) {
        let correctCount = 0;
        allQs.forEach((q: any, idx: number) => {
          if (updated[idx] === q.correctIdx) correctCount++;
        });
        setQuizScore({
          answered: allQs.length,
          correct: correctCount,
          done: true
        });
      }
      return updated;
    });
  };

  // 6. "Add to Planner" simulation
  const handleAddToPlanner = () => {
    setAddingToPlanner(true);
    setTimeout(() => {
      setAddingToPlanner(false);
      
      // Inject recommended AI objective into the shared study planner context!
      addGoal({
        title: "BFS Graph Cycles (Diagnostic Recovery)",
        duration: "45 min",
        priority: "High"
      });

      setToastMessage("🚀 Added 'BFS Graph Cycles (Diagnostic Recovery)' to your AI Study Planner objectives!");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  // Structured Doubt Solver Submit
  const handleSolveDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSolvingDoubt(true);
    setDoubtResult(null);

    setTimeout(() => {
      setSolvingDoubt(false);
      setDoubtResult({
        topic: "Infinite BFS Queue Loop (Python)",
        errorReason: "Your loop is appending neighbors to the queue without checking if they have already been added to the queue, creating a duplicate-processing cascade. Simple BFS will loop infinitely if cyclic connections are traversed.",
        linesAffected: "Lines 11 & 12 (`visited.add(curr)` / `queue.append(neigh)`)",
        fixDescription: "To fix the queue flood, mark nodes as visited *at the moment of appending* them to the queue, not when they are popped. Or better, tracking back paths with a parent mapping.",
        codeFix: `def detect_cycle_fixed(nodes, edges):
    visited = set()
    queue = []
    
    for n in nodes:
        if n in visited: continue
        queue.append(n)
        visited.add(n) # Mark immediately on queue entrance!
        
        while queue:
            curr = queue.pop(0)
            for neigh in edges[curr]:
                if neigh in visited:
                    return True # Cycle detected!
                visited.add(neigh)
                queue.append(neigh)
    return False`
      });
    }, 1800);
  };

  // Code Explainer Submit
  const handleExplainCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExplainingCode(true);
    setExplainResult(null);

    setTimeout(() => {
      setExplainingCode(false);
      setExplainResult({
        title: "Memoized Fibonacci Visualizer",
        complexity: "Time: O(N) | Space: O(N) call stack recursion depth",
        breakdown: [
          { line: "Line 1: const fibonacci = (n, memo = {}) => {", desc: "Instantiates recursive function. Initializes a default empty hashmap parameter 'memo' that persists between call frames." },
          { line: "Line 2: if (n <= 1) return n;", desc: "Core Base Case: Prunes further calls. Returns 0 or 1 directly, resolving the leaf node on the call tree." },
          { line: "Line 3: if (n in memo) return memo[n];", desc: "🔑 Memoization Pruning lookup: If n has already been calculated in a previous subproblem, returns the value immediately. Avoids duplicate tree evaluation (O(2^N) ➔ O(N))." },
          { line: "Line 4: memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);", desc: "Calculates values recursively, then stores the result into the memo hash map prior to returning." }
        ]
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-200 h-[calc(100vh-100px)] flex flex-col justify-between overflow-hidden relative">
      
      {/* Absolute Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-6 py-3.5 rounded-xl border border-teal-400 font-extrabold shadow-[0_0_30px_rgba(20,184,166,0.35)] z-50 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4.5 h-4.5 animate-pulse" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Bot className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">AI Expert Assistant</h2>
            <p className="text-xs text-slate-400">Adaptive concept resolving & doubt compilation</p>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "chat" ? "bg-teal-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            AI Chat Hub
          </button>
          <button
            onClick={() => setActiveTab("solve")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "solve" ? "bg-teal-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Structured Doubt Solver
          </button>
          <button
            onClick={() => setActiveTab("explain")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "explain" ? "bg-teal-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Code Explainer
          </button>
        </div>
      </div>

      {/* Main Workspace Panels */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left sidebar: Recent Doubts (only active on AI Chat Tab) */}
        <div className={`w-[240px] shrink-0 bg-slate-900/20 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between ${activeTab === "chat" ? "block" : "hidden md:block"}`}>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-teal-400" /> Active Doubt Logs
            </h3>

            <div className="space-y-3">
              {recentDoubts.map((doubt) => (
                <div 
                  key={doubt.id}
                  onClick={() => {
                    setChatTopic(doubt.title);
                    if (doubt.id === "memoization") {
                      setMessages([
                        { id: 1, sender: "ai", text: "I can explain memoization stack constraints! Post your recursive logic.", time: "Yesterday", showActions: true }
                      ]);
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer border text-left transition-all ${
                    chatTopic === doubt.title 
                      ? "bg-teal-950/15 border-teal-500/35 text-white" 
                      : "bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/60"
                  }`}
                >
                  <p className="text-xs font-bold truncate text-slate-200">{doubt.title}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] font-black uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{doubt.lang}</span>
                    <span className="text-[9px] text-slate-500 font-medium">{doubt.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white mb-1.5">
              <AlertCircle className="w-4 h-4 text-purple-400" />
              <span>Study Insights</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Resolving doubt logs with live quiz checks increases node retention rates by **42%**.
            </p>
          </div>
        </div>

        {/* Right workspace window */}
        <div className="flex-1 bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col overflow-hidden relative">
          
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Chat messages viewport */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {messages.map((msg, idx) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[85%] flex gap-3">
                      {msg.sender === "ai" && (
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                          <Bot className="w-4.5 h-4.5" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-teal-500 text-slate-950 font-medium rounded-tr-none" 
                            : "bg-slate-950/60 border border-slate-850 text-slate-300 rounded-tl-none"
                        }`}>
                          <p className="whitespace-pre-line">{msg.text}</p>

                          {msg.code && (
                            <div className="mt-4 bg-slate-950 rounded-xl border border-slate-850 p-4.5 overflow-x-auto relative group">
                              <button
                                onClick={() => handleCopy(msg.code || "", idx)}
                                className="absolute top-3.5 right-3.5 text-slate-500 hover:text-white bg-slate-900/80 border border-slate-800 p-1.5 rounded transition-colors"
                              >
                                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <code className="text-xs text-slate-300 font-mono block whitespace-pre">
                                {msg.code}
                              </code>
                            </div>
                          )}
                        </div>

                        {/* Interactive Action Hub (Only exposed on last AI response) */}
                        {msg.showActions && (
                          <div className="flex flex-wrap gap-2 pt-1.5">
                            <button
                              onClick={handleExplainSimpler}
                              disabled={simplifying}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-teal-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <Lightbulb className="w-3.5 h-3.5" /> 
                              {simplifying ? "Simplifying..." : "Explain Simpler"}
                            </button>
                            <button
                              onClick={handleGenerateQuiz}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-blue-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <GraduationCap className="w-3.5 h-3.5" /> Generate Quiz
                            </button>
                            <button
                              onClick={handleAddToPlanner}
                              disabled={addingToPlanner}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-purple-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <Calendar className="w-3.5 h-3.5" /> Add to Planner
                            </button>
                          </div>
                        )}
                        
                        <span className={`text-[9px] text-slate-500 block ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                          {msg.time}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}

                {/* Simulated Analogy Response Area */}
                {simplifiedAnalogy && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start pl-11"
                  >
                    <div className="max-w-[85%] bg-slate-950/80 border border-teal-500/20 p-5 rounded-2xl relative shadow-lg">
                      <div className="absolute top-2.5 right-3.5 flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded text-[8px] font-black text-teal-400 uppercase">
                        <Lightbulb className="w-3 h-3" /> Simplified Analogy
                      </div>
                      <div className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-line prose prose-invert">
                        {simplifiedAnalogy}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Simulated Interactive Quiz Area */}
                {activeQuiz && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start pl-11"
                  >
                    <div className="max-w-[85%] w-full bg-[#1e293b]/50 border border-blue-500/20 p-6 rounded-2xl shadow-xl space-y-5">
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-blue-400" /> {activeQuiz.title}
                        </h4>
                        <span className="text-[9px] font-black bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 uppercase">Interactive Diagnostic</span>
                      </div>

                      {activeQuiz.questions.map((q: any, qIdx: number) => {
                        const isAnswered = selectedAnswers[qIdx] !== undefined;
                        const userAns = selectedAnswers[qIdx];

                        return (
                          <div key={q.id} className="space-y-3">
                            <p className="text-xs font-bold text-slate-200">
                              {q.id}. {q.text}
                            </p>
                            
                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((option: string, oIdx: number) => {
                                const isSelected = userAns === oIdx;
                                const isCorrect = q.correctIdx === oIdx;
                                
                                let optionBg = "bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/80";
                                if (isAnswered) {
                                  if (isCorrect) {
                                    optionBg = "bg-teal-950/15 border-teal-500/50 text-teal-400 font-bold";
                                  } else if (isSelected) {
                                    optionBg = "bg-red-950/15 border-red-500/50 text-red-400 font-bold";
                                  } else {
                                    optionBg = "bg-slate-950/20 border-slate-900 opacity-50";
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleSelectAnswer(qIdx, oIdx)}
                                    disabled={isAnswered}
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${optionBg}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Show detailed explanation on submission */}
                            <AnimatePresence>
                              {isAnswered && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 mt-2 text-[10.5px] text-slate-400 leading-normal"
                                >
                                  <strong className={userAns === q.correctIdx ? "text-teal-400" : "text-red-400"}>
                                    {userAns === q.correctIdx ? "✓ Correct!" : "✗ Incorrect."}
                                  </strong>{" "}
                                  {q.explanation}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {/* Quiz Score Summary card */}
                      {quizScore?.done && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="pt-4 border-t border-slate-800/80 text-center space-y-3"
                        >
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20 text-[11px] font-extrabold text-teal-400">
                            Score: {quizScore.correct} / {quizScore.answered} Passed
                          </div>
                          <p className="text-xs text-slate-400">
                            {quizScore.correct === quizScore.answered 
                              ? "Excellent! You have fully mastered directed cycle constraints." 
                              : "Review Kahn's algorithm inDegree maps to solidify cycle concepts."}
                          </p>
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={handleAddToPlanner}
                              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md"
                            >
                              <Plus className="w-3.5 h-3.5" /> Save Practice Node
                            </button>
                            <button
                              onClick={handleGenerateQuiz}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Retry Quiz
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Typing loader */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                      <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input text send bar */}
              <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-850 bg-slate-950/40 flex gap-3 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a technical doubt or paste graph logs..."
                  className="flex-1 bg-slate-950/50 hover:bg-slate-950 border border-slate-850 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 text-sm h-12 px-4 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200"
                />
                <button
                  type="submit"
                  className="w-12 h-12 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all duration-200 shrink-0"
                >
                  <Send className="w-5 h-5 fill-current" />
                </button>
              </form>

            </div>
          )}

          {activeTab === "solve" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Structured Code & Doubt Solver</h3>
                  <p className="text-[11px] text-slate-400">Paste structured blocks to pinpoint memory overflows and loop leaks</p>
                </div>
              </div>

              <form onSubmit={handleSolveDoubtSubmit} className="space-y-4">
                
                {/* Language selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["python", "cpp", "javascript", "java"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setDoubtLang(lang)}
                      className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                        doubtLang === lang 
                          ? "bg-teal-500/15 border-teal-500/40 text-teal-400" 
                          : "bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      {lang === "cpp" ? "C++" : lang}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code editor mock box */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-teal-400" /> Source Code
                    </label>
                    <textarea
                      value={doubtCode}
                      onChange={(e) => setDoubtCode(e.target.value)}
                      rows={10}
                      className="w-full bg-slate-950 text-slate-300 border border-slate-850 focus:border-teal-500 p-4 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Terminal error log log box */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-400" /> Terminal Error Log (Optional)
                    </label>
                    <textarea
                      value={doubtError}
                      onChange={(e) => setDoubtError(e.target.value)}
                      rows={10}
                      placeholder="Paste terminal error trace logs here..."
                      className="w-full bg-slate-950/60 text-red-400/90 border border-slate-850 focus:border-red-500/40 p-4 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={solvingDoubt}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 h-12 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all flex items-center justify-center gap-1.5"
                >
                  {solvingDoubt ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Compiling static diagnostics...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Synthesize Code Doubt Resolution
                    </>
                  )}
                </button>
              </form>

              {/* Resolved Output pane */}
              <AnimatePresence>
                {doubtResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-teal-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-teal-400" /> Doubt Diagnosis: {doubtResult.topic}
                      </h4>
                      <span className="text-[9px] font-black uppercase bg-red-500/10 px-2 py-0.5 rounded text-red-400 border border-red-500/15">Resolved</span>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Root Cause Detection:</span>
                        <p className="text-slate-300 mt-1 leading-relaxed">{doubtResult.errorReason}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">Impacted Lines:</span>
                          <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-mono rounded">{doubtResult.linesAffected}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block mb-1">Recovery Plan Recommendation:</span>
                          <p className="text-slate-300 leading-normal">{doubtResult.fixDescription}</p>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Recommended Correct Code:</span>
                        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4.5 relative overflow-x-auto">
                          <button
                            onClick={() => handleCopy(doubtResult.codeFix, 999)}
                            className="absolute top-3.5 right-3.5 text-slate-500 hover:text-white bg-slate-900/80 border border-slate-800 p-1.5 rounded transition-colors"
                          >
                            {copiedIndex === 999 ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <code className="text-xs text-slate-300 font-mono block whitespace-pre">
                            {doubtResult.codeFix}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-900">
                      <button
                        onClick={handleAddToPlanner}
                        className="px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500 hover:text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Append Recovery to Study Planner
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {activeTab === "explain" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Interactive Line Code Explainer</h3>
                  <p className="text-[11px] text-slate-400">Decompile algorithms and walk through stack allocations line-by-line</p>
                </div>
              </div>

              <form onSubmit={handleExplainCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Paste Complex Block
                  </label>
                  <textarea
                    value={explainCode}
                    onChange={(e) => setExplainCode(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-950 text-slate-300 border border-slate-850 focus:border-teal-500 p-4 rounded-xl text-xs font-mono focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={explainingCode}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 h-12 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all flex items-center justify-center gap-1.5"
                >
                  {explainingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Unraveling stack allocations...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" /> Analyze Code Architecture
                    </>
                  )}
                </button>
              </form>

              {/* Resolved Output pane */}
              <AnimatePresence>
                {explainResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-white">
                        Analysis: {explainResult.title}
                      </h4>
                      <span className="text-[10px] font-black uppercase text-teal-400">{explainResult.complexity}</span>
                    </div>

                    <div className="space-y-4">
                      {explainResult.breakdown.map((item: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-slate-900/30 border border-slate-850/60 rounded-xl hover:border-slate-800 transition-colors">
                          <code className="text-xs text-teal-400 font-mono block mb-1.5">{item.line}</code>
                          <p className="text-xs text-slate-400 leading-relaxed pl-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex justify-between gap-3 border-t border-slate-900">
                      <button
                        onClick={handleExplainSimpler}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-teal-400 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> Explain Simpler (Analogy)
                      </button>
                      <button
                        onClick={handleGenerateQuiz}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-blue-400 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <GraduationCap className="w-3.5 h-3.5" /> Synthesize Diagnostic Quiz
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

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

const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
