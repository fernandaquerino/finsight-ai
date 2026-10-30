# FinSight AI — Roadmap

> Incremental roadmap per version. Each version is deployable and delivers value.

## v0.1 — Foundation

- Project setup (Next.js 15, TS, npm, ESLint/Prettier).
- Docker Compose (Postgres+pgvector, Redis), `.env.example`.
- Design tokens + Tailwind theme + shadcn configured.
- AppShell (Sidebar/Topbar) + base components + feedback states.
- Auth.js (OAuth + JWT) + route protection.
- Initial Drizzle schema + migrations + seed.
- CI (lint, typecheck, unit, build, drizzle-check).
- **Result:** an authenticatable, navigable app, with a database and a design system, no domain features yet.

## v0.2 — Manual finance MVP

- Onboarding (currency, goal, consent).
- Manual entries (expense/income/transfer) + recurrences.
- Transaction CRUD + master-detail list + filters/search.
- Categories (manual) + CategoryBadge.
- Basic dashboard (metrics + trend + top categories + latest).
- **Result:** already genuinely usable for manual tracking (Mobills-style without AI).

## v0.3 — Import MVP

- CSV upload + validation.
- Column mapping + ImportPreviewTable.
- Deduplication + transactional confirmation.
- Import history + ImportStatusCard.
- **Result:** bank statements come in; time-to-first-value drops drastically.

## v0.4 — AI MVP

- AI chat components.
- Orchestration with the Vercel AI SDK + streaming + system prompts + guards.
- Read tools + per-user isolation.
- Embeddings (pgvector) + RAG.
- Chat endpoint + history + feedback.
- Rate limit + AI cache.
- First insights (rules engine) + InsightCard.
- **Result:** the product's differentiator — talking to your own data, with grounded answers.

## v0.5 — Reports, Goals & Debts

- Goals (CRUD + progress + AI projection).
- Debts (CRUD + avalanche/snowball payoff strategy).
- Reports (cards/charts/table + AI summary).
- CSV/PDF export.
- PDF statement parser.
- **Result:** full coverage of personal use, including debts and planning.

## v1.0 — Production ready

- Observability (Sentry + OpenTelemetry + structured logs + AI metrics).
- Advanced security (global rate limit, RLS `Decision Needed`, LGPD/GDPR export/delete).
- E2E tests of the critical flows + isolation tests + a11y.
- Performance and hardening.
- Complete open source documentation (README, docs, templates) + EN translation.
- Published Storybook `Decision Needed`.
- **Result:** a solid, secure, tested project, presentable as a portfolio piece.

## Future (post-1.0)

- Automatic bank integrations (Plaid / Open Finance) + webhooks.
- Categorization learning from the user's rules.
- Native mobile app.
- Simultaneous multi-currency.
- Shared / family accounts.
