import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserStats } from "@/types/dashboard";

export function useDashboardData() {
  const { user: firebaseUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<UserStats>({
    weeklyHours: 0.0,
    studyHours: 0.0,
    masteryIndex: 0,
    quizzesCleared: 0,
    streakCount: 0,
    dailyTasks: [],
    level: 1,
    xp: 0,
    totalXpNeeded: 1000,
    claimedDaily: false,
    name: "SkillBridge User"
  });

  const fetchStats = async () => {
    if (!firebaseUser) return;
    try {
      const response = await fetch(`/api/getUserStats?uid=${firebaseUser.uid}`);
      if (response.ok) {
        const stats = await response.json();
        setData(stats);
      } else {
        console.error("Failed to fetch user stats:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching stats from API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      setLoading(true);
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [firebaseUser]);

  const handleLogHours = async (hours: number) => {
    if (!firebaseUser) return;
    try {
      const response = await fetch("/api/updateUserStats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: firebaseUser.uid, hours }),
      });
      if (response.ok) {
        // Trigger a re-fetch of the data so the stats & mastery bar update in real-time
        await fetchStats();
      } else {
        console.error("Failed to update user stats:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating stats via API:", error);
    }
  };

  return {
    loading,
    data,
    handleLogHours,
    refreshData: fetchStats
  };
}
