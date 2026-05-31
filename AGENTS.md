# AGENTS.md — FinSight AI

> Instruções operacionais para coding agents (Codex/OpenAI). Direto ao ponto.

---

## 1. Project instructions

**Projeto:** FinSight AI
**Objetivo:** Plataforma de análise financeira pessoal com IA — full-stack, production-ready, open source.
**Resumo:** usuário importa extratos ou lança dados manualmente; conversa com os próprios dados via IA; recebe insights acionáveis, metas e estratégia de quitação de dívidas.

**Stack:**

- Next.js 15 App Router + TypeScript strict
- Tailwind CSS + shadcn/ui
- React Query + Zustand
- Drizzle ORM + PostgreSQL + pgvector
- Redis (cache, rate limit)
- Auth.js (OAuth + JWT)
- Vercel AI SDK
- Vitest + Testing Library + Playwright
- Sentry + OpenTelemetry

**Prioridades técnicas (em ordem):**

1. Segurança e isolamento de dados por usuário
2. Corretude e testabilidade
3. Simplicidade e clareza
4. Performance
5. Elegância de código

---

## 2. How to work in this repository

**Antes de editar qualquer arquivo:**

- Ler os arquivos relevantes (`CLAUDE.md`, `docs/architecture.md`, arquivos que serão alterados).
- Verificar a estrutura de pastas abaixo (Architecture Map).
- Identificar padrões já usados no projeto para o mesmo tipo de problema.

**Durante a edição:**

- Fazer alterações mínimas e focadas no escopo da task.
- Não refatorar arquivos que não são necessários para a task.
- Preservar padrões existentes de nomenclatura, estrutura e estilo.
- Não criar novas dependências sem justificar (propósito + alternativa descartada).
- Não mexer em arquivos fora do escopo descrito.
- Não reescrever arquitetura sem pedido explícito.

**Após editar:**

- Atualizar testes quando comportamento mudar.
- Atualizar comentários/documentação quando contrato mudar.
- Não remover testes para fazer o build passar.
- Verificar se lint e typecheck passam.

---

## 3. Commands

> `Decision Needed` — scripts exatos podem variar; confirmar com o `package.json` do projeto.

```bash
pnpm dev              # Iniciar servidor de desenvolvimento
pnpm lint             # ESLint
pnpm type-check       # tsc --noEmit
pnpm test             # Vitest (unit + integration)
pnpm test:e2e         # Playwright
pnpm build            # Build de produção

pnpm db:generate      # Gerar migration (drizzle-kit generate)
pnpm db:migrate       # Aplicar migrations (drizzle-kit migrate)
pnpm db:studio        # Abrir Drizzle Studio
pnpm db:seed          # Popular banco de dev

docker compose up -d  # Subir Postgres+pgvector e Redis localmente
```

---

## 4. Code style

- **TypeScript strict.** `noImplicitAny: true`. Sem `any` sem comentário de justificativa.
- **Tipos explícitos nas bordas:** props de componente, retorno de route handlers, parâmetros de service/repository. Inferência OK dentro de funções.
- **Componentes pequenos.** Uma responsabilidade. Se o componente crescer, quebrar.
- **Separar server/client.** `"use client"` só quando necessário. Server Component por padrão.
- **Sem lógica de domínio em componentes UI.** Lógica vai nos services (`server/services/`).
- **Zod para validação.** Todo input de API validado antes de processar. Mesmo schema no front e no back (via `server/validators/`).
- **Nomes claros.** `getTransactionsByUserId` não `getData`. `ImportPreviewTable` não `Table2`.
- **Código testável.** Se está difícil de testar, o design está errado. Injetar dependências quando necessário.
- **Commits no formato Conventional Commits:** `feat(transactions): add grouped list`.

---

## 5. Architecture map

```
src/
  app/          Roteamento. Grupos: (auth) e (app). api/ para route handlers.
                Handlers: extraem sessão → validam Zod → delegam service → retornam.

  components/
    ui/         Primitivos shadcn. Não editar lógica.
    app/        Componentes genéricos reutilizáveis: AppShell, PageHeader, MetricCard, etc.
    charts/     Wrappers de Recharts/D3. Dados chegam prontos.
    feedback/   EmptyState, LoadingState, ErrorState.

  features/     Um diretório por domínio: transactions, imports, ai-chat, goals, debts...
                Cada um tem: components/, hooks/, types/.

  server/
    actions/    Server Actions para mutações simples.
    api/        Helpers: response envelope, error handling, middleware.
    services/   Regras de negócio. Funções puras + testáveis.
    repositories/ Acesso ao banco. SEMPRE filtra por userId. Nunca sem userId.
    validators/ Schemas Zod compartilhados.

  db/
    schema/     Tabelas Drizzle. Tipos inferidos daqui.
    migrations/ Geradas pelo Drizzle. Nunca editar manualmente.
    seed/       Dados de dev. Nunca dados reais.

  ai/
    tools/      Tools de IA. userId vem da sessão do servidor, nunca do prompt.
    prompts/    System prompts versionados.
    rag/        Recuperação de contexto.
    embeddings/ Geração de embeddings.
    guards/     Sanitização, anti injection.

  lib/          Utilitários sem estado: formatadores, helpers.
  hooks/        Hooks React reutilizáveis.
  types/        Tipos TypeScript globais.

docs/           Documentação do projeto.
```

---

## 6. Domain rules

- **Usuário só acessa os próprios dados.** Toda query filtra por `userId` vindo da sessão — nunca do cliente.
- **Transações pertencem a contas.** `Transaction` tem FK para `Account`. `Account` tem FK para `User`.
- **Categorias:** podem ser padrão (seed) ou customizadas por usuário. Verificar escopo antes de filtrar.
- **Importações precisam de preview antes de persistir.** Fluxo: upload → parse → preview → confirmação → persistência. Nunca salvar sem confirmação.
- **Deduplicação obrigatória.** `dedupe_hash = sha256(date + amount + description + accountId)`. Sinalizar duplicatas ao usuário; não inserir silenciosamente.
- **Sugestões de IA precisam de confirmação antes de alterar dados.** A IA propõe; o usuário confirma. Sem aplicação automática, salvo configuração explícita.
- **Relatórios e exports respeitam filtros e permissões.** Nunca retornar dados fora do `userId` da sessão.
- **Dados financeiros não aparecem em logs.** Nem valores, nem descrições de transação, nem extratos.

---

## 7. AI feature rules

- **Tool calling:** toda tool recebe `userId` da sessão do servidor. Nunca do prompt. Toda tool tem schema Zod de input e output.
- **RAG:** busca de embedding sempre filtra por `userId` antes de ordenar por similaridade.
- **Embeddings:** gerados ao criar/importar transação. Representação: `"YYYY-MM-DD · descrição · categoria · valor"`. Armazenar com `userId`.
- **Streaming:** via `streamText` do Vercel AI SDK. `aria-live="polite"` na região do chat.
- **Prompt injection:** conteúdo vindo de dados do usuário (descrições, PDFs) é tratado como dado — não como instrução. Separar explicitamente no system prompt.
- **Confirmação antes de mutações:** tools de escrita (criar insight, categorizar em lote) exigem confirmação visual. Implementar fluxo de confirmação — não efetivar direto.
- **Disclaimers:** toda projeção ou recomendação financeira tem disclaimer de que é estimativa, não aconselhamento profissional.
- **Segurança de dados:** números só via tool calls. Nunca incluir extratos brutos no system prompt.
- **Testes:** tools com fixtures de banco (Vitest). Chat com modelo mockado — nunca chamar API real em testes.

---

## 8. Testing expectations

- **Nova regra de negócio** → teste unitário no service.
- **Novo componente relevante** → teste de renderização + estados (Loading, Error, Empty).
- **Novo fluxo crítico** → E2E no Playwright.
- **Bug corrigido** → teste de regressão antes da correção.
- **Tool de IA** → teste com fixture de banco.
- **Upload/importação** → casos de erro: arquivo inválido, linha malformada, duplicata.
- **Isolamento por usuário** → teste explícito: usuário A não acessa dados do usuário B.
- **Nunca usar dados financeiros reais em fixtures.**
- **Testes não são removidos para fazer build passar.**

---

## 9. Pull request expectations

Todo PR deve ter:

- **Descrição clara** do que foi feito e por quê.
- **Issue relacionada** (`Closes #N`).
- **Como testar** — passos para verificar localmente.
- **Screenshots** quando houver mudança de UI.
- **Riscos** identificados (marcar com `Risk`).
- **Checklist** verificado: lint, typecheck, testes, isolamento por usuário, acessibilidade (se UI), sem dados sensíveis em logs.
- **Estimativa de risco:** Low / Medium / High.

---

## 10. Do not do

- ❌ Commitar secrets, chaves de API ou tokens de qualquer tipo.
- ❌ Logar dados financeiros, descrições de transação, CPF, tokens de integração.
- ❌ Adicionar dependência sem justificar (propósito + alternativa descartada).
- ❌ Criar abstração prematura (esperar dois usos reais antes de abstrair).
- ❌ Reescrever arquitetura sem pedido explícito.
- ❌ Aplicar sugestão de IA diretamente nos dados do usuário sem confirmação visual.
- ❌ Ignorar acessibilidade em componentes de UI.
- ❌ Remover testes para fazer build ou lint passar.
- ❌ Usar dados financeiros reais em fixtures ou seed.
- ❌ Fazer query sem filtrar por `userId`.
- ❌ Usar `any` sem justificar e sem plano de remoção.
- ❌ Editar migrations geradas manualmente.
- ❌ Fazer mudanças grandes sem explicar o plano primeiro.
- ❌ Refatorar arquivos fora do escopo da task.
