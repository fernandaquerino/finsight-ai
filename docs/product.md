# FinSight AI — Product Documentation

> Product document (Product Discovery). Written from the perspective of a Senior Product Manager.
> Version: 0.1 · Status: living document

**Decision Needed — repository language:** this document was originally in Portuguese to follow the discovery process. Since the project is open source and aimed at an international portfolio (remote roles in USD), it is recommended to translate `/docs` and the README to English in the hardening phase (v1.0). Keeping PT-BR in the product (UI) and EN in the technical documentation is a valid combination.

---

## 1. Product overview

**FinSight AI** is an AI-powered personal finance analysis platform, full-stack, production-ready and open source. The user connects, imports or enters their financial data and the product turns it into clarity: where the money goes, what patterns exist, where there's risk and where there's an opportunity to save.

**Problem it solves.** Personal finance control today lives at two bad extremes: spreadsheets (powerful but laborious, no intelligence, easy to abandon) and closed apps (pretty but black boxes, no transparency about data and no ability to answer open questions). Between the two, there's a missing tool that is at the same time transparent, automated and conversational.

**Who it's for.** People who want to understand and organize their financial life without becoming finance experts — from those who just want to stop being surprised by the bill, to those in debt who need a payoff plan, to self-employed people with variable income and technical users who want to analyze their own data.

**Value proposition.** You talk to your own financial data in natural language and receive answers grounded in the real numbers — not guesswork. Categorization is automatic, insights are actionable, and nothing happens to your data without your consent.

**Why AI makes sense here.** Personal finance is a problem of _interpreting unstructured data_: statements come in different formats, transaction descriptions are cryptic ("PAG\*IFD3344"), and the question the user wants to ask ("can I afford to travel?") doesn't map to a table filter. AI solves all three ends: it normalizes and categorizes messy data, answers open questions with context, and generates proactive insights the user wouldn't think to look for. Without AI, this becomes a pretty spreadsheet.

**Difference from a common finance app.** Traditional apps show _what happened_ (static dashboards). FinSight answers _why_ and _what to do_ — and shows where it got the answer. On top of that, it's open source and transparent about data use, the opposite of a black box.

**Difference from a spreadsheet.** Zero manual formula maintenance, automatic categorization, natural-language questions, and proactive insights. The spreadsheet requires you to already know what to ask; FinSight suggests what's worth looking at.

**As a real product and as an open source project.** As a product, it's genuinely usable for personal finance control (supports manual entry + statement import, like a Mobills with AI). As an open source project, it's a dense technical demonstration: RAG over personal data, grounded tool calling, PDF/CSV ingestion, modern full-stack architecture, sensitive-data security and observability.

---

## 2. Personas

### Persona 1 — Mariana, the organizer

- **Profile:** 29, marketing analyst, salaried, stable income ~R$ 6k. Uses the card for everything and looks at the bill at the end of the month in shock.
- **Pains:** doesn't know where the money goes; forgotten subscriptions; a sense that "money just disappears".
- **Goals:** a clear view of spending by category; identify waste; manage to save a little every month.
- **Behaviors:** wants a quick setup, low tolerance for manual work; uses it heavily on mobile.
- **Key features:** statement import, automatic categorization, dashboard, subscription alerts.
- **Experience risks:** abandoning if onboarding takes too much effort; frustration if categorization is often wrong.
- **What keeps her:** the app delivers value already on the first imported statement (short time-to-first-value).

### Persona 2 — Rafael, the indebted

- **Profile:** 35, technician, has 3 loans at different banks and gets lost in the installments and interest.
- **Pains:** doesn't know which debt to pay off first; interest eating into income; financial anxiety.
- **Goals:** a clear payoff plan; understand how much he saves by paying one debt before another.
- **Behaviors:** motivated but needs concrete, non-judgmental guidance; checks frequently.
- **Key features:** debt module, payoff strategy (avalanche/snowball) suggested by the AI, projections.
- **Experience risks:** an alarmist or judgmental tone would push him away; absolute promises would cause frustration if they don't come true.
- **What keeps him:** seeing the debt shrink and the AI confirming the plan is working.

### Persona 3 — Carla, the freelancer

- **Profile:** 41, freelance designer, variable income (R$ 3k to R$ 12k/month), multiple clients.
- **Pains:** good and bad months; difficulty separating personal from business; doesn't know how much she can spend.
- **Goals:** smooth out cash flow; understand her real average income; plan a reserve for lean months.
- **Behaviors:** enters income manually (sometimes paid outside the bank); needs flexibility.
- **Key features:** manual entries, recurring and one-off income, cash flow, reserve goals.
- **Experience risks:** rigid "fixed salary" models don't work; she needs a moving-average view.
- **What keeps her:** the app handles her irregularity well instead of assuming fixed income.

### Persona 4 — Diego, the analytical one

- **Profile:** 33, software engineer, likes data and wants to understand fine patterns in his own spending.
- **Pains:** closed apps won't let him explore; a spreadsheet is a chore; he wants ad-hoc questions.
- **Goals:** ask open questions ("compare my delivery vs supermarket spending over the last 6 months"); export data.
- **Behaviors:** explores deeply, tests limits, values transparency and the ability to see/export everything.
- **Key features:** AI chat, data export, transparency about response sources, open source.
- **Experience risks:** distrusts answers with no source; abandons if he notices the AI "making up" numbers.
- **What keeps him:** auditable answers (the AI shows which data each number came from) and being able to see the code.

---

## 3. Product goals

### Business

- Create a relevant and technically respected open source project (stars, forks, real use).
- Demonstrate product _and_ engineering maturity in a single portfolio artifact.
- Build a scalable architectural base that supports future integrations (Open Finance) without a rewrite.
- Reduce the friction of personal finance analysis to the point where the author uses their own product daily ("dogfooding").

### Product

- Give clarity about financial habits in under 5 minutes after the first data.
- Automate categorization at high quality (target: >85% accuracy without manual correction).
- Allow natural-language questions with answers grounded in real data.
- Generate actionable and proactive insights (not just reactive).
- Help the user reduce spending and pay off debts with concrete plans.
- Be trustworthy and secure with sensitive data by default.

### User experience

- Reduce the sense of financial complexity; translate data into simple language.
- Avoid an alarmist or judgmental tone — the product is a copilot, not a judge.
- Help decide better without promising absolute certainties.
- Be visually clear, trustworthy and accessible on desktop and mobile.

---

## 4. Value proposition

- **One-liner:** Talk to your money. FinSight AI turns your statements into clear answers.
- **Elevator pitch:** FinSight AI is a personal, open source financial copilot. You import statements or enter expenses manually, and it categorizes everything automatically, builds your dashboard, and answers natural-language questions about your financial life — always showing where it got each number. Unlike spreadsheets, it's no chore; unlike closed apps, it's transparent about your data and even helps you build a plan to pay off debts and hit goals.

**Main benefits:** immediate clarity, effortless categorization, auditable answers, actionable savings and payoff plans, full control of your own data.

**Differentiators:** grounded chat (tool calling over real data, without hallucinating numbers), source transparency, support for manual entry + import, a debt module with strategy, open source.

**Use cases:** understand the month's spending; find forgotten subscriptions; plan debt payoff; track goals; smooth out variable-income cash flow; export data for your own analysis.

**Product limits / what it does NOT promise:**

- It is not professional financial, legal or investment advice — it's an organization and analysis tool. `Risk`
- It does not guarantee returns, specific savings or payoff by a given date; projections are estimates.
- It does not execute transactions or move money.
- In the MVP, it doesn't connect automatically to banks (no Plaid/Open Finance — that's `Future`).
- It does not replace an accountant for tax matters.

---

## 5. MVP scope

### Must Have

- Authentication (OAuth) and minimal onboarding (currency, primary goal, data consent).
- Manual transaction entry (expense/income/transfer) + recurrences.
- CSV import with preview, column mapping, validation and deduplication.
- Categorization (manual + automatic suggestion with confirmation).
- Dashboard with balance, income, expenses, monthly trend, top categories and latest transactions.
- Transaction listing with search, filters, edit, delete and detail.
- Quality empty states, loading and error states.

### Should Have

- AI chat (tool calling over real data) and conversation history.
- PDF import (statement parsing).
- Basic proactive insights (unusual spend, category increase, subscriptions).
- Financial goals with progress tracking.
- Debt module with a payoff strategy.

### Could Have

- Monthly reports with an AI-generated summary and PDF/CSV export.
- Categorization learning from the user's corrections.
- Cash flow projections.
- Batch categorization.

### Won't Have Now (`Future`)

- Automatic bank integrations (Plaid / Open Finance) and webhooks.
- Multi-user / shared accounts / family.
- Native mobile app (the MVP is responsive web).
- Simultaneous multi-currency (MVP: a single currency per user).
- Published Storybook (decided in Phase 2).

---

## 6. Product features

> Summarized format per feature. The data entities cited are detailed in section 10.

### 6.1 Authentication and onboarding

- **Goal:** allow secure entry and capture the minimum context to personalize the experience.
- **Problem it solves:** sign-up friction and lack of initial context for insights.
- **Target user:** all personas.
- **Flow:** OAuth login → (if first access) a 3-step onboarding: default currency → primary financial goal → consent about data use and an explanation of AI/privacy → dashboard with a guided empty state.
- **States:** new user (onboarding), returning user (goes straight to the dashboard), expired session (re-login).
- **Business rules:** session via JWT; mandatory consent before any AI processing; logout invalidates the session.
- **Acceptance criteria:** the user creates an account with OAuth and lands in onboarding; preferences persist; logout works; without consent, AI is disabled.
- **Data:** `User`, `UserProfile`.
- **Errors:** OAuth failure, email already existing on another provider.
- **Security:** never log tokens; auditable consent.
- **Telemetry:** `signup_completed`, `onboarding_step_completed`, `onboarding_completed`, `time_to_first_value`.
- **MVP:** yes. **Future:** advanced preferences, 2FA.

### 6.2 Financial dashboard

- **Goal:** give a reading of the month at a glance.
- **Flow:** on entry, see balance/income/expense/savings cards, a trend chart, top categories, latest transactions, insights and alerts.
- **States:** no data (empty with a CTA to import/add), partial data (only 1 account), complete data.
- **Rules:** default period = current month; values always in the profile's currency.
- **Acceptance criteria:** metrics match the sum of the period's transactions; the empty state offers import/add; insights appear when there's enough data.
- **Data:** `Transaction`, `Category`, `AIInsight`.
- **Telemetry:** `dashboard_viewed`, `insight_clicked`.
- **MVP:** yes (insights are Should Have).

### 6.3 Transaction management

- **Goal:** be the source of truth for entries, coming from import or manual.
- **Flow:** list grouped by date → clicking opens a detail panel → edit category/note/amount; create manual via a form; delete with confirmation.
- **States:** full list, empty, filtered with no results, loading error.
- **Rules:** a transaction belongs to exactly one user and one account; the origin (`manual`/`import`/`recurring`) is recorded and immutable; soft delete.
- **Acceptance criteria:** full CRUD; search and filters work; recategorization persists; origin badge visible.
- **Data:** `Transaction`, `Category`, `Tag`, `Account`.
- **Telemetry:** `transaction_created_manual`, `transaction_recategorized`, `transaction_deleted`.
- **MVP:** yes. **Future:** advanced tags, attachments.

### 6.4 Data import

- **Goal:** bring statements in with the fewest errors.
- **Flow:** upload CSV/PDF → parsing → column mapping (CSV) → preview with per-row validation → deduplication → confirmation → persistence → summary.
- **States:** upload in progress, parsing, preview, per-row errors, completed, failed.
- **Rules:** duplicate imports detected by hash (date+amount+description+account); confirmation required before saving; auditable history; job rollback when possible.
- **Acceptance criteria:** CSV imports with mapping; duplicates flagged and not duplicated; per-row errors shown; history recorded.
- **Data:** `ImportJob`, `ImportRow`, `UploadedFile`, `Transaction`.
- **Errors:** invalid/corrupt file, unrecognized format, malformed row.
- **Security:** size limit; type validation; file scanned and discarded after processing per policy. `Risk` (sensitive data in files).
- **Telemetry:** `import_started`, `import_completed`, `import_failed`, `import_rows_error_count`.
- **MVP:** CSV yes; PDF is Should Have.

### 6.5 Smart categorization

- **Goal:** classify transactions with no manual work.
- **Flow:** a transaction arrives → the AI suggests a category with a confidence score → the user confirms/corrects → (future) the system learns a recurring rule.
- **Rules:** suggestions are NOT applied automatically without confirmation, unless the user enables that in settings; corrections take priority over the AI.
- **Acceptance criteria:** the suggestion shows confidence; a correction persists; batch application asks for confirmation.
- **Data:** `Transaction`, `Category`.
- **Telemetry:** `category_suggested`, `category_accepted`, `category_corrected`.
- **MVP:** manual categorization + simple suggestion. **Future:** rules learning, batch.

### 6.6 Financial AI chat

- **Goal:** answer open questions based on the user's real data.
- **Flow:** the user asks → the AI decides which _tools_ to call → queries data → responds with streaming, citing the data used → the user gives feedback (👍/👎).
- **States:** idle (with suggestions), thinking/querying, streaming, error, rate limit reached.
- **Rules:** every response indicates it was generated by AI; numbers come from tool calls (not "memory"); disclaimers when the question asks for advice; scope limited to the user's own finances. `Risk` (hallucination, prompt injection).
- **Acceptance criteria:** answers use real data via tools; sources displayed; streaming works; feedback recorded; no other users' data ever.
- **Data:** `AIConversation`, `AIMessage`, `AIEmbedding`, all the read tools.
- **Telemetry:** `ai_question_asked`, `ai_tool_called`, `ai_response_feedback`, `ai_tokens_used`.
- **MVP:** Should Have (the core of the differentiator).
- **Example questions:** where did I spend the most this month; how much did I spend on delivery over the last 3 months; what can I cut; does my income cover my fixed expenses; forecast for the next 2 months; which recurring subscriptions do I have; did my card spending go up; which category impacted the budget the most.

### 6.7 Insights and recommendations

- **Goal:** proactively point out what deserves attention.
- **Flow:** a job analyzes data → generates insights with severity → the user sees, applies, ignores or marks as useful.
- **Rules:** an insight has severity and status; ignoring removes it from the list; actionable recommendations when possible.
- **Acceptance criteria:** insights generated from rules/AI; severity visible; actions (apply/ignore/useful) work.
- **Data:** `AIInsight`.
- **Telemetry:** `insight_generated`, `insight_applied`, `insight_dismissed`, `insight_marked_useful`.
- **MVP:** Should Have (a rules-based version before AI).

### 6.8 Reports

- **Goal:** consolidate periods and allow export.
- **Flow:** choose period/type → see cards + charts + table → AI summary → export CSV/PDF.
- **Acceptance criteria:** report by month/category/period; export works; comparison between periods.
- **Data:** `Transaction`, `Category`, `AIInsight`.
- **MVP:** Could Have.

### 6.9 Financial goals

- **Goal:** give direction and tracking to objectives.
- **Flow:** create a goal (amount, deadline, related categories) → track progress → receive an AI projection and recommendation.
- **Rules:** a goal belongs to the user; progress computed from transactions/contributions; status (active/completed/late).
- **Acceptance criteria:** goals CRUD; correct progress; projection displayed.
- **Data:** `FinancialGoal`.
- **MVP:** Should Have.

### 6.10 Integrations (`Future`)

- **Goal:** sync bank data automatically.
- **Includes:** Plaid, Open Finance, webhooks, connection state, reauthorization, sync, logs, security.
- **Data:** `IntegrationConnection`, `WebhookEvent`.
- **MVP:** no. The whole architecture must leave the "slot" ready (a transaction's origin already anticipates `integration`).

### 6.11 Settings

- **Goal:** give control over profile, security, privacy and data.
- **Includes:** profile, currency, closing day, preferences, notifications, AI limits/model, consents, export data, delete account, manage integrations (Future).
- **Rules:** the user can export and delete all their data (LGPD/GDPR); deletion is irreversible and confirmed.
- **Acceptance criteria:** export generates JSON/CSV; deletion removes data; notification toggles persist.
- **Data:** `UserProfile`, `NotificationPreference`, `AuditLog`.
- **MVP:** yes (profile, currency, basic privacy, export/delete).

---

## 7. Functional requirements

**Auth**

- RF001 — The user must be able to create an account and authenticate via OAuth.
- RF002 — The system must maintain a secure session via JWT and allow logout.
- RF003 — The system must require data-use consent before processing AI.

**Onboarding**

- RF010 — The user must set a default currency on first access.
- RF011 — The user must provide a primary financial goal.
- RF012 — The system must record the completion of onboarding.

**Dashboard**

- RF020 — The system must display balance, income, expenses and savings for the period.
- RF021 — The system must display the monthly trend and top categories.
- RF022 — The system must display an empty state when there is no data.

**Transactions**

- RF030 — The user must create, edit and delete transactions manually.
- RF031 — The user must search, filter and sort transactions.
- RF032 — The user must recategorize and add notes/tags.
- RF033 — The system must record the origin of each transaction.

**Import**

- RF040 — The user must import transactions via CSV.
- RF041 — The system must allow column mapping and a preview before saving.
- RF042 — The system must detect and flag duplicates.
- RF043 — The system must keep an auditable import history.
- RF044 — The user must import via PDF (`Should Have`).

**Categories**

- RF050 — The system must suggest categories automatically for transactions.
- RF051 — The system must display the suggestion's confidence.
- RF052 — The system must not apply suggestions without confirmation, except with explicit configuration.

**AI Chat**

- RF060 — The user must ask in natural language about their finances.
- RF061 — The system must respond via streaming using tool calling over real data.
- RF062 — The system must indicate the sources/data used in the response.
- RF063 — The system must record conversations and allow feedback.
- RF064 — The system must signal that the response was generated by AI.

**Insights**

- RF070 — The system must generate insights with severity and status.
- RF071 — The user must be able to apply, ignore or mark an insight as useful.

**Reports**

- RF080 — The user must generate reports by month/category/period (`Could Have`).
- RF081 — The user must export reports in CSV/PDF.

**Goals**

- RF090 — The user must create, edit and delete goals.
- RF091 — The system must track progress and display a projection.

**Integrations (`Future`)**

- RF100 — The system must connect accounts via Plaid/Open Finance.
- RF101 — The system must process sync webhooks.

**Settings**

- RF110 — The user must edit profile, currency and preferences.
- RF111 — The user must export all their data.
- RF112 — The user must delete the account and all data.

---

## 8. Non-functional requirements

- **Security:** per-user data isolation in every query; tokens never logged; validation of every input with Zod.
- **Privacy:** LGPD/GDPR compliance; data never used for training; self-service export and delete.
- **Performance:** dashboard < 1s with cached data; import of 1,000 rows < 10s; AI streaming starts in < 2s.
- **Accessibility:** WCAG 2.1 AA; keyboard navigation; visible focus; charts with a textual alternative.
- **Observability:** distributed tracing (OpenTelemetry), errors (Sentry), API and AI-cost metrics.
- **Scalability:** stateless app architecture; cache in Redis; adequate indexes in Postgres.
- **Resilience:** an AI failure doesn't take down the app (degrades gracefully); import with rollback.
- **Testability:** business logic in pure services, testable without I/O.
- **DX:** local setup with one command; data seed; shared types.
- **AI cost:** rate limit per user; cache of frequent responses; model choice (Haiku for cheap tasks). `Risk`
- **Auditing:** sensitive actions (export, delete, import) recorded in `AuditLog`.
- **Maintainability:** clear separation by domain; documented conventions.

---

## 9. Business rules

1. Every transaction belongs to exactly one user and is not accessible by others (`Risk` if violated).
2. Financial data never crosses between users — every access filters by `userId`.
3. Duplicate imports are detected by a hash of (date + amount + description + account).
4. AI suggestions are not applied automatically without confirmation, unless the user enables that option.
5. The system always indicates when a response was generated by AI.
6. The system does not present financial advice as absolute certainty; projections have a disclaimer.
7. The user can export and delete all their data at any time.
8. The import history is auditable and immutable.
9. External integrations store only what's needed (encrypted tokens, minimal data).
10. A transaction's origin (`manual`/`import`/`recurring`/`integration`) is recorded and immutable.
11. Deletion uses soft delete in the product; hard delete only in the account-deletion flow.

---

## 10. Conceptual data model

> The physical detail (fields, indexes, constraints) is in `architecture.md`. This is the product view.

| Entity                   | Responsibility                             | Relationships                          | Security note                  | MVP    |
| ------------------------ | ------------------------------------------ | -------------------------------------- | ------------------------------ | ------ |
| `User`                   | Identity and authentication                | 1:1 `UserProfile`; 1:N almost everything | Root of per-user isolation   | Yes    |
| `UserProfile`            | Preferences (currency, goal, closing)      | 1:1 `User`                             | —                              | Yes    |
| `Account`                | Account/origin (Nubank, Itaú, cash)        | N:1 `User`; 1:N `Transaction`          | —                              | Yes    |
| `Transaction`            | Financial entry                            | N:1 `User`, `Account`, `Category`      | Sensitive core                 | Yes    |
| `Category`               | Expense/income category                    | 1:N `Transaction`                      | —                              | Yes    |
| `Tag`                    | Free-form label                            | N:N `Transaction` via `TransactionTag` | —                              | Could  |
| `TransactionTag`         | Transaction↔tag join                       | —                                      | —                              | Could  |
| `ImportJob`              | An import process                          | N:1 `User`; 1:N `ImportRow`            | Auditable                      | Yes    |
| `ImportRow`              | A row of an import                         | N:1 `ImportJob`                        | —                              | Yes    |
| `UploadedFile`           | Uploaded file                              | N:1 `User`/`ImportJob`                 | Discarded after processing     | Yes    |
| `AIConversation`         | A chat session                             | N:1 `User`; 1:N `AIMessage`            | —                              | Should |
| `AIMessage`              | A message (user/assistant/tool)            | N:1 `AIConversation`                   | No PII in logs                 | Should |
| `AIInsight`              | A generated insight                        | N:1 `User`                             | —                              | Should |
| `AIEmbedding`            | Vector for RAG                             | N:1 `User`/`Transaction`               | Isolated per user              | Should |
| `FinancialGoal`          | A financial goal                           | N:1 `User`                             | —                              | Should |
| `Debt`                   | A debt/loan                                | N:1 `User`                             | —                              | Should |
| `IntegrationConnection`  | A bank connection                          | N:1 `User`                             | Encrypted tokens               | Future |
| `WebhookEvent`           | A received event                           | N:1 `IntegrationConnection`            | —                              | Future |
| `AuditLog`               | Trail of sensitive actions                 | N:1 `User`                             | Append-only                    | Yes    |
| `NotificationPreference` | Notification toggles                       | 1:1/N:1 `User`                         | —                              | Yes    |

> Note: I added `Debt` to the model because the debt module (screen 6) became a product differentiator and wasn't in the original list.

---

## 11. Main flows

For each flow: step by step, success, error, empty, data, caution.

1. **Create account + onboarding** — OAuth → currency → goal → consent → guided empty dashboard. _Error:_ OAuth fails → retry. _Caution:_ don't ask for too much data.
2. **First manual transaction** — Entries → type → fill → save → appears on the dashboard. _Empty:_ highlighted CTA. _Caution:_ validate amount/date.
3. **Import CSV** — upload → map columns → preview → resolve duplicates → confirm → summary. _Error:_ invalid row flagged without blocking valid ones.
4. **Import PDF** — upload → parsing → preview (no manual mapping) → confirm. _Caution:_ parser quality varies by bank. `Risk`
5. **Fix categories** — open a transaction → change category → (optional) apply to similar ones. _Caution:_ confirmation before batch.
6. **Ask the AI** — type → the AI calls tools → streaming with sources → feedback. _Error:_ AI unavailable → a clear message, data still accessible. _Caution:_ never make up numbers.
7. **View dashboard** — enter → metrics + charts + insights. _Empty/partial:_ dedicated states.
8. **Create a goal** — define amount/deadline/categories → track → AI projection.
9. **Monthly report** — period → cards/charts/table → AI summary → export.
10. **Connect an integration** (`Future`) — choose a bank → the provider's OAuth → sync.
11. **Export data** — Settings → export → JSON/CSV. _Caution:_ record in auditing.
12. **Delete account** — Settings → confirm (double confirmation) → hard delete → logout.

---

## 12. Interface experience

- **Main routes:** `/dashboard`, `/chat`, `/transactions`, `/import`, `/entries`, `/categories`, `/goals`, `/debts`, `/reports`, `/settings`, `/onboarding`, `/auth`.
- **Layout:** AppShell with a fixed sidebar (desktop) + topbar; content with a consistent PageHeader.
- **Side menu:** "Main" (dashboard, chat, transactions, import, entries) and "Analysis" (categories, goals, debts, reports) groups + settings.
- **Topbar:** logo, notifications, avatar/account menu.
- **Breadcrumbs:** only on deep screens (e.g. import detail). Otherwise, the PageHeader is enough.
- **Empty/loading/error states:** dedicated, reusable components (see design-system.md).
- **Feedback:** toasts for actions (saved, imported, deleted); modals for destructive confirmations; a drawer/side panel for transaction detail.
- **Main components:** MetricCard, ChartCard, TransactionRow/List, AIChat, InsightCard, ImportPreviewTable, GoalProgressCard, DebtCard.
- **Mobile:** sidebar becomes a drawer/bottom-nav; tables become lists; collapsible filters; primary actions always accessible.
- **Desktop:** master-detail (list + panel), a 12-column grid on the dashboard.

---

## 13. Product metrics

- **Activation:** % who complete onboarding; % who add the first data (manual or import).
- **Time to first value (TTFV):** minutes between signup and the first dashboard with data.
- **Retention:** D1/D7/D30; weekly active users.
- **Data engagement:** transactions created/imported; imports completed vs failed.
- **AI:** questions asked; tool calls per question; positive/negative feedback; tokens/cost per user.
- **Insights:** generated, viewed, applied, ignored.
- **Goals:** created; % completed.
- **Reports:** generated; exports.
- **Quality:** import error rate; category correction rate (a proxy for AI accuracy).
- **Onboarding funnel:** completion rate per step.

---

## 14. Risks and cautions

| Item                                              | Type   | Impact   | Likelihood | Mitigation                                                                    |
| ------------------------------------------------- | ------ | -------- | ---------- | ----------------------------------------------------------------------------- |
| Leak/crossover of data between users              | `Risk` | Critical | Low        | Per-`userId` isolation in every query; authorization tests; review.           |
| Sensitive data in imported files                  | `Risk` | High     | Medium     | Size limit, type validation, discard after processing, no PII in logs.         |
| AI hallucination (made-up numbers)                | `Risk` | High     | Medium     | Numbers only via tool calls; display sources; tests with mocks; disclaimers.   |
| Prompt injection (via transaction description/PDF)| `Risk` | High     | Medium     | Sanitization; separate data from instructions; restricted tool scope.          |
| Uncontrolled AI cost                              | `Risk` | Medium   | Medium     | Rate limit, cache, a cheap model for simple tasks, a per-user budget.          |
| Incorrect import (PDF parsing)                    | `Risk` | Medium   | High       | Mandatory preview, confirmation, rollback, incremental per-bank support.       |
| User trust (tone/security)                        | `Risk` | High     | Medium     | Non-judgmental tone; data transparency; no absolute promises.                  |
| MVP complexity/scope                              | `Risk` | Medium   | High       | Lean Must Have scope; AI and PDF as Should; integrations as Future.            |
| Overly dense interface                            | `Risk` | Medium   | Medium     | Clear hierarchy, empty states, progressive disclosure.                         |
| Dependence on external APIs                       | `Risk` | Medium   | Low (MVP)  | Integrations outside the MVP; a provider abstraction when they come in.         |
| LGPD/GDPR                                         | `Risk` | High     | Low        | Consent, export/delete, auditing, data minimization.                           |

---

## 15. Product roadmap

- **Phase 0 — Setup and foundation:** technical base, design system, database, auth, CI/CD.
- **Phase 1 — Manual MVP:** auth, basic dashboard, manual transactions, categories, charts.
- **Phase 2 — Import:** CSV (then PDF), validation, preview, history.
- **Phase 3 — Financial AI:** chat, tool calling, insights, smart categorization.
- **Phase 4 — Reports and goals:** reports, goals, debts, projections, export.
- **Phase 5 — Integrations (`Future`):** Plaid/Open Finance, webhooks, sync.
- **Phase 6 — Hardening:** observability, advanced security, E2E, performance, OSS docs.

> Detail by version (0.1 → 1.0) is in `roadmap.md`.
