import { db } from "./firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { SkillItem, ProjectItem, GoalItem, RepetitionItem } from "@/context/DashboardContext";

// Type definitions matching the Firestore subcollection items
export interface WeakTopicItem {
  name: string;
  accuracy: number;
  totalQs: number;
  severity: "Critical" | "High" | "Medium" | "Low";
}

export interface ResourceSuggestionItem {
  type: "Conceptual" | "Adaptive Quiz" | "Interactive Code" | "Practice Challenge" | "Standard Study";
  title: string;
  description: string;
  duration: string;
  linkText: string;
  linkUrl: string;
}

// Type definition for a complete User Starter Pack
export interface StudentCurriculumTemplate {
  studyHours: number;
  masteryIndex: number;
  assessmentsCleared: number;
  skills: Omit<SkillItem, "id">[];
  projects: Omit<ProjectItem, "id">[];
  goals: Omit<GoalItem, "id">[];
  repetitionQueue: Omit<RepetitionItem, "id">[];
  weakTopics: WeakTopicItem[];
  aiSuggestions: ResourceSuggestionItem[];
}

// Curated starter templates initialized at GROUND-ZERO (0.0 progress) for authentic real-time learning tracking
export const SEED_TEMPLATES: Record<string, StudentCurriculumTemplate> = {
  compsci: {
    studyHours: 0.0,
    masteryIndex: 0,
    assessmentsCleared: 0,
    skills: [
      { name: "TypeScript", category: "Language", level: "Learning", pct: 10 },
      { name: "Data Structures", category: "Core CS", level: "Learning", pct: 10 },
      { name: "Recursion Basics", category: "Algorithms", level: "Learning", pct: 10 },
    ],
    projects: [
      {
        title: "Dynamic BFS Pathfinding Simulator",
        tech: ["TypeScript", "React", "Algorithms"],
        description: "Visualize BFS & DFS shortest-path grid routing in real-time.",
        link: "#",
      }
    ],
    goals: [
      { title: "Understand Call-Stack and memory stack overhead", duration: "30 mins", completed: false, priority: "High" },
      { title: "Solve 2 array allocation quiz questions", duration: "15 mins", completed: false, priority: "Medium" }
    ],
    repetitionQueue: [
      { title: "Recursion base case vs infinite call loops", daysLeft: 1, difficulty: null },
      { title: "Adjacency list memory efficiency vs matrices", daysLeft: 2, difficulty: null }
    ],
    weakTopics: [
      { name: "Dynamic Programming", accuracy: 10, totalQs: 0, severity: "Critical" },
      { name: "Graph Traversals (BFS/DFS)", accuracy: 10, totalQs: 0, severity: "High" },
      { name: "Recursion & Backtracking", accuracy: 10, totalQs: 0, severity: "Medium" },
    ],
    aiSuggestions: [
      {
        type: "Conceptual",
        title: "Memoization vs Tabulation: Top-Down DP Visualized",
        description: "Unlock Gemini API interactive diagrams detailing subproblem overlays, call-stack executions, and temporal complexity mapping.",
        duration: "15 min read",
        linkText: "Open Resource",
        linkUrl: "#"
      },
      {
        type: "Adaptive Quiz",
        title: "Graph Traversal Traps: DFS Call Stacks",
        description: "A personalized diagnostic quiz targeting BFS structures, adjacency lists, topological cycles, and custom recursion nodes.",
        duration: "10 Questions",
        linkText: "Start Diagnostic",
        linkUrl: "#"
      },
      {
        type: "Interactive Code",
        title: "Backtracking: Maze Solving Pathfinders",
        description: "Examine recursion backtracking trees with interactive visual debug step-ins. Inspect stack frame states in real-time.",
        duration: "Intermediate",
        linkText: "Launch Sandbox",
        linkUrl: "#"
      }
    ]
  },
  datasci: {
    studyHours: 0.0,
    masteryIndex: 0,
    assessmentsCleared: 0,
    skills: [
      { name: "Python", category: "Language", level: "Learning", pct: 10 },
      { name: "Pandas & NumPy", category: "Libraries", level: "Learning", pct: 10 },
      { name: "Data Aggregation", category: "Analytics", level: "Learning", pct: 10 },
    ],
    projects: [
      {
        title: "Predictive Student Grade Miner",
        tech: ["Python", "Jupyter", "Recharts"],
        description: "Train multivariate regression trees to forecast final grading curves based on study hours.",
        link: "#",
      }
    ],
    goals: [
      { title: "Filter dataset with dynamic pandas query filters", duration: "40 mins", completed: false, priority: "High" },
      { title: "Read exploratory data analysis textbook introduction", duration: "25 mins", completed: false, priority: "Medium" }
    ],
    repetitionQueue: [
      { title: "Standard deviation vs variance calculations", daysLeft: 1, difficulty: null },
      { title: "Handling null dataset fields with pandas fillna", daysLeft: 2, difficulty: null }
    ],
    weakTopics: [
      { name: "Multivariate Regression", accuracy: 10, totalQs: 0, severity: "Critical" },
      { name: "Pandas Index Filtering", accuracy: 10, totalQs: 0, severity: "High" },
      { name: "Exploratory Data Analysis", accuracy: 10, totalQs: 0, severity: "Medium" },
    ],
    aiSuggestions: [
      {
        type: "Conceptual",
        title: "Gradient Descent visual explanation",
        description: "Learn how linear regression minimizes mean squared errors with learning rates and vector calculations.",
        duration: "20 min read",
        linkText: "Open Resource",
        linkUrl: "#"
      },
      {
        type: "Adaptive Quiz",
        title: "Pandas Axis manipulation parameters",
        description: "Quiz yourself on axis=0 vs axis=1 manipulations inside dataframes.",
        duration: "8 Questions",
        linkText: "Start Diagnostic",
        linkUrl: "#"
      },
      {
        type: "Interactive Code",
        title: "Data cleansing outlier pipelines",
        description: "Implement standard deviation and z-score anomaly filters in Python.",
        duration: "Beginner",
        linkText: "Launch Sandbox",
        linkUrl: "#"
      }
    ]
  },
  system_design: {
    studyHours: 0.0,
    masteryIndex: 0,
    assessmentsCleared: 0,
    skills: [
      { name: "System Scalability", category: "Core CS", level: "Learning", pct: 10 },
      { name: "Database Sharding", category: "Databases", level: "Learning", pct: 10 },
      { name: "HTTP Caching & CDN", category: "Networking", level: "Learning", pct: 10 },
    ],
    projects: [
      {
        title: "Simulated Round-Robin Load Balancer",
        tech: ["Next.js", "Visual Canvas", "Tailwind"],
        description: "Simulate edge networking routes and server loads using Dijkstra algorithm nodes.",
        link: "#",
      }
    ],
    goals: [
      { title: "Understand consistent hashing ring partition protocols", duration: "50 mins", completed: false, priority: "High" },
      { title: "Map standard CDN Edge caching header policies", duration: "30 mins", completed: false, priority: "Medium" }
    ],
    repetitionQueue: [
      { title: "Horizontal vs vertical scaling database trade-offs", daysLeft: 1, difficulty: null },
      { title: "Cache invalidation write-through vs write-back", daysLeft: 2, difficulty: null }
    ],
    weakTopics: [
      { name: "Consistent Hashing Protocol", accuracy: 10, totalQs: 0, severity: "Critical" },
      { name: "Cache Eviction (LRU/LFU)", accuracy: 10, totalQs: 0, severity: "High" },
      { name: "Message Queues & Broker Fanout", accuracy: 10, totalQs: 0, severity: "Medium" },
    ],
    aiSuggestions: [
      {
        type: "Conceptual",
        title: "Microservice Load Balancing strategies",
        description: "Walkthrough of reverse proxy load balancers and Consistent Hashing rings.",
        duration: "25 min read",
        linkText: "Open Resource",
        linkUrl: "#"
      },
      {
        type: "Adaptive Quiz",
        title: "Redis Eviction policies breakdown",
        description: "Challenge your architectural knowledge of volatile-lru, allkeys-lru, and volatile-ttl caches.",
        duration: "12 Questions",
        linkText: "Start Diagnostic",
        linkUrl: "#"
      },
      {
        type: "Interactive Code",
        title: "Simulating a Round-Robin Edge Balancer",
        description: "Explore simulated networking congestion curves and request rerouting logs.",
        duration: "Advanced",
        linkText: "Launch Sandbox",
        linkUrl: "#"
      }
    ]
  },
  math: {
    studyHours: 0.0,
    masteryIndex: 0,
    assessmentsCleared: 0,
    skills: [
      { name: "Set Theory", category: "Discrete Math", level: "Learning", pct: 10 },
      { name: "Combinatorics", category: "Discrete Math", level: "Learning", pct: 10 },
      { name: "Boolean Algebra", category: "Logic", level: "Learning", pct: 10 },
    ],
    projects: [
      {
        title: "Dynamic Truth Table Compiler",
        tech: ["TypeScript", "Parsing", "Logic"],
        description: "An engine parsing mathematical logical statements into clean interactive truth tables.",
        link: "#",
      }
    ],
    goals: [
      { title: "Verify de Morgan's Laws for digital logic gates", duration: "45 mins", completed: false, priority: "High" },
      { title: "Review prime factorization modulo algebra basics", duration: "20 mins", completed: false, priority: "Medium" }
    ],
    repetitionQueue: [
      { title: "Permutations vs combinations formula criteria", daysLeft: 1, difficulty: null },
      { title: "RSA public-key prime number criteria", daysLeft: 2, difficulty: null }
    ],
    weakTopics: [
      { name: "Permutations & Combinations formulas", accuracy: 10, totalQs: 0, severity: "Critical" },
      { name: "Modulo Arithmetic algebra basics", accuracy: 10, totalQs: 0, severity: "High" },
      { name: "de Morgan's gate logic simplifications", accuracy: 10, totalQs: 0, severity: "Medium" },
    ],
    aiSuggestions: [
      {
        type: "Conceptual",
        title: "RSA Cryptography public prime mathematics",
        description: "Visualize modular arithmetic and Euclid's GCD operations behind RSA keys.",
        duration: "30 min read",
        linkText: "Open Resource",
        linkUrl: "#"
      },
      {
        type: "Adaptive Quiz",
        title: "Boolean algebra digital gate operations",
        description: "Test your digital logic simplifications with multiple choice gates.",
        duration: "6 Questions",
        linkText: "Start Diagnostic",
        linkUrl: "#"
      },
      {
        type: "Interactive Code",
        title: "Dynamic Truth Table evaluator sandbox",
        description: "Parse logic strings into full digital logic matrices dynamically.",
        duration: "Intermediate",
        linkText: "Launch Sandbox",
        linkUrl: "#"
      }
    ]
  },
  engineering: {
    studyHours: 0.0,
    masteryIndex: 0,
    assessmentsCleared: 0,
    skills: [
      { name: "Git Version Control", category: "Tools", level: "Learning", pct: 10 },
      { name: "Unit Testing (Jest)", category: "Testing", level: "Learning", pct: 10 },
      { name: "REST API Design", category: "Architecture", level: "Learning", pct: 10 },
    ],
    projects: [
      {
        title: "Automated CI/CD Test Sandbox",
        tech: ["Shell", "Docker", "Next.js"],
        description: "A sandbox environment tracking mock pipeline test build coverage results.",
        link: "#",
      }
    ],
    goals: [
      { title: "Configure Jest unit testing expect/assertion matchers", duration: "35 mins", completed: false, priority: "High" },
      { title: "Practice interactive Git branch merges and conflict resolutions", duration: "20 mins", completed: false, priority: "Medium" }
    ],
    repetitionQueue: [
      { title: "Git rebase vs merge commits selection criteria", daysLeft: 1, difficulty: null },
      { title: "Test Driven Development Red-Green-Refactor sequence", daysLeft: 2, difficulty: null }
    ],
    weakTopics: [
      { name: "Git Rebase conflict resolutions", accuracy: 10, totalQs: 0, severity: "Critical" },
      { name: "TDD Unit Testing assertions (Jest)", accuracy: 10, totalQs: 0, severity: "High" },
      { name: "REST API Endpoint design standards", accuracy: 10, totalQs: 0, severity: "Medium" },
    ],
    aiSuggestions: [
      {
        type: "Conceptual",
        title: "CI/CD automated pipeline build orchestration",
        description: "Deconstruct Docker containers, GitHub Action workflow triggers, and runner caching mechanics.",
        duration: "18 min read",
        linkText: "Open Resource",
        linkUrl: "#"
      },
      {
        type: "Adaptive Quiz",
        title: "TDD Red-Green-Refactor methodologies",
        description: "Quiz yourself on test assertions, mock hooks, and regression testing standards.",
        duration: "10 Questions",
        linkText: "Start Diagnostic",
        linkUrl: "#"
      },
      {
        type: "Interactive Code",
        title: "Jest Mocking: Server Request intercepts",
        description: "Write mock network responses to test client-side network error handlings.",
        duration: "Intermediate",
        linkText: "Launch Sandbox",
        linkUrl: "#"
      }
    ]
  }
};

/**
 * Seeding Routine: Commits a unified batch write to Firestore
 * initializing all core subcollections and template metrics under users/{userId}
 */
export async function seedUserProfile(userId: string, subjectKey: string, fullName: string) {
  const firestoreDb = db;
  if (!firestoreDb) {
    console.warn("⚠️ Firestore DB is not initialized. Skipping profile seeding.");
    return;
  }

  try {
    const template = SEED_TEMPLATES[subjectKey] || SEED_TEMPLATES["compsci"];
    const batch = writeBatch(firestoreDb);

    // 1. Write personalized stats back to the user's main profile document (Starting at absolute 0.0)
    const userRef = doc(firestoreDb, "users", userId);
    batch.update(userRef, {
      studyHours: template.studyHours,
      masteryIndex: template.masteryIndex,
      assessmentsCleared: template.assessmentsCleared,
      readinessScore: 0
    });

    // 2. Seed Skills subcollection
    template.skills.forEach((skill) => {
      const docRef = doc(collection(firestoreDb, "users", userId, "skills"));
      batch.set(docRef, {
        ...skill,
        createdAt: new Date().toISOString()
      });
    });

    // 3. Seed Projects subcollection
    template.projects.forEach((proj) => {
      const docRef = doc(collection(firestoreDb, "users", userId, "projects"));
      batch.set(docRef, {
        ...proj,
        createdAt: new Date().toISOString()
      });
    });

    // 4. Seed Goals subcollection
    template.goals.forEach((goal) => {
      const docRef = doc(collection(firestoreDb, "users", userId, "goals"));
      batch.set(docRef, {
        ...goal,
        createdAt: new Date().toISOString()
      });
    });

    // 5. Seed Spaced Repetition Queue subcollection
    template.repetitionQueue.forEach((rep) => {
      const docRef = doc(collection(firestoreDb, "users", userId, "repetitionQueue"));
      batch.set(docRef, {
        ...rep,
        createdAt: new Date().toISOString()
      });
    });

    // 6. Seed Weak Topics subcollection
    template.weakTopics.forEach((topic) => {
      const docRef = doc(collection(firestoreDb, "users", userId, "weakTopics"));
      batch.set(docRef, {
        ...topic,
        createdAt: new Date().toISOString()
      });
    });

    // 7. Seed AI Suggestions subcollection
    template.aiSuggestions.forEach((suggestion) => {
      const docRef = doc(collection(firestoreDb, "users", userId, "aiSuggestions"));
      batch.set(docRef, {
        ...suggestion,
        createdAt: new Date().toISOString()
      });
    });

    // 8. Seed Welcome Notification subcollection
    const welcomeNotifRef = doc(collection(firestoreDb, "users", userId, "notifications"));
    batch.set(welcomeNotifRef, {
      type: "spaced",
      title: `Welcome to SkillBridge, ${fullName}!`,
      description: `We've prepared your custom curriculum mapping for "${subjectKey}". Start tracking your study progress!`,
      timestamp: "Today",
      read: false,
      createdAt: new Date().toISOString()
    });

    // Commit the entire atomic batch write to Google Cloud
    await batch.commit();
    console.log(`🎉 Successfully seeded dynamic user database for UID: ${userId} (${subjectKey})`);
  } catch (error) {
    console.error("❌ Failed to seed user profile subcollections in Firestore:", error);
  }
}
