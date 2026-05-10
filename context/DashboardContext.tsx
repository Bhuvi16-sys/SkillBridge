"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Definitions of shared models
export interface UserStats {
  name: string;
  email: string;
  role: string;
  cohort: string;
  level: number;
  xp: number;
  totalXpNeeded: number;
  streak: number;
  bio: string;
  claimedDaily: boolean;
  readinessScore: number;
}

export interface SkillItem {
  name: string;
  category: string;
  level: string;
  pct: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  tech: string[];
  description: string;
  link: string;
}

export interface GoalItem {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  priority: "High" | "Medium";
}

export interface RepetitionItem {
  id: string;
  title: string;
  daysLeft: number;
  difficulty: "Easy" | "Medium" | "Hard" | null;
}

export interface NotificationItem {
  id: string;
  type: "missed" | "weakness" | "spaced";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface Competitor {
  id: string;
  name: string;
  xp: number;
  cheers: number;
}

export interface DashboardContextProps {
  user: UserStats;
  skills: SkillItem[];
  projects: ProjectItem[];
  goals: GoalItem[];
  repetitionQueue: RepetitionItem[];
  notifications: NotificationItem[];
  leaderboard: Competitor[];
  activeThemeId: string;
  claimDailyBoost: () => void;
  addSkill: (skill: SkillItem) => void;
  addProject: (proj: ProjectItem) => void;
  addGoal: (goal: Omit<GoalItem, "id" | "completed">) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  reviewSpacedRepetition: (id: string, difficulty: "Easy" | "Medium" | "Hard") => void;
  cheerCompetitor: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  updateProfile: (name: string, email: string, cohort: string, bio: string) => void;
  updateTheme: (themeId: string) => void;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  // 1. Theme Configuration
  const [activeThemeId, setActiveThemeId] = useState("emerald");

  // 2. User Stats state
  const [user, setUser] = useState<UserStats>({
    name: "Alex R.",
    email: "alex.r@stanford.edu",
    role: "Student",
    cohort: "Stanford Cohort B",
    level: 8,
    xp: 4350,
    totalXpNeeded: 4500,
    streak: 6,
    bio: "Aspiring Software Architect, currently drilling Dynamic Programming algorithms and BST structures.",
    claimedDaily: false,
    readinessScore: 84
  });

  // 3. Shared Skills
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: "TypeScript", category: "Language", level: "Expert", pct: 92 },
    { name: "Python", category: "Language", level: "Proficient", pct: 85 },
    { name: "C++", category: "Language", level: "Intermediate", pct: 68 },
    { name: "Graph Traversals", category: "Core CS", level: "Expert", pct: 90 },
    { name: "Dynamic Programming", category: "Core CS", level: "Learning", pct: 45 },
    { name: "System Design", category: "Core CS", level: "Proficient", pct: 75 }
  ]);

  // 4. Shared Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "p1",
      title: "Adaptive Router Simulator",
      tech: ["TypeScript", "Next.js", "Graph Theory"],
      description: "Simulates shortest-path first (OSPF) routing protocols using dynamic Dijkstra nodes on canvas grids.",
      link: "https://github.com/alexr/router-sim",
    },
    {
      id: "p2",
      title: "Self-Balancing BST Visualizer",
      tech: ["React", "CSS Canvas", "Algorithms"],
      description: "An interactive visualizer rendering AVL and Red-Black tree rotations in real-time based on numeric keys.",
      link: "https://github.com/alexr/bst-visual",
    }
  ]);

  // 5. Shared Goals
  const [goals, setGoals] = useState<GoalItem[]>([
    { id: "g1", title: "Complete DFS Stack Analogy module", duration: "45 mins", completed: false, priority: "High" },
    { id: "g2", title: "Debug AVL Tree node imbalances", duration: "30 mins", completed: true, priority: "High" },
    { id: "g3", title: "Write Custom Dijkstra Edge weights script", duration: "60 mins", completed: false, priority: "Medium" }
  ]);

  // 6. Spaced Repetition Review queue
  const [repetitionQueue, setRepetitionQueue] = useState<RepetitionItem[]>([
    { id: "r1", title: "Binary Search Tree rotations", daysLeft: 1, difficulty: null },
    { id: "r2", title: "Dijkstra Priority Queue optimization", daysLeft: 2, difficulty: null },
    { id: "r3", title: "Dynamic Programming recursion states", daysLeft: 4, difficulty: null }
  ]);

  // 7. Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      type: "weakness",
      title: "Weak Topic Detected: Trees",
      description: "A new custom interactive loop optimization practice test is available.",
      timestamp: "2 hours ago",
      read: false
    },
    {
      id: "n2",
      type: "missed",
      title: "Goal Deadline Approaching: Arrays Quiz",
      description: "Complete your basic array allocations test in the next 2 hours.",
      timestamp: "5 hours ago",
      read: false
    },
    {
      id: "n3",
      type: "spaced",
      title: "Spaced Repetition Review Active",
      description: "You have 3 core algorithmic flashcards waiting for conceptual active recall.",
      timestamp: "Today",
      read: false
    }
  ]);

  // 8. Weekly Leaderboard list
  const [leaderboard, setLeaderboard] = useState<Competitor[]>([
    { id: "l1", name: "Sarah G.", xp: 24890, cheers: 42 },
    { id: "l2", name: "Ethan S.", xp: 21500, cheers: 19 },
    { id: "l3", name: "Marcus T.", xp: 19450, cheers: 31 }
  ]);

  // Actions/Mutators
  const claimDailyBoost = () => {
    if (user.claimedDaily) return;
    setUser(prev => {
      const addedXp = 100;
      let newXp = prev.xp + addedXp;
      let newLevel = prev.level;
      if (newXp >= prev.totalXpNeeded) {
        newLevel += 1;
        newXp = newXp - prev.totalXpNeeded;
      }
      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        streak: prev.streak + 1,
        claimedDaily: true
      };
    });
  };

  const addSkill = (skill: SkillItem) => {
    setSkills(prev => [...prev, skill]);
    setUser(prev => ({
      ...prev,
      readinessScore: Math.min(prev.readinessScore + 2, 100)
    }));
  };

  const addProject = (proj: ProjectItem) => {
    setProjects(prev => [...prev, proj]);
    setUser(prev => ({
      ...prev,
      readinessScore: Math.min(prev.readinessScore + 3, 100)
    }));
  };

  const addGoal = (goal: Omit<GoalItem, "id" | "completed">) => {
    const newGoal: GoalItem = {
      ...goal,
      id: "g_" + Date.now(),
      completed: false
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const toggleGoal = (id: string) => {
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const reviewSpacedRepetition = (id: string, difficulty: "Easy" | "Medium" | "Hard") => {
    setRepetitionQueue(prev =>
      prev.map(r => (r.id === id ? { ...r, difficulty, daysLeft: difficulty === "Easy" ? 4 : difficulty === "Medium" ? 2 : 1 } : r))
    );
    // Add small award XP
    setUser(prev => {
      let newXp = prev.xp + 30;
      let newLevel = prev.level;
      if (newXp >= prev.totalXpNeeded) {
        newLevel += 1;
        newXp = newXp - prev.totalXpNeeded;
      }
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const cheerCompetitor = (id: string) => {
    setLeaderboard(prev =>
      prev.map(comp => (comp.id === id ? { ...comp, cheers: comp.cheers + 1 } : comp))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateProfile = (name: string, email: string, cohort: string, bio: string) => {
    setUser(prev => ({
      ...prev,
      name,
      email,
      cohort,
      bio
    }));
  };

  const updateTheme = (themeId: string) => {
    setActiveThemeId(themeId);
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        skills,
        projects,
        goals,
        repetitionQueue,
        notifications,
        leaderboard,
        activeThemeId,
        claimDailyBoost,
        addSkill,
        addProject,
        addGoal,
        toggleGoal,
        deleteGoal,
        reviewSpacedRepetition,
        cheerCompetitor,
        markNotificationRead,
        clearAllNotifications,
        updateProfile,
        updateTheme
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
