# FinSight AI — Backlog (Épicos & Issues)

> Perspectiva: Engineering Manager / Agile Lead.
> Estimativas: P (≤1 dia), M (2-3 dias), G (4+ dias).

---

## 1. Épicos

| ID      | Épico                            | Foco                                       |
| ------- | -------------------------------- | ------------------------------------------ |
| EPIC-00 | Project Setup & DX               | Base do repo, tooling, CI/CD, Docker       |
| EPIC-01 | Design System & UI Foundation    | Tokens, shadcn, AppShell, componentes base |
| EPIC-02 | Authentication & User Management | OAuth, sessão, perfil                      |
| EPIC-03 | Database & Domain Modeling       | Schema Drizzle, migrations, seed           |
| EPIC-04 | Onboarding                       | Fluxo inicial, preferências, consentimento |
| EPIC-05 | Dashboard                        | Métricas, gráficos, estados                |
| EPIC-06 | Transactions                     | CRUD, lista, filtros, manual, detalhe      |
| EPIC-07 | CSV/PDF Ingestion                | Upload, preview, dedupe, histórico         |
| EPIC-08 | AI Layer & Chat                  | Tools, RAG, chat streaming                 |
| EPIC-09 | Insights & Recommendations       | Geração, severidade, ações                 |
| EPIC-10 | Reports                          | Relatórios, exportação                     |
| EPIC-11 | Goals & Debts                    | Metas, dívidas, estratégia                 |
| EPIC-12 | Integrations (`Future`)          | Plaid/Open Finance, webhooks               |
| EPIC-13 | Observability & Security         | Sentry, OTel, rate limit, RLS              |
| EPIC-14 | Testing & Production Hardening   | Cobertura, E2E, performance                |
| EPIC-15 | Documentation & Open Source      | README, docs, templates                    |

---

## 2. Issues

### EPIC-00 — Project Setup & DX

#### ISSUE 00-01 — Inicializar projeto Next.js 15 + TypeScript + npm

**Descrição** Criar a base do repositório com Next.js 15 (App Router), TypeScript estrito e npm.
**Objetivo** Ter um esqueleto rodável e tipado.
**Escopo** App Router, tsconfig estrito, estrutura de pastas de `architecture.md`.
**Tasks**

- [ ] `create-next-app` com App Router + TS
- [ ] Configurar npm e workspaces (se aplicável)
- [ ] Criar estrutura de pastas base
- [ ] Configurar paths/aliases (`@/`)
      **Critérios de aceite**
- [ ] `npm dev` sobe a aplicação
- [ ] `tsc --noEmit` passa
- [ ] Estrutura de pastas criada
      **Notas técnicas** TS estrito desde o início.
      **Dependências** —
      **Estimativa** P · **Prioridade** Alta · **Labels** `infra`

#### ISSUE 00-02 — ESLint, Prettier e convenções

**Tasks** [ ] ESLint config · [ ] Prettier + `prettier-plugin-tailwindcss` · [ ] format on save documentado · [ ] script `lint`
**Critérios de aceite** [ ] `npm lint` passa · [ ] formatação consistente
**Estimativa** P · **Prioridade** Alta · **Labels** `infra`

#### ISSUE 00-03 — Docker Compose (Postgres+pgvector, Redis) e .env.example

**Tasks** [ ] Compose com Postgres+pgvector e Redis · [ ] `.env.example` · [ ] script de start local
**Critérios de aceite** [ ] `docker compose up` sobe banco e Redis · [ ] app conecta localmente
**Estimativa** M · **Prioridade** Alta · **Labels** `infra`, `database`

#### ISSUE 00-04 — Pipeline CI (GitHub Actions)

**Tasks** [ ] install/cache · [ ] lint · [ ] typecheck · [ ] unit · [ ] build · [ ] verify-envs · [ ] drizzle-check
**Critérios de aceite** [ ] CI roda em cada PR e bloqueia merge se falhar
**Estimativa** M · **Prioridade** Alta · **Labels** `infra`, `testing`

#### ISSUE 00-05 — Setup de testes (Vitest + Testing Library + Playwright)

**Tasks** [ ] Vitest config · [ ] Testing Library · [ ] Playwright + serviço de banco · [ ] exemplo de cada
**Critérios de aceite** [ ] `npm test` e `npm e2e` rodam
**Estimativa** M · **Prioridade** Alta · **Labels** `testing`

---

### EPIC-01 — Design System & UI Foundation

#### ISSUE 01-01 — Definir direção visual e design tokens

**Descrição** Formalizar os tokens (cores, tipografia, espaçamento, radius) de `design-system.md` em código.
**Objetivo** Ter uma fonte única de verdade visual.
**Escopo** CSS variables (light/dark), arquivo de tokens TS.
**Tasks**

- [ ] CSS variables para todas as cores (light/dark)
- [ ] Tokens TS (radius, spacing, fontSize, zIndex, motion)
- [ ] Mapa de cores de gráfico e de categoria
- [ ] `next-themes` para alternância
      **Critérios de aceite**
- [ ] Tokens consumíveis no Tailwind config
- [ ] Dark mode funciona
- [ ] Nenhuma cor hardcoded em componentes
      **Estimativa** M · **Prioridade** Alta · **Labels** `design-system`, `frontend`

#### ISSUE 01-02 — Configurar tema Tailwind + CSS variables

**Tasks** [ ] Tailwind config consumindo variáveis · [ ] tipografia (Geist/Inter) · [ ] tabular-nums utilitário
**Critérios de aceite** [ ] classes do tema disponíveis · [ ] fontes carregando
**Estimativa** P · **Prioridade** Alta · **Labels** `design-system`

#### ISSUE 01-03 — Instalar e configurar shadcn/ui

**Tasks** [ ] init shadcn com tema do FinSight · [ ] adicionar primitivos (button, input, select, dialog, drawer, dropdown, popover, tooltip, tabs, switch, checkbox, badge, sonner, skeleton)
**Critérios de aceite** [ ] primitivos renderizam com tokens do FinSight
**Estimativa** M · **Prioridade** Alta · **Labels** `design-system`

#### ISSUE 01-04 — Criar componentes UI base

**Tasks** [ ] Button variants (cva) · [ ] Input com erro/label · [ ] Card · [ ] testes unit dos críticos
**Critérios de aceite** [ ] variantes e estados cobertos · [ ] a11y de foco
**Estimativa** M · **Prioridade** Alta · **Labels** `design-system`, `testing`

#### ISSUE 01-05 — AppShell com Sidebar e Topbar

**Tasks** [ ] AppShell no layout `(app)` · [ ] Sidebar com grupos Principal/Análise · [ ] Topbar · [ ] estado ativo · [ ] responsivo (drawer/bottom-nav no mobile)
**Critérios de aceite** [ ] navegação funciona · [ ] item ativo destacado · [ ] mobile colapsa
**Estimativa** G · **Prioridade** Alta · **Labels** `design-system`, `frontend`

#### ISSUE 01-06 — Componentes de card do dashboard

**Tasks** [ ] MetricCard (label/valor/trend) · [ ] ChartCard · [ ] PageHeader · [ ] SectionHeader
**Critérios de aceite** [ ] usados no dashboard · [ ] estados loading/empty
**Estimativa** M · **Prioridade** Alta · **Labels** `design-system`

#### ISSUE 01-07 — Componentes de data display

**Tasks** [ ] DataTable (TanStack) · [ ] DataFilterBar · [ ] Pagination · [ ] DateRangePicker · [ ] TransactionAmount · [ ] CategoryBadge · [ ] StatusBadge · [ ] TrendIndicator
**Critérios de aceite** [ ] DataTable com loading/empty · [ ] amount colore por sinal
**Estimativa** G · **Prioridade** Alta · **Labels** `design-system`

#### ISSUE 01-08 — Componentes de feedback (Empty/Loading/Error)

**Tasks** [ ] EmptyState · [ ] LoadingState (skeleton) · [ ] ErrorState com retry · [ ] Toast helper
**Critérios de aceite** [ ] reutilizáveis em qualquer query
**Estimativa** M · **Prioridade** Alta · **Labels** `design-system`

#### ISSUE 01-09 — Componentes de UI do chat de IA

**Tasks** [ ] AIChat layout · [ ] AIChatMessage (user/assistant) · [ ] AIInput · [ ] AIThinkingState · [ ] SourceReference · [ ] AIResponseFeedback · [ ] AISuggestionPrompt
**Critérios de aceite** [ ] streaming visual · [ ] fontes exibidas · [ ] a11y `aria-live`
**Estimativa** G · **Prioridade** Média · **Labels** `design-system`, `ai`

#### ISSUE 01-10 — Documentar uso dos componentes (Storybook)

**Tasks** [ ] setup Storybook · [ ] stories dos componentes prioritários · [ ] estados documentados
**Critérios de aceite** [ ] Storybook roda · [ ] componentes-chave com stories
**Estimativa** M · **Prioridade** Baixa · **Labels** `design-system`, `docs` · `Decision Needed`

---

### EPIC-02 — Authentication & User Management

- **02-01** Configurar Auth.js com OAuth (P, Alta, `backend`, `security`)
- **02-02** Sessão JWT + middleware de proteção de rotas (M, Alta, `backend`, `security`)
- **02-03** Página de login e logout (P, Alta, `frontend`)
- **02-04** Helper de `getCurrentUser`/`userId` server-side (P, Alta, `backend`)

> Exemplo detalhado:
> **ISSUE 02-02 — Sessão JWT + middleware**
> **Tasks** [ ] middleware protege grupo `(app)` · [ ] redireciona não autenticado · [ ] expira/rotaciona sessão
> **Critérios de aceite** [ ] rota protegida exige login · [ ] logout invalida sessão
> **Notas** nenhuma query sem `userId`. **Estimativa** M · **Prioridade** Alta · **Labels** `backend`, `security`

---

### EPIC-03 — Database & Domain Modeling

- **03-01** Schema Drizzle: users, user_profiles, accounts, categories (M, Alta, `database`)
- **03-02** Schema: transactions (+ origin, dedupe_hash, soft delete) e índices (M, Alta, `database`)
- **03-03** Schema: import_jobs, import_rows, uploaded_files (M, Alta, `database`)
- **03-04** Schema: ai_conversations, ai_messages, ai_insights, ai_embeddings (pgvector) (M, Média, `database`, `ai`)
- **03-05** Schema: financial_goals, debts, notification_preferences (P, Média, `database`)
- **03-06** Schema: audit_logs (append-only) (P, Média, `database`, `security`)
- **03-07** Seed de desenvolvimento (M, Média, `database`)
- **03-08** Repositórios base com isolamento por userId (M, Alta, `backend`, `security`)

---

### EPIC-04 — Onboarding

- **04-01** Fluxo de onboarding 3 passos (moeda, objetivo, consentimento) (M, Alta, `frontend`)
- **04-02** Persistir preferências e consentimento de IA (P, Alta, `backend`)
- **04-03** Empty state guiado pós-onboarding (P, Média, `frontend`)

---

### EPIC-05 — Dashboard

- **05-01** Endpoint/serviço de agregações do período (M, Alta, `backend`)
- **05-02** MetricCards (saldo, receita, despesa, economia) (P, Alta, `frontend`)
- **05-03** Gráfico de evolução mensal (M, Alta, `frontend`)
- **05-04** Top categorias + últimas transações (M, Alta, `frontend`)
- **05-05** Empty / partial data states (P, Média, `frontend`)
- **05-06** Cache de agregações em Redis (P, Média, `backend`)

---

### EPIC-06 — Transactions

- **06-01** Endpoint de listagem com filtros/paginação (M, Alta, `backend`)
- **06-02** Lista agrupada por data + master-detail (G, Alta, `frontend`)
- **06-03** TransactionForm (criar/editar) com RHF+Zod (M, Alta, `frontend`)
- **06-04** Recategorização e notas (P, Alta, `frontend`, `backend`)
- **06-05** Soft delete com confirmação (P, Alta, `backend`)
- **06-06** Busca e DataFilterBar (M, Média, `frontend`)
- **06-07** Painel de detalhe com histórico do estabelecimento (M, Média, `frontend`)

> Exemplo detalhado:
> **ISSUE 06-02 — Lista agrupada por data + master-detail**
> **Objetivo** Navegação de transações legível para uso pessoal.
> **Tasks** [ ] agrupar por dia · [ ] TransactionRow com badge de origem · [ ] abrir painel lateral (drawer no mobile) · [ ] estados loading/empty/error
> **Critérios de aceite** [ ] clicar abre detalhe sem navegar · [ ] mobile vira tela cheia · [ ] origem visível
> **Estimativa** G · **Prioridade** Alta · **Labels** `frontend`

---

### EPIC-07 — CSV/PDF Ingestion

- **07-01** Upload + validação de arquivo (tipo/tamanho) (M, Alta, `backend`, `security`)
- **07-02** Parser CSV + mapeamento de colunas (G, Alta, `backend`, `frontend`)
- **07-03** ImportPreviewTable com validação por linha (G, Alta, `frontend`)
- **07-04** Deduplicação por hash (M, Alta, `backend`)
- **07-05** Confirmação + persistência transacional (M, Alta, `backend`)
- **07-06** Histórico de importações + ImportStatusCard (M, Média, `frontend`, `backend`)
- **07-07** Parser PDF (heurística + IA por banco) (G, Média, `backend`, `ai`) `Risk`
- **07-08** Descarte de arquivo pós-processo (P, Média, `security`)

---

### EPIC-08 — AI Layer & Chat

- **08-01** Orquestração com Vercel AI SDK + streaming (M, Alta, `ai`)
- **08-02** System prompts versionados + guards anti prompt-injection (M, Alta, `ai`, `security`)
- **08-03** Tools de leitura (summary, byCategory, trends, recurring, topMerchants...) (G, Alta, `ai`, `backend`)
- **08-04** Geração e armazenamento de embeddings (pgvector) (M, Média, `ai`, `database`)
- **08-05** RAG: recuperação de contexto por similaridade (M, Média, `ai`)
- **08-06** Endpoint `/api/ai/chat` + histórico (M, Alta, `ai`, `backend`)
- **08-07** Tools de escrita com confirmação (createInsight, categorize) (M, Média, `ai`)
- **08-08** Rate limit + cache de IA (Redis) (M, Alta, `ai`, `security`) `Risk`
- **08-09** Testes de tools (fixtures) + chat com modelo mockado (M, Alta, `ai`, `testing`)

> Exemplo detalhado:
> **ISSUE 08-03 — Tools de leitura**
> **Objetivo** Garantir que a IA reporte números reais via queries estruturadas.
> **Tasks** [ ] definir schema de cada tool (Zod) · [ ] implementar consultas nos services · [ ] injetar `userId` da sessão (nunca do prompt) · [ ] testes unitários
> **Critérios de aceite** [ ] cada tool filtra por usuário · [ ] retorna dado estruturado · [ ] coberta por teste
> **Notas** a IA nunca acessa o banco direto; só via tools. **Estimativa** G · **Prioridade** Alta · **Labels** `ai`, `backend`, `security`

---

### EPIC-09 — Insights & Recommendations

- **09-01** Motor de insights por regras (gasto incomum, aumento, assinaturas) (G, Média, `backend`)
- **09-02** InsightCard com severidade e ações (P, Média, `frontend`)
- **09-03** Ações: aplicar/ignorar/útil + persistência (M, Média, `backend`, `frontend`)
- **09-04** Filtros por tipo/severidade (P, Baixa, `frontend`)

---

### EPIC-10 — Reports

- **10-01** Geração de relatório por período/categoria (M, Baixa, `backend`)
- **10-02** UI de relatório (cards/gráficos/tabela) (M, Baixa, `frontend`)
- **10-03** Resumo por IA (P, Baixa, `ai`)
- **10-04** Exportação CSV/PDF (M, Baixa, `backend`)

---

### EPIC-11 — Goals & Debts

- **11-01** CRUD de metas + progresso (M, Média, `backend`, `frontend`)
- **11-02** GoalProgressCard + projeção da IA (M, Média, `frontend`, `ai`)
- **11-03** CRUD de dívidas (M, Média, `backend`, `frontend`)
- **11-04** DebtStrategyPanel (avalanche/bola de neve) com economia estimada (M, Média, `ai`, `frontend`)

> Exemplo detalhado:
> **ISSUE 11-04 — Estratégia de quitação de dívidas**
> **Objetivo** Dar a Rafael um plano concreto e fundamentado.
> **Tasks** [ ] calcular ordem por método avalanche e bola de neve · [ ] estimar economia de juros e tempo · [ ] painel explicando a recomendação · [ ] disclaimer (estimativa, não aconselhamento)
> **Critérios de aceite** [ ] cálculo correto verificado por teste · [ ] economia exibida em R$ · [ ] disclaimer presente
> **Estimativa** M · **Prioridade** Média · **Labels** `ai`, `frontend`, `backend`

---

### EPIC-12 — Integrations (`Future`)

- **12-01** Abstração de provider de integração (M, Future, `backend`)
- **12-02** Conexão Plaid/Open Finance (G, Future, `backend`, `security`)
- **12-03** Webhooks de sincronização + logs (G, Future, `backend`)
- **12-04** UI de estado de conexão / reautorização (M, Future, `frontend`)

---

### EPIC-13 — Observability & Security

- **13-01** Sentry (front + back) (P, Alta, `infra`)
- **13-02** OpenTelemetry tracing (M, Média, `infra`)
- **13-03** Logs estruturados sem PII (P, Alta, `security`)
- **13-04** Rate limit global em endpoints sensíveis (M, Alta, `security`)
- **13-05** Métricas de custo de IA + alerta (M, Média, `ai`, `infra`) `Risk`
- **13-06** Postgres RLS como defesa em profundidade (M, Média, `database`, `security`) `Decision Needed`
- **13-07** Export e exclusão de dados (LGPD/GDPR) (M, Alta, `backend`, `security`)

---

### EPIC-14 — Testing & Production Hardening

- **14-01** Testes de isolamento por usuário (autorização) (M, Alta, `testing`, `security`)
- **14-02** E2E dos fluxos críticos (G, Alta, `testing`)
- **14-03** Testes de a11y (axe) (M, Média, `testing`)
- **14-04** Performance do dashboard e listas (M, Média, `frontend`)
- **14-05** Auditoria de segurança e dependências (M, Média, `security`)

---

### EPIC-15 — Documentation & Open Source

- **15-01** README com pitch, screenshots, setup (M, Alta, `docs`)
- **15-02** CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / LICENSE (P, Alta, `docs`)
- **15-03** docs/api.md, database.md, ai.md (M, Média, `docs`)
- **15-04** Templates de issue e PR (P, Média, `docs`)
- **15-05** Publicar Storybook (P, Baixa, `docs`) `Decision Needed`

---

## 3. Ordem de implementação

**Sprint 0 — Fundação:** EPIC-00 inteiro, EPIC-01 (01-01 a 01-08), EPIC-02, EPIC-03.
**Sprint 1 — MVP core:** EPIC-04, EPIC-05, EPIC-06.
**Sprint 2 — Importação:** EPIC-07 (CSV: 07-01 a 07-06).
**Sprint 3 — IA:** EPIC-01 (01-09), EPIC-08, EPIC-09.
**Sprint 4 — Relatórios, metas e dívidas:** EPIC-10, EPIC-11, EPIC-07 (07-07 PDF).
**Sprint 5 — Produção:** EPIC-13, EPIC-14, EPIC-15.
**Backlog futuro:** EPIC-12 (integrações).
