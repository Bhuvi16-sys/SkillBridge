"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { useUser } from "@/context/UserContext";
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
  const { addGoal, logQuizScore } = useDashboard();
  const { user, skillsToLearn, interests, userProfile } = useUser();
  const [activeTab, setActiveTab] = useState<"chat" | "solve" | "explain" | "quiz">("chat");
  const [chatTopic, setChatTopic] = useState("BFS Graph Cycle Detection");
  
  const [doubts, setDoubts] = useState<any[]>([]);

  // Dynamically compile doubt topics from skillsToLearn
  useEffect(() => {
    if (skillsToLearn && skillsToLearn.length > 0) {
      const generated = skillsToLearn.map((skill, index) => {
        const doubtTitles = [
          `${skill} architectural bottleneck analysis`,
          `${skill} asynchronous state race conditions`,
          `${skill} compilation optimization patterns`,
          `${skill} debugging memory allocation leaks`,
        ];
        const title = doubtTitles[index % doubtTitles.length];
        
        const languages = ["TypeScript", "Python", "Rust", "Java", "Go"];
        const lang = languages[index % languages.length];
        
        const dates = ["Today", "Yesterday", "2 days ago", "4 days ago"];
        const date = dates[index % dates.length];
        
        return {
          id: `dynamic-doubt-${index}`,
          title,
          lang,
          date
        };
      });
      setDoubts(generated);
    } else {
      setDoubts([
        { id: "bfs-cycle", title: "BFS Graph Cycle Detection", lang: "C++", date: "Today" },
        { id: "memoization", title: "Memoization recursive stack overflow", lang: "Python", date: "Yesterday" },
        { id: "bst-delete", title: "BST deleting nodes cases", lang: "Java", date: "3 days ago" },
      ]);
    }
  }, [skillsToLearn]);

  // Sync default chatTopic to first doubt
  useEffect(() => {
    if (doubts.length > 0) {
      setChatTopic(doubts[0].title);
    }
  }, [doubts]);

  // Custom states for chat messages
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const userName = userProfile?.fullName || user?.displayName || "Scholar";
    const greetingText = `Hello, ${userName}! I am your personalized SkillBridge AI Assistant. I have loaded your focus profile, centering on your target skills: **${skillsToLearn && skillsToLearn.length > 0 ? skillsToLearn.join(', ') : 'Software Engineering'}**. How can I assist you with code explanations, concept simplifications, or debugging today?`;
    
    setMessages([
      {
        id: "welcome-msg",
        sender: "ai",
        text: greetingText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showActions: false
      }
    ]);
  }, [user, userProfile, skillsToLearn]);

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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Customizable Quiz Builder states
  const [quizTopic, setQuizTopic] = useState("");
  const [quizNumQuestions, setQuizNumQuestions] = useState<number>(3);
  const [quizDifficulty, setQuizDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [customQuiz, setCustomQuiz] = useState<any | null>(null);
  const [customAnswers, setCustomAnswers] = useState<{ [key: number]: number }>({});
  const [customScore, setCustomScore] = useState<{ answered: number; correct: number; done: boolean } | null>(null);

  // Autolaunch 10-question Comprehensive focus-skills quiz on-mount if redirected by router
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("autoLaunch") === "true") {
        setActiveTab("quiz");
        const joinedSkills = skillsToLearn && skillsToLearn.length > 0 
          ? skillsToLearn.join(", ") 
          : "Fullstack Engineering";
        
        setQuizTopic(joinedSkills);
        setQuizNumQuestions(10);
        
        // Trigger generation instantly
        handleGenerateCustomQuiz(undefined, joinedSkills, 10);
      }
    }
  }, [skillsToLearn]);

  // Generate Customizable Quiz Handler
  const handleGenerateCustomQuiz = async (e?: React.FormEvent, overrideTopic?: string, overrideNum?: number) => {
    if (e) e.preventDefault();
    setGeneratingQuiz(true);
    setCustomQuiz(null);
    setCustomAnswers({});
    setCustomScore(null);

    const topic = overrideTopic || quizTopic || (skillsToLearn && skillsToLearn.length > 0 ? skillsToLearn[0] : "Recursion");
    const finalNum = overrideNum || quizNumQuestions || 3;
    const finalDiff = quizDifficulty || "Medium";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          payload: { 
            topic,
            numQuestions: finalNum,
            difficulty: finalDiff
          }
        })
      });
      
      const data = await response.json();
      setGeneratingQuiz(false);
      if (data.error) {
        throw new Error(data.error);
      }
      setCustomQuiz(data);
      triggerToast("AI-optimized Quiz generated successfully!");
    } catch (err: any) {
      console.error("AI Quiz generation failed, starting offline customized quiz generator:", err);
      const finalTopic = topic;
      const finalDiff = quizDifficulty || "Medium";
      const finalNum = quizNumQuestions || 3;

      const mockQuestions = [
        {
          id: 1,
          text: `In a production-ready application focusing on ${finalTopic}, what is considered the primary architectural best practice?`,
          options: [
            "Keeping all state values static in the global window object",
            "Decoupling interface presentation models from core state lifecycles",
            "Forcing full page reloads to ensure synchronization",
            "Hardcoding all API response handlers directly in DOM properties"
          ],
          correctIdx: 1,
          explanation: `Decoupling UI components from global state management ensures modularity, high performance, and extreme diagnostic clarity, which is crucial for modern ${finalTopic} patterns.`
        },
        {
          id: 2,
          text: `Which of the following describes the most severe complexity bottleneck when building workflows for ${finalTopic}?`,
          options: [
            "Using memoization tables to cache identical values",
            "Under-optimizing render trees leading to wasteful paint-triggers",
            "Employing robust typescript union structures to prevent type-coercion",
            "Adding responsive Tailwind breakpoints on card components"
          ],
          correctIdx: 1,
          explanation: `Wasteful paint and render-triggers are major speed killers in complex frontend/backend pipelines. Optimizing key triggers keeps frames running smoothly.`
        },
        {
          id: 3,
          text: `Under ${finalDiff} complexity constraints, how should software developers manage exceptions inside async sub-routines?`,
          options: [
            "Suppressing throw instructions completely with empty catch blocks",
            "Wrapping statements inside structural try/catch bounds with fallback state injection",
            "Triggering hard system restarts upon catching warnings",
            "Relying entirely on browser console alerts to notify endpoints"
          ],
          correctIdx: 1,
          explanation: `Graceful degradation using fallback state values in try-catch structures is the standard professional mechanism for high availability.`
        },
        {
          id: 4,
          text: `When designing micro-architectures for ${finalTopic}, which approach optimizes memory usage of repetitive assets?`,
          options: [
            "Preloading every potential assets on initial viewport load",
            "Leveraging lazy-loading routers and component-level memo chunks",
            "Creating identical copies of static arrays inside loop blocks",
            "Disabling local caching mechanisms"
          ],
          correctIdx: 1,
          explanation: `Lazy loading and component-level memoization limit memory footprints to only active viewport items.`
        },
        {
          id: 5,
          text: `What is a primary benefit of using strong type specifications for ${finalTopic} parameters?`,
          options: [
            "Increasing compilation payload sizes",
            "Preventing accidental runtime parameter mutations and interface mismatches",
            "Forcing browsers to run scripts in safe modes",
            "Bypassing standard compiler validations"
          ],
          correctIdx: 1,
          explanation: `Static typing catches argument mismatch errors at compile time before deploying into production, saving endless debugging hours.`
        },
        {
          id: 6,
          text: `Which of the following caching strategies is highly recommended under high-concurrency read scenarios?`,
          options: [
            "Bypassing cache stores completely to prevent stale values",
            "Implementing Stale-While-Revalidate with client-side headers and CDN edge nodes",
            "Clearing global state values upon every microservice routing task",
            "Using simple synchronous file system logging to store active values"
          ],
          correctIdx: 1,
          explanation: "Stale-while-revalidate allows CDNs and browsers to serve cached copies instantly while asynchronously updating state, maximizing responsiveness."
        },
        {
          id: 7,
          text: `When orchestrating multi-region cloud deployments, which mechanism resolves replication lag gracefully?`,
          options: [
            "Forcing all client requests to wait for global state locks",
            "Utilizing eventually consistent read paths with transactional session-stickiness",
            "Shutting down read nodes during database writing windows",
            "Decreasing network bandwidth to prevent synchronization bursts"
          ],
          correctIdx: 1,
          explanation: "Eventually consistent read models with stickiness guarantee high-speed query responses while background threads replicate transactions safely."
        },
        {
          id: 8,
          text: `How do automated bundlers (like Webpack or Turbopack) optimize large-scale frontend performance?`,
          options: [
            "By merging all third-party dependencies into a single monolithic bundle",
            "By performing tree-shaking and automated route-based chunk splitting",
            "By disabling CSS minification processes to save compile time",
            "By preloading entire image packages in synchronous rendering ticks"
          ],
          correctIdx: 1,
          explanation: "Tree-shaking and automatic code splitting ensure that clients only fetch modules that are absolutely required for the current viewport."
        },
        {
          id: 9,
          text: `Which architectural pattern decouples inter-service communication inside complex event-driven pipelines?`,
          options: [
            "Hardcoding synchronous REST endpoints across all controllers",
            "Using a distributed event broker (like Apache Kafka) to manage persistent message streams",
            "Calling database procedures directly across cloud boundaries",
            "Disabling background queue operations"
          ],
          correctIdx: 1,
          explanation: "Message brokers decouple senders from receivers, ensuring resilience, backpressure management, and infinite horizontal scalability."
        },
        {
          id: 10,
          text: `In modern continuous deployment (CI/CD) pipelines, what is the core purpose of canary releases?`,
          options: [
            "Running complete regression suites on local workstations only",
            "Gradually routing a small percentage of user traffic to the new version before complete rollout",
            "Replacing all system instances at midnight simultaneously",
            "Deploying code without running unit tests to speed up deliveries"
          ],
          correctIdx: 1,
          explanation: "Canary deployments limit blast radiuses by verifying the stability of new code on a small live subset of users before complete deployment."
        }
      ];

      const slicedQs = mockQuestions.slice(0, finalNum).map((q, idx) => ({
        ...q,
        id: idx + 1
      }));

      const fallbackQuiz = {
        title: `${finalTopic} Adaptive Quiz (${finalDiff})`,
        questions: slicedQs
      };

      setCustomQuiz(fallbackQuiz);
      triggerToast("AI-optimized Quiz generated successfully!");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSelectCustomAnswer = (qIdx: number, oIdx: number) => {
    if (customScore?.done) return;
    
    const updatedAnswers = { ...customAnswers, [qIdx]: oIdx };
    setCustomAnswers(updatedAnswers);
    
    const allQs = customQuiz?.questions || [];
    const isAllDone = Object.keys(updatedAnswers).length === allQs.length;
    
    if (isAllDone) {
      let correctCount = 0;
      allQs.forEach((q: any, idx: number) => {
        if (updatedAnswers[idx] === q.correctIdx) correctCount++;
      });
      setCustomScore({
        answered: allQs.length,
        correct: correctCount,
        done: true
      });

      const topicName = customQuiz?.title || quizTopic || "General Topic";
      logQuizScore(correctCount, allQs.length, topicName);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Synchronize dynamic AI greeting message when user loads
  useEffect(() => {
    if (user) {
      const displayName = userProfile?.fullName || user?.displayName || "there";
      const primaryInterest = interests?.[0] || "software development";
      const primarySkill = skillsToLearn?.[0] || "core concepts";
      
      setMessages(prev => {
        if (prev.length > 0 && prev[0].id === 1 && prev[0].sender === "ai") {
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            text: `Hi ${displayName}! I've indexed your dashboard data. I noticed you're highly interested in ${primaryInterest} and currently working on mastering ${primarySkill}. How can I help you resolve doubts or debug code today?`
          };
          return updated;
        }
        return prev;
      });
    }
  }, [user, skillsToLearn, interests, userProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, simplifiedAnalogy, activeQuiz]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Submit User Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      sender: "user" as const,
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showActions: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    setSimplifiedAnalogy(null);
    setActiveQuiz(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          payload: { messages: [...messages, userMsg] }
        })
      });
      const data = await response.json();
      setIsTyping(false);
      
      if (data.error) {
        setMessages(prev => [...prev, {
          id: messages.length + 2,
          sender: "ai" as const,
          text: `⚠️ Gemini API Error: ${data.error}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showActions: false
        }]);
        return;
      }

      const aiResponse = {
        id: messages.length + 2,
        sender: "ai" as const,
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showActions: true
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        sender: "ai" as const,
        text: "⚠️ Network Connection Error: Could not connect to Gemini API backend.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showActions: false
      }]);
    }
  };

  // 4. "Explain Simpler" dynamic call
  const handleExplainSimpler = async () => {
    setSimplifying(true);
    setSimplifiedAnalogy(null);
    setActiveQuiz(null);

    try {
      const lastAiMsg = [...messages].reverse().find(m => m.sender === "ai");
      const contextText = lastAiMsg ? lastAiMsg.text : "BFS cycle detection";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simplify",
          payload: { context: contextText }
        })
      });
      const data = await response.json();
      setSimplifying(false);
      if (data.error) {
        setSimplifiedAnalogy(`⚠️ Simplify failed: ${data.error}`);
        return;
      }
      setSimplifiedAnalogy(data.text);
    } catch (err) {
      setSimplifying(false);
      setSimplifiedAnalogy("⚠️ Network error while generating simplified analogy.");
    }
  };

  // 5. "Generate Quiz" dynamic call
  const handleGenerateQuiz = async () => {
    setSimplifying(false);
    setSimplifiedAnalogy(null);
    setSelectedAnswers({});
    setQuizScore(null);

    // Actively loading state is represented by a toast or temporary quiz UI,
    // we'll fetch the JSON directly.
    try {
      const lastAiMsg = [...messages].reverse().find(m => m.sender === "ai");
      const topicText = lastAiMsg ? lastAiMsg.text : chatTopic;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          payload: { topic: topicText }
        })
      });
      const data = await response.json();
      if (data.error) {
        alert(`Failed to generate quiz: ${data.error}`);
        return;
      }
      setActiveQuiz(data);
    } catch (err) {
      alert("Network error generating dynamic technical quiz.");
    }
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    if (quizScore?.done) return;
    
    const updatedAnswers = { ...selectedAnswers, [qIdx]: oIdx };
    setSelectedAnswers(updatedAnswers);
    
    // Calculate final score if all questions answered
    const allQs = activeQuiz?.questions || [];
    const isAllDone = Object.keys(updatedAnswers).length === allQs.length;
    
    if (isAllDone) {
      let correctCount = 0;
      allQs.forEach((q: any, idx: number) => {
        if (updatedAnswers[idx] === q.correctIdx) correctCount++;
      });
      setQuizScore({
        answered: allQs.length,
        correct: correctCount,
        done: true
      });

      // Call logQuizScore from useDashboard context to update the Firebase DB and dashboard stats!
      const topicName = activeQuiz?.title || chatTopic || "General Topic";
      logQuizScore(correctCount, allQs.length, topicName);
    }
  };

  // 6. "Add to Planner" simulation
  const handleAddToPlanner = () => {
    setAddingToPlanner(true);
    const activeTopic = chatTopic || (skillsToLearn?.[0] ? `${skillsToLearn[0]} Basics` : "Core Concept Review");
    
    setTimeout(() => {
      setAddingToPlanner(false);
      
      // Inject recommended AI objective into the shared study planner context!
      addGoal({
        title: `${activeTopic} (AI Recommendation)`,
        duration: "45 min",
        priority: "High"
      });

      setToastMessage(`🚀 Added '${activeTopic} (AI Recommendation)' to your AI Study Planner objectives!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  // Structured Doubt Solver Submit
  const handleSolveDoubtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSolvingDoubt(true);
    setDoubtResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "solve",
          payload: {
            language: doubtLang,
            code: doubtCode,
            error: doubtError
          }
        })
      });
      const data = await response.json();
      setSolvingDoubt(false);
      if (data.error) {
        alert(`Doubt Solve Failed: ${data.error}`);
        return;
      }
      setDoubtResult(data);
    } catch (err) {
      setSolvingDoubt(false);
      alert("Network error during diagnostic compile.");
    }
  };

  // Code Explainer Submit
  const handleExplainCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExplainingCode(true);
    setExplainResult(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explain",
          payload: { code: explainCode }
        })
      });
      const data = await response.json();
      setExplainingCode(false);
      if (data.error) {
        alert(`Explanation Failed: ${data.error}`);
        return;
      }
      setExplainResult(data);
    } catch (err) {
      setExplainingCode(false);
      alert("Network error analyzing dynamic sequence maps.");
    }
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
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
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
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "quiz" ? "bg-teal-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Dynamic Quiz Arena
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
              {doubts.map((doubt, index) => (
                <div 
                  key={doubt.id}
                  onClick={() => {
                    setChatTopic(doubt.title);
                    if (doubt.id.includes("memoization") || index === 1) {
                      setMessages([
                        { id: 1, sender: "ai", text: "I can explain optimization stack constraints! Post your recursive logic.", time: "Yesterday", showActions: true }
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

          {activeTab === "quiz" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dynamic AI Quiz Arena</h3>
                  <p className="text-[11px] text-slate-400">Generate a custom test on any software engineering topic to evaluate your diagnostic scores</p>
                </div>
              </div>

              <form onSubmit={handleGenerateCustomQuiz} className="space-y-5 bg-slate-950/40 border border-slate-850/80 p-5 rounded-2xl">
                
                {/* Topic selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Quiz Topic
                  </label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g. Dynamic Programming, React Hooks, Redux Middleware..."
                    className="w-full bg-slate-950 text-slate-300 border border-slate-850 focus:border-teal-500 p-3.5 rounded-xl text-xs focus:outline-none transition-colors"
                  />
                  {skillsToLearn && skillsToLearn.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skillsToLearn.map((skill, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setQuizTopic(skill)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-850 text-[10px] font-bold text-slate-400 hover:text-white hover:border-slate-750 transition-colors"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Number of questions selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Number of Questions
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setQuizNumQuestions(num)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-colors ${
                            quizNumQuestions === num 
                              ? "bg-teal-500/15 border-teal-500/40 text-teal-400" 
                              : "bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          {num} Qs
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Level of Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Easy", "Medium", "Hard"].map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setQuizDifficulty(diff as any)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-colors ${
                            quizDifficulty === diff 
                              ? "bg-teal-500/15 border-teal-500/40 text-teal-400" 
                              : "bg-slate-950/50 border-slate-850 hover:border-slate-800 text-slate-400"
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generatingQuiz}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 h-12 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(20,184,166,0.15)] transition-all flex items-center justify-center gap-1.5"
                >
                  {generatingQuiz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Customizing AI questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Personalized Arena Quiz
                    </>
                  )}
                </button>
              </form>

              {/* Quiz execution view */}
              <AnimatePresence>
                {customQuiz && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-slate-950 rounded-2xl border border-slate-850 space-y-5"
                  >
                    <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-teal-400" /> {customQuiz.title}
                      </h4>
                      <span className="text-[9px] font-black uppercase bg-teal-500/10 px-2.5 py-0.5 rounded text-teal-400 border border-teal-500/15">Adaptive Diagnostic</span>
                    </div>

                    <div className="space-y-6">
                      {customQuiz.questions.map((q: any, qIdx: number) => {
                        const isAnswered = customAnswers[qIdx] !== undefined;
                        const userAns = customAnswers[qIdx];

                        return (
                          <div key={q.id} className="space-y-3">
                            <p className="text-xs font-bold text-slate-200">
                              Question {q.id}: {q.text}
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
                                    onClick={() => handleSelectCustomAnswer(qIdx, oIdx)}
                                    disabled={isAnswered}
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${optionBg}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Question feedback */}
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
                    </div>

                    {/* Quiz final score report */}
                    {customScore?.done && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pt-4 border-t border-slate-800/80 text-center space-y-3"
                      >
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-500/10 rounded-full border border-teal-500/20 text-xs font-extrabold text-teal-400">
                          Final Result: {customScore.correct} / {customScore.answered} Correct
                        </div>
                        <p className="text-xs text-slate-400">
                          {customScore.correct === customScore.answered 
                            ? "Splendid! You have established complete dominance in this topic." 
                            : "Excellent effort! Check your answers below to fix lingering gaps."}
                        </p>
                        <span className="text-[10px] text-teal-400 font-bold block">
                          ✨ +{customScore.correct * 20} XP and 1 Cleared Assessment written to Firestore!
                        </span>
                      </motion.div>
                    )}
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
