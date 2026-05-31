# FinSight AI

**Status:** In development

FinSight AI is an open source personal finance analysis platform powered by AI. The goal is to help users import bank statements or add transactions manually, understand spending patterns, ask questions about their own financial data, and receive actionable insights for goals, debt payoff, and budgeting.

The product is being built as a production-ready full-stack app with a strong focus on data isolation, testability, security, and clear user experience for sensitive financial data.

> FinSight AI does not provide professional financial, legal, tax, or investment advice. Insights and projections are estimates for personal organization and analysis only.

## Stack

- **App:** Next.js App Router, React, TypeScript strict
- **Styling:** Tailwind CSS, shadcn/ui design primitives
- **Data:** PostgreSQL with pgvector, Redis
- **Backend:** Next.js route handlers, service/repository layers
- **AI:** Vercel AI SDK, tool calling, RAG with user-scoped embeddings
- **Testing:** Vitest, Testing Library, Playwright
- **Quality:** ESLint, Prettier, Husky, lint-staged
- **Infra:** Docker Compose for local Postgres and Redis

## Local Setup

### Requirements

- Node.js 22 recommended (`.nvmrc` is included)
- npm
- Docker Desktop or another Docker-compatible runtime

Use the project Node version:

```bash
nvm install
nvm use
```

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Start local services:

```bash
npm run db:up
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Check database and Redis connectivity:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "services": {
    "postgres": "ok",
    "redis": "ok"
  }
}
```

## Main Commands

```bash
npm run dev             # Start Next.js dev server with webpack
npm run dev:turbo       # Start Next.js dev server with Turbopack
npm run build           # Production build
npm run start           # Start production server

npm run lint            # ESLint
npm run type-check      # TypeScript check
npm test                # Vitest unit/integration tests
npm run test:e2e        # Playwright E2E tests
npm run format:check    # Check formatting
npm run format          # Format files

npm run db:up           # Start Postgres + Redis
npm run db:down         # Stop local services
npm run db:logs         # Follow local service logs

npm run verify-envs     # Validate environment configuration
npm run drizzle-check   # Validate Drizzle migration state
```

## Documentation

- [Product documentation](./docs/product.md)
- [Technical architecture](./docs/architecture.md)
- [Design system](./docs/design-system.md)
- [Roadmap](./docs/roadmap.md)
- [Backlog](./docs/backlog.md)
- [AI collaboration guide](./docs/ai-collaboration.md)

## Roadmap Summary

- **v0.1 Foundation:** project setup, local infrastructure, base design system, auth foundation, database setup, CI.
- **v0.2 Manual finance MVP:** onboarding, manual transactions, categories, filters, dashboard.
- **v0.3 Import MVP:** CSV upload, column mapping, preview, validation, deduplication, import history.
- **v0.4 AI MVP:** AI chat, streaming, tool calling, user-scoped RAG, guards, rate limiting, first insights.
- **v0.5 Reports, Goals & Debts:** goals, debt payoff strategies, reports, exports, PDF statement parsing.
- **v1.0 Production ready:** observability, hardening, E2E coverage, accessibility, performance, open source documentation.

## Current Scope

The repository is still early and intentionally marked **In development**. Some product and architecture documents describe the target system, while the implementation is being built incrementally through the roadmap above.

Security rules for financial data are non-negotiable:

- Every user-scoped query must filter by `userId`.
- AI tools receive `userId` from the server session, never from a prompt.
- Financial values, transaction descriptions, tokens, and personal data must not be logged.
- AI suggestions that mutate user data require explicit user confirmation.

## Contributing

This project follows Conventional Commits:

```txt
feat(transactions): add grouped list
fix(imports): handle malformed csv rows
docs(readme): add local setup guide
```

Before opening a pull request, run:

```bash
npm run lint
npm run type-check
npm test
```

For changes touching critical flows, also run:

```bash
npm run test:e2e
```
