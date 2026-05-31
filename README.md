This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Local Services

Start Postgres with pgvector and Redis:

```bash
cp .env.example .env
docker compose up -d
npm run dev
```

The local services use:

- Postgres: `localhost:5434`
- Redis: `localhost:6379`

Check the app connection to both services:

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

Useful service commands:

```bash
npm run db:up
npm run db:logs
npm run db:down
```

## Code Quality

This project uses ESLint with the Next.js Core Web Vitals and TypeScript presets, plus Prettier with `prettier-plugin-tailwindcss`.

Recommended VSCode settings live in `.vscode/settings.json` and enable format on save with Prettier. Install the Prettier and ESLint VSCode extensions to use the same setup in the editor.

Useful commands:

```bash
npm run lint
npm run type-check
npm run format
npm run format:check
```

## Tests

This project uses Vitest with Testing Library for unit and integration tests, and Playwright for E2E tests.

Run unit and integration tests:

```bash
npm test
```

Run E2E tests:

```bash
npm run test:e2e
```

Integration and E2E health tests need Postgres and Redis. For local runs, start the Docker services first:

```bash
cp .env.example .env
docker compose up -d
npx playwright install chromium
npm test
npm run test:e2e
```

The CI workflow in `.github/workflows/test.yml` starts `pgvector/pgvector:pg16` and Redis services before running the test suite.

## Git Hooks

This project uses Husky to run checks before commits:

- `pre-commit` runs `lint-staged`, applying ESLint and Prettier only to staged files, then runs `npm test`.
- `commit-msg` runs commitlint to enforce Conventional Commits.

After installing dependencies, npm runs the Husky setup through the `prepare` script. If needed, run it manually:

```bash
npm run prepare
```

Commit messages should use this format:

```txt
type: short description
```

Valid examples:

```txt
feat: add authentication setup
fix: handle empty transaction list
docs: update project documentation
chore: configure husky hooks
test: add transaction form tests
refactor: simplify dashboard metrics
```

Invalid examples:

```txt
added files
fix bug
update
WIP
created stuff
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
