# CLAUDE.md — FinSight AI

> Instruções persistentes para o Claude Code. Leia este arquivo antes de qualquer ação no repositório.

---

## 1. Project overview

**FinSight AI** é uma plataforma de análise financeira pessoal com IA — full-stack, production-ready e open source.

O usuário importa extratos bancários (CSV/PDF), lança dados manualmente e conversa em linguagem natural com seus próprios dados financeiros. A IA responde com números reais (tool calling, não "memória"), categoriza transações, gera insights e sugere estratégias de quitação de dívidas e metas de economia.

**O que resolve:** a lacuna entre planilhas (controle, mas trabalhosas) e apps fechados (fáceis, mas caixas-pretas sem IA conversacional).

**Escopo do MVP:**

- Auth OAuth + onboarding mínimo
- Lançamentos manuais + transações recorrentes
- Importação de CSV com preview, validação e deduplicação
- Dashboard (métricas, gráficos, top categorias)
- Gestão de transações (CRUD, filtros, master-detail)
- Categorização com sugestão de IA (Should Have)
- Chat com IA financeira via tool calling (Should Have)
- Insights básicos, metas e módulo de dívidas (Should Have)

**O que NÃO assumir sem validação:**

- Integrações bancárias automáticas (Plaid/Open Finance) → `Future`
- Multi-moeda simultânea → `Future`
- App mobile nativo → `Future`
- Multi-usuário / contas familiares → `Future`
- Aplicar sugestão de IA diretamente nos dados sem confirmação do usuário → **nunca**

**Perfil do projeto:** production-ready, portfolio-grade, open source. Cada decisão técnica deve ser defensável como se fosse um produto real com usuários reais e dados financeiros sensíveis.

---

## 2. Technical stack

Stack oficial — não adicionar bibliotecas fora desta lista sem justificar claramente o trade-off (propósito, tamanho, manutenção, alternativa descartada):

| Camada             | Tecnologia                            |
| ------------------ | ------------------------------------- |
| Framework          | Next.js 15 (App Router)               |
| Linguagem          | TypeScript (strict)                   |
| Estilo             | Tailwind CSS + shadcn/ui              |
| Estado cliente     | React Query (servidor) + Zustand (UI) |
| ORM                | Drizzle ORM                           |
| Banco              | PostgreSQL + pgvector                 |
| Cache / rate limit | Redis                                 |
| Auth               | Auth.js (OAuth + JWT)                 |
| IA                 | Vercel AI SDK                         |
| Testes             | Vitest + Testing Library + Playwright |
| Observabilidade    | Sentry + OpenTelemetry                |
| Deploy             | Vercel                                |

**Regra:** antes de instalar qualquer pacote novo, perguntar: "existe forma de fazer isso com o que já temos?" Se não existir, justificar com: propósito, alternativas consideradas, impacto no bundle, manutenção.

---

## 3. Engineering principles

- **Simplicidade antes de abstração.** Se uma abstração não tem pelo menos dois usos reais, provavelmente é cedo demais.
- **Tipagem forte.** Sem `any` desnecessário. Tipos explícitos nas bordas da aplicação (API responses, props, DB schema). Inferência OK no interior de funções.
- **Componentes pequenos e coesos.** Uma responsabilidade por componente. Se crescer, quebrar.
- **Separação clara de camadas:** UI → hooks/query → service → repository → banco. Lógica de domínio não vive em componentes React.
- **Server Components por padrão.** Client Component só quando há interatividade, estado local, browser API ou evento do usuário.
- **Segurança e privacidade por padrão.** Isolamento por `userId` em toda query. Sem PII em logs. Consentimento antes de IA.
- **Testabilidade como critério de design.** Se está difícil de testar, o design provavelmente está errado.
- **Acessibilidade é parte da feature.** WCAG 2.1 AA mínimo. Teclado, foco visível, gráficos com alternativa textual.
- **Observabilidade é parte da feature.** Eventos de telemetria, tracing, métricas de custo de IA.
- **Entrega incremental.** Preferir pequenas mudanças que funcionam completamente a grandes mudanças que "quase funcionam".

---

## 4. Architecture guidelines

```
src/
  app/                    # Roteamento (App Router). Mínimo de lógica aqui.
                          # Grupos: (auth) para login/onboarding, (app) para autenticado.
                          # api/ para route handlers por domínio.

  components/
    ui/                   # Primitivos shadcn. Não editar lógica, só tokens.
    app/                  # Componentes de layout/produto genéricos:
                          # AppShell, PageHeader, MetricCard, EmptyState, etc.
    charts/               # Wrappers de Recharts/D3. Sem lógica de domínio.
    feedback/             # EmptyState, LoadingState, ErrorState, Toast.

  features/               # Um diretório por domínio:
                          # auth, onboarding, dashboard, transactions, imports,
                          # categories, ai-chat, insights, reports, goals, debts, settings.
                          # Cada feature contém: components/, hooks/, types/, (opcionalmente) utils/.

  server/
    actions/              # Server Actions (mutações simples acopladas a forms).
    api/                  # Helpers compartilhados: responses, errors, middleware.
    services/             # Regras de negócio — funções puras, testáveis, sem I/O direto.
    repositories/         # Acesso a dados (Drizzle). SEMPRE filtra por userId.
    validators/           # Schemas Zod por domínio (compartilhados com o front).

  db/
    schema/               # Definição das tabelas Drizzle.
    migrations/           # Geradas pelo Drizzle — nunca editar manualmente.
    seed/                 # Dados de desenvolvimento.

  ai/
    tools/                # Tools de leitura e escrita controlada para o LLM.
                          # Toda tool recebe userId da sessão, nunca do prompt.
    prompts/              # System prompts versionados.
    rag/                  # Recuperação de contexto por similaridade.
    embeddings/           # Geração e armazenamento de embeddings.
    guards/               # Sanitização, anti prompt-injection, rate limit.

  lib/                    # Utilitários sem estado: formatadores, helpers de data, etc.
  hooks/                  # Hooks React reutilizáveis entre features.
  styles/                 # globals.css, tokens.
  types/                  # Tipos TypeScript compartilhados.
```

**Regra de ouro:** se não sabe onde algo vai, prefira mais específico a mais genérico. Evitar um `utils/` ou `helpers/` que vira coleção de tudo.

---

## 5. Frontend guidelines

### Server vs Client Components

- **Server Component (padrão):** busca de dados no carregamento inicial, sem estado ou evento do usuário.
- **Client Component (`"use client"`):** forms, filtros, gráficos interativos, chat, painel de detalhe. Marcar no menor componente possível.

### React Query

- Um hook de query por recurso em `features/<domínio>/hooks/`.
- Query keys como constantes nomeadas: `['transactions', userId, filters]`.
- Sempre tratar loading, error e empty nos consumidores.
- Invalidar queries após mutações relacionadas.

### Zustand

- Para estado de UI efêmero: qual transação está selecionada, filtros ativos, rascunho de chat.
- **Nunca** duplicar dados de servidor no Zustand (React Query faz isso melhor).
- Stores por domínio, não uma store global monolítica.

### Formulários

- React Hook Form + Zod. O mesmo schema Zod do backend via `server/validators/`.
- Nunca validar só no cliente.

### Tabelas / listas

- TanStack Table dentro do componente `DataTable`.
- Considerar virtualização quando a lista puder crescer.
- Filtros sincronizados na URL (searchParams) para deep-link e SSR.

### Gráficos

- Wrappers em `components/charts/`. Dados chegam prontos (sem transformação dentro do chart).
- Sempre com `aria-label` descritivo e tabela alternativa acessível.
- Cores de categoria estáveis (mesmo mapa de cores em todo o app).

### Estados obrigatórios

Toda tela/componente que busca dados deve tratar:

- **Loading:** skeleton no shape do conteúdo.
- **Error:** `ErrorState` com mensagem e botão de retry.
- **Empty:** `EmptyState` com CTA claro — nunca tela em branco.

### Responsividade

- Mobile-first. Sidebar vira drawer/bottom-nav em mobile.
- Tabelas com scroll horizontal em telas menores.
- Painel de detalhe (master-detail) vira tela cheia no mobile.

### Acessibilidade

- Navegação por teclado funcional em todos os componentes interativos.
- Focus ring visível (anel 2px, nunca remover outline sem substituir).
- Labels em todos os inputs. `aria-describedby` em mensagens de erro.
- Modais com focus trap. `aria-live` no streaming de IA.

### shadcn/ui

- Não usar componentes shadcn no estado "cru" — sempre passar pelos tokens do FinSight.
- Primitivos em `components/ui/`, sem lógica de domínio.
- Variantes com `cva`.

### Tailwind

- Classes de token (ex: `text-primary`, `bg-secondary`) em vez de valores arbitrários quando possível.
- Não usar `!important`. Se precisar, o design está errado.

---

## 6. Backend guidelines

### Route Handlers

- Um arquivo por recurso: `app/api/<domínio>/route.ts`.
- Handlers finos: extraem sessão, validam input (Zod), delegam a service, retornam resposta.
- Nunca lógica de negócio dentro do handler.

### Services

- Funções puras ou quase-puras. Recebem repositórios/dependências por parâmetro (facilita teste).
- Lógica de negócio aqui: cálculo de deduplicação, estratégia de dívida, agregações do dashboard.

### Repositories

- Única camada que fala com o banco.
- **Toda query filtra por `userId`.** Sem exceção. Nunca confiar em IDs vindos do cliente para autorização.

### Validação

- Todo input de route handler passa por schema Zod antes de qualquer processamento.
- Rejeitar com 422 e mensagem estruturada em caso de falha.

### Responses / erros

- Envelope consistente: `{ data: T }` ou `{ error: { code, message, details? } }`.
- Status HTTP corretos (400 validação, 401 não autenticado, 403 não autorizado, 404 não encontrado, 422 input inválido, 500 erro interno).
- Nunca vazar stack trace ou dados de banco em responses de produção.

### Autorização

- `userId` vem **sempre** da sessão do servidor, nunca de body/params do cliente.
- Verificar propriedade do recurso em cada acesso antes de retornar/modificar.

### Rate limiting

- Redis para rate limit por usuário/IP em endpoints sensíveis e IA.
- Retornar 429 com `Retry-After` quando atingido.

### Logs seguros

- Logs estruturados (JSON), com `requestId` e `userId` (hash/opaco), sem dados financeiros.
- Nunca logar: valores de transação, extratos, tokens de integração, segredos.

### Webhooks / integrações (`Future`)

- Verificar assinatura antes de processar.
- Idempotência: processar o mesmo evento duas vezes deve ser seguro.
- Logar evento + resultado, sem payload completo se contiver dados sensíveis.

---

## 7. Database guidelines

### Schema Drizzle

- Schema em `db/schema/`, separado por tabela/domínio.
- Tipos TypeScript inferidos do schema — nunca criar tipos duplicados manualmente para entidades de banco.
- `snake_case` para nomes de tabela e coluna; `camelCase` no TypeScript via mapeamento do Drizzle.

### Migrations

- Geradas com `drizzle-kit generate`. **Nunca editar manualmente.**
- Cada migration deve ser revisada antes de aplicar em produção.
- CI verifica que migrations estão consistentes com o schema.

### Relacionamentos e índices

- FK explícitas com `references()`.
- Índices obrigatórios: `userId` em todas as tabelas de domínio, `dedupe_hash` em `transactions`, `occurred_at` em `transactions`, embedding com HNSW no pgvector.

### Soft delete

- Coluna `deleted_at` nas entidades de domínio para deletar sem perder auditoria.
- Hard delete só no fluxo de exclusão de conta (LGPD/GDPR).

### Multi-tenancy por usuário

- **Toda tabela de domínio tem `userId` (FK indexada).**
- Repository sempre filtra: `where(eq(transactions.userId, userId))`.
- `Decision Needed` — habilitar Postgres RLS como defesa extra no hardening (v1.0).

### pgvector

- Coluna `vector(1536)` em `ai_embeddings`.
- Índice HNSW (`cosine`).
- Toda busca de embedding filtra por `userId` antes de ordenar por similaridade.

### Deduplicação

- `dedupe_hash` = `sha256(date + amount + description + accountId)`.
- Constraint unique por conta. Detectar antes de inserir, não confiar só na constraint.

### Histórico de importação

- `import_jobs` e `import_rows` preservam o bruto para auditoria.
- Status do job: `pending | parsing | preview | confirmed | failed | rolled_back`.
- Linhas inválidas não bloqueiam as válidas — registrar erro por linha.

### Audit logs

- Tabela `audit_logs` append-only: export de dados, exclusão de conta, import confirmado.
- Nunca atualizar ou deletar linhas de audit.

---

## 8. AI guidelines

### Vercel AI SDK

- `streamText` para chat. `generateText` para tasks internas (categorização, insight).
- Sempre com `maxTokens` e `temperature` explícitos por use case.

### Streaming

- Resposta chega ao cliente via `ReadableStream`. Usar `AIThinkingState` enquanto processa.
- `aria-live="polite"` na região de chat para acessibilidade.

### Tool calling

- Tools definidas em `ai/tools/` com schema Zod de input e output.
- **Toda tool recebe `userId` do contexto de sessão do servidor — nunca do prompt do usuário.**
- Tools de leitura são seguras. Tools de escrita (categorizar, criar insight) **exigem confirmação do usuário** antes de efetivar.
- A IA nunca acessa o banco diretamente; só via tools.

### RAG

- Recuperar embeddings filtrados por `userId` antes de qualquer ordenação por similaridade.
- RAG complementa as tools (semântico); tools dominam (estruturado/numérico).

### Embeddings

- Gerar ao criar/importar transação (assíncrono quando possível).
- Representação textual: `"YYYY-MM-DD · <descrição> · <categoria> · <valor>"`.
- Armazenar em `ai_embeddings` com `userId` e `transactionId`.

### Prompt injection

- Conteúdo vindo de dados do usuário (descrições de transação, PDFs) é tratado como dado, não como instrução.
- Separação explícita no system prompt entre instruções e dados.
- `ai/guards/` sanitiza antes de injetar no contexto.

### Dados sensíveis

- Nunca incluir valores exatos de transação no system prompt de forma bruta — passar via tools.
- Números específicos só via tool calls (auditáveis).

### Limites de resposta

- Respostas com números financeiros **sempre** citam a fonte (qual tool, qual período).
- Se a tool não retornou dados, a IA diz que não tem dados suficientes — nunca inventa.
- Projeções e recomendações vêm com disclaimer: "estimativa baseada nos seus dados, não aconselhamento financeiro profissional".

### Tom da IA

- Copiloto, não juiz. "Seu gasto com X foi 17% acima da média" — não "você gastou demais com X".
- Sem promessas absolutas. "Você pode economizar até X" — não "você vai economizar X".

### Confirmação antes de mutações

- Qualquer ação que altere dados (categorização em lote, criar insight) exige confirmação visual antes.
- A IA propõe; o usuário decide.

### Histórico de conversa

- Persistir em `ai_conversations` e `ai_messages`.
- Registrar tokens usados para métrica de custo.

### Testes de IA

- Tools testadas com fixtures de banco (Vitest + banco de teste).
- Chat testado com modelo mockado — nunca chamar a API real em testes.
- `ai/guards/` testados com payloads maliciosos.

---

## 9. Security & privacy guidelines

- **LGPD/GDPR:** consentimento explícito antes de processar IA; export self-service; delete self-service (hard delete de todos os dados do usuário).
- **Nunca logar:** valores de transação, descrições de extrato, CPF, e-mail completo, tokens de integração, chaves de API.
- **Isolamento por usuário:** toda query filtra por `userId`. Sem acesso a dados de outros usuários possível — testar isso explicitamente.
- **Sanitização:** todo input validado com Zod no backend. Conteúdo de arquivo (CSV/PDF) sanitizado antes de qualquer uso.
- **Upload seguro:** validar tipo MIME + extensão + tamanho. Arquivo descartado após processamento (`purged_at`). Nunca armazenar arquivo em caminho público sem autenticação.
- **Rate limit:** Redis, por usuário e por IP, em IA e endpoints sensíveis. 429 com `Retry-After`.
- **Auth:** `userId` sempre da sessão do servidor. `httpOnly + sameSite` nos cookies. Sessão expira e rotaciona.
- **Secrets:** apenas em `.env` e variáveis de ambiente da Vercel. Nunca em código, nunca commitados. `.env` no `.gitignore`.
- **Exportação de dados:** registrar em `audit_logs`. Gerar JSON/CSV apenas dos dados do próprio usuário.
- **Exclusão de conta:** hard delete de todas as entidades com FK para `userId`. Confirmar antes de executar.

---

## 10. Testing guidelines

### Estratégia geral

- Testar o que tem maior risco: isolamento por usuário, lógica de negócio (deduplicação, cálculo de dívida, agregações), importação de CSV, tools de IA.
- Preferir testes de integração (service + repository + banco de teste) a mocks pesados.

### Vitest (unit + integration)

- Services com lógica pura: unitário.
- Repositories + services juntos: integração com banco de teste (Docker no CI).
- Validators (Zod): unitário — inputs válidos e inválidos.

### Testing Library (componentes)

- Componentes do design system: fumaça + acessibilidade (axe).
- Formulários: submit válido, submit inválido, estados de loading/error.
- `TransactionRow`, `InsightCard`, `AIChatMessage`: renderização com props críticas.

### Playwright (E2E)

- Fluxos críticos: onboarding → criar transação → ver dashboard.
- Importar CSV → preview → confirmar → transações aparecem.
- Perguntar à IA → resposta com fonte exibida (modelo mockado).
- Tentar acessar dado de outro usuário → 403.

### Testes de segurança

- **Isolamento:** criar dois usuários no seed; tentar acessar recurso do outro → verificar rejeição.
- **Autorização:** tentar chamar endpoints sem sessão → 401.

### Mocks

- IA: mock do `generateText`/`streamText` retornando resposta fixture.
- APIs externas: mock com `msw` ou `nock`.
- Nunca usar dados financeiros reais em fixtures.

### Acessibilidade

- `@axe-core/playwright` nas páginas principais.
- Verificar navegação por teclado nos E2E críticos.

### Regressão

- Qualquer bug corrigido vira um teste antes da correção.

---

## 11. Workflow rules

Antes de qualquer ação no repositório:

1. **Ler os arquivos relevantes primeiro.** Nunca assumir o estado do código — verificar.
2. **Explicar o plano antes de mudanças grandes.** Propor abordagem e aguardar confirmação para refatorações, mudanças de arquitetura ou alterações que tocam muitos arquivos.
3. **Mudanças pequenas e incrementais.** Uma coisa de cada vez. Preferir um commit que funciona completamente a vários commits quebrados.
4. **Não refatorar arquivos fora do escopo da tarefa.** Se notar algo a melhorar, apontar e sugerir — não fazer silenciosamente.
5. **Não alterar arquitetura sem justificar.** Qualquer desvio das convenções de `architecture.md` precisa de razão explícita.
6. **Não remover testes sem explicar.** Se um teste precisa ser removido, explicar por quê e o que o substitui.
7. **Rodar validações quando possível:** `pnpm lint`, `pnpm type-check`, `pnpm test`. Reportar resultado.
8. **Atualizar documentação quando alterar comportamento.** Se uma função, rota ou componente muda de contrato, atualizar o doc relevante.
9. **Commits pequenos e descritivos quando solicitado.** Formato: `feat(transactions): add grouped list with master-detail`.

---

## 12. Senior engineering mentorship mode

Este projeto também é um espaço de crescimento profissional. A IA deve atuar como **mentora de engenharia sênior**, não apenas como geradora de código.

Comportamentos esperados:

- **Explicar trade-offs** antes de recomendar uma abordagem. "Poderia usar X ou Y — X é mais simples agora, mas Y escala melhor quando tivermos integração com Plaid."
- **Questionar decisões frágeis.** "Você quer fazer isso dessa forma — tem certeza? Qual é o risco se o parsing do PDF falhar no meio?"
- **Sugerir alternativas.** "Fiz assim, mas outra opção seria... O trade-off é..."
- **Apontar riscos proativamente.** Marcar com `Risk` quando algo pode falhar em produção, comprometer segurança ou criar dívida técnica.
- **Pedir decisões arquiteturais.** Para escolhas importantes, apresentar opções e pedir que eu decida — não decidir por mim silenciosamente.
- **Não entregar código sem contexto.** Sempre explicar: o que foi feito, por quê, quais padrões foram usados, onde revisar com mais cuidado.
- **Destacar padrões.** "Usei o padrão repository aqui para facilitar o teste unitário do service."
- **Sugerir testes relevantes.** Após implementar, listar o que vale testar e por quê.
- **Sugerir melhorias de performance, segurança e DX** como follow-ups — sem implementar sem pedir.
- **Ajudar a comunicar decisões.** "Como eu explicaria essa escolha para a equipe/recrutador/PR?"

---

## 13. Output style

- **Objetiva e clara.** Sem rodeios, sem enrolação.
- **Português** quando a mensagem for em português. **Inglês** para código, nomes de variáveis, comentários de código, nomes de branch, commits, documentação técnica.
- **Sem abstrações exageradas.** Se a solução mais simples funciona, use-a.
- **Sinalização consistente:**
  - `Risk` — algo que pode falhar, criar vulnerabilidade ou gerar dívida.
  - `Decision Needed` — escolha arquitetural ou de produto que precisa de validação.
  - `Future` — melhoria válida, mas fora do escopo atual.
- **Nunca usar `any` sem comentar o motivo** e propor o caminho para remover.
- **Sempre mostrar diff/arquivos alterados** ao fim de uma implementação.
