import { useUser } from "@/context/UserContext";
import { UserStats } from "@/types/dashboard";

export function useDashboardData() {
  const stats = useUser();

  const data: UserStats = {
    weeklyHours: stats.studyHours,
    studyHours: stats.studyHours,
    masteryIndex: stats.masteryIndex,
    quizzesCleared: stats.assessments,
    streakCount: 0, // Fallback/default profile statistics
    dailyTasks: stats.dailyTasks,
    level: 1,
    xp: 0,
    totalXpNeeded: 1000,
    claimedDaily: false,
    name: stats.user?.displayName || "SkillBridge User"
  };

  return {
    loading: stats.loading,
    data,
    handleLogHours: stats.logStudyHours,
    refreshData: stats.refreshData
  };
}
