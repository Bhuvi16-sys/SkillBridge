import { FirestoreDataConverter, QueryDocumentSnapshot, DocumentData, WithFieldValue } from "firebase/firestore";

/**
 * 1. CORE USER SCHEMAS (Auth & Stats mapping)
 * Supported Roles: "student" | "company" | "recruiter"
 */
export interface UserProfile {
  uid: string;
  email: string;
  role: "student" | "company" | "recruiter";
  fullName: string;
  createdAt: string;
  updatedAt: string;
  profilePictureUrl?: string;
  
  // Student specific stats (Dashboard, Analytics, Profile, Assistant)
  institution?: string;
  gradeLevel?: string;
  subjectOfInterest?: string;
  bio?: string;
  rank?: number;
  totalScore?: number;
  
  level?: number;
  xp?: number;
  totalXpNeeded?: number;
  streak?: number;
  claimedDaily?: boolean;
  
  studyHours?: number;
  masteryIndex?: number;
  assessmentsCleared?: number;
  readinessScore?: number;

  // Onboarding fields
  onboardingCompleted?: boolean;
  skillsToLearn?: string[];
  interests?: string[];

  // Company / Recruiter specific details
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;

  // Synced resume details
  resumeFileName?: string;
  resumeUrl?: string;
  resumeUploadedAt?: string;
}

export const userProfileConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore(user: WithFieldValue<UserProfile>): DocumentData {
    return {
      uid: user.uid,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profilePictureUrl: user.profilePictureUrl ?? "",
      
      // Student Fields
      institution: user.institution ?? "",
      gradeLevel: user.gradeLevel ?? "",
      subjectOfInterest: user.subjectOfInterest ?? "General Study",
      bio: user.bio ?? "",
      level: user.level ?? 1,
      xp: user.xp ?? 0,
      totalXpNeeded: user.totalXpNeeded ?? 1000,
      streak: user.streak ?? 0,
      claimedDaily: user.claimedDaily ?? false,
      studyHours: user.studyHours ?? 0.0,
      masteryIndex: user.masteryIndex ?? 0,
      assessmentsCleared: user.assessmentsCleared ?? 0,
      readinessScore: user.readinessScore ?? 0,
      rank: user.rank ?? 0,
      totalScore: user.totalScore ?? 0,

      // Onboarding Fields
      onboardingCompleted: user.onboardingCompleted ?? false,
      skillsToLearn: user.skillsToLearn ?? [],
      interests: user.interests ?? [],

      // Recruiter / Corporate Fields
      companyName: user.companyName ?? "",
      industry: user.industry ?? "",
      companySize: user.companySize ?? "",
      website: user.website ?? "",

      // Synced resume fields
      resumeFileName: user.resumeFileName ?? "",
      resumeUrl: user.resumeUrl ?? "",
      resumeUploadedAt: user.resumeUploadedAt ?? ""
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): UserProfile {
    const data = snapshot.data(options)!;
    return {
      uid: data.uid,
      email: data.email,
      role: data.role,
      fullName: data.fullName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      profilePictureUrl: data.profilePictureUrl ?? "",
      
      institution: data.institution,
      gradeLevel: data.gradeLevel,
      subjectOfInterest: data.subjectOfInterest,
      bio: data.bio,
      level: data.level,
      xp: data.xp,
      totalXpNeeded: data.totalXpNeeded,
      streak: data.streak,
      claimedDaily: data.claimedDaily,
      studyHours: data.studyHours,
      masteryIndex: data.masteryIndex,
      assessmentsCleared: data.assessmentsCleared,
      readinessScore: data.readinessScore,
      rank: data.rank ?? 0,
      totalScore: data.totalScore ?? 0,

      // Onboarding Fields
      onboardingCompleted: data.onboardingCompleted ?? false,
      skillsToLearn: data.skillsToLearn || [],
      interests: data.interests || [],

      companyName: data.companyName,
      industry: data.industry,
      companySize: data.companySize,
      website: data.website,

      // Synced resume fields
      resumeFileName: data.resumeFileName,
      resumeUrl: data.resumeUrl,
      resumeUploadedAt: data.resumeUploadedAt
    };
  }
};


/**
 * 1.5 COMPANY PROFILE SCHEMA
 */
export interface CompanyProfile {
  companyName: string;
  industry: string;
  recruiterName: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 2. RECRUITER PROFILE SCHEMA
 * Equivalent to: mongoose.model("RecruiterProfile", recruiterProfileSchema)
 */
export interface RecruiterProfile {
  userId: string;
  companyName: string;
  companyDescription?: string;
  hiringRoles: string[];
  createdAt: string;
  updatedAt: string;
}

export const recruiterProfileConverter: FirestoreDataConverter<RecruiterProfile> = {
  toFirestore(profile: WithFieldValue<RecruiterProfile>): DocumentData {
    return {
      userId: profile.userId,
      companyName: profile.companyName,
      companyDescription: profile.companyDescription ?? "",
      hiringRoles: profile.hiringRoles ?? [],
      createdAt: profile.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): RecruiterProfile {
    const data = snapshot.data(options)!;
    return {
      userId: data.userId,
      companyName: data.companyName,
      companyDescription: data.companyDescription,
      hiringRoles: data.hiringRoles || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
};


/**
 * 3. PLANNER SCHEMAS (Goals Subcollection: users/{userId}/goals)
 */
export interface GoalItem {
  id?: string;
  title: string;
  category: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export const goalConverter: FirestoreDataConverter<GoalItem> = {
  toFirestore(goal: WithFieldValue<GoalItem>): DocumentData {
    return {
      title: goal.title,
      category: goal.category ?? "General",
      dueDate: goal.dueDate,
      completed: goal.completed ?? false,
      createdAt: goal.createdAt || new Date().toISOString()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): GoalItem {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      title: data.title,
      category: data.category,
      dueDate: data.dueDate,
      completed: data.completed,
      createdAt: data.createdAt
    };
  }
};


/**
 * 4. ASSISTANT SCHEMAS - WEAK TOPICS & SPACED REPETITION
 * Subcollections: users/{userId}/weakTopics  AND  users/{userId}/repetitionQueue
 */
export interface WeakTopicItem {
  id?: string;
  name: string;
  score: number;       // Average diagnostic score (0-100)
  severity: "High" | "Medium" | "Low";
  totalQuizzes: number;
  updatedAt: string;
}

export interface RepetitionItem {
  id?: string;
  topicName: string;
  intervalDays: number;
  nextReview: string;  // ISO Date string
  easeFactor: number;
  reviewedCount: number;
}

export const weakTopicConverter: FirestoreDataConverter<WeakTopicItem> = {
  toFirestore(topic: WithFieldValue<WeakTopicItem>): DocumentData {
    return {
      name: topic.name,
      score: topic.score,
      severity: topic.severity ?? "Medium",
      totalQuizzes: topic.totalQuizzes ?? 1,
      updatedAt: new Date().toISOString()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): WeakTopicItem {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      name: data.name,
      score: data.score,
      severity: data.severity,
      totalQuizzes: data.totalQuizzes,
      updatedAt: data.updatedAt
    };
  }
};

export const repetitionConverter: FirestoreDataConverter<RepetitionItem> = {
  toFirestore(item: WithFieldValue<RepetitionItem>): DocumentData {
    return {
      topicName: item.topicName,
      intervalDays: item.intervalDays ?? 1,
      nextReview: item.nextReview,
      easeFactor: item.easeFactor ?? 2.5,
      reviewedCount: item.reviewedCount ?? 0
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): RepetitionItem {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      topicName: data.topicName,
      intervalDays: data.intervalDays,
      nextReview: data.nextReview,
      easeFactor: data.easeFactor,
      reviewedCount: data.reviewedCount
    };
  }
};


/**
 * 5. ANALYTICS & PROFILE SCHEMAS (Skills & Projects)
 * Subcollections: users/{userId}/skills  AND  users/{userId}/projects
 */
export interface SkillItem {
  id?: string;
  name: string;
  level: number;
  xp: number;
  category: string;
}

export interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  gitUrl?: string;
  demoUrl?: string;
  tags: string[];
  createdAt: string;
}

export const skillConverter: FirestoreDataConverter<SkillItem> = {
  toFirestore(skill: WithFieldValue<SkillItem>): DocumentData {
    return {
      name: skill.name,
      level: skill.level ?? 1,
      xp: skill.xp ?? 0,
      category: skill.category ?? "General"
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): SkillItem {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      name: data.name,
      level: data.level,
      xp: data.xp,
      category: data.category
    };
  }
};

export const projectConverter: FirestoreDataConverter<ProjectItem> = {
  toFirestore(proj: WithFieldValue<ProjectItem>): DocumentData {
    return {
      title: proj.title,
      description: proj.description,
      gitUrl: proj.gitUrl ?? "",
      demoUrl: proj.demoUrl ?? "",
      tags: proj.tags ?? [],
      createdAt: proj.createdAt || new Date().toISOString()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): ProjectItem {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      title: data.title,
      description: data.description,
      gitUrl: data.gitUrl,
      demoUrl: data.demoUrl,
      tags: data.tags || [],
      createdAt: data.createdAt
    };
  }
};


/**
 * 6. NOTIFICATIONS SCHEMA
 * Subcollection: users/{userId}/notifications
 */
export interface NotificationItem {
  id?: string;
  type: "milestone" | "spaced" | "alert" | "system";
  title: string;
  description: string;
  read: boolean;
  timestamp: string;  // Human readable string (e.g., "Just now")
  createdAt: string;  // ISO Date string for sorting
}

export const notificationConverter: FirestoreDataConverter<NotificationItem> = {
  toFirestore(notif: WithFieldValue<NotificationItem>): DocumentData {
    return {
      type: notif.type ?? "system",
      title: notif.title,
      description: notif.description,
      read: notif.read ?? false,
      timestamp: notif.timestamp ?? "Just now",
      createdAt: notif.createdAt || new Date().toISOString()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options): NotificationItem {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      type: data.type,
      title: data.title,
      description: data.description,
      read: data.read,
      timestamp: data.timestamp,
      createdAt: data.createdAt
    };
  }
};
