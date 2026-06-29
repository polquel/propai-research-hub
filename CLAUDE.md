# CLAUDE.md — AI in Property Management Research Tool

> This file is my personal contract with Claude. Read it before every task.
> I am a 2nd-year CS student. Always explain WHY before HOW.

---

## 🧑‍💻 Who I Am & How to Teach Me

- **Level:** 2nd-year CS beginner. I know basic Python, some HTML/CSS, and I've used Git a little.
- **Learning style:** Explain concepts before writing code. If you're about to write more than 10 lines, stop and explain the approach first.
- **When I'm stuck:** Ask me clarifying questions instead of assuming. Break tasks into tiny steps.
- **Terminology:** Define acronyms and jargon the first time you use them (e.g., "API = Application Programming Interface — a way for two programs to talk to each other").
- **Analogies welcome:** Use real-world comparisons to explain abstract concepts.

---

## 🎯 Project Purpose

**Name:** PropAI Research Hub

**What it is:** A web app to gather, tag, summarize, and organize research about how AI is being integrated into property management.

**What it is NOT:** This is NOT an enterprise AI system. It is a personal research aid tool — like a smart notebook.

**Core user story:** "As a CS student, I want to save articles, papers, and notes about AI + property management, tag them by topic, and search/filter them easily."

---

## 🗂️ Project Structure

```
propai-research-hub/
├── CLAUDE.md               ← You are here
├── README.md
├── .env                    ← Secret keys (NEVER commit this)
├── .env.example            ← Safe template for .env
├── .gitignore
│
├── frontend/               ← What users see (React)
│   ├── src/
│   │   ├── components/     ← Reusable UI pieces
│   │   ├── pages/          ← Full pages (Home, Research, Tags)
│   │   ├── hooks/          ← Custom React logic
│   │   ├── services/       ← API calls to the backend
│   │   └── App.jsx
│   └── package.json
│
├── backend/                ← Server & database (Node + Express)
│   ├── src/
│   │   ├── routes/         ← URL endpoints (e.g., /api/articles)
│   │   ├── controllers/    ← Logic for each route
│   │   ├── models/         ← Database schemas
│   │   └── index.js        ← Entry point
│   └── package.json
│
└── docs/                   ← My own notes & research sketches
    └── architecture.md
```

---

## 🛠️ Tech Stack & Why Each Was Chosen

| Layer           | Technology                       | Why                                                                                |
| --------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| Frontend        | React + Vite                     | Industry standard; component model teaches reusability                             |
| Styling         | Tailwind CSS                     | Utility-first; faster than writing raw CSS from scratch                            |
| Backend         | Node.js + Express                | Same language (JS) on frontend and backend = less context switching for a beginner |
| Database        | SQLite (dev) → PostgreSQL (prod) | SQLite needs zero setup; same SQL knowledge transfers to Postgres                  |
| ORM             | Prisma                           | Lets me write JS objects instead of raw SQL; generates type-safe queries           |
| Auth            | Clerk (or simple JWT)            | Auth is hard to get right; start simple                                            |
| AI Feature      | OpenAI API (optional)            | For auto-summarizing saved articles                                                |
| Version Control | Git + GitHub                     | Non-negotiable; commit after every working feature                                 |

---

## 📐 Architecture Rules

1. **Separation of concerns:** Frontend never talks directly to the database. Always goes through the backend API.
2. **REST API:** Backend exposes endpoints like `GET /api/articles`, `POST /api/articles`, `DELETE /api/articles/:id`.
3. **Environment variables:** All secrets (API keys, DB connection strings) live in `.env`. Never hardcode them.
4. **One feature at a time:** Don't start a new feature until the current one is committed and working.

---

## 🗃️ Core Data Models

### Article (the main entity)

```
Article {
  id           String   @id @default(uuid())
  title        String
  url          String?
  summary      String?  // Can be AI-generated or manual
  notes        String?  // My personal annotations
  source       String?  // e.g., "arXiv", "Forbes", "YouTube"
  publishedAt  DateTime?
  savedAt      DateTime @default(now())
  tags         Tag[]    // Many-to-many relationship
}
```

### Tag

```
Tag {
  id       String    @id @default(uuid())
  name     String    @unique  // e.g., "lease-management", "chatbots", "predictive-maintenance"
  articles Article[]
}
```

---

## ✅ Feature Roadmap (build in this order)

### Phase 1 — Foundation (do this first)

- [ ] Project scaffolding (folders, Git, package.json)
- [ ] Basic Express server with health check route
- [ ] Prisma + SQLite setup with Article model
- [ ] CRUD API: Create, Read, Update, Delete articles
- [ ] Simple React frontend with article list and add form

### Phase 2 — Organization

- [ ] Tag system (add/remove tags on articles)
- [ ] Search by title or tag
- [ ] Filter by source or date

### Phase 3 — Research Features

- [ ] Import from URL (scrape title + description automatically)
- [ ] AI auto-summary via OpenAI API
- [ ] Export to CSV or Markdown

### Phase 4 — Polish

- [ ] Responsive mobile layout
- [ ] Dark mode
- [ ] Dashboard with research stats (articles per tag, per month)

---

## 🧠 Claude's Behavior Instructions

### Before writing ANY code:

1. State what we're building in one sentence.
2. Explain the concept (what is a "route"? what is a "component"?).
3. Show the plan as pseudocode or bullet points first.
4. Ask if I understand before writing real code.

### Code style:

- Use **comments** on every non-obvious line.
- Prefer **explicit** over clever (e.g., `const articleList = []` not `const a = []`).
- Write **small functions** — one function = one job.
- Use `async/await` instead of `.then()` chains (easier to read).

### When I make mistakes:

- Don't just give the fix. Explain what went wrong and why.
- Show the diff (what changed) when editing existing code.
- If there are multiple ways to fix something, show the simplest one first.

### Testing mindset:

- After each feature, tell me how to manually test it in the browser or with a tool like Thunder Client / Postman.
- Write at least one comment per file explaining what the file does.

---

## 🚫 Constraints & Guardrails

- **No premature optimization.** Don't add caching, queues, or microservices until Phase 3 at earliest.
- **No TypeScript yet.** Plain JavaScript only until I explicitly ask to migrate.
- **No Docker yet.** Keep the local dev setup simple.
- **No paid services in Phase 1-2.** Use free tiers and local tools only.
- **Always explain a new npm package** before installing it. What does it do? Why do we need it? Any alternatives?

---

## 🔁 Git Workflow

```bash
# Before starting any work:
git status               # Check what's changed
git pull                 # Get latest changes

# The commit cycle:
git add .
git commit -m "feat: add article creation endpoint"  # Use descriptive messages
git push

# Commit message prefixes:
# feat:    new feature
# fix:     bug fix
# docs:    documentation only
# style:   formatting, no logic change
# refactor: restructure without behavior change
# test:    adding tests
```

**Rule:** Never commit broken code. If something doesn't work, stash it (`git stash`) or keep it in a separate branch.

---

## 📚 Glossary (update as we learn new terms)

| Term      | Plain English Explanation                                                                  |
| --------- | ------------------------------------------------------------------------------------------ |
| API       | A messenger that lets two programs talk to each other via HTTP requests                    |
| Route     | A URL pattern the server listens to (e.g., `/api/articles`)                                |
| Component | A reusable piece of UI in React (like a LEGO brick)                                        |
| ORM       | A tool that translates between JavaScript objects and database tables                      |
| Schema    | A blueprint that defines the structure of data in the database                             |
| Endpoint  | A specific URL + HTTP method that does one thing (e.g., `POST /articles` = create article) |
| CRUD      | Create, Read, Update, Delete — the four basic database operations                          |
| .env      | A file that stores secret configuration values (API keys, passwords)                       |
| Migration | A versioned script that changes the database structure                                     |
| Prisma    | The ORM we use — writes the SQL so we don't have to                                        |

---

## 🧪 How to Run the Project

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up the database (run once)
cd backend && npx prisma migrate dev --name init

# Start both servers (each in its own terminal)
cd backend && npm run dev      # Runs on http://localhost:3001
cd frontend && npm run dev     # Runs on http://localhost:5173
```

---

## 📝 Session Log (update after each session)

| Date   | What we built | What I learned        | Open questions             |
| ------ | ------------- | --------------------- | -------------------------- |
| [date] | Project setup | How to initialize npm | What is package-lock.json? |

---

_Last updated: [date] — Remember: understanding > speed. Ask Claude to slow down anytime._
