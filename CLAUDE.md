# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> I am a 2nd-year CS student. Always explain WHY before HOW.

---

## Who I Am & How to Teach Me

- **Level:** 2nd-year CS beginner. I know basic Python, some HTML/CSS, and I've used Git a little.
- **Learning style:** Explain concepts before writing code. If you're about to write more than 10 lines, stop and explain the approach first.
- **When I'm stuck:** Ask me clarifying questions instead of assuming. Break tasks into tiny steps.
- **Terminology:** Define acronyms and jargon the first time you use them (e.g., "API = Application Programming Interface — a way for two programs to talk to each other").
- **Analogies welcome:** Use real-world comparisons to explain abstract concepts.

---

## Project Purpose

**What it is:** A research intelligence tool to investigate where and how AI could be applied to **neighborhood community management companies** — firms that manage HOAs (Homeowners Associations), residential building communities, and multi-tenant property complexes.

**The bigger goal:** This app supports the design of a future SaaS product for this sector. Before building that product, we need to understand: who the players are, what they do, what their pain points are, and where AI can add real value.

**This app is a structured research base, not a generic notebook.** Everything saved here should answer one of these questions:
1. Who are the companies in this space? (names, size, location, services)
2. What do they struggle with? (manual tasks, communication, billing, maintenance)
3. What AI tools exist that could solve those problems?
4. What would a competitive product look like?

**Core user stories:**
- "I want to save and tag articles and reports about AI in property management."
- "I want to log companies I find (their website, services, region, size) with notes."
- "I want to track potential AI use cases (e.g. chatbot for resident queries, predictive maintenance alerts) and rate their viability."
- "I want to search across all my research to spot patterns and opportunities."

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite | Industry standard; component model teaches reusability |
| Styling | Tailwind CSS | Utility-first; faster than writing raw CSS |
| Backend | Node.js + Express | Same language on frontend and backend = less context switching |
| Database | SQLite (dev) → PostgreSQL (prod) | SQLite needs zero setup; same SQL transfers to Postgres |
| ORM | Prisma | Writes SQL for us; lets us use JS objects instead |
| Auth | Clerk (or simple JWT) | Auth is hard to get right; start simple |
| AI Feature | OpenAI API (optional, Phase 3) | For auto-summarizing saved articles |

---

## Dev Commands

```bash
# Install dependencies (run once per folder)
cd backend && npm install
cd ../frontend && npm install

# Set up the database (run once, creates SQLite file)
cd backend && npx prisma migrate dev --name init

# Start backend (Terminal 1) — http://localhost:3001
cd backend && npm run dev

# Start frontend (Terminal 2) — http://localhost:5173
cd frontend && npm run dev
```

---

## Architecture Rules

1. **Separation of concerns:** Frontend never talks directly to the database. Always goes through the backend API.
2. **REST API:** Backend endpoints follow the pattern `GET /api/articles`, `POST /api/articles`, `DELETE /api/articles/:id`.
3. **Environment variables:** All secrets live in `.env`. Never hardcode them.
4. **One feature at a time:** Don't start a new feature until the current one is committed and working.

---

## Core Data Models

### Article (a saved research item: news, paper, report, blog post)
```
Article {
  id           String    @id @default(uuid())
  title        String
  url          String?
  summary      String?   // AI-generated or manual
  notes        String?   // Personal annotations
  source       String?   // e.g., "arXiv", "Forbes", "YouTube"
  publishedAt  DateTime?
  savedAt      DateTime  @default(now())
  tags         Tag[]     // Many-to-many
}
```

### Company (a firm in the neighborhood community management space)
```
Company {
  id          String   @id @default(uuid())
  name        String
  website     String?
  country     String?  // e.g., "Spain", "USA"
  services    String?  // e.g., "billing, maintenance, resident portal"
  employeeCount String? // e.g., "50-200"
  notes       String?  // observations, pain points observed
  addedAt     DateTime @default(now())
  tags        Tag[]
}
```

### AIUseCase (a potential AI application for the sector)
```
AIUseCase {
  id           String  @id @default(uuid())
  title        String  // e.g., "Chatbot for resident queries"
  description  String?
  targetArea   String? // e.g., "communication", "billing", "maintenance"
  viability    Int?    // 1 (speculative) to 5 (proven, exists in market)
  notes        String?
  addedAt      DateTime @default(now())
  tags         Tag[]
}
```

### Tag (shared label across all three models)
```
Tag {
  id         String     @id @default(uuid())
  name       String     @unique  // e.g., "chatbots", "predictive-maintenance", "Spain"
  articles   Article[]
  companies  Company[]
  useCases   AIUseCase[]
}
```

---

## Feature Roadmap (build in this order)

### Phase 1 — Foundation
- [x] Project scaffolding (folders, package.json)
- [x] Basic Express server with health check route (`GET /api/health`)
- [x] Prisma + SQLite setup with Article model
- [ ] CRUD API for articles
- [ ] Simple React frontend: article list + add form

### Phase 2 — Domain-Specific Research Tools
- [ ] **Company profiles** — log companies in the sector (name, website, country, services, employee count, notes)
- [ ] **AI use case tracker** — document potential AI applications (name, description, which type of company benefits, viability score 1–5)
- [ ] Tag system — shared tags across articles, companies, and use cases
- [ ] Search by title or tag
- [ ] Filter by source, date, or company

### Phase 3 — Intelligence Features
- [ ] Import from URL (auto-scrape company name, description, and logo)
- [ ] AI auto-summary via OpenAI API (summarize an article or a company's homepage)
- [ ] Market map view — a visual grid of companies by region and service type
- [ ] Export to CSV or Markdown (for use in a pitch deck or product spec)

### Phase 4 — Polish
- [ ] Responsive mobile layout
- [ ] Dark mode
- [ ] Dashboard: articles saved per week, companies tracked per region, top AI use cases by viability score

---

## Claude's Behavior Instructions

### Before writing ANY code:
1. State what we're building in one sentence.
2. Explain the concept (what is a "route"? what is a "component"?).
3. Show the plan as pseudocode or bullet points first.
4. Ask if I understand before writing real code.

### Code style:
- Comment every non-obvious line.
- Prefer explicit names (`const articleList = []` not `const a = []`).
- One function = one job.
- Use `async/await` instead of `.then()` chains.

### When I make mistakes:
- Explain what went wrong and why before showing the fix.
- Show the diff when editing existing code.
- If there are multiple fixes, show the simplest one first.

### After each feature:
- Tell me how to manually test it in the browser or with Thunder Client / Postman.

---

## Constraints

- **No TypeScript yet.** Plain JavaScript only until I explicitly ask.
- **No Docker yet.** Keep local dev simple.
- **No paid services in Phase 1–2.** Free tiers and local tools only.
- **Always explain a new npm package** before installing: what it does, why we need it, any alternatives.
- **No premature optimization.** No caching, queues, or microservices until Phase 3.

---

## Commit Message Format

```
feat:     new feature
fix:      bug fix
docs:     documentation only
style:    formatting, no logic change
refactor: restructure without behavior change
```

---

## Glossary

| Term | Plain English |
|---|---|
| API | A messenger that lets two programs talk via HTTP |
| Route | A URL pattern the server listens to (e.g., `/api/articles`) |
| Component | A reusable piece of UI in React (like a LEGO brick) |
| ORM | Translates between JS objects and database tables |
| Schema | A blueprint for data structure in the database |
| Endpoint | A specific URL + HTTP method (e.g., `POST /articles` = create article) |
| CRUD | Create, Read, Update, Delete — the four basic database operations |
| Migration | A versioned script that changes the database structure |
| Prisma | The ORM we use — writes the SQL so we don't have to |
