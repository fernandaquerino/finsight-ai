# FinSight AI — Roadmap

> Roadmap incremental por versão. Cada versão é deployável e entrega valor.

## v0.1 — Foundation

- Setup do projeto (Next.js 15, TS, npm, ESLint/Prettier).
- Docker Compose (Postgres+pgvector, Redis), `.env.example`.
- Design tokens + tema Tailwind + shadcn configurado.
- AppShell (Sidebar/Topbar) + componentes base + feedback states.
- Auth.js (OAuth + JWT) + proteção de rotas.
- Schema Drizzle inicial + migrations + seed.
- CI (lint, typecheck, unit, build, drizzle-check).
- **Resultado:** app autenticável, navegável, com banco e design system, sem features de domínio ainda.

## v0.2 — Manual finance MVP

- Onboarding (moeda, objetivo, consentimento).
- Lançamentos manuais (despesa/receita/transferência) + recorrências.
- CRUD de transações + lista master-detail + filtros/busca.
- Categorias (manual) + CategoryBadge.
- Dashboard básico (métricas + evolução + top categorias + últimas).
- **Resultado:** já dá para usar de verdade para controle manual (estilo Mobills sem IA).

## v0.3 — Import MVP

- Upload CSV + validação.
- Mapeamento de colunas + ImportPreviewTable.
- Deduplicação + confirmação transacional.
- Histórico de importações + ImportStatusCard.
- **Resultado:** entra extrato de banco; tempo até primeiro valor cai drasticamente.

## v0.4 — AI MVP

- Componentes de chat de IA.
- Orquestração com Vercel AI SDK + streaming + system prompts + guards.
- Tools de leitura + isolamento por usuário.
- Embeddings (pgvector) + RAG.
- Endpoint de chat + histórico + feedback.
- Rate limit + cache de IA.
- Primeiros insights (motor por regras) + InsightCard.
- **Resultado:** o diferencial do produto — conversar com os próprios dados, com respostas fundamentadas.

## v0.5 — Reports, Goals & Debts

- Metas (CRUD + progresso + projeção da IA).
- Dívidas (CRUD + estratégia de quitação avalanche/bola de neve).
- Relatórios (cards/gráficos/tabela + resumo IA).
- Exportação CSV/PDF.
- Parser PDF de extratos.
- **Resultado:** cobertura completa do uso pessoal, incluindo dívidas e planejamento.

## v1.0 — Production ready

- Observabilidade (Sentry + OpenTelemetry + logs estruturados + métricas de IA).
- Segurança avançada (rate limit global, RLS `Decision Needed`, export/delete LGPD/GDPR).
- Testes E2E dos fluxos críticos + testes de isolamento + a11y.
- Performance e hardening.
- Documentação open source completa (README, docs, templates) + tradução EN.
- Storybook publicado `Decision Needed`.
- **Resultado:** projeto sólido, seguro, testado e apresentável como portfólio.

## Future (pós-1.0)

- Integrações bancárias automáticas (Plaid / Open Finance) + webhooks.
- Aprendizado de categorização por regras do usuário.
- App mobile nativo.
- Multi-moeda simultânea.
- Contas compartilhadas / família.
