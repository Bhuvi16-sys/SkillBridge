import { useUser } from "@/context/UserContext";
import { UserStats } from "@/types/dashboard";

export function useDashboardData() {
  const stats = useUser();

  const data: UserStats = {
    weeklyHours: stats.studyHours,
    studyHours: stats.studyHours,
    masteryIndex: stats.masteryIndex,
    quizzesCleared: stats.assessments,
    streakCount: stats.userProfile?.streak ?? 0,
    dailyTasks: stats.dailyTasks,
    level: stats.userProfile?.level ?? 1,
    xp: stats.userProfile?.xp ?? 0,
    totalXpNeeded: stats.userProfile?.totalXpNeeded ?? 1000,
    claimedDaily: stats.userProfile?.claimedDaily ?? false,
    name: stats.userProfile?.fullName || stats.user?.displayName || "SkillBridge User"
  };

  return {
    loading: stats.loading,
    data,
    handleLogHours: stats.logStudyHours,
    refreshData: stats.refreshData
  };
}
