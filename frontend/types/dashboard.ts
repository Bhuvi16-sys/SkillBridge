export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority: "High" | "Medium";
  duration: string;
}

export interface UserStats {
  weeklyHours: number;
  studyHours: number;
  masteryIndex: number;
  quizzesCleared: number;
  streakCount: number;
  dailyTasks: DailyTask[];
  level: number;
  xp: number;
  totalXpNeeded: number;
  claimedDaily: boolean;
  name: string;
}
