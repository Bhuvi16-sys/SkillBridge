"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { DailyTask } from "@/types/dashboard";

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
  logStudyHours: (hours: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [studyHours, setStudyHours] = useState<number>(0.0);
  const [masteryIndex, setMasteryIndex] = useState<number>(0);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [assessments, setAssessments] = useState<number>(0);

  // Deprecated manual refresh logic (no longer needed because of real-time snapshot listeners)
  const refreshData = async () => {
    return Promise.resolve();
  };

  const logStudyHours = async (hours: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch("/api/user/stats/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: currentUser.uid, hours }),
      });
      if (!response.ok) {
        console.error("Failed to log study hours in UserContext:", response.statusText);
      }
    } catch (error) {
      console.error("Error logging study hours in UserContext:", error);
    }
  };

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      // Secure cleanup of any previous snapshot listeners
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        // Establish real-time Firestore synchronization listener
        const userRef = doc(db!, "users", user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const stats = snapshot.data();
            setStudyHours(stats.studyHours ?? 0.0);
            setMasteryIndex(stats.masteryIndex ?? 0);
            setDailyTasks(stats.dailyTasks || []);
            setAssessments(stats.quizzesCleared !== undefined ? stats.quizzesCleared : (stats.assessmentsCleared ?? 0));
          } else {
            console.warn("User stats document snapshot does not exist in Firestore.");
          }
          setLoading(false);
        }, (error) => {
          console.error("Error in real-time stats snapshot listener:", error);
          setLoading(false);
        });
      } else {
        // Clear state on logout
        setStudyHours(0.0);
        setMasteryIndex(0);
        setDailyTasks([]);
        setAssessments(0);
        setLoading(false);
      }
    });

    // Double-cleanup memory-leak prevention hook on unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
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
        logStudyHours,
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
