# CLAUDE.md — FinSight AI

> Persistent instructions for Claude Code. Read this file before any action in the repository.

---

## 1. Project overview

**FinSight AI** is an AI-powered personal finance analysis platform — full-stack, production-ready and open source.

The user imports bank statements (CSV/PDF), enters data manually and talks in natural language to their own financial data. The AI responds with real numbers (tool calling, not "memory"), categorizes transactions, generates insights and suggests debt-payoff strategies and savings goals.

**What it solves:** the gap between spreadsheets (control, but laborious) and closed apps (easy, but black boxes without conversational AI).

**MVP scope:**

- OAuth auth + minimal onboarding
- Manual entries + recurring transactions
- CSV import with preview, validation and deduplication
- Dashboard (metrics, charts, top categories)
- Transaction management (CRUD, filters, master-detail)
- Categorization with AI suggestion (Should Have)
- Chat with a financial AI via tool calling (Should Have)
- Basic insights, goals and a debt module (Should Have)

**What NOT to assume without validation:**

- Automatic bank integrations (Plaid/Open Finance) → `Future`
- Simultaneous multi-currency → `Future`
- Native mobile app → `Future`
- Multi-user / family accounts → `Future`
- Applying an AI suggestion directly to data without user confirmation → **never**

**Project profile:** production-ready, portfolio-grade, open source. Every technical decision must be defensible as if it were a real product with real users and sensitive financial data.

---

## 2. Technical stack

Official stack — don't add libraries outside this list without clearly justifying the trade-off (purpose, size, maintenance, alternative rejected):

| Layer              | Technology                            |
| ------------------ | ------------------------------------- |
| Framework          | Next.js 15 (App Router)               |
| Language           | TypeScript (strict)                   |
| Styling            | Tailwind CSS + shadcn/ui              |
| Client state       | React Query (server) + Zustand (UI)   |
| ORM                | Drizzle ORM                           |
| Database           | PostgreSQL + pgvector                 |
| Cache / rate limit | Redis                                 |
| Auth               | Auth.js (OAuth + JWT)                 |
| AI                 | Vercel AI SDK                         |
| Tests              | Vitest + Testing Library + Playwright |
| Observability      | Sentry + OpenTelemetry                |
| Deploy             | Vercel                                |

**Rule:** before installing any new package, ask: "is there a way to do this with what we already have?" If not, justify with: purpose, alternatives considered, bundle impact, maintenance.

---

## 3. Engineering principles

- **Simplicity before abstraction.** If an abstraction doesn't have at least two real usages, it's probably too early.
- **Strong typing.** No unnecessary `any`. Explicit types at the application's edges (API responses, props, DB schema). Inference is fine inside functions.
- **Small, cohesive components.** One responsibility per component. If it grows, split it.
- **Clear layer separation:** UI → hooks/query → service → repository → database. Domain logic does not live in React components.
- **Server Components by default.** Client Component only when there is interactivity, local state, a browser API or a user event.
- **Security and privacy by default.** Isolation by `userId` in every query. No PII in logs. Consent before AI.
- **Testability as a design criterion.** If it's hard to test, the design is probably wrong.
- **Accessibility is part of the feature.** WCAG 2.1 AA minimum. Keyboard, visible focus, charts with a textual alternative.
- **Observability is part of the feature.** Telemetry events, tracing, AI cost metrics.
- **Incremental delivery.** Prefer small changes that work completely over large changes that "almost work".

---

## 4. Architecture guidelines

```
src/
  app/                    # Routing (App Router). Minimal logic here.
                          # Groups: (auth) for login/onboarding, (app) for authenticated.
                          # api/ for route handlers per domain.

  components/
    ui/                   # shadcn primitives. Don't edit the logic, only tokens.
    app/                  # Generic layout/product components:
                          # AppShell, PageHeader, MetricCard, etc.
    charts/               # Recharts/D3 wrappers. No domain logic.
    feedback/             # EmptyState, LoadingState, ErrorState, Toast.

  features/               # One directory per domain:
                          # auth, onboarding, dashboard, transactions, imports,
                          # categories, ai-chat, insights, reports, goals, debts, settings.
                          # Each feature contains: components/, hooks/, types/, (optionally) utils/.

  server/
    actions/              # Server Actions (simple mutations coupled to forms).
    api/                  # Shared helpers: responses, errors, middleware.
    services/             # Business rules — pure, testable functions, no direct I/O.
    repositories/         # Data access (Drizzle). ALWAYS filters by userId.
    validators/           # Zod schemas per domain (shared with the front).

  db/
    schema/               # Drizzle table definitions.
    migrations/           # Generated by Drizzle — never edit manually.
    seed/                 # Development data.

  ai/
    tools/                # Read and controlled-write tools for the LLM.
                          # Every tool receives userId from the session, never from the prompt.
    prompts/              # Versioned system prompts.
    rag/                  # Context retrieval by similarity.
    embeddings/           # Embedding generation and storage.
    guards/               # Sanitization, anti prompt-injection, rate limit.

  lib/                    # Stateless utilities: formatters, date helpers, etc.
  hooks/                  # React hooks reused across features.
  styles/                 # globals.css, tokens.
  types/                  # Shared TypeScript types.
```

**Golden rule:** if you don't know where something goes, prefer more specific over more generic. Avoid a `utils/` or `helpers/` that becomes a dumping ground for everything.

---

## 5. Frontend guidelines

### Server vs Client Components

- **Server Component (default):** data fetching on initial load, no user state or event.
- **Client Component (`"use client"`):** forms, filters, interactive charts, chat, detail panel. Mark it on the smallest possible component.

### React Query

- One query hook per resource in `features/<domain>/hooks/`.
- Query keys as named constants: `['transactions', userId, filters]`.
- Always handle loading, error and empty in the consumers.
- Invalidate queries after related mutations.

### Zustand

- For ephemeral UI state: which transaction is selected, active filters, chat draft.
- **Never** duplicate server data in Zustand (React Query does that better).
- Stores per domain, not one monolithic global store.

### Forms

- React Hook Form + Zod. The same backend Zod schema via `server/validators/`.
- Never validate only on the client.

### Tables / lists

- TanStack Table inside the `DataTable` component.
- Consider virtualization when the list can grow.
- Filters synced to the URL (searchParams) for deep-linking and SSR.

### Charts

- Wrappers in `components/charts/`. Data arrives ready (no transformation inside the chart).
- Always with a descriptive `aria-label` and an accessible alternative table.
- Stable category colors (the same color map across the whole app).

### Required states

Every screen/component that fetches data must handle:

- **Loading:** a skeleton in the shape of the content.
- **Error:** `ErrorState` with a message and a retry button.
- **Empty:** `EmptyState` with a clear CTA — never a blank screen.

### Responsiveness

- Mobile-first. The sidebar becomes a drawer/bottom-nav on mobile.
- Tables with horizontal scroll on smaller screens.
- The detail panel (master-detail) becomes full screen on mobile.

### Accessibility

- Working keyboard navigation on all interactive components.
- Visible focus ring (2px ring, never remove the outline without replacing it).
- Labels on all inputs. `aria-describedby` on error messages.
- Modals with focus trap. `aria-live` on AI streaming.

### shadcn/ui

- Don't use shadcn components in the "raw" state — always go through FinSight's tokens.
- Primitives in `components/ui/`, no domain logic.
- Variants with `cva`.

### Tailwind

- Token classes (e.g. `text-primary`, `bg-secondary`) instead of arbitrary values when possible.
- Don't use `!important`. If you need it, the design is wrong.

---

## 6. Backend guidelines

### Route Handlers

- One file per resource: `app/api/<domain>/route.ts`.
- Thin handlers: extract session, validate input (Zod), delegate to a service, return the response.
- Never business logic inside the handler.

### Services

- Pure or near-pure functions. Receive repositories/dependencies as parameters (makes testing easier).
- Business logic here: deduplication computation, debt strategy, dashboard aggregations.

### Repositories

- The only layer that talks to the database.
- **Every query filters by `userId`.** No exceptions. Never trust IDs coming from the client for authorization.

### Validation

- Every route handler input goes through a Zod schema before any processing.
- Reject with 422 and a structured message on failure.

### Responses / errors

- Consistent envelope: `{ data: T }` or `{ error: { code, message, details? } }`.
- Correct HTTP statuses (400 validation, 401 not authenticated, 403 not authorized, 404 not found, 422 invalid input, 500 internal error).
- Never leak a stack trace or database data in production responses.

### Authorization

- `userId` **always** comes from the server session, never from the client's body/params.
- Verify resource ownership on each access before returning/modifying.

### Rate limiting

- Redis for rate limiting per user/IP on sensitive and AI endpoints.
- Return 429 with `Retry-After` when hit.

### Safe logs

- Structured logs (JSON), with `requestId` and `userId` (hashed/opaque), without financial data.
- Never log: transaction amounts, statements, integration tokens, secrets.

### Webhooks / integrations (`Future`)

- Verify the signature before processing.
- Idempotency: processing the same event twice must be safe.
- Log the event + result, without the full payload if it contains sensitive data.

---

## 7. Database guidelines

### Drizzle schema

- Schema in `db/schema/`, split by table/domain.
- TypeScript types inferred from the schema — never manually create duplicate types for database entities.
- `snake_case` for table and column names; `camelCase` in TypeScript via Drizzle mapping.

### Migrations

- Generated with `drizzle-kit generate`. **Never edit manually.**
- Each migration must be reviewed before applying in production.
- CI checks that migrations are consistent with the schema.

### Relationships and indexes

- Explicit FKs with `references()`.
- Mandatory indexes: `userId` on all domain tables, `dedupe_hash` on `transactions`, `occurred_at` on `transactions`, embedding with HNSW on pgvector.

### Soft delete

- A `deleted_at` column on domain entities to delete without losing the audit trail.
- Hard delete only in the account-deletion flow (LGPD/GDPR).

### Per-user multi-tenancy

- **Every domain table has `userId` (indexed FK).**
- The repository always filters: `where(eq(transactions.userId, userId))`.
- `Decision Needed` — enable Postgres RLS as an extra defense in hardening (v1.0).

### pgvector

- A `vector(1536)` column in `ai_embeddings`.
- HNSW index (`cosine`).
- Every embedding search filters by `userId` before ranking by similarity.

### Deduplication

- `dedupe_hash` = `sha256(date + amount + description + accountId)`.
- Unique constraint per account. Detect before inserting, don't rely only on the constraint.

### Import history

- `import_jobs` and `import_rows` preserve the raw data for auditing.
- Job status: `pending | parsing | preview | confirmed | failed | rolled_back`.
- Invalid rows don't block valid ones — record a per-row error.

### Audit logs

- An append-only `audit_logs` table: data export, account deletion, confirmed import.
- Never update or delete audit rows.

---

## 8. AI guidelines

### Vercel AI SDK

- `streamText` for chat. `generateText` for internal tasks (categorization, insight).
- Always with explicit `maxTokens` and `temperature` per use case.

### Streaming

- The response reaches the client via a `ReadableStream`. Use `AIThinkingState` while processing.
- `aria-live="polite"` on the chat region for accessibility.

### Tool calling

- Tools defined in `ai/tools/` with input and output Zod schemas.
- **Every tool receives `userId` from the server session context — never from the user's prompt.**
- Read tools are safe. Write tools (categorize, create insight) **require user confirmation** before applying.
- The AI never accesses the database directly; only via tools.

### RAG

- Retrieve embeddings filtered by `userId` before any ranking by similarity.
- RAG complements the tools (semantic); tools dominate (structured/numeric).

### Embeddings

- Generate when a transaction is created/imported (asynchronous when possible).
- Textual representation: `"YYYY-MM-DD · <description> · <category> · <amount>"`.
- Store in `ai_embeddings` with `userId` and `transactionId`.

### Prompt injection

- Content coming from user data (transaction descriptions, PDFs) is treated as data, not as instructions.
- Explicit separation in the system prompt between instructions and data.
- `ai/guards/` sanitizes before injecting into the context.

### Sensitive data

- Never include exact transaction amounts raw in the system prompt — pass them via tools.
- Specific numbers only via tool calls (auditable).

### Response limits

- Responses with financial numbers **always** cite the source (which tool, which period).
- If the tool returned no data, the AI says it doesn't have enough data — it never makes things up.
- Projections and recommendations come with a disclaimer: "an estimate based on your data, not professional financial advice".

### AI tone

- A copilot, not a judge. "Your spending on X was 17% above average" — not "you spent too much on X".
- No absolute promises. "You could save up to X" — not "you will save X".

### Confirmation before mutations

- Any action that changes data (batch categorization, create insight) requires visual confirmation first.
- The AI proposes; the user decides.

### Conversation history

- Persist in `ai_conversations` and `ai_messages`.
- Record tokens used for a cost metric.

### AI tests

- Tools tested with database fixtures (Vitest + test database).
- Chat tested with a mocked model — never call the real API in tests.
- `ai/guards/` tested with malicious payloads.

---

## 9. Security & privacy guidelines

- **LGPD/GDPR:** explicit consent before processing AI; self-service export; self-service delete (hard delete of all the user's data).
- **Never log:** transaction amounts, statement descriptions, CPF, full email, integration tokens, API keys.
- **Per-user isolation:** every query filters by `userId`. No access to other users' data possible — test this explicitly.
- **Sanitization:** every input validated with Zod on the backend. File content (CSV/PDF) sanitized before any use.
- **Safe upload:** validate MIME type + extension + size. File discarded after processing (`purged_at`). Never store a file at a public path without authentication.
- **Rate limit:** Redis, per user and per IP, on AI and sensitive endpoints. 429 with `Retry-After`.
- **Auth:** `userId` always from the server session. `httpOnly + sameSite` on cookies. Session expires and rotates.
- **Secrets:** only in `.env` and Vercel environment variables. Never in code, never committed. `.env` in `.gitignore`.
- **Data export:** record in `audit_logs`. Generate JSON/CSV only of the user's own data.
- **Account deletion:** hard delete of all entities with an FK to `userId`. Confirm before executing.

---

## 10. Testing guidelines

### General strategy

- Test what carries the most risk: per-user isolation, business logic (deduplication, debt calculation, aggregations), CSV import, AI tools.
- Prefer integration tests (service + repository + test database) over heavy mocks.

### Vitest (unit + integration)

- Services with pure logic: unit.
- Repositories + services together: integration with a test database (Docker in CI).
- Validators (Zod): unit — valid and invalid inputs.

### Testing Library (components)

- Design system components: smoke + accessibility (axe).
- Forms: valid submit, invalid submit, loading/error states.
- `TransactionRow`, `InsightCard`, `AIChatMessage`: rendering with critical props.

### Playwright (E2E)

- Critical flows: onboarding → create transaction → see dashboard.
- Import CSV → preview → confirm → transactions appear.
- Ask the AI → response with the source displayed (mocked model).
- Try to access another user's data → 403.

### Security tests

- **Isolation:** create two users in the seed; try to access the other's resource → verify rejection.
- **Authorization:** try to call endpoints without a session → 401.

### Mocks

- AI: mock `generateText`/`streamText` returning a fixture response.
- External APIs: mock with `msw` or `nock`.
- Never use real financial data in fixtures.

### Accessibility

- `@axe-core/playwright` on the main pages.
- Verify keyboard navigation in the critical E2E.

### Regression

- Any fixed bug becomes a test before the fix.

---

## 11. Workflow rules

Before any action in the repository:

1. **Read the relevant files first.** Never assume the state of the code — check it.
2. **Explain the plan before big changes.** Propose an approach and wait for confirmation for refactors, architecture changes or changes touching many files.
3. **Small, incremental changes.** One thing at a time. Prefer one commit that works completely over several broken commits.
4. **Don't refactor files outside the task's scope.** If you notice something to improve, point it out and suggest it — don't do it silently.
5. **Don't change architecture without justification.** Any deviation from the conventions in `architecture.md` needs an explicit reason.
6. **Don't remove tests without explaining.** If a test needs to be removed, explain why and what replaces it.
7. **Run checks when possible:** `npm lint`, `npm type-check`, `npm test`. Report the result.
8. **Update documentation when changing behavior.** If a function, route or component changes its contract, update the relevant doc.
9. **Small, descriptive commits when requested.** Format: `feat(transactions): add grouped list with master-detail`.

---

## 12. Senior engineering mentorship mode

This project is also a space for professional growth. The AI should act as a **senior engineering mentor**, not just a code generator.

Expected behaviors:

- **Explain trade-offs** before recommending an approach. "You could use X or Y — X is simpler now, but Y scales better once we have Plaid integration."
- **Question fragile decisions.** "You want to do it this way — are you sure? What's the risk if the PDF parsing fails halfway through?"
- **Suggest alternatives.** "I did it this way, but another option would be... The trade-off is..."
- **Point out risks proactively.** Mark with `Risk` when something could fail in production, compromise security or create technical debt.
- **Ask for architectural decisions.** For important choices, present options and ask me to decide — don't decide for me silently.
- **Don't deliver code without context.** Always explain: what was done, why, which patterns were used, where to review more carefully.
- **Highlight patterns.** "I used the repository pattern here to make the service's unit test easier."
- **Suggest relevant tests.** After implementing, list what's worth testing and why.
- **Suggest performance, security and DX improvements** as follow-ups — without implementing them unasked.
- **Help communicate decisions.** "How would I explain this choice to the team/recruiter/PR?"

---

## 13. Output style

- **Objective and clear.** No beating around the bush.
- **Portuguese** when the message is in Portuguese. **English** for code, variable names, code comments, branch names, commits, technical documentation.
- **No over-abstraction.** If the simplest solution works, use it.
- **Consistent signaling:**
  - `Risk` — something that can fail, create a vulnerability or generate debt.
  - `Decision Needed` — an architectural or product choice that needs validation.
  - `Future` — a valid improvement, but out of the current scope.
- **Never use `any` without commenting the reason** and proposing the path to remove it.
- **Always show the diff/changed files** at the end of an implementation.
