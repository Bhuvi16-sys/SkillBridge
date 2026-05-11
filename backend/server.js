import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Client in backend Express
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint (friendly HTML dashboard)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StudyApp Backend API</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #0f172a;
          color: #f1f5f9;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .card {
          background: #1e293b;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
          border: 1px solid #334155;
        }
        h1 {
          color: #38bdf8;
          margin-bottom: 10px;
          font-size: 2.5rem;
        }
        p {
          color: #94a3b8;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .endpoints {
          text-align: left;
          background: #0f172a;
          padding: 15px;
          border-radius: 8px;
          font-family: monospace;
          margin-bottom: 30px;
        }
        .endpoint {
          margin: 5px 0;
        }
        .method {
          color: #10b981;
          font-weight: bold;
          margin-right: 10px;
        }
        .btn {
          display: inline-block;
          background: #38bdf8;
          color: #0f172a;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          transition: background 0.2s;
        }
        .btn:hover {
          background: #0ea5e9;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>SkillBridge Backend</h1>
        <p>Your API Gateway is online, configured, and serving AI-powered modules and customized study routines.</p>
        <div class="endpoints">
          <div class="endpoint"><span class="method">GET</span> /health</div>
          <div class="endpoint"><span class="method">POST</span> /api/chat</div>
          <div class="endpoint"><span class="method">POST</span> /api/gemini/suggestions</div>
        </div>
        <a href="/health" class="btn">Check Server Health</a>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "StudyApp Backend API" });
});

/**
 * GET /api/user/stats
 * Fetches user statistics from Firestore strictly by UID
 */
app.get("/api/user/stats", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) {
      return res.status(400).json({ error: "Missing uid query parameter." });
    }

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const snapData = snap.data();
      return res.json({
        weeklyHours: snapData.weeklyHours !== undefined ? snapData.weeklyHours : (snapData.studyHours ?? 0.0),
        studyHours: snapData.studyHours ?? 0.0,
        masteryIndex: snapData.masteryIndex ?? 0,
        quizzesCleared: snapData.quizzesCleared !== undefined ? snapData.quizzesCleared : (snapData.assessmentsCleared ?? 0),
        streakCount: snapData.streakCount !== undefined ? snapData.streakCount : (snapData.streak ?? 0),
        dailyTasks: snapData.dailyTasks || [],
        level: snapData.level ?? 1,
        xp: snapData.xp ?? 0,
        totalXpNeeded: snapData.totalXpNeeded ?? 1000,
        claimedDaily: snapData.claimedDaily ?? false,
        name: snapData.fullName || snapData.name || "SkillBridge User"
      });
    } else {
      return res.status(404).json({ error: "User stats not found." });
    }
  } catch (error) {
    console.error("Error in getUserStats API:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/user/stats/update
 * Increments study hours and awards mastery strictly following RESTful specs
 */
app.post("/api/user/stats/update", async (req, res) => {
  try {
    const { uid, hours } = req.body;
    if (!uid || hours === undefined) {
      return res.status(400).json({ error: "Missing uid or hours in request body." });
    }

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const snapData = snap.data();
      const currentWeeklyHours = snapData.weeklyHours !== undefined ? snapData.weeklyHours : (snapData.studyHours ?? 0.0);
      const currentStudyHours = snapData.studyHours ?? 0.0;
      const currentMasteryIndex = snapData.masteryIndex ?? 0;

      const newWeeklyHours = parseFloat((currentWeeklyHours + hours).toFixed(2));
      const newStudyHours = parseFloat((currentStudyHours + hours).toFixed(2));
      
      // Award mastery index growth as well (3% per hour)
      const newMasteryIndex = Math.min(100, currentMasteryIndex + Math.round(hours * 3));

      await updateDoc(userRef, {
        weeklyHours: newWeeklyHours,
        studyHours: newStudyHours,
        masteryIndex: newMasteryIndex
      });

      return res.json({
        success: true,
        weeklyHours: newWeeklyHours,
        studyHours: newStudyHours,
        masteryIndex: newMasteryIndex
      });
    } else {
      return res.status(404).json({ error: "User profile not found." });
    }
  } catch (error) {
    console.error("Error in updateUserStats API:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat
 * Handles all AI actions: chat, simplify, quiz, solve, explain, recoveryPlan
 */
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY=your_key in backend/.env",
      });
    }

    const { action, payload } = req.body;
    if (!action || !payload) {
      return res.status(400).json({ error: "Missing action or payload in request body." });
    }

    let prompt = "";
    let systemInstruction = "";
    let responseMimeType = "text/plain";

    if (action === "chat") {
      systemInstruction = `You are SkillBridge AI, a helpful, elite, and highly encouraging educational assistant. 
Your goal is to help students learn software engineering, algorithms, data structures, and computer science concepts.
Keep responses concise, clear, and structured with GitHub-flavored markdown. If code is provided, keep it elegant with comments.`;
      
      const chatHistory = payload.messages || [];
      const trace = chatHistory.map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
      prompt = `${trace}\nAssistant:`;

    } else if (action === "simplify") {
      systemInstruction = "You are an expert educator. Your task is to explain complex technical concepts or algorithms using incredibly simple, vivid, and memorable everyday analogies.";
      prompt = `Simplify the following technical context with an everyday real-world analogy. Keep it structured in markdown. Highlight what the common mistake represents in the analogy:
      
Context:
${payload.context}`;

    } else if (action === "quiz") {
      responseMimeType = "application/json";
      systemInstruction = "You are a software engineering technical interviewer. Generate multiple choice quiz questions in valid JSON format. Follow the requested JSON schema exactly.";
      prompt = `Generate a 2-question technical multiple-choice diagnostic quiz in JSON format based on this technical topic: "${payload.topic}".
      
You MUST output the JSON matching this TypeScript schema exactly with no other surrounding text:
{
  "title": "Topic Quiz Title",
  "questions": [
    {
      "id": 1,
      "text": "The question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIdx": 0,
      "explanation": "A detailed explanation of why this option is correct and why others are wrong."
    }
  ]
}`;

    } else if (action === "solve") {
      responseMimeType = "application/json";
      systemInstruction = "You are a compiler and runtime debugger assistant. Analyze code blocks and terminal logs to pinpoint and resolve bugs. Follow the requested JSON schema exactly.";
      prompt = `Analyze this ${payload.language} code block and its corresponding terminal error trace:
      
Source Code:
${payload.code}

Terminal Error Log:
${payload.error || "No explicit terminal logs provided."}

Detect the bug and output a JSON object matching this TypeScript schema exactly:
{
  "topic": "Brief description of the bug category",
  "errorReason": "Deep diagnostic of why this bug is happening (e.g. recursion stack overflow, memory leaks, sorting edge cases)",
  "linesAffected": "Specify the line numbers or functions affected",
  "fixDescription": "Explanation of how to fix the bug",
  "codeFix": "The corrected, complete code block ready to run with syntax comments"
}`;

    } else if (action === "explain") {
      responseMimeType = "application/json";
      systemInstruction = "You are a code walkthrough assistant. Break down code blocks sequentially. Highlight asymptotic time and space complexities (Big O). Follow the requested JSON schema exactly.";
      prompt = `Break down this code snippet:
      
${payload.code}

Output a structured sequential breakdown JSON matching this TypeScript schema exactly:
{
  "title": "Descriptive title of what the code does",
  "complexity": "Time: O(...) | Space: O(...)",
  "breakdown": [
    {
      "line": "Line content or function signature",
      "desc": "Explanation of what this line does in simple terms"
    }
  ]
}`;

    } else if (action === "recoveryPlan") {
      responseMimeType = "application/json";
      systemInstruction = "You are an elite, adaptive educational curriculum planner. Create customized, hyper-targeted 3-step action plans to help a student master a technical concept they are struggling with. Follow the requested JSON schema exactly.";
      prompt = `The student is struggling with the topic: "${payload.topic}". 
Generate an actionable 3-step study recovery plan in JSON format. Each step represents a concrete daily study goal they can complete.

Each goal MUST have:
1. "title": A short, motivating, highly specific action (e.g., "Review AVL tree root rotation math", "Practice 2 BFS grid traversal challenges")
2. "duration": estimated time (e.g. "25 mins", "40 mins")
3. "priority": "High" or "Medium" or "Low"

You MUST output the JSON matching this TypeScript schema exactly with no other surrounding text:
{
  "topic": "The name of the weak topic",
  "steps": [
    {
      "title": "Specific goal title",
      "duration": "estimated time",
      "priority": "High"
    }
  ]
}`;
    }

    // Model retry configuration
    const versions = ["v1beta"];
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let responseText = "";
    let lastError = "";

    for (const version of versions) {
      if (responseText) break;
      for (const model of models) {
        try {
          const fetchUrl = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
          
          const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              systemInstruction: systemInstruction
                ? {
                    parts: [
                      {
                        text: systemInstruction,
                      },
                    ],
                  }
                : undefined,
              generationConfig: {
                responseMimeType: responseMimeType,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              responseText = text;
              console.log(`Successfully completed generation using Model: ${model} (${version})`);
              break;
            }
          } else {
            const errBody = await response.text();
            console.warn(`Model ${model} in API ${version} returned status ${response.status}: `, errBody);
            lastError = errBody;
          }
        } catch (fetchErr) {
          console.warn(`Fetch failure trying Model ${model} on ${version}: `, fetchErr.message);
          lastError = fetchErr.message;
        }
      }
    }

    if (!responseText) {
      console.error("All Gemini API models and versions failed to resolve: ", lastError);
      return res.status(500).json({
        error: `Gemini API Model Configuration issue. Details: ${lastError}`,
      });
    }

    // Parse JSON if needed
    if (responseMimeType === "application/json") {
      try {
        const parsedJson = JSON.parse(responseText.trim());
        return res.json(parsedJson);
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON response: ", responseText);
        return res.status(500).json({
          error: "Gemini did not return valid JSON. Please try again.",
        });
      }
    }

    // Default: return text (for chat & simplify actions)
    return res.json({ text: responseText });
  } catch (error) {
    console.error("Internal API Handler Error: ", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

/**
 * POST /api/gemini/suggestions
 * Generates personalized study tips
 */
app.post("/api/gemini/suggestions", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        tip: "Keep practicing! Consistently spending study hours on your identified weak topics is the fastest path to expanding your overall mastery score and unlocking advanced curriculum nodes.",
      });
    }

    const { masteryIndex, weakTopics } = req.body;

    const topicsList = Array.isArray(weakTopics) && weakTopics.length > 0
      ? weakTopics.map((topic) => typeof topic === "string" ? topic : (topic.name || "")).filter(Boolean).join(", ")
      : "general computer science core structures";

    const prompt = `You are an elite, encouraging AI Study Coach on SkillBridge. Generate a highly personalized 2-sentence study tip for a student who currently has a mastery index of ${masteryIndex || 0}% and has identified the following weak topics: ${topicsList}. Make it specific, actionable, encouraging, and concise. You MUST output exactly 2 sentences and absolutely nothing else.`;

    // Try multiple models and versions in a robust fallback loop
    const versions = ["v1beta"];
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let responseText = "";
    let lastError = "";

    for (const version of versions) {
      if (responseText) break;
      for (const model of models) {
        try {
          const fetchUrl = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
          
          const response = await fetch(fetchUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              responseText = text;
              console.log(`Successfully completed suggestions generation using Model: ${model} (${version})`);
              break;
            }
          } else {
            const errBody = await response.text();
            lastError = errBody;
          }
        } catch (fetchErr) {
          lastError = fetchErr.message;
        }
      }
    }

    if (!responseText) {
      throw new Error(`All Gemini API models failed for suggestions. Details: ${lastError}`);
    }

    return res.json({ tip: responseText });
  } catch (error) {
    console.error("Gemini API Suggestions Route Error:", error);
    return res.json({
      tip: "Fantastic study streak! Ensure you log your daily study session and tackle at least one diagnostic topic quiz today to lock in your mastery curve gains.",
    });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 StudyApp Backend server is running on http://localhost:${PORT}`);
  console.log(`- Health Check: http://localhost:${PORT}/health`);
  console.log(`- API Chat Route: http://localhost:${PORT}/api/chat`);
  console.log(`- API Suggestions Route: http://localhost:${PORT}/api/gemini/suggestions`);
});
