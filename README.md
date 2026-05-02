# AI STUDY BUDDY

## 📋 OVERVIEW
AI Study Buddy is a full-stack web application designed
to help students organise, retain, and test their knowledge.

Built with a Node.js/Express REST API backend connected to a Microsoft SQL Server database,
and a plain HTML/CSS/JS frontend.

The AI layer uses a mock engine that delivers quizzes, flashcards, and chat responses reliably out of the box, with the
openai package wired in for future live upgrades.

---

## ✨ HIGHLIGHTS
★  AI — Currenlty using mock engine works instantly but credit Api key can be integrated
★  JWT-protected routes — all data is scoped strictly per user
★  bcrypt password hashing — passwords never stored in plain text
★  Spaced repetition flashcards — review dates shift based on recall
★  Full CRUD notes — create, read, update, delete with folder organisation
★  Study planner — deadline-sorted plans with status tracking
★  7-day progress history — tracks study hours and tasks per day
★  Dark / light theme toggle — persisted in localStorage across sessions
★  Single-page feel — all screens share one app.js controller 

---

## 🗂️ FEATURES

```
FEATURES/
├── auth/
│   ├── Register          — Username, email, bcrypt-hashed password, JWT issued
│   └── Login             — Credential check + JWT for session continuity
│
├── notes/
│   ├── Create Note       — Title, content, optional folder assignment
│   ├── View All Notes    — Ordered by latest, filtered per user
│   ├── Update Note       — Edit title, content, or folder
│   └── Delete Note       — Hard delete, user-scoped
│
├── ai-engine/
│   ├── AI Chat           —  Mock conversational assistant
│   ├── Chat History      — Stored per user, ordered chronologically
│   ├── Quiz Generator    — 5 MCQ questions saved to DB + returned to UI
│   ├── Flashcard Gen     — 5 study term cards with spaced repetition dates
│   └── Flashcard Review  — PATCH endpoint updates next_review_date per result
│
├── planner/
│   ├── Create Plan       — Title, subject, description, deadline
│   ├── View Plans        — Sorted by deadline ASC
│   ├── Update Status     — Mark as pending / in-progress / completed
│   └── Delete Plan       — Remove a study plan entry
│
├── progress/
│   ├── Log Progress      — Upserts daily row: hours + tasks (cumulative)
│   └── View History      — Last 7 days of study stats
│
├── dashboard/
│   └── Summary View      — Aggregated stats for the logged-in user
│
└── frontend/
    ├── index.html        — Login & Register screen
    ├── dashboard.html    — Stats overview
    ├── notes.html        — Notes editor
    ├── chat.html         — AI chat interface
    ├── flashcards.html   — Flashcard review UI
    ├── quiz.html         — Quiz MCQ screen
    ├── planner.html      — Study planner board
    └── styles.css        — Shared theme with dark/light CSS variables
```

---

## 🎯 OBJECTIVES
[PRIMARY]
  > Build a complete, usable study tool with real auth and data persistence.
  > Integrate an AI layer for quiz and flashcard generation with a reliable fallback.
  > Demonstrate a clean REST API design:
      route → middleware → controller → model

[SECONDARY]
  > Apply JWT-based stateless auth across all protected endpoints.
  > Implement spaced repetition logic for flashcard review scheduling.
  > Track cumulative daily progress with upsert logic.
  > Deliver a responsive, theme-aware UI without a frontend framework.

[LEARNING GOALS]
  > Practice Express.js middleware chaining and error handling.
  > Use parameterised SQL queries to prevent injection attacks.
  > Work with async/await patterns throughout a full-stack JS project.
  > Manage environment config with dotenv for deployment flexibility.

---

## 🏗️ ARCHITECTURE

```
BROWSER  (HTML + CSS + app.js)
        │
        │  fetch() with Bearer JWT in headers
        ▼
┌──────────────────────────────────────────┐
│             Express Server               │
│               server.js                 │
│  Serves static frontend + mounts routes  │
└───────┬──────────────────────────────────┘
        │
        ├── /api/auth      →  authController
        │     register()      login()
        │
        ├── /api/notes     →  notesController     ← auth middleware
        │     CRUD via Note model
        │
        ├── /api/ai        →  aiController        ← auth middleware
        │     chat · history · quiz
        │     flashcards · review
        │
        ├── /api/planner   →  plannerController   ← auth middleware
        │     CRUD + status update
        │
        ├── /api/progress  →  progressController  ← auth middleware
        │     upsert daily row · 7-day history
        │
        └── /api/dashboard →  dashboardController ← auth middleware
              aggregated summary stats
                        │
                        ▼
              ┌──────────────────┐
              │  Microsoft SQL   │
              │  Server (mssql)  │
              │  poolPromise     │
              │                  │
              │  tables:         │
              │   users          │
              │   notes          │
              │   study_plans    │
              │   progress       │
              │   quizzes        │
              │   quiz_questions │
              │   flashcards     │
              │   chats          │
              └──────────────────┘
```

---

## 💡 CONCEPTS

BACKEND
─────────────────
  [✓] REST API Design       — Separate route files per domain, correct HTTP verbs
  [✓] JWT Auth              — Tokens signed on login, verified per request
  [✓] Password Hashing      — bcrypt with 10 salt rounds
  [✓] Middleware Chaining   — auth.js validates token before any protected handler
  [✓] Parameterised Queries — All SQL uses .input() to prevent injection
  [✓] Upsert Pattern        — Progress checks for today's row before INSERT/UPDATE
  [✓] Error Isolation       — AI endpoints catch DB errors separately; data returned
  [✓] Environment Config    — dotenv keeps secrets out of source code

FRONTEND
──────────────────
  [✓] Single Object Controller — StudyAI manages all pages from one app.js
  [✓] Token Persistence     — JWT in localStorage, attached to every fetch()
  [✓] Theme System          — CSS custom properties toggled via data-theme attribute
  [✓] Route Guard           — Redirects to index.html if no token found
  [✓] Spaced Repetition     — Review intervals calculated and persisted to DB

DATABASE
──────────────────
  [✓] Connection Pooling    — poolPromise from mssql reused across all queries
  [✓] Relational Design     — All tables foreign-keyed to users via user_id
  [✓] Scoped Queries        — Every SELECT / UPDATE / DELETE filters by user_id
  
---

## 🛠️ TECHNOLOGIES
BACKEND
  Runtime      Node.js
  Framework    Express.js 4.x
  Database     Microsoft SQL Server  (mssql 12.x · msnodesqlv8)
  AI SDK       openai 3.x  (wired, mock active)

FRONTEND
  Language     Vanilla JavaScript (ES6+)
  Markup       HTML5
  Styling      CSS3 with custom properties
  Storage      localStorage  (token · user · theme)

TOOLING
  Package Mgr  npm
  IDE Config   VS Code  (launch.json included)
  Env Vars     .env  (DB connection string, JWT secret, port)

---


## 🔮 FUTURE_IMPROVEMENTS
AI & CONTENT
  [ ] Connect live OpenAI API — generate quizzes from real note content
  [ ] Note-aware AI chat — feed note text as context for smarter replies
  [ ] AI-suggested study schedule based on upcoming planner deadlines
  [ ] Summarisation — condense long notes into key bullet points

FEATURES
  [ ] Password reset with email verification  (nodemailer)
  [ ] File / image attachments on notes
  [ ] Shared notes — invite classmates to collaborate
  [ ] Streak tracker — consecutive days of logged study activity

TECH & QUALITY
  [ ] Add input validation  (express-validator or Joi)
  [ ] Write unit tests for controllers  (Jest + supertest)
  [ ] Refresh token rotation for longer JWT sessions
  [ ] Convert frontend to React or Vue for component reuse
