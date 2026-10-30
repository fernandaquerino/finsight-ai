# FinSight AI — Backlog (Epics & Issues)

> Perspective: Engineering Manager / Agile Lead.
> Estimates: S (≤1 day), M (2-3 days), L (4+ days).

---

## 1. Epics

| ID      | Epic                             | Focus                                      |
| ------- | -------------------------------- | ------------------------------------------ |
| EPIC-00 | Project Setup & DX               | Repo base, tooling, CI/CD, Docker          |
| EPIC-01 | Design System & UI Foundation    | Tokens, shadcn, AppShell, base components  |
| EPIC-02 | Authentication & User Management | OAuth, session, profile                    |
| EPIC-03 | Database & Domain Modeling       | Drizzle schema, migrations, seed           |
| EPIC-04 | Onboarding                       | Initial flow, preferences, consent         |
| EPIC-05 | Dashboard                        | Metrics, charts, states                    |
| EPIC-06 | Transactions                     | CRUD, list, filters, manual, detail        |
| EPIC-07 | CSV/PDF Ingestion                | Upload, preview, dedupe, history           |
| EPIC-08 | AI Layer & Chat                  | Tools, RAG, streaming chat                 |
| EPIC-09 | Insights & Recommendations       | Generation, severity, actions              |
| EPIC-10 | Reports                          | Reports, export                            |
| EPIC-11 | Goals & Debts                    | Goals, debts, strategy                     |
| EPIC-12 | Integrations (`Future`)          | Plaid/Open Finance, webhooks               |
| EPIC-13 | Observability & Security         | Sentry, OTel, rate limit, RLS              |
| EPIC-14 | Testing & Production Hardening   | Coverage, E2E, performance                 |
| EPIC-15 | Documentation & Open Source      | README, docs, templates                    |

---

## 2. Issues

### EPIC-00 — Project Setup & DX

#### ISSUE 00-01 — Initialize Next.js 15 + TypeScript + npm project

**Description** Create the repository base with Next.js 15 (App Router), strict TypeScript and npm.
**Goal** Have a runnable, typed skeleton.
**Scope** App Router, strict tsconfig, folder structure from `architecture.md`.
**Tasks**

- [ ] `create-next-app` with App Router + TS
- [ ] Configure npm and workspaces (if applicable)
- [ ] Create the base folder structure
- [ ] Configure paths/aliases (`@/`)
      **Acceptance criteria**
- [ ] `npm dev` starts the app
- [ ] `tsc --noEmit` passes
- [ ] Folder structure created
      **Technical notes** Strict TS from the start.
      **Dependencies** —
      **Estimate** S · **Priority** High · **Labels** `infra`

#### ISSUE 00-02 — ESLint, Prettier and conventions

**Tasks** [ ] ESLint config · [ ] Prettier + `prettier-plugin-tailwindcss` · [ ] format on save documented · [ ] `lint` script
**Acceptance criteria** [ ] `npm lint` passes · [ ] consistent formatting
**Estimate** S · **Priority** High · **Labels** `infra`

#### ISSUE 00-03 — Docker Compose (Postgres+pgvector, Redis) and .env.example

**Tasks** [ ] Compose with Postgres+pgvector and Redis · [ ] `.env.example` · [ ] local start script
**Acceptance criteria** [ ] `docker compose up` starts the database and Redis · [ ] app connects locally
**Estimate** M · **Priority** High · **Labels** `infra`, `database`

#### ISSUE 00-04 — CI pipeline (GitHub Actions)

**Tasks** [ ] install/cache · [ ] lint · [ ] typecheck · [ ] unit · [ ] build · [ ] verify-envs · [ ] drizzle-check
**Acceptance criteria** [ ] CI runs on each PR and blocks merge if it fails
**Estimate** M · **Priority** High · **Labels** `infra`, `testing`

#### ISSUE 00-05 — Test setup (Vitest + Testing Library + Playwright)

**Tasks** [ ] Vitest config · [ ] Testing Library · [ ] Playwright + database service · [ ] example of each
**Acceptance criteria** [ ] `npm test` and `npm e2e` run
**Estimate** M · **Priority** High · **Labels** `testing`

---

### EPIC-01 — Design System & UI Foundation

#### ISSUE 01-01 — Define visual direction and design tokens

**Description** Formalize the tokens (colors, typography, spacing, radius) from `design-system.md` in code.
**Goal** Have a single visual source of truth.
**Scope** CSS variables (light/dark), TS tokens file.
**Tasks**

- [ ] CSS variables for all colors (light/dark)
- [ ] TS tokens (radius, spacing, fontSize, zIndex, motion)
- [ ] Chart and category color map
- [ ] `next-themes` for toggling
      **Acceptance criteria**
- [ ] Tokens consumable in the Tailwind config
- [ ] Dark mode works
- [ ] No hardcoded color in components
      **Estimate** M · **Priority** High · **Labels** `design-system`, `frontend`

#### ISSUE 01-02 — Configure Tailwind theme + CSS variables

**Tasks** [ ] Tailwind config consuming variables · [ ] typography (Geist/Inter) · [ ] tabular-nums utility
**Acceptance criteria** [ ] theme classes available · [ ] fonts loading
**Estimate** S · **Priority** High · **Labels** `design-system`

#### ISSUE 01-03 — Install and configure shadcn/ui

**Tasks** [ ] init shadcn with the FinSight theme · [ ] add primitives (button, input, select, dialog, drawer, dropdown, popover, tooltip, tabs, switch, checkbox, badge, sonner, skeleton)
**Acceptance criteria** [ ] primitives render with FinSight tokens
**Estimate** M · **Priority** High · **Labels** `design-system`

#### ISSUE 01-04 — Create base UI components

**Tasks** [ ] Button variants (cva) · [ ] Input with error/label · [ ] Card · [ ] unit tests of the critical ones
**Acceptance criteria** [ ] variants and states covered · [ ] focus a11y
**Estimate** M · **Priority** High · **Labels** `design-system`, `testing`

#### ISSUE 01-05 — AppShell with Sidebar and Topbar

**Tasks** [ ] AppShell in the `(app)` layout · [ ] Sidebar with Main/Analysis groups · [ ] Topbar · [ ] active state · [ ] responsive (drawer/bottom-nav on mobile)
**Acceptance criteria** [ ] navigation works · [ ] active item highlighted · [ ] mobile collapses
**Estimate** L · **Priority** High · **Labels** `design-system`, `frontend`

#### ISSUE 01-06 — Dashboard card components

**Tasks** [ ] MetricCard (label/value/trend) · [ ] ChartCard · [ ] PageHeader · [ ] SectionHeader
**Acceptance criteria** [ ] used in the dashboard · [ ] loading/empty states
**Estimate** M · **Priority** High · **Labels** `design-system`

#### ISSUE 01-07 — Data display components

**Tasks** [ ] DataTable (TanStack) · [ ] DataFilterBar · [ ] Pagination · [ ] DateRangePicker · [ ] TransactionAmount · [ ] CategoryBadge · [ ] StatusBadge · [ ] TrendIndicator
**Acceptance criteria** [ ] DataTable with loading/empty · [ ] amount colored by sign
**Estimate** L · **Priority** High · **Labels** `design-system`

#### ISSUE 01-08 — Feedback components (Empty/Loading/Error)

**Tasks** [ ] EmptyState · [ ] LoadingState (skeleton) · [ ] ErrorState with retry · [ ] Toast helper
**Acceptance criteria** [ ] reusable in any query
**Estimate** M · **Priority** High · **Labels** `design-system`

#### ISSUE 01-09 — AI chat UI components

**Tasks** [ ] AIChat layout · [ ] AIChatMessage (user/assistant) · [ ] AIInput · [ ] AIThinkingState · [ ] SourceReference · [ ] AIResponseFeedback · [ ] AISuggestionPrompt
**Acceptance criteria** [ ] visual streaming · [ ] sources displayed · [ ] `aria-live` a11y
**Estimate** L · **Priority** Medium · **Labels** `design-system`, `ai`

#### ISSUE 01-10 — Document component usage (Storybook)

**Tasks** [ ] Storybook setup · [ ] stories of the priority components · [ ] states documented
**Acceptance criteria** [ ] Storybook runs · [ ] key components with stories
**Estimate** M · **Priority** Low · **Labels** `design-system`, `docs` · `Decision Needed`

---

### EPIC-02 — Authentication & User Management

- **02-01** Configure Auth.js with OAuth (S, High, `backend`, `security`)
- **02-02** JWT session + route protection middleware (M, High, `backend`, `security`)
- **02-03** Login and logout page (S, High, `frontend`)
- **02-04** `getCurrentUser`/`userId` server-side helper (S, High, `backend`)

> Detailed example:
> **ISSUE 02-02 — JWT session + middleware**
> **Tasks** [ ] middleware protects the `(app)` group · [ ] redirects unauthenticated · [ ] expires/rotates session
> **Acceptance criteria** [ ] a protected route requires login · [ ] logout invalidates the session
> **Notes** no query without `userId`. **Estimate** M · **Priority** High · **Labels** `backend`, `security`

---

### EPIC-03 — Database & Domain Modeling

- **03-01** Drizzle schema: users, user_profiles, accounts, categories (M, High, `database`)
- **03-02** Schema: transactions (+ origin, dedupe_hash, soft delete) and indexes (M, High, `database`)
- **03-03** Schema: import_jobs, import_rows, uploaded_files (M, High, `database`)
- **03-04** Schema: ai_conversations, ai_messages, ai_insights, ai_embeddings (pgvector) (M, Medium, `database`, `ai`)
- **03-05** Schema: financial_goals, debts, notification_preferences (S, Medium, `database`)
- **03-06** Schema: audit_logs (append-only) (S, Medium, `database`, `security`)
- **03-07** Development seed (M, Medium, `database`)
- **03-08** Base repositories with per-userId isolation (M, High, `backend`, `security`)

---

### EPIC-04 — Onboarding

- **04-01** 3-step onboarding flow (currency, goal, consent) (M, High, `frontend`)
- **04-02** Persist preferences and AI consent (S, High, `backend`)
- **04-03** Guided empty state after onboarding (S, Medium, `frontend`)

---

### EPIC-05 — Dashboard

- **05-01** Period aggregations endpoint/service (M, High, `backend`)
- **05-02** MetricCards (balance, income, expense, savings) (S, High, `frontend`)
- **05-03** Monthly trend chart (M, High, `frontend`)
- **05-04** Top categories + latest transactions (M, High, `frontend`)
- **05-05** Empty / partial data states (S, Medium, `frontend`)
- **05-06** Aggregation cache in Redis (S, Medium, `backend`)

---

### EPIC-06 — Transactions

- **06-01** Listing endpoint with filters/pagination (M, High, `backend`)
- **06-02** List grouped by date + master-detail (L, High, `frontend`)
- **06-03** TransactionForm (create/edit) with RHF+Zod (M, High, `frontend`)
- **06-04** Recategorization and notes (S, High, `frontend`, `backend`)
- **06-05** Soft delete with confirmation (S, High, `backend`)
- **06-06** Search and DataFilterBar (M, Medium, `frontend`)
- **06-07** Detail panel with merchant history (M, Medium, `frontend`)

> Detailed example:
> **ISSUE 06-02 — List grouped by date + master-detail**
> **Goal** Readable transaction navigation for personal use.
> **Tasks** [ ] group by day · [ ] TransactionRow with origin badge · [ ] open side panel (drawer on mobile) · [ ] loading/empty/error states
> **Acceptance criteria** [ ] clicking opens the detail without navigating · [ ] mobile becomes full screen · [ ] origin visible
> **Estimate** L · **Priority** High · **Labels** `frontend`

---

### EPIC-07 — CSV/PDF Ingestion

- **07-01** Upload + file validation (type/size) (M, High, `backend`, `security`)
- **07-02** CSV parser + column mapping (L, High, `backend`, `frontend`)
- **07-03** ImportPreviewTable with per-row validation (L, High, `frontend`)
- **07-04** Deduplication by hash (M, High, `backend`)
- **07-05** Confirmation + transactional persistence (M, High, `backend`)
- **07-06** Import history + ImportStatusCard (M, Medium, `frontend`, `backend`)
- **07-07** PDF parser (heuristic + AI per bank) (L, Medium, `backend`, `ai`) `Risk`
- **07-08** File discard after processing (S, Medium, `security`)

---

### EPIC-08 — AI Layer & Chat

- **08-01** Orchestration with the Vercel AI SDK + streaming (M, High, `ai`)
- **08-02** Versioned system prompts + anti prompt-injection guards (M, High, `ai`, `security`)
- **08-03** Read tools (summary, byCategory, trends, recurring, topMerchants...) (L, High, `ai`, `backend`)
- **08-04** Embedding generation and storage (pgvector) (M, Medium, `ai`, `database`)
- **08-05** RAG: context retrieval by similarity (M, Medium, `ai`)
- **08-06** `/api/ai/chat` endpoint + history (M, High, `ai`, `backend`)
- **08-07** Write tools with confirmation (createInsight, categorize) (M, Medium, `ai`)
- **08-08** Rate limit + AI cache (Redis) (M, High, `ai`, `security`) `Risk`
- **08-09** Tool tests (fixtures) + chat with a mocked model (M, High, `ai`, `testing`)

> Detailed example:
> **ISSUE 08-03 — Read tools**
> **Goal** Ensure the AI reports real numbers via structured queries.
> **Tasks** [ ] define each tool's schema (Zod) · [ ] implement the queries in the services · [ ] inject `userId` from the session (never from the prompt) · [ ] unit tests
> **Acceptance criteria** [ ] each tool filters by user · [ ] returns structured data · [ ] covered by a test
> **Notes** the AI never accesses the database directly; only via tools. **Estimate** L · **Priority** High · **Labels** `ai`, `backend`, `security`

---

### EPIC-09 — Insights & Recommendations

- **09-01** Rules-based insights engine (unusual spend, increase, subscriptions) (L, Medium, `backend`)
- **09-02** InsightCard with severity and actions (S, Medium, `frontend`)
- **09-03** Actions: apply/ignore/useful + persistence (M, Medium, `backend`, `frontend`)
- **09-04** Filters by type/severity (S, Low, `frontend`)

---

### EPIC-10 — Reports

- **10-01** Report generation by period/category (M, Low, `backend`)
- **10-02** Report UI (cards/charts/table) (M, Low, `frontend`)
- **10-03** AI summary (S, Low, `ai`)
- **10-04** CSV/PDF export (M, Low, `backend`)

---

### EPIC-11 — Goals & Debts

- **11-01** Goals CRUD + progress (M, Medium, `backend`, `frontend`)
- **11-02** GoalProgressCard + AI projection (M, Medium, `frontend`, `ai`)
- **11-03** Debts CRUD (M, Medium, `backend`, `frontend`)
- **11-04** DebtStrategyPanel (avalanche/snowball) with estimated savings (M, Medium, `ai`, `frontend`)

> Detailed example:
> **ISSUE 11-04 — Debt payoff strategy**
> **Goal** Give Rafael a concrete, grounded plan.
> **Tasks** [ ] compute the order by avalanche and snowball methods · [ ] estimate interest savings and time · [ ] panel explaining the recommendation · [ ] disclaimer (estimate, not advice)
> **Acceptance criteria** [ ] correct computation verified by a test · [ ] savings shown in R$ · [ ] disclaimer present
> **Estimate** M · **Priority** Medium · **Labels** `ai`, `frontend`, `backend`

---

### EPIC-12 — Integrations (`Future`)

- **12-01** Integration provider abstraction (M, Future, `backend`)
- **12-02** Plaid/Open Finance connection (L, Future, `backend`, `security`)
- **12-03** Sync webhooks + logs (L, Future, `backend`)
- **12-04** Connection state / reauthorization UI (M, Future, `frontend`)

---

### EPIC-13 — Observability & Security

- **13-01** Sentry (front + back) (S, High, `infra`)
- **13-02** OpenTelemetry tracing (M, Medium, `infra`)
- **13-03** Structured logs without PII (S, High, `security`)
- **13-04** Global rate limit on sensitive endpoints (M, High, `security`)
- **13-05** AI cost metrics + alert (M, Medium, `ai`, `infra`) `Risk`
- **13-06** Postgres RLS as defense in depth (M, Medium, `database`, `security`) `Decision Needed`
- **13-07** Data export and deletion (LGPD/GDPR) (M, High, `backend`, `security`)

---

### EPIC-14 — Testing & Production Hardening

- **14-01** Per-user isolation tests (authorization) (M, High, `testing`, `security`)
- **14-02** E2E of the critical flows (L, High, `testing`)
- **14-03** A11y tests (axe) (M, Medium, `testing`)
- **14-04** Dashboard and list performance (M, Medium, `frontend`)
- **14-05** Security and dependency audit (M, Medium, `security`)

---

### EPIC-15 — Documentation & Open Source

- **15-01** README with pitch, screenshots, setup (M, High, `docs`)
- **15-02** CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / LICENSE (S, High, `docs`)
- **15-03** docs/api.md, database.md, ai.md (M, Medium, `docs`)
- **15-04** Issue and PR templates (S, Medium, `docs`)
- **15-05** Publish Storybook (S, Low, `docs`) `Decision Needed`

---

## 3. Implementation order

**Sprint 0 — Foundation:** all of EPIC-00, EPIC-01 (01-01 to 01-08), EPIC-02, EPIC-03.
**Sprint 1 — Core MVP:** EPIC-04, EPIC-05, EPIC-06.
**Sprint 2 — Import:** EPIC-07 (CSV: 07-01 to 07-06).
**Sprint 3 — AI:** EPIC-01 (01-09), EPIC-08, EPIC-09.
**Sprint 4 — Reports, goals and debts:** EPIC-10, EPIC-11, EPIC-07 (07-07 PDF).
**Sprint 5 — Production:** EPIC-13, EPIC-14, EPIC-15.
**Future backlog:** EPIC-12 (integrations).
