"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, doc, onSnapshot, query, orderBy, limit, addDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  studyHours: number;
  masteryIndex: number;
  assessmentsCleared: number;
}

export interface WeakTopicItem {
  id: string;
  name: string;
  accuracy: number;
  totalQs: number;
  severity: "Critical" | "High" | "Medium" | "Low";
}

export interface ResourceSuggestionItem {
  id: string;
  type: "Conceptual" | "Adaptive Quiz" | "Interactive Code" | "Practice Challenge" | "Standard Study";
  title: string;
  description: string;
  duration: string;
  linkText: string;
  linkUrl: string;
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
  weakTopics: WeakTopicItem[];
  leaderboard: Competitor[];
  aiSuggestions: ResourceSuggestionItem[];
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
  logStudySession: (hours: number, topicName: string) => Promise<void>;
  logQuizScore: (correct: number, total: number, topicName: string) => Promise<void>;
  resetProgress: () => Promise<void>;
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
  const { userProfile, user: firebaseUser } = useAuth();

  // 1. Theme Configuration
  const [activeThemeId, setActiveThemeId] = useState("emerald");

  // 2. User Stats state
  const [user, setUser] = useState<UserStats>({
    name: "SkillBridge User",
    email: "",
    role: "Student",
    cohort: "Self Study Cohort",
    level: 1,
    xp: 0,
    totalXpNeeded: 1000,
    streak: 0,
    bio: "Aspiring software professional.",
    claimedDaily: false,
    readinessScore: 0,
    studyHours: 0.0,
    masteryIndex: 0,
    assessmentsCleared: 0
  });

  // 3. Shared Skills
  const [skills, setSkills] = useState<SkillItem[]>([]);

  // 4. Shared Projects
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // 5. Shared Goals
  const [goals, setGoals] = useState<GoalItem[]>([]);

  // 6. Spaced Repetition Review queue
  const [repetitionQueue, setRepetitionQueue] = useState<RepetitionItem[]>([]);

  // 7. Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 8. Weekly Leaderboard list
  const [leaderboard, setLeaderboard] = useState<Competitor[]>([]);

  // 9. Weak Topics Map
  const [weakTopics, setWeakTopics] = useState<WeakTopicItem[]>([]);

  // 10. AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<ResourceSuggestionItem[]>([]);

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    if (!firebaseUser || !db) {
      // If user is logged out or Firebase configuration is missing, reset states
      setSkills([]);
      setProjects([]);
      setGoals([]);
      setRepetitionQueue([]);
      setNotifications([]);
      setLeaderboard([]);
      setWeakTopics([]);
      setAiSuggestions([]);
      return;
    }

    const userId = firebaseUser.uid;

    // A. Subscribe to main User Document
    const userRef = doc(db, "users", userId);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          name: data.fullName || firebaseUser.displayName || "SkillBridge User",
          email: data.email || firebaseUser.email || "",
          role: data.role === "student" ? "Student" : "Company Member",
          cohort: data.role === "student"
            ? (data.institution ? `${data.institution} (${data.gradeLevel || 'student'})` : "Self Study Cohort")
            : (data.companyName || "Organization Member"),
          level: data.level ?? 1,
          xp: data.xp ?? 0,
          totalXpNeeded: data.totalXpNeeded ?? 1000,
          streak: data.streak ?? 0,
          bio: data.bio || (data.role === "student"
            ? `Adaptive student interested in ${data.subjectOfInterest || 'General learning'}.`
            : `Company profile of ${data.companyName || 'Enterprise member'} in ${data.industry || 'Industry'}.`),
          claimedDaily: data.claimedDaily ?? false,
          readinessScore: data.readinessScore ?? 0,
          studyHours: data.studyHours ?? 0.0,
          masteryIndex: data.masteryIndex ?? 0,
          assessmentsCleared: data.assessmentsCleared ?? 0
        });
      } else {
        // Fallback user state
        setUser({
          name: firebaseUser.displayName || "SkillBridge User",
          email: firebaseUser.email || "",
          role: "Student",
          cohort: "Self Study Cohort",
          level: 1,
          xp: 0,
          totalXpNeeded: 1000,
          streak: 0,
          bio: "Aspiring software professional.",
          claimedDaily: false,
          readinessScore: 0,
          studyHours: 0.0,
          masteryIndex: 0,
          assessmentsCleared: 0
        });
      }
    });

    // B. Subscribe to Skills
    const skillsRef = collection(db, "users", userId, "skills");
    const unsubscribeSkills = onSnapshot(skillsRef, (snapshot) => {
      const items: SkillItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as SkillItem);
      });
      setSkills(items);
    });

    // C. Subscribe to Projects
    const projectsRef = collection(db, "users", userId, "projects");
    const unsubscribeProjects = onSnapshot(projectsRef, (snapshot) => {
      const items: ProjectItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as unknown as ProjectItem);
      });
      setProjects(items);
    });

    // D. Subscribe to Goals (Sorted by createdAt field)
    const goalsRef = collection(db, "users", userId, "goals");
    const goalsQuery = query(goalsRef, orderBy("createdAt", "desc"));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const items: GoalItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as unknown as GoalItem);
      });
      setGoals(items);
    }, (error) => {
      // Index error fallback for safety
      console.warn("Goals query error (possible index building in progress):", error);
      onSnapshot(goalsRef, (snapshot) => {
        const items: GoalItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({ id: doc.id, ...data } as unknown as GoalItem);
        });
        setGoals(items);
      });
    });

    // E. Subscribe to Spaced Repetition Queue
    const repRef = collection(db, "users", userId, "repetitionQueue");
    const unsubscribeRep = onSnapshot(repRef, (snapshot) => {
      const items: RepetitionItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as unknown as RepetitionItem);
      });
      setRepetitionQueue(items);
    });

    // F. Subscribe to Notifications
    const notificationsRef = collection(db, "users", userId, "notifications");
    const unsubscribeNotifications = onSnapshot(notificationsRef, (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as unknown as NotificationItem);
      });
      setNotifications(items);
    });

    // G. Subscribe to global student Leaderboard (Sorted descending by XP)
    const usersRef = collection(db, "users");
    const leaderboardQuery = query(usersRef, orderBy("xp", "desc"), limit(10));
    const unsubscribeLeaderboard = onSnapshot(leaderboardQuery, (snapshot) => {
      const items: Competitor[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "student" || !data.role) {
          items.push({
            id: doc.id,
            name: data.fullName || "SkillBridge Competitor",
            xp: data.xp || 0,
            cheers: data.cheers || 0
          });
        }
      });
      setLeaderboard(items);
    }, (error) => {
      console.warn("Leaderboard query error (possible index building in progress):", error);
      onSnapshot(usersRef, (snapshot) => {
        const items: Competitor[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === "student" || !data.role) {
            items.push({
              id: doc.id,
              name: data.fullName || "SkillBridge Competitor",
              xp: data.xp || 0,
              cheers: data.cheers || 0
            });
          }
        });
        items.sort((a, b) => b.xp - a.xp);
        setLeaderboard(items.slice(0, 10));
      });
    });

    // H. Subscribe to Weak Topics
    const weakTopicsRef = collection(db, "users", userId, "weakTopics");
    const unsubscribeWeakTopics = onSnapshot(weakTopicsRef, (snapshot) => {
      const items: WeakTopicItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as unknown as WeakTopicItem);
      });
      setWeakTopics(items);
    });

    // I. Subscribe to AI Suggestions
    const suggestionsRef = collection(db, "users", userId, "aiSuggestions");
    const unsubscribeSuggestions = onSnapshot(suggestionsRef, (snapshot) => {
      const items: ResourceSuggestionItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data } as unknown as ResourceSuggestionItem);
      });
      setAiSuggestions(items);
    });

    // Clean up subscriptions on auth sign-out/unmount
    return () => {
      unsubscribeUser();
      unsubscribeSkills();
      unsubscribeProjects();
      unsubscribeGoals();
      unsubscribeRep();
      unsubscribeNotifications();
      unsubscribeLeaderboard();
      unsubscribeWeakTopics();
      unsubscribeSuggestions();
    };
  }, [firebaseUser]);

  // Actions/Mutators
  const claimDailyBoost = async () => {
    if (user.claimedDaily || !firebaseUser || !db) return;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const addedXp = 100;
      let newXp = user.xp + addedXp;
      let newLevel = user.level;
      if (newXp >= user.totalXpNeeded) {
        newLevel += 1;
        newXp = newXp - user.totalXpNeeded;
      }
      await updateDoc(userRef, {
        xp: newXp,
        level: newLevel,
        streak: user.streak + 1,
        claimedDaily: true
      });
    } catch (error) {
      console.error("Error claiming daily boost:", error);
    }
  };

  const addSkill = async (skill: SkillItem) => {
    if (!firebaseUser || !db) return;
    try {
      await addDoc(collection(db, "users", firebaseUser.uid, "skills"), {
        ...skill,
        createdAt: new Date().toISOString()
      });
      // Reward readiness score boost
      const userRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userRef, {
        readinessScore: Math.min(user.readinessScore + 2, 100)
      });
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const addProject = async (proj: ProjectItem) => {
    if (!firebaseUser || !db) return;
    try {
      const { id, ...data } = proj; // Remove dummy id if passed
      await addDoc(collection(db, "users", firebaseUser.uid, "projects"), {
        ...data,
        createdAt: new Date().toISOString()
      });
      // Reward readiness score boost
      const userRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userRef, {
        readinessScore: Math.min(user.readinessScore + 3, 100)
      });
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const addGoal = async (goal: Omit<GoalItem, "id" | "completed">) => {
    if (!firebaseUser || !db) return;
    try {
      await addDoc(collection(db, "users", firebaseUser.uid, "goals"), {
        ...goal,
        completed: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const toggleGoal = async (id: string) => {
    if (!firebaseUser || !db) return;
    try {
      const targetGoal = goals.find(g => g.id === id);
      if (targetGoal) {
        const isCompleting = !targetGoal.completed;
        const goalRef = doc(db, "users", firebaseUser.uid, "goals", id);
        
        // 1. Update the goal status
        await updateDoc(goalRef, {
          completed: isCompleting
        });

        // 2. Compute study hours change
        let hoursToAdd = 0.5; // default
        const d = (targetGoal.duration || "").toLowerCase();
        if (d.includes("15")) hoursToAdd = 0.25;
        else if (d.includes("45")) hoursToAdd = 0.75;
        else if (d.includes("1h") || d.includes("1 h") || d.includes("60")) hoursToAdd = 1.0;
        else if (d.includes("30")) hoursToAdd = 0.5;

        const studyChange = isCompleting ? hoursToAdd : -hoursToAdd;
        const masteryChange = isCompleting ? 4 : -4;
        const xpChange = isCompleting ? 50 : -50;

        const updatedHours = Math.max(0, (user.studyHours || 0) + studyChange);
        const updatedMastery = Math.min(100, Math.max(0, (user.masteryIndex || 0) + masteryChange));
        
        let newXp = (user.xp || 0) + xpChange;
        let newLevel = user.level || 1;
        const xpNeeded = user.totalXpNeeded || 1000;
        if (newXp >= xpNeeded) {
          newLevel += 1;
          newXp = newXp - xpNeeded;
        } else if (newXp < 0 && newLevel > 1) {
          newLevel -= 1;
          newXp = xpNeeded + newXp;
        }
        newXp = Math.max(0, newXp);

        // Update main user profile document
        const userRef = doc(db, "users", firebaseUser.uid);
        await updateDoc(userRef, {
          studyHours: parseFloat(updatedHours.toFixed(2)),
          masteryIndex: updatedMastery,
          xp: newXp,
          level: newLevel
        });

        // 3. Update Weak Topics accuracy if matching keywords
        const titleLower = targetGoal.title.toLowerCase();
        let topicKey = "";
        if (titleLower.includes("dp") || titleLower.includes("dynamic") || titleLower.includes("programming") || titleLower.includes("memoization") || titleLower.includes("tabulation") || titleLower.includes("knapsack")) {
          topicKey = "Dynamic Programming";
        } else if (titleLower.includes("graph") || titleLower.includes("dfs") || titleLower.includes("bfs") || titleLower.includes("traversal") || titleLower.includes("dijkstra") || titleLower.includes("kahn") || titleLower.includes("cycle")) {
          topicKey = "Graph Traversals (BFS/DFS)";
        } else if (titleLower.includes("recursion") || titleLower.includes("backtracking") || titleLower.includes("recursive") || titleLower.includes("stack") || titleLower.includes("queens") || titleLower.includes("maze")) {
          topicKey = "Recursion & Backtracking";
        }

        if (topicKey && weakTopics && weakTopics.length > 0) {
          const matchedTopic = weakTopics.find(t => t.name.toLowerCase().includes(topicKey.toLowerCase()) || topicKey.toLowerCase().includes(t.name.toLowerCase()));
          if (matchedTopic) {
            const topicRef = doc(db, "users", firebaseUser.uid, "weakTopics", matchedTopic.id);
            const accChange = isCompleting ? 15 : -15;
            const qsChange = isCompleting ? 1 : -1;
            
            await updateDoc(topicRef, {
              accuracy: Math.min(100, Math.max(10, (matchedTopic.accuracy || 10) + accChange)),
              totalQs: Math.max(0, (matchedTopic.totalQs || 0) + qsChange)
            });
          }
        }
      }
    } catch (error) {
      console.error("Error toggling goal status:", error);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!firebaseUser || !db) return;
    try {
      await deleteDoc(doc(db, "users", firebaseUser.uid, "goals", id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const reviewSpacedRepetition = async (id: string, difficulty: "Easy" | "Medium" | "Hard") => {
    if (!firebaseUser || !db) return;
    try {
      const days = difficulty === "Easy" ? 4 : difficulty === "Medium" ? 2 : 1;
      const repRef = doc(db, "users", firebaseUser.uid, "repetitionQueue", id);
      await updateDoc(repRef, {
        difficulty,
        daysLeft: days,
        lastReviewed: new Date().toISOString()
      });

      // Award experience points, assessments cleared, and mastery
      const userRef = doc(db, "users", firebaseUser.uid);
      let newXp = (user.xp || 0) + 30;
      let newLevel = user.level || 1;
      const xpNeeded = user.totalXpNeeded || 1000;
      if (newXp >= xpNeeded) {
        newLevel += 1;
        newXp = newXp - xpNeeded;
      }
      
      await updateDoc(userRef, {
        xp: newXp,
        level: newLevel,
        assessmentsCleared: (user.assessmentsCleared || 0) + 1,
        masteryIndex: Math.min(100, (user.masteryIndex || 0) + 2)
      });
    } catch (error) {
      console.error("Error reviewing spaced repetition card:", error);
    }
  };

  const cheerCompetitor = async (id: string) => {
    if (!firebaseUser || !db) return;
    try {
      const competitor = leaderboard.find(c => c.id === id);
      if (competitor) {
        const competitorRef = doc(db, "users", id);
        await updateDoc(competitorRef, {
          cheers: (competitor.cheers || 0) + 1
        });
      }
    } catch (error) {
      console.error("Error cheering competitor:", error);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!firebaseUser || !db) return;
    try {
      const notifRef = doc(db, "users", firebaseUser.uid, "notifications", id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const clearAllNotifications = async () => {
    const firestoreDb = db;
    if (!firebaseUser || !firestoreDb) return;
    try {
      const batch = writeBatch(firestoreDb);
      notifications.forEach((n) => {
        if (!n.read) {
          const docRef = doc(firestoreDb, "users", firebaseUser.uid, "notifications", n.id);
          batch.update(docRef, { read: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const updateProfile = async (name: string, email: string, cohort: string, bio: string) => {
    if (!firebaseUser || !db) return;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userRef, {
        fullName: name,
        email: email,
        bio: bio
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const updateTheme = (themeId: string) => {
    setActiveThemeId(themeId);
  };

  const logStudySession = async (hours: number, topicName: string) => {
    if (!firebaseUser || !db) return;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      
      const studyChange = hours;
      const masteryChange = Math.round(hours * 3);
      const xpChange = Math.round(hours * 100);

      const updatedHours = Math.max(0, (user.studyHours || 0) + studyChange);
      const updatedMastery = Math.min(100, Math.max(0, (user.masteryIndex || 0) + masteryChange));

      let newXp = (user.xp || 0) + xpChange;
      let newLevel = user.level || 1;
      const xpNeeded = user.totalXpNeeded || 1000;
      if (newXp >= xpNeeded) {
        newLevel += 1;
        newXp = newXp - xpNeeded;
      }

      await updateDoc(userRef, {
        studyHours: parseFloat(updatedHours.toFixed(2)),
        masteryIndex: updatedMastery,
        xp: newXp,
        level: newLevel
      });

      // Update weakTopics subcollection topic accuracy
      if (topicName && weakTopics && weakTopics.length > 0) {
        const matchedTopic = weakTopics.find(t => t.name.toLowerCase() === topicName.toLowerCase() || t.name.toLowerCase().includes(topicName.toLowerCase()) || topicName.toLowerCase().includes(t.name.toLowerCase()));
        if (matchedTopic) {
          const topicRef = doc(db, "users", firebaseUser.uid, "weakTopics", matchedTopic.id);
          const currentAcc = matchedTopic.accuracy || 10;
          await updateDoc(topicRef, {
            accuracy: Math.min(100, currentAcc + Math.round(hours * 5)),
            totalQs: (matchedTopic.totalQs || 0) + 1
          });
        }
      }

      // Add logged activity notification
      const notifRef = collection(db, "users", firebaseUser.uid, "notifications");
      await addDoc(notifRef, {
        type: "spaced",
        title: "Study Session Logged! 📚",
        description: `You logged ${hours} hours of study on ${topicName || "General Study"}. Your stats and mastery index have increased!`,
        timestamp: "Just now",
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error logging study session:", error);
    }
  };

  const logQuizScore = async (correct: number, total: number, topicName: string) => {
    if (!firebaseUser || !db) return;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const quizAccuracy = Math.round((correct / total) * 100);
      
      const xpChange = correct * 20;
      const masteryChange = quizAccuracy >= 70 ? 3 : 1;

      let newXp = (user.xp || 0) + xpChange;
      let newLevel = user.level || 1;
      const xpNeeded = user.totalXpNeeded || 1000;
      if (newXp >= xpNeeded) {
        newLevel += 1;
        newXp = newXp - xpNeeded;
      }

      const updatedMastery = Math.min(100, Math.max(0, (user.masteryIndex || 0) + masteryChange));

      await updateDoc(userRef, {
        assessmentsCleared: (user.assessmentsCleared || 0) + 1,
        xp: newXp,
        level: newLevel,
        masteryIndex: updatedMastery
      });

      // Update matching weak topics diagnostic accuracy
      if (topicName && weakTopics) {
        const matchedTopic = weakTopics.find(t => t.name.toLowerCase() === topicName.toLowerCase() || t.name.toLowerCase().includes(topicName.toLowerCase()) || topicName.toLowerCase().includes(t.name.toLowerCase()));
        if (matchedTopic) {
          const topicRef = doc(db, "users", firebaseUser.uid, "weakTopics", matchedTopic.id);
          const currentAcc = matchedTopic.accuracy || 10;
          // Weighted moving average: (currentAcc + quizAccuracy) / 2
          const newAcc = Math.round((currentAcc + quizAccuracy) / 2);
          
          await updateDoc(topicRef, {
            accuracy: Math.min(100, Math.max(10, newAcc)),
            totalQs: (matchedTopic.totalQs || 0) + 1,
            severity: newAcc >= 80 ? "Low" : newAcc >= 50 ? "Medium" : newAcc >= 30 ? "High" : "Critical"
          });
        } else {
          // Dynamically register the topic in the weakTopics list if it doesn't exist
          const weakTopicsRef = collection(db, "users", firebaseUser.uid, "weakTopics");
          await addDoc(weakTopicsRef, {
            name: topicName,
            accuracy: quizAccuracy,
            totalQs: 1,
            severity: quizAccuracy >= 80 ? "Low" : quizAccuracy >= 50 ? "Medium" : quizAccuracy >= 30 ? "High" : "Critical",
            createdAt: new Date().toISOString()
          });
        }
      }

      // Add dynamic logged activity notification
      const notifRef = collection(db, "users", firebaseUser.uid, "notifications");
      await addDoc(notifRef, {
        type: "spaced",
        title: `Quiz Resolved: ${quizAccuracy}% Accuracy! 🎯`,
        description: `Successfully cleared diagnostic quiz on ${topicName || "General Topic"}. Earned +${xpChange} XP.`,
        timestamp: "Just now",
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error logging quiz score:", error);
    }
  };

  const resetProgress = async () => {
    if (!firebaseUser || !db) return;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userRef, {
        studyHours: 0.0,
        masteryIndex: 0,
        assessmentsCleared: 0,
        readinessScore: 0,
        xp: 0,
        level: 1
      });

      // Add dynamic logged activity notification
      const notifRef = collection(db, "users", firebaseUser.uid, "notifications");
      await addDoc(notifRef, {
        type: "spaced",
        title: "Progress Reset Successful! 🧹",
        description: "Your study stats, mastery index, and quizzes have been reset to 0. Start your learning journey fresh!",
        timestamp: "Just now",
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error resetting progress:", error);
    }
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
        weakTopics,
        aiSuggestions,
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
        updateTheme,
        logStudySession,
        logQuizScore,
        resetProgress
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
