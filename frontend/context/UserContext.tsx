"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority: "High" | "Medium";
  duration: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  studyHours: number;
  masteryIndex: number;
  weeklyStudyHours: number;
  overallMasteryIndex: number;
  dailyTasks: DailyTask[];
  assessments: number;
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [studyHours, setStudyHours] = useState<number>(0.0);
  const [masteryIndex, setMasteryIndex] = useState<number>(0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [assessments, setAssessments] = useState<number>(0);

  const fetchStats = async (uid: string) => {
    try {
      const response = await fetch(`/api/user/stats?uid=${uid}`);
      if (response.ok) {
        const stats = await response.json();
        setStudyHours(stats.studyHours ?? 0.0);
        setMasteryIndex(stats.masteryIndex ?? 0);
        setDailyTasks(stats.dailyTasks || []);
        setAssessments(stats.quizzesCleared !== undefined ? stats.quizzesCleared : (stats.assessmentsCleared ?? 0));
      } else {
        console.error("Failed to fetch user stats in UserContext:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching stats in UserContext:", error);
    }
  };

  const refreshData = async () => {
    if (currentUser) {
      await fetchStats(currentUser.uid);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchStats(user.uid);
      } else {
        // Reset stats on sign out
        setStudyHours(0.0);
        setMasteryIndex(0);
        setDailyTasks([]);
        setAssessments(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user: currentUser,
        loading,
        studyHours,
        masteryIndex,
        weeklyStudyHours: studyHours,
        overallMasteryIndex: masteryIndex,
        dailyTasks,
        assessments,
        refreshData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
