#!/bin/bash
set -euo pipefail

# ============================================================
# FinSight AI — Criar issues no GitHub
# Repositório: fernandaquerino/finsight
# Project ID: 5
#
# Pré-requisitos:
#   gh auth login   (autenticar uma vez)
#   gh extension install github/gh-projects (se quiser vincular ao projeto)
#
# Uso:
#   chmod +x create-issues.sh
#   ./create-issues.sh
# ============================================================

REPO="fernandaquerino/finsight-ai"
OWNER="fernandaquerino"
PROJECT_ID="6"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }

# Valida pré-requisitos antes de criar qualquer coisa
validate_environment() {
  command -v gh >/dev/null 2>&1 || {
    fail "GitHub CLI não encontrado. Instale com: brew install gh"
    exit 1
  }

  gh auth status >/dev/null 2>&1 || {
    fail "Você precisa autenticar com: gh auth login"
    exit 1
  }

  gh repo view "$REPO" >/dev/null 2>&1 || {
    fail "Repositório não encontrado ou sem permissão: $REPO"
    exit 1
  }
}

# Cria label de forma idempotente — se já existir, não falha
create_label() {
  local name="$1"
  local color="$2"
  local description="$3"

  if LABEL_NAME="$name" gh label list --repo "$REPO" --search "$name" --json name --jq '.[] | select(.name == env.LABEL_NAME) | .name' >/dev/null 2>&1; then
    if LABEL_NAME="$name" gh label list --repo "$REPO" --search "$name" --json name --jq '.[] | select(.name == env.LABEL_NAME) | .name' | grep -qx "$name"; then
      info "Label já existe: $name"
      return
    fi
  fi

  gh label create "$name" --repo "$REPO" --color "$color" --description "$description" >/dev/null 2>&1 || true
}

# Cria milestone de forma idempotente — se já existir, não duplica
create_milestone() {
  local title="$1"

  local existing
  existing=$(MILESTONE_TITLE="$title" gh api "repos/$REPO/milestones?state=all" \
    --jq '.[] | select(.title == env.MILESTONE_TITLE) | .title' \
    2>/dev/null | head -n 1 || true)

  if [ -n "$existing" ]; then
    info "Milestone já existe: $title"
    return
  fi

  gh api "repos/$REPO/milestones" --method POST -f title="$title" -f state="open" >/dev/null 2>&1
}

# Cria issue e adiciona ao projeto.
# Proteção contra duplicação: se já existir uma issue com o mesmo título, não cria de novo.
create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  local milestone="$4"

  local existing_issue_url
  existing_issue_url=$(TITLE="$title" gh issue list \
    --repo "$REPO" \
    --state all \
    --limit 200 \
    --json title,url \
    --jq '.[] | select(.title == env.TITLE) | .url' \
    2>/dev/null | head -n 1 || true)

  if [ -n "$existing_issue_url" ]; then
    info "Issue já existe, pulando → $existing_issue_url"
    return
  fi

  info "Criando: $title"

  local issue_url
  if issue_url=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body "$body" \
    --label "$labels" \
    --milestone "$milestone" \
    2>/dev/null); then
    log "Criada → $issue_url"

    # Adicionar ao project board. Se falhar, não interrompe a criação das issues.
    if ! gh project item-add "$PROJECT_ID" --owner "$OWNER" --url "$issue_url" >/dev/null 2>&1; then
      info "Não foi possível adicionar ao Project $PROJECT_ID automaticamente. Verifique permissões/extensão gh-projects."
    fi
  else
    fail "Erro ao criar: $title"
  fi

  sleep 0.4  # evitar rate limit
}

validate_environment

# ============================================================
# Criar labels (idempotente — ignora se já existir)
# ============================================================
info "Criando labels..."

create_label "frontend"      "0075ca" "Frontend / UI"
create_label "backend"       "e4e669" "Backend / API"
create_label "ai"            "7057ff" "Camada de IA"
create_label "database"      "0e8a16" "Banco de dados / Schema"
create_label "design-system" "d93f0b" "Design System / UI Foundation"
create_label "security"      "b60205" "Segurança / Privacidade"
create_label "testing"       "0075ca" "Testes"
create_label "docs"          "cfd3d7" "Documentação"
create_label "infra"         "e4e669" "Infraestrutura / CI/CD"
create_label "settings"      "5319e7" "Configurações / Conta"
create_label "integrations"  "1d76db" "Integrações externas / Webhooks"

log "Labels criadas."

# # ============================================================
# # Criar milestones
# # ============================================================
info "Criando milestones..."

create_milestone "v0.1 Foundation"
create_milestone "v0.2 Manual MVP"
create_milestone "v0.3 Import MVP"
create_milestone "v0.4 AI MVP"
create_milestone "v0.5 Reports/Goals/Debts"
create_milestone "v1.0 Production"
create_milestone "vFuture Integrations"

log "Milestones criados."

# ============================================================
# EPIC-00 — Project Setup & DX
# ============================================================
echo ""
info "=== EPIC-00 — Project Setup & DX ==="

create_issue \
  "[EPIC-00] 00-01 — Inicializar projeto Next.js 15 + TypeScript + pnpm" \
  "## Objetivo
Criar a base do repositório com Next.js 15 (App Router), TypeScript estrito e pnpm.

## Tasks
- [ ] \`create-next-app\` com App Router + TypeScript
- [ ] Configurar pnpm
- [ ] Estrutura de pastas: \`src/app\`, \`src/components\`, \`src/features\`, \`src/server\`, \`src/db\`, \`src/ai\`, \`src/lib\`, \`src/hooks\`, \`src/types\`
- [ ] Paths/aliases (\`@/\`) no tsconfig

## Critérios de aceite
- [ ] \`pnpm dev\` sobe a aplicação
- [ ] \`tsc --noEmit\` passa sem erros
- [ ] Estrutura de pastas conforme arquitetura

## Estimativa
P (≤ 1 dia)

## Prioridade
Alta — bloqueia tudo" \
  "infra" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-00] 00-02 — ESLint, Prettier e convenções de código" \
  "## Objetivo
Padronizar formatação e linting desde o início.

## Tasks
- [ ] Configurar ESLint (Next.js + TypeScript)
- [ ] Configurar Prettier + \`prettier-plugin-tailwindcss\`
- [ ] Scripts \`pnpm lint\` e \`pnpm type-check\`
- [ ] VSCode settings em \`.vscode/settings.json\`
- [ ] Format on save documentado no README/CONTRIBUTING

## Critérios de aceite
- [ ] \`pnpm lint\` passa sem erros
- [ ] Formatação consistente em todo o projeto

## Estimativa
P

## Prioridade
Alta" \
  "infra" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-00] 00-03 — Docker Compose (Postgres+pgvector, Redis) e .env.example" \
  "## Objetivo
Ambiente local reproduzível com um comando.

## Tasks
- [ ] \`docker-compose.yml\` com Postgres+pgvector e Redis
- [ ] \`.env.example\` com todas as variáveis necessárias
- [ ] Script/instrução de start local no README
- [ ] Verificar conexão da app com banco e Redis

## Critérios de aceite
- [ ] \`docker compose up -d\` sobe banco e Redis
- [ ] App conecta ao banco localmente
- [ ] \`.env\` no \`.gitignore\`

## Notas técnicas
- Imagem: \`pgvector/pgvector:pg16\`
- Risk: nunca commitar \`.env\` real

## Estimativa
M (2-3 dias)

## Prioridade
Alta" \
  "infra,database" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-00] 00-04 — Pipeline CI com GitHub Actions" \
  "## Objetivo
Garantir qualidade em cada PR automaticamente.

## Tasks
- [ ] Job: install/cache (pnpm)
- [ ] Job: lint
- [ ] Job: typecheck (\`tsc --noEmit\`)
- [ ] Job: unit tests (Vitest)
- [ ] Job: build (\`next build\`)
- [ ] Job: drizzle-check
- [ ] Job: verify-envs
- [ ] Cache de node_modules e build

## Critérios de aceite
- [ ] CI roda em cada PR
- [ ] Merge bloqueado se CI falhar
- [ ] Tempo de CI < 5 minutos

## Estimativa
M

## Prioridade
Alta" \
  "infra,testing" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-00] 00-05 — Setup de testes (Vitest + Testing Library + Playwright)" \
  "## Objetivo
Infraestrutura de testes pronta desde o início.

## Tasks
- [ ] Configurar Vitest com setup de banco de teste
- [ ] Instalar e configurar Testing Library
- [ ] Instalar e configurar Playwright
- [ ] Criar exemplo de cada tipo (unit, integration, e2e)
- [ ] Configurar serviço de banco no CI para testes de integração

## Critérios de aceite
- [ ] \`pnpm test\` roda sem erros
- [ ] \`pnpm test:e2e\` roda sem erros

## Estimativa
M

## Prioridade
Alta" \
  "testing,infra" \
  "v0.1 Foundation"

# ============================================================
# EPIC-01 — Design System & UI Foundation
# ============================================================
echo ""
info "=== EPIC-01 — Design System & UI Foundation ==="

create_issue \
  "[EPIC-01] 01-01 — Definir tokens visuais (cores, tipografia, espaçamento)" \
  "## Objetivo
Formalizar os tokens em código — fonte única de verdade visual do FinSight AI.

## Referência do protótipo
O protótipo define os tokens completos via CSS variables:
- Cores: \`--background\`, \`--card\`, \`--muted\`, \`--primary\` (#534AB7), \`--success\`, \`--danger\`, \`--warning\`, \`--info\`
- Dark mode via \`[data-theme='dark']\`
- Cores de categoria: \`--cat-alimentacao\`, \`--cat-moradia\`, \`--cat-transporte\`, \`--cat-assinaturas\`, \`--cat-saude\`, \`--cat-lazer\`, \`--cat-outros\`
- Radius: \`--radius-sm\` (6px), \`--radius-md\` (8px), \`--radius-lg\` (12px), \`--radius-xl\` (16px)
- Tipografia: Geist (sans) + Geist Mono (mono/tabular)
- Escala de tipo: 11/12/13/14/16/18/20/24px
- Spacing 4px grid: 4/8/12/16/24/32px

## Tasks
- [ ] CSS variables para todas as cores (light + dark)
- [ ] Tokens TypeScript (radius, spacing, fontSize, zIndex)
- [ ] Mapa de cores por categoria financeira (7 categorias)
- [ ] Configurar \`next-themes\` para alternância sem flash
- [ ] Configurar Tailwind consumindo os tokens

## Critérios de aceite
- [ ] Tokens consumíveis via Tailwind
- [ ] Dark mode sem flash (FOUC)
- [ ] Nenhuma cor hardcoded em componentes

## Estimativa
M

## Prioridade
Alta" \
  "design-system,frontend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-02 — Configurar Tailwind + next/font (Geist)" \
  "## Objetivo
Tailwind consumindo os tokens do FinSight AI, com Geist carregado via next/font.

## Referência do protótipo
Usa Geist (sans) e Geist Mono (mono para valores financeiros com tabular-nums).
Classe utilitária \`.tnum\` para números financeiros.

## Tasks
- [ ] \`tailwind.config.ts\` mapeando variáveis CSS
- [ ] Carregar Geist + Geist Mono via \`next/font\`
- [ ] Utilitário \`.tnum\` (font-mono + tabular-nums + letter-spacing -0.01em)
- [ ] Testar classes de cor em componente dummy

## Critérios de aceite
- [ ] Geist carregando sem FOUT
- [ ] Dark mode via atributo \`data-theme\`

## Estimativa
P

## Prioridade
Alta" \
  "design-system,frontend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-03 — Instalar e configurar shadcn/ui" \
  "## Objetivo
Primitivos shadcn configurados com o tema do FinSight AI.

## Tasks
- [ ] \`npx shadcn@latest init\` com tema customizado
- [ ] Adicionar: button, input, select, dialog, drawer, dropdown-menu, popover, tooltip, tabs, switch, checkbox, badge, sonner, skeleton
- [ ] Verificar que todos usam variáveis CSS do tema
- [ ] Smoke test visual de cada primitivo em light e dark

## Critérios de aceite
- [ ] Primitivos renderizam com visual do FinSight AI
- [ ] Dark mode funciona em todos

## Estimativa
M

## Prioridade
Alta" \
  "design-system,frontend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-04 — Componentes UI base: Button, Input, Card, Field" \
  "## Objetivo
Componentes base com variantes, estados e testes.

## Referência do protótipo
- \`Button\`: variantes primary, secondary, ghost, destructive; tamanhos sm/md; suporte a \`icon\` (esquerda) e \`iconRight\`; estado loading
- \`Card\`: surface branca, borda 0.5px, radius-lg, sombra \`--shadow-card\`; prop \`hover\` para hover state; prop \`pad={false}\` para remover padding
- \`Field\`: label + input + mensagem de erro inline
- \`Switch\`, \`Chip\` (filtros selecionáveis)

## Tasks
- [ ] \`Button\` com variantes via \`cva\` e suporte a ícone esquerda/direita
- [ ] \`Card\` com variante hover e pad controlável
- [ ] \`Field\` com estados: default, error, disabled
- [ ] \`Switch\` e \`Chip\`
- [ ] Testes unitários: variantes, estados (hover, focus, disabled, loading)
- [ ] A11y: focus ring visível, aria-label quando necessário

## Critérios de aceite
- [ ] Todas as variantes renderizam corretamente
- [ ] Navegação por teclado funciona
- [ ] Testes passam

## Estimativa
M

## Prioridade
Alta" \
  "design-system,frontend,testing" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-05 — AppShell com Sidebar colapsável e Topbar" \
  "## Objetivo
Layout base de todas as telas autenticadas.

## Referência do protótipo
Navegação em 4 grupos:
- **Visão geral**: Dashboard, Transações, Relatórios
- **Inteligência**: Chat IA, Insights (com dot de novidade)
- **Planejamento**: Metas, Dívidas, Categorias
- **Entradas**: Importar extrato, Lançamento manual

Footer da sidebar: Configurações
Topbar: botão toggle sidebar, título da página, busca global (240px), notificações, UserMenu (avatar com dropdown)
Sidebar colapsa para 60px (ícones apenas) via botão no topbar.
\`--sidebar-w: 200px\`, \`--topbar-h: 52px\`

## Tasks
- [ ] \`AppShell\` no layout do grupo \`(app)\`
- [ ] Sidebar com 4 grupos de navegação + Configurações no footer
- [ ] Item ativo: fundo primary-soft + cor primary + barra lateral de 3px
- [ ] Sidebar colapsável (200px ↔ 60px) com transição 0.2s
- [ ] Topbar sticky com busca, notificações e UserMenu
- [ ] Mobile: sidebar vira drawer + bottom-nav com 4-5 itens

## Critérios de aceite
- [ ] Navegação entre todas as 12 rotas funciona
- [ ] Item ativo destacado corretamente
- [ ] Colapso de sidebar suave, sem quebrar layout
- [ ] Mobile: drawer + bottom-nav

## Estimativa
G (4+ dias)

## Prioridade
Alta" \
  "design-system,frontend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-06 — Componentes de card do dashboard (MetricCard, ChartCard, PageHeader, SectionHeader)" \
  "## Objetivo
Blocos visuais reutilizáveis em todo o app.

## Referência do protótipo
- \`MetricCard\`: label-micro 11px uppercase + valor 24px tabular + TrendIndicator + sparkline opcional; aceita prop \`accent='ai'\` para sotaque roxo
- \`ChartCard\`: wrapper com título + loading skeleton + empty state
- \`PageHeader\`: título h1 16px + subtítulo muted + slot à direita (DateRangePicker ou CTA)
- \`SectionHeader\`: título 11px uppercase + subtítulo opcional

## Tasks
- [ ] \`MetricCard\` com todas as props (delta, invert, spark, accent)
- [ ] \`ChartCard\` com estados loading/empty
- [ ] \`PageHeader\` + \`SectionHeader\`
- [ ] \`Trend\` / \`TrendIndicator\` (▲▼ com cor e %)
- [ ] \`Sparkline\` inline SVG

## Critérios de aceite
- [ ] MetricCard positivo (verde) e negativo (vermelho) corretos
- [ ] Skeleton no shape real do card

## Estimativa
M

## Prioridade
Alta" \
  "design-system,frontend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-07 — Componentes de data display (DataTable, FilterBar, Amount, CategoryBadge, badges)" \
  "## Objetivo
Componentes para exibir e filtrar dados financeiros.

## Referência do protótipo
- \`Amount\`: valor com símbolo de moeda, colore pelo sinal (+verde / -vermelho / neutro = primary); usa Geist Mono tabular
- \`CategoryBadge\`: dot colorido + label; cor estável mapeada por slug da categoria
- \`CategoryDot\`: apenas o círculo colorido (usado em listas densas)
- \`Badge\`: genérico com tones (primary, success, danger, warning, info, neutral)
- \`SourceReference\`: badge de origem da transação (manual | extrato | recorrente | integração)
- \`DataTable\` com TanStack Table: sorting, paginação, loading, empty
- \`Chip\`: filtro selecionável (fundo primary-soft quando ativo)

## Tasks
- [ ] \`Amount\`, \`CategoryBadge\`, \`CategoryDot\`, \`Badge\`, \`SourceReference\`
- [ ] \`Chip\` com estado ativo/inativo
- [ ] \`DataTable\` com TanStack Table
- [ ] \`DataFilterBar\`: busca inline + chips de filtro
- [ ] \`Pagination\` com contagem e navegação
- [ ] \`DateRangePicker\`

## Critérios de aceite
- [ ] \`Amount\`: positivo verde, negativo vermelho
- [ ] \`CategoryBadge\`: mesma categoria sempre na mesma cor
- [ ] DataTable navegável por teclado

## Estimativa
G

## Prioridade
Alta" \
  "design-system,frontend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-08 — Componentes de feedback (EmptyState, LoadingState, ErrorState, Toast)" \
  "## Objetivo
Estados de interface reutilizáveis em qualquer query/tela.

## Tasks
- [ ] \`EmptyState\`: ícone + título + descrição + CTA primário + CTA secundário opcional
- [ ] \`LoadingState\`: skeletons no shape do conteúdo (não spinner genérico)
- [ ] \`ErrorState\`: mensagem + botão retry + ação secundária opcional
- [ ] Toast helper (Sonner) com variantes: success, error, info, warning
- [ ] Documentar quando usar cada um

## Critérios de aceite
- [ ] Tom correto: EmptyState convidativo, ErrorState calmo
- [ ] Skeletons têm o shape real do conteúdo

## Estimativa
M

## Prioridade
Alta" \
  "design-system,frontend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-01] 01-09 — Componentes de UI do chat de IA" \
  "## Objetivo
Interface do chat com identidade visual clara de IA.

## Referência do protótipo
Componentes de linguagem visual de IA (arquivo \`shared-ai\`):
- \`AIAvatar\`: avatar roxo da IA (círculo com logo)
- \`AIBlock\`: container de resposta da IA com sotaque visual (borda/fundo roxo claro); estilos: \`soft\` | \`bordered\` | \`minimal\`
- \`AILabel\`: badge 'IA' roxo
- \`AISummary\`: parágrafo de resumo gerado pela IA
- \`InsightCard\`: card de insight com severidade (info/warning/risk)
- \`AIThinking\`: animação de 'consultando seus dados...' com 3 dots pulsando
- \`SourceReference\`: quais dados foram usados na resposta

## Tasks
- [ ] \`AIAvatar\`, \`AILabel\`, \`AIBlock\`, \`AISummary\`
- [ ] \`AIThinking\` com animação \`fs-pulse-dot\`
- [ ] \`InsightCard\` com ações (aplicar, ignorar, útil)
- [ ] \`ChatScreen\`: layout de conversa (mensagens + área de input)
- [ ] \`AISuggestionPrompt\`: perguntas sugeridas clicáveis
- [ ] \`aria-live='polite'\` na região de streaming

## Critérios de aceite
- [ ] Streaming visual funciona
- [ ] Fontes exibidas ao fim de cada resposta
- [ ] Acessível por teclado e leitor de tela

## Estimativa
G

## Prioridade
Média" \
  "design-system,frontend,ai" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-01] 01-10 — Setup Storybook e stories dos componentes prioritários" \
  "## Objetivo
Documentação visual dos componentes — valor alto para portfólio.

## Tasks
- [ ] Setup Storybook com tema do FinSight AI
- [ ] Stories: Button, Input, Card, Field, Chip, Switch
- [ ] Stories: MetricCard, ChartCard, Amount, CategoryBadge, Badge
- [ ] Stories: EmptyState, LoadingState, ErrorState
- [ ] Stories: InsightCard, AIBlock, AIThinking
- [ ] Publicar via GitHub Pages ou Chromatic

## Critérios de aceite
- [ ] \`pnpm storybook\` roda sem erros
- [ ] Todos os estados (hover, focus, disabled, loading, empty, error) documentados

## Estimativa
M

## Prioridade
Baixa" \
  "design-system,docs" \
  "v1.0 Production"

# ============================================================
# EPIC-02 — Authentication & User Management
# ============================================================
echo ""
info "=== EPIC-02 — Authentication & User Management ==="

create_issue \
  "[EPIC-02] 02-01 — Configurar Auth.js com OAuth (Google + GitHub)" \
  "## Objetivo
Autenticação funcional com providers OAuth.

## Tasks
- [ ] Instalar e configurar Auth.js v5
- [ ] Configurar providers: Google + GitHub
- [ ] Configurar adapter Drizzle para persistir sessões/usuários
- [ ] Variáveis de ambiente documentadas no \`.env.example\`

## Critérios de aceite
- [ ] Login com OAuth funciona end-to-end
- [ ] Usuário criado na tabela \`users\` no primeiro login
- [ ] Sessão persiste entre reloads

## Notas técnicas
- Auth.js v5 usa \`auth()\` server-side
- Risk: nunca logar tokens de sessão

## Estimativa
P

## Prioridade
Alta — EPIC atual (02)" \
  "backend,security" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-02] 02-02 — Sessão JWT + middleware de proteção de rotas" \
  "## Objetivo
Rotas autenticadas protegidas; userId disponível server-side em todo contexto.

## Tasks
- [ ] Middleware protege grupo \`(app)\` — redirect não autenticado para \`/login\`
- [ ] Helper \`getCurrentUser()\` e \`requireUserId()\` server-side
- [ ] Logout invalida sessão e redireciona para \`/\`
- [ ] Sessão expira e rotaciona token

## Critérios de aceite
- [ ] Rota protegida sem login → redirect para \`/login\`
- [ ] Logout funciona e invalida sessão
- [ ] \`requireUserId()\` lança 401 se não autenticado

## Notas técnicas
- userId vem SEMPRE da sessão do servidor — nunca de body/params do cliente

## Estimativa
M

## Prioridade
Alta — EPIC atual (02)" \
  "backend,security" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-02] 02-03 — Página de Login (AuthScreen) e página de erro de auth" \
  "## Objetivo
Experiência de entrada limpa com tratamento de erros.

## Referência do protótipo
- \`AuthScreen\`: tela de login fora do AppShell
- Botões OAuth com logotipos
- Toggle entre 'Entrar' e 'Criar conta' (mesmo componente)
- Ilustração decorativa lateral no desktop

## Tasks
- [ ] Página \`/login\` com botões OAuth (Google, GitHub)
- [ ] Toggle Entrar / Criar conta
- [ ] Página de erro de auth (\`/auth/error\`) com mensagem útil
- [ ] Redirect para dashboard após login bem-sucedido
- [ ] Layout da página de login fora do AppShell

## Critérios de aceite
- [ ] Login redireciona corretamente para dashboard
- [ ] Erro de OAuth exibe mensagem clara (não tela em branco)

## Estimativa
P

## Prioridade
Alta — EPIC atual (02)" \
  "frontend,backend" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-02] 02-04 — UserMenu, NotificationCenter e modais de conta" \
  "## Objetivo
Fluxo completo de gerenciamento de conta acessível via topbar.

## Referência do protótipo (telas descobertas na revisão)
Componentes presentes no protótipo mas sem issues cobrindo implementação:
- \`UserMenu\`: dropdown no topbar com avatar, nome, email, links para Minha conta e Configurações, e botão Sair
- \`NotificationCenter\`: painel de notificações (ícone de sino na topbar) com lista de alertas recentes
- \`AccountScreen\` (\`/conta\`): perfil com avatar, plano ativo, dados pessoais, contas conectadas, preferências, segurança
- \`EditProfileModal\`: editar nome, telefone
- \`ChangePasswordModal\`: trocar senha com validação de força
- \`DeleteAccountModal\`: exclusão com dupla confirmação (digitar 'CONFIRMAR')

## Tasks
- [ ] \`UserMenu\`: dropdown acessível via teclado, avatar com iniciais
- [ ] \`NotificationCenter\`: painel lateral com lista e badge de count não lidos
- [ ] Rota \`/conta\` com \`AccountScreen\` completa
- [ ] \`EditProfileModal\`: campos nome, telefone; salvar via \`PATCH /api/user/profile\`
- [ ] \`ChangePasswordModal\`: validação de força de senha (fraca/média/forte)
- [ ] \`DeleteAccountModal\`: campo de confirmação texto + botão destructive
- [ ] Marcar notificações como lidas via \`PATCH /api/notifications/:id/read\`

## Critérios de aceite
- [ ] UserMenu abre/fecha com click e Escape
- [ ] AccountScreen renderiza dados reais do usuário
- [ ] Delete account exige digitação de texto de confirmação
- [ ] Notificações não lidas exibem badge no ícone de sino

## Notas técnicas
- \`DeleteAccountModal\` deve chamar \`DELETE /api/settings/account\` (EPIC-13)

## Estimativa
M

## Prioridade
Alta — EPIC atual (02)" \
  "frontend,backend" \
  "v0.2 Manual MVP"

# ============================================================
# EPIC-03 — Database & Domain Modeling
# ============================================================
echo ""
info "=== EPIC-03 — Database & Domain Modeling ==="

create_issue \
  "[EPIC-03] 03-01 — Schema: users, user_profiles, accounts, categories" \
  "## Objetivo
Tabelas base do domínio — identidade, preferências, contas e categorias.

## Tasks
- [ ] \`users\`: id, email, oauth_provider, created_at
- [ ] \`user_profiles\`: user_id (PK/FK), currency, primary_goal, closing_day, ai_consent_at
- [ ] \`accounts\`: id, user_id, name, type, institution, created_at, deleted_at
- [ ] \`categories\`: id, user_id (nullable para padrão), name, color, kind (income|expense), parent_id
- [ ] Índices: user_id em todas as tabelas
- [ ] Gerar e aplicar migration

## Critérios de aceite
- [ ] Migration aplica sem erro
- [ ] Types TypeScript inferidos do schema

## Estimativa
M

## Prioridade
Alta" \
  "database" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-03] 03-02 — Schema: transactions (+ índices e dedupe_hash)" \
  "## Objetivo
Tabela central do domínio financeiro com suporte a deduplicação e soft delete.

## Tasks
- [ ] \`transactions\`: id, user_id, account_id, category_id, amount, currency, kind (income|expense|transfer), description, occurred_at, origin (manual|import|recurring|integration), dedupe_hash, created_at, deleted_at
- [ ] Índice composto: (user_id, occurred_at)
- [ ] Índice único: dedupe_hash por conta
- [ ] Soft delete via deleted_at

## Notas técnicas
- dedupe_hash = sha256(date + amount + description + account_id)

## Estimativa
M

## Prioridade
Alta" \
  "database" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-03] 03-03 — Schema: import_jobs, import_rows, uploaded_files" \
  "## Objetivo
Suporte ao pipeline de importação de extratos.

## Tasks
- [ ] \`uploaded_files\`: id, user_id, kind (csv|pdf), size, checksum, created_at, purged_at
- [ ] \`import_jobs\`: id, user_id, file_id, status (pending|parsing|preview|confirmed|failed), total_rows, error_count, created_at
- [ ] \`import_rows\`: id, job_id, raw, parsed (json), status, error, dedupe_hash

## Critérios de aceite
- [ ] Migration aplica sem erro
- [ ] import_rows preserva bruto para auditoria

## Estimativa
M

## Prioridade
Alta" \
  "database" \
  "v0.3 Import MVP"

create_issue \
  "[EPIC-03] 03-04 — Schema: ai_conversations, ai_messages, ai_insights, ai_embeddings (pgvector)" \
  "## Objetivo
Persistência do histórico de IA e suporte a RAG com pgvector.

## Tasks
- [ ] \`ai_conversations\`: id, user_id, title, created_at
- [ ] \`ai_messages\`: id, conversation_id, role (user|assistant|tool), content, tool_name, tokens, created_at
- [ ] \`ai_insights\`: id, user_id, type, severity (info|warning|risk), title, body, impact (valor em R$ de economia potencial), status (new|applied|dismissed|useful), created_at
- [ ] \`ai_embeddings\`: id, user_id, transaction_id, content, embedding vector(1536), created_at
- [ ] Índice HNSW em ai_embeddings.embedding (cosine)

## Critérios de aceite
- [ ] pgvector extension ativa no banco
- [ ] Índice HNSW criado sem erro
- [ ] Busca por similaridade filtra por user_id

## Notas técnicas
- Risk: toda busca de embedding deve filtrar por user_id ANTES de ordenar por similaridade

## Estimativa
M

## Prioridade
Média" \
  "database,ai" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-03] 03-05 — Schema: financial_goals, debts, notification_preferences" \
  "## Objetivo
Tabelas para metas, dívidas e preferências de notificação.

## Tasks
- [ ] \`financial_goals\`: id, user_id, name, target_amount, current_amount, due_date, status (active|completed|late), created_at, deleted_at
- [ ] \`debts\`: id, user_id, name, institution, principal, balance, monthly_rate, installment_amount, remaining_installments, created_at, deleted_at
- [ ] \`notification_preferences\`: user_id (PK/FK), spend_alerts, installment_reminders, weekly_summary, anomaly_alerts

## Estimativa
P

## Prioridade
Média" \
  "database" \
  "v0.5 Reports/Goals/Debts"

create_issue \
  "[EPIC-03] 03-06 — Schema: audit_logs (append-only)" \
  "## Objetivo
Trilha auditável de ações sensíveis.

## Tasks
- [ ] \`audit_logs\`: id, user_id, action, target (tipo + id), metadata (json), created_at
- [ ] Constraint: sem UPDATE/DELETE em audit_logs
- [ ] Índice: user_id + created_at

## Critérios de aceite
- [ ] Registros criados em ações sensíveis (export, delete, import confirmado)
- [ ] Tabela append-only

## Estimativa
P

## Prioridade
Média" \
  "database,security" \
  "v0.1 Foundation"

create_issue \
  "[EPIC-03] 03-07 — Repositórios base com isolamento por userId + seed de dev" \
  "## Objetivo
Camada de repositório que impõe segurança por padrão + dados para desenvolver.

## Tasks
- [ ] Padrão de repositório: sempre recebe userId, sempre filtra
- [ ] Repositórios iniciais: UserRepository, AccountRepository, TransactionRepository, CategoryRepository
- [ ] Seed de desenvolvimento com usuário fictício + transações variadas (PT-BR, maio 2026 como referência)
- [ ] Teste de isolamento: usuário A não acessa dados do usuário B

## Critérios de aceite
- [ ] Toda query usa \`where(eq(table.userId, userId))\`
- [ ] Seed popula banco sem dados reais
- [ ] Teste de isolamento passa

## Notas técnicas
- Risk: nunca usar dados financeiros reais em fixtures/seed

## Estimativa
M

## Prioridade
Alta" \
  "database,backend,security,testing" \
  "v0.1 Foundation"

# ============================================================
# EPIC-04 — Onboarding
# ============================================================
echo ""
info "=== EPIC-04 — Onboarding ==="

create_issue \
  "[EPIC-04] 04-01 — Fluxo de onboarding 3 passos" \
  "## Objetivo
Capturar contexto mínimo e mostrar valor imediatamente após o primeiro login.

## Tasks
- [ ] Passo 1: moeda padrão (BRL, USD, EUR...)
- [ ] Passo 2: objetivo financeiro principal (organizar gastos / quitar dívidas / economizar / planejar)
- [ ] Passo 3: consentimento sobre uso de dados e explicação de IA/privacidade
- [ ] Indicador de progresso (1/3, 2/3, 3/3)
- [ ] Redirect para dashboard com empty state guiado após conclusão
- [ ] Se usuário já fez onboarding, ir direto ao dashboard

## Critérios de aceite
- [ ] Preferências persistidas em user_profiles
- [ ] Consentimento registrado com timestamp (ai_consent_at)
- [ ] Onboarding não se repete em logins subsequentes

## Estimativa
M

## Prioridade
Alta" \
  "frontend,backend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-04] 04-02 — Empty state guiado pós-onboarding" \
  "## Objetivo
Primeiro dashboard sem dados deve guiar para o primeiro valor.

## Tasks
- [ ] EmptyState no dashboard com duas CTAs: 'Importar extrato' e 'Lançar manualmente'
- [ ] Texto encorajador e não-técnico
- [ ] Guia rápido (3 passos) do que fazer primeiro

## Critérios de aceite
- [ ] Usuário sem dados vê o empty state (não tela em branco)
- [ ] CTAs funcionam e levam às telas corretas

## Estimativa
P

## Prioridade
Alta" \
  "frontend" \
  "v0.2 Manual MVP"

# ============================================================
# EPIC-05 — Dashboard
# ============================================================
echo ""
info "=== EPIC-05 — Dashboard ==="

create_issue \
  "[EPIC-05] 05-01 — Endpoint de agregações do período (saldo, receita, despesa, economia)" \
  "## Objetivo
API que alimenta os MetricCards do dashboard.

## Tasks
- [ ] \`GET /api/dashboard\` com parâmetros de período (padrão: mês corrente)
- [ ] Calcular: total receitas, total despesas, saldo, economia
- [ ] Cache em Redis (TTL curto, invalidar após nova transação)
- [ ] Testes unitários dos cálculos

## Critérios de aceite
- [ ] Valores batem com soma das transações do período
- [ ] Sem dados de outros usuários
- [ ] Cache invalidado após criar/editar/deletar transação

## Estimativa
M

## Prioridade
Alta" \
  "backend,database" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-05] 05-02 — MetricCards, evolução mensal e seletor de período no dashboard" \
  "## Objetivo
Visão do mês em um relance — a primeira coisa que o usuário vê.

## Referência do protótipo
- Grid de 3 MetricCards: Receitas (+verde), Despesas (-vermelho), Saldo
- 4º card opcional: Economia do mês com accent roxo IA
- Gráfico de barras agrupadas: receita vs despesa por mês (últimos 5-6 meses)
- Seletor de período no PageHeader (DateRangePicker)
- Sparklines inline nos MetricCards

## Tasks
- [ ] Grid de 3-4 MetricCards com sparklines
- [ ] Gráfico \`IncomeExpenseChart\` (barras agrupadas SVG responsivo)
- [ ] Seletor de período no header
- [ ] Loading skeleton no shape dos cards e do gráfico
- [ ] Empty state quando sem dados no período

## Critérios de aceite
- [ ] Cards refletem dados reais do período
- [ ] Gráfico mostra evolução histórica de 6 meses
- [ ] Dark mode funciona

## Estimativa
M

## Prioridade
Alta" \
  "frontend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-05] 05-03 — Top categorias (donut), últimas transações e insight em destaque" \
  "## Objetivo
Segunda linha do dashboard: composição de gastos, atividade recente e IA.

## Referência do protótipo
- Donut de top 5 categorias (resto em 'Outros') com legenda lateral
- Lista de 5 últimas transações com TxRow (ícone, nome, badge origem, valor, data)
- Card de insight da IA em destaque (primeiro da lista de insights)
- CTA 'Ver todas' nos rodapés

## Tasks
- [ ] \`DonutChart\` SVG responsivo com legenda
- [ ] Lista de 5 últimas transações (reutilizar \`TxRow\` de Transações)
- [ ] Card de insight da IA no dashboard
- [ ] CTAs que navegam para Transações e Insights

## Critérios de aceite
- [ ] Categorias refletem dados reais
- [ ] Cores de categoria consistentes com o app

## Estimativa
M

## Prioridade
Alta" \
  "frontend,backend" \
  "v0.2 Manual MVP"

# ============================================================
# EPIC-06 — Transactions
# ============================================================
echo ""
info "=== EPIC-06 — Transactions ==="

create_issue \
  "[EPIC-06] 06-01 — Endpoint de listagem de transações (filtros + paginação)" \
  "## Objetivo
API de transações com filtros, busca e paginação.

## Tasks
- [ ] \`GET /api/transactions\` com query params: período, categoria, conta, tipo, busca por texto, page, limit
- [ ] Sempre filtra por user_id da sessão
- [ ] Retorna: items, total, page, hasNext
- [ ] Testes: filtros corretos, isolamento por usuário

## Estimativa
M

## Prioridade
Alta" \
  "backend,database" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-06] 06-02 — TransactionsScreen: lista agrupada por data + painel de detalhe" \
  "## Objetivo
Tela de transações navegável e informativa — coração do produto.

## Referência do protótipo
- \`TxRow\`: ícone de categoria (CategoryIcon), nome, badge de origem (SourceReference), valor (Amount colorido), horário; clique abre detalhe
- Agrupamento por dia: 'Hoje · 31 mai', 'Ontem · 30 mai', etc.
- MetricCards do período no topo (reutilizados do dashboard)
- \`DataFilterBar\`: busca + chips (Todos, Despesas, Receitas) + botão 'Filtros' para filtros avançados
- Painel de detalhe (desktop: 360px lateral; mobile: drawer fullscreen):
  - Categoria editável inline
  - Nota livre
  - Histórico do estabelecimento
  - Insight contextual da IA
  - Botões: Editar, Excluir

## Tasks
- [ ] Lista agrupada por data com \`TxRow\`
- [ ] \`DataFilterBar\` com chips e filtros avançados
- [ ] Painel de detalhe (desktop: 360px; mobile: drawer)
- [ ] MetricCards no topo
- [ ] Paginação no rodapé
- [ ] Estados: loading (skeleton), empty, error

## Critérios de aceite
- [ ] Badge de origem visível em cada transação
- [ ] Painel abre sem navegar para nova página
- [ ] Filtros refletidos na URL (deep-link)

## Estimativa
G

## Prioridade
Alta" \
  "frontend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-06] 06-03 — TransactionForm: criar e editar transação manual" \
  "## Objetivo
Formulário completo para lançamentos manuais (\`ManualScreen\`).

## Referência do protótipo
- Toggle tipo: Despesa / Receita / Transferência
- Campos: descrição, valor (MoneyInput), data, categoria (SelectField), conta
- Checkbox 'Lançamento recorrente' com frequência
- Lista de recorrentes ativos no sidebar

## Tasks
- [ ] Toggle tipo Despesa/Receita/Transferência
- [ ] \`MoneyInput\`: aceita vírgula decimal, formata BR
- [ ] Checkbox de recorrência com seletor de frequência
- [ ] Validação com React Hook Form + Zod
- [ ] \`POST /api/transactions\` e \`PATCH /api/transactions/:id\`
- [ ] Invalidar React Query após salvar

## Critérios de aceite
- [ ] CRUD completo funciona
- [ ] Validação no front e no back
- [ ] Toast de sucesso após salvar

## Estimativa
M

## Prioridade
Alta" \
  "frontend,backend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-06] 06-04 — Recategorização, notas e exclusão de transação" \
  "## Objetivo
Edição inline de categoria e notas, exclusão com confirmação.

## Tasks
- [ ] Recategorizar no painel de detalhe (CategorySelector inline)
- [ ] Campo de nota livre (salva no blur)
- [ ] \`PATCH /api/transactions/:id\`
- [ ] Exclusão com Dialog de confirmação (destructive)
- [ ] \`DELETE /api/transactions/:id\` com soft delete
- [ ] Toast de feedback para cada ação

## Critérios de aceite
- [ ] Recategorização persiste após reload
- [ ] Exclusão: item desaparece da lista
- [ ] Sem exclusão acidental (confirmação obrigatória)

## Estimativa
M

## Prioridade
Alta" \
  "frontend,backend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-06] 06-05 — CategoriesScreen: CRUD de categorias com gestão de orçamento" \
  "## Objetivo
Tela de categorias para organizar e orçar os gastos.

## Referência do protótipo (tela descoberta na revisão)
\`CategoriesScreen\` presente no protótipo (arquivo screens-2) mas sem issue de implementação:
- Grid de CategoryCards com ícone colorido, nome, gasto do mês, barra de progresso vs orçamento
- \`CategoryBudgetBars\`: gráfico de barras de orçamento por categoria
- Botão 'Nova categoria' abre \`AddCategoryModal\`
- \`AddCategoryModal\`: nome, cor, ícone, tipo (despesa/receita), orçamento mensal opcional

## Tasks
- [ ] \`CategoriesScreen\` com grid de CategoryCards
- [ ] \`CategoryBudgetBars\` SVG (barra horizontal por categoria)
- [ ] \`AddCategoryModal\`: campos nome, cor (picker), ícone, tipo, orçamento
- [ ] Editar e excluir categoria
- [ ] \`GET|POST /api/categories\` e \`PATCH|DELETE /api/categories/:id\`
- [ ] Ao excluir: mover transações para categoria 'Outros' ou pedir reclassificação

## Critérios de aceite
- [ ] Criar categoria e ver refletida nos filtros de transação
- [ ] Barra de orçamento mostra % correta
- [ ] Excluir categoria não orphaniza transações

## Estimativa
M

## Prioridade
Alta" \
  "frontend,backend" \
  "v0.2 Manual MVP"

# ============================================================
# EPIC-07 — CSV/PDF Ingestion
# ============================================================
echo ""
info "=== EPIC-07 — CSV/PDF Ingestion ==="

create_issue \
  "[EPIC-07] 07-01 — Upload e validação de arquivo (tipo, tamanho, checksum)" \
  "## Objetivo
Receber arquivo de forma segura antes de qualquer processamento.

## Tasks
- [ ] \`POST /api/imports\` — recebe multipart/form-data
- [ ] Validar: tipo MIME, extensão, tamanho (máx 10MB)
- [ ] Calcular checksum (sha256)
- [ ] Criar \`uploaded_file\` + \`import_job\` com status 'pending'
- [ ] Retornar jobId para polling

## Critérios de aceite
- [ ] Arquivo inválido → 422 com mensagem clara
- [ ] Arquivo grande demais → 413

## Estimativa
M

## Prioridade
Alta" \
  "backend,security" \
  "v0.3 Import MVP"

create_issue \
  "[EPIC-07] 07-02 — Parser CSV + mapeamento de colunas" \
  "## Objetivo
Transformar CSV bruto em transações estruturadas.

## Tasks
- [ ] Detectar delimitador e encoding automaticamente
- [ ] UI de mapeamento de colunas (data / valor / descrição / tipo)
- [ ] Normalizar formatos de data e valores
- [ ] Calcular dedupe_hash por linha
- [ ] Atualizar import_job para 'preview'

## Critérios de aceite
- [ ] CSV de Nubank, Itaú e Bradesco parseia sem configuração manual
- [ ] Valores e datas normalizados corretamente

## Estimativa
G

## Prioridade
Alta" \
  "backend,frontend" \
  "v0.3 Import MVP"

create_issue \
  "[EPIC-07] 07-03 — ImportPreviewTable com validação por linha" \
  "## Objetivo
Usuário vê e valida o que vai ser importado antes de confirmar.

## Referência do protótipo
\`ImportScreen\` com pipeline de progresso visual (5 etapas animadas):
parse → categorização → indexação RAG → embeddings → concluído

Tabela de preview com colunas: data, descrição, valor, categoria sugerida, status (ok | duplicata | erro)
Linhas de erro em vermelho, duplicatas em âmbar
Resumo: X válidas, Y duplicatas, Z erros

## Tasks
- [ ] Tabela de preview com status por linha
- [ ] Filtro: mostrar só erros / só duplicatas
- [ ] Checkbox por linha para excluir da importação
- [ ] Resumo de contagens
- [ ] Pipeline de progresso visual (5 etapas)
- [ ] Botão 'Confirmar importação' ativo só se há linhas válidas

## Critérios de aceite
- [ ] Erros por linha não bloqueiam as válidas
- [ ] Duplicatas sinalizadas com opção de incluir/ignorar

## Estimativa
G

## Prioridade
Alta" \
  "frontend" \
  "v0.3 Import MVP"

create_issue \
  "[EPIC-07] 07-04 — Confirmação, persistência transacional e histórico de importações" \
  "## Objetivo
Importação só acontece após confirmação — com rollback em caso de falha.

## Tasks
- [ ] \`POST /api/imports/:id/confirm\` — persiste em transação de banco
- [ ] Deduplicação: não inserir se dedupe_hash já existe
- [ ] Rollback em falha parcial
- [ ] Registrar em audit_logs
- [ ] Histórico de importações (data, arquivo, status, N transações)

## Critérios de aceite
- [ ] Sem transações duplicadas ao re-importar mesmo arquivo
- [ ] Falha não deixa dados inconsistentes

## Estimativa
M

## Prioridade
Alta" \
  "backend,frontend" \
  "v0.3 Import MVP"

create_issue \
  "[EPIC-07] 07-05 — Parser PDF de extratos bancários" \
  "## Objetivo
Importar extratos em PDF sem mapeamento manual.

## Tasks
- [ ] Extração de texto do PDF
- [ ] Heurísticas por layout de banco (Nubank, Itaú, Bradesco, XP)
- [ ] Fallback: IA para layouts não reconhecidos
- [ ] Preview idêntico ao CSV (ImportPreviewTable)

## Critérios de aceite
- [ ] PDF do Nubank importa corretamente
- [ ] Bancos não suportados têm mensagem clara

## Estimativa
G

## Prioridade
Média" \
  "backend,ai" \
  "v0.5 Reports/Goals/Debts"

# ============================================================
# EPIC-08 — AI Layer & Chat
# ============================================================
echo ""
info "=== EPIC-08 — AI Layer & Chat ==="

create_issue \
  "[EPIC-08] 08-01 — Orquestração com Vercel AI SDK + streaming" \
  "## Objetivo
Infraestrutura base da camada de IA com streaming funcional.

## Tasks
- [ ] Configurar Vercel AI SDK
- [ ] \`POST /api/ai/chat\` com streaming (\`streamText\`)
- [ ] Persistir mensagem do usuário + resposta em ai_conversations/ai_messages
- [ ] Contabilizar tokens por resposta
- [ ] Teste com modelo mockado

## Critérios de aceite
- [ ] Resposta chega em streaming para o cliente
- [ ] Conversa e mensagens persistidas

## Estimativa
M

## Prioridade
Alta" \
  "ai,backend" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-08] 08-02 — System prompt + guards anti prompt-injection" \
  "## Objetivo
IA com escopo correto e proteção contra uso indevido.

## Tasks
- [ ] System prompt em \`ai/prompts/system.ts\` (versionado)
- [ ] Tom não-julgador, disclaimers, escopo limitado a finanças do usuário
- [ ] Guard: sanitizar conteúdo de dados antes de injetar no contexto
- [ ] Separação explícita entre instruções e dados no prompt
- [ ] Testes com payloads maliciosos

## Critérios de aceite
- [ ] IA recusa pedidos fora do escopo financeiro
- [ ] Descrições de transação não sobrescrevem instruções do sistema

## Notas técnicas
- Risk: prompt injection via descrição de transação ou PDF

## Estimativa
M

## Prioridade
Alta" \
  "ai,security" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-08] 08-03 — Tools de leitura (getMonthlySummary, getTransactionsByCategory, etc.)" \
  "## Objetivo
IA responde com números reais via tool calling — sem inventar dados.

## Tasks
- [ ] \`getMonthlySummary\` — receitas, despesas, saldo, economia
- [ ] \`getTransactionsByCategory\`
- [ ] \`getSpendingTrends\` — evolução mês a mês
- [ ] \`getRecurringExpenses\` — assinaturas detectadas
- [ ] \`getTopMerchants\`
- [ ] \`getUnusualSpending\` — gastos acima da média
- [ ] \`getIncomeVsExpense\`
- [ ] \`getDebtOverview\`
- [ ] Toda tool: recebe userId da sessão, retorna Zod-tipado
- [ ] Testes unitários com fixture de banco

## Critérios de aceite
- [ ] Cada tool filtra por userId
- [ ] Números retornados batem com o banco

## Notas técnicas
- A IA nunca acessa o banco diretamente — só via tools

## Estimativa
G

## Prioridade
Alta" \
  "ai,backend,security,testing" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-08] 08-04 — Embeddings (pgvector) + RAG" \
  "## Objetivo
Busca semântica sobre as transações do próprio usuário.

## Tasks
- [ ] Gerar embedding ao criar/importar transação
- [ ] Armazenar em ai_embeddings com user_id e transaction_id
- [ ] Busca: filtrar user_id → ordenar cosine similarity → top-k
- [ ] Injetar contexto semântico no prompt quando relevante
- [ ] Testes: embedding gerado, busca filtra por usuário

## Critérios de aceite
- [ ] Embedding criado para cada transação nova
- [ ] Busca nunca retorna embeddings de outro usuário

## Estimativa
M

## Prioridade
Média" \
  "ai,database" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-08] 08-05 — Rate limit + cache de IA (Redis)" \
  "## Objetivo
Controlar custo e prevenir abuso da camada de IA.

## Tasks
- [ ] Rate limit por usuário: N perguntas/hora (sliding window Redis)
- [ ] Retornar 429 com tempo até reset
- [ ] Cache de respostas idênticas no mesmo período
- [ ] Métricas de tokens/usuário
- [ ] UI: mostrar limite atingido com quando reseta

## Critérios de aceite
- [ ] Rate limit retorna 429 correto
- [ ] Cache evita chamada ao LLM para perguntas repetidas

## Estimativa
M

## Prioridade
Alta" \
  "ai,backend,security" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-08] 08-06 — ChatScreen: interface completa de conversa com IA" \
  "## Objetivo
Tela de chat com experiência polida e prompts sugeridos.

## Referência do protótipo (tela descoberta na revisão)
\`ChatScreen\` presente no protótipo mas sem issue cobrindo a UI completa:
- Empty state: tela de boas-vindas com título 'Pergunte sobre suas finanças' + grid de prompts sugeridos (8 perguntas rápidas clicáveis)
- Conversa: lista de mensagens (user right-aligned, AI left-aligned com AIAvatar)
- Mensagens da IA renderizam Markdown básico (\`**bold**\`)
- \`AIThinking\`: animação de 3 dots pulsando enquanto processa
- Rodapé: input + botão Enviar + hint de privacidade
- \`SourceReference\` abaixo de cada resposta da IA
- Botão de feedback thumbs up/down por resposta

## Tasks
- [ ] Empty state com grid de 8 prompts sugeridos clicáveis
- [ ] Lista de mensagens com scroll automático para o fim
- [ ] \`AIThinking\` durante streaming
- [ ] Renderização de Markdown simples (\`**bold**\`, listas)
- [ ] \`SourceReference\` abaixo de cada resposta
- [ ] Feedback thumbs up/down → \`POST /api/ai/messages/:id/feedback\`
- [ ] \`aria-live='polite'\` na região de mensagens

## Critérios de aceite
- [ ] Prompts sugeridos enviam a mensagem ao clicar
- [ ] Scroll para última mensagem automaticamente
- [ ] Feedback registrado no banco

## Estimativa
M

## Prioridade
Alta" \
  "frontend,ai" \
  "v0.4 AI MVP"

# ============================================================
# EPIC-09 — Insights & Recommendations
# ============================================================
echo ""
info "=== EPIC-09 — Insights & Recommendations ==="

create_issue \
  "[EPIC-09] 09-01 — Motor de insights por regras" \
  "## Objetivo
Insights proativos baseados nos dados do usuário.

## Referência do protótipo
Insights têm campo \`impact\` (valor em R$ de economia potencial).
Tela \`InsightsScreen\` exibe: 'Potencial de economia: R$ X,XX identificado esta semana'

## Tasks
- [ ] Regra: categoria acima de 20% da média → warning
- [ ] Regra: assinatura recorrente não vista no mês → info
- [ ] Regra: gasto prestes a ultrapassar receita → risk
- [ ] Regra: gasto incomum em estabelecimento novo → info
- [ ] Calcular campo \`impact\` em R$ para cada insight
- [ ] Persistir em ai_insights com severidade e status
- [ ] Job após importação + início de mês

## Critérios de aceite
- [ ] Insights com severidade correta e impact calculado
- [ ] Sem insights duplicados para o mesmo evento
- [ ] Testes unitários das regras

## Estimativa
G

## Prioridade
Média" \
  "backend,ai" \
  "v0.4 AI MVP"

create_issue \
  "[EPIC-09] 09-02 — InsightsScreen e ações (aplicar, ignorar, marcar útil)" \
  "## Objetivo
Interface de insights acionável.

## Referência do protótipo
\`InsightsScreen\`:
- Header com potencial de economia total (soma dos campos \`impact\`)
- Chips de filtro: Todos / Risco / Atenção / Info
- Lista de \`InsightCard\` com: ícone de severidade, título, descrição, ação recomendada, botões
- \`InsightDetailModal\`: detalhe expandido com ação e histórico

## Tasks
- [ ] \`InsightsScreen\` com header de economia potencial
- [ ] Chips de filtro por severidade com contagens
- [ ] \`InsightCard\` com botões (Aplicar, Ignorar, Foi útil)
- [ ] \`InsightDetailModal\` (usar modal existente)
- [ ] \`POST /api/insights/:id/action\`

## Critérios de aceite
- [ ] Severidade visível (cor + ícone)
- [ ] Ignorar remove da lista principal
- [ ] Ações persistem no banco

## Estimativa
M

## Prioridade
Média" \
  "frontend,backend" \
  "v0.4 AI MVP"

# ============================================================
# EPIC-10 — Reports
# ============================================================
echo ""
info "=== EPIC-10 — Reports ==="

create_issue \
  "[EPIC-10] 10-01 — ReportsScreen: filtros, gráficos, tabela e exportação" \
  "## Objetivo
Visão consolidada de um período com exportação.

## Referência do protótipo
\`ReportsScreen\` com:
- Cards de resumo + gráfico \`IncomeExpenseChart\` (barras agrupadas)
- \`BalanceLineChart\`: linha de saldo acumulado
- Donut de composição + \`CategoryBudgetBars\`
- Tabela de transações filtradas
- \`AISummary\`: parágrafo gerado pela IA

## Tasks
- [ ] Filtros: período, categorias, contas, tipo
- [ ] Cards de resumo + gráficos (barras, linha, donut)
- [ ] \`CategoryBudgetBars\` horizontal
- [ ] Tabela de transações do período
- [ ] Exportação CSV + PDF do relatório
- [ ] \`AISummary\` com disclaimer

## Critérios de aceite
- [ ] Filtros refletem nos gráficos e na tabela
- [ ] Exportação CSV funciona
- [ ] Disclaimer presente no resumo da IA

## Estimativa
G

## Prioridade
Baixa" \
  "frontend,backend,ai" \
  "v0.5 Reports/Goals/Debts"

# ============================================================
# EPIC-11 — Goals & Debts
# ============================================================
echo ""
info "=== EPIC-11 — Goals & Debts ==="

create_issue \
  "[EPIC-11] 11-01 — GoalsScreen: CRUD de metas + GoalRing + projeção da IA" \
  "## Objetivo
Acompanhamento de objetivos financeiros com projeção da IA.

## Referência do protótipo
\`GoalsScreen\` com:
- \`GoalRing\`: anel SVG de progresso (% concluído) com cor por status
- Grid de cards de meta: nome, valor-alvo vs atual, prazo, projeção IA
- Botão 'Nova meta' → \`AddGoalModal\`
- \`AddGoalModal\`: nome, valor-alvo, data-limite

## Tasks
- [ ] \`GoalRing\` SVG com animação de fill
- [ ] Grid de cards com progresso e projeção
- [ ] \`AddGoalModal\`
- [ ] \`GET|POST /api/goals\` e \`PATCH|DELETE /api/goals/:id\`
- [ ] Projeção da IA: 'No ritmo atual você chega em X'

## Critérios de aceite
- [ ] CRUD completo funciona
- [ ] Progresso calculado corretamente
- [ ] Projeção com disclaimer

## Estimativa
M

## Prioridade
Média" \
  "frontend,backend,ai" \
  "v0.5 Reports/Goals/Debts"

create_issue \
  "[EPIC-11] 11-02 — DebtsScreen: módulo de dívidas + estratégia de quitação" \
  "## Objetivo
Ajudar o usuário a quitar dívidas com um plano fundamentado.

## Referência do protótipo
\`DebtsScreen\` com:
- MetricCards: total em aberto, parcelas/mês, juros totais
- Lista de DebtCards com barra de progresso e badge de prioridade
- \`DebtStrategyPanel\`: tabs Avalanche vs Bola de Neve com economia estimada
- \`AddDebtModal\`: nome, banco, saldo, taxa mensal, parcela, parcelas restantes

## Tasks
- [ ] DebtCards com badge de prioridade (maior juros = vermelho)
- [ ] \`AddDebtModal\`
- [ ] \`DebtStrategyPanel\`: cálculo avalanche e bola de neve
- [ ] Exibir economia estimada em R$ e meses
- [ ] \`GET|POST /api/debts\` e \`PATCH|DELETE /api/debts/:id\`

## Critérios de aceite
- [ ] Cálculo de estratégia correto (testado unitariamente)
- [ ] Disclaimer presente
- [ ] Badge de prioridade correto

## Estimativa
M

## Prioridade
Média" \
  "frontend,backend,ai" \
  "v0.5 Reports/Goals/Debts"

# ============================================================
# EPIC-12 — Settings & Preferences (novo — descoberto no protótipo)
# ============================================================
echo ""
info "=== EPIC-12 — Settings & Preferences (NOVO) ==="

create_issue \
  "[EPIC-12] 12-01 — SettingsScreen: preferências, notificações e IA" \
  "## Objetivo
Tela de configurações acessível pelo footer da sidebar e pelo UserMenu.

## Referência do protótipo (EPIC novo — descoberto na revisão)
\`SettingsScreen\` com seções:
1. **Aparência**: toggle dark/light mode; toggle sidebar compacta
2. **Preferências financeiras**: moeda padrão; dia de fechamento do mês
3. **Notificações** (todos toggles): alertas de gastos, lembretes de parcela, resumo semanal, anomalias de IA
4. **Inteligência Artificial**: toggle de personalização IA; nível de detalhe das respostas (conciso/detalhado/analítico); toggle de sugestões proativas
5. **Privacidade**: toggle de analytics; botão 'Exportar meus dados'; botão 'Excluir conta' (destructive, abre DeleteAccountModal)

## Tasks
- [ ] \`SettingsScreen\` com seções e \`SettingRow\` / \`SettingToggle\`
- [ ] Persistir preferências via \`PATCH /api/settings\`
- [ ] Rota \`/config\` mapeada no AppShell
- [ ] Dark mode toggle reflete imediatamente (sem reload)
- [ ] Integrar botões de Exportar dados e Excluir conta (EPIC-13)

## Critérios de aceite
- [ ] Preferências salvas e persistidas entre sessões
- [ ] Dark mode toggle funciona imediatamente
- [ ] Botão excluir conta abre DeleteAccountModal (dupla confirmação)

## Estimativa
M

## Prioridade
Média" \
  "frontend,backend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-12] 12-02 — Schema: user_settings e preferências de IA" \
  "## Objetivo
Persistir as configurações do usuário no banco.

## Referência do protótipo
Campos necessários levantados da SettingsScreen:
- appearance: theme (light|dark|system), sidebar_collapsed
- financial: currency, closing_day
- notifications: spend_alerts, installment_reminders, weekly_summary, anomaly_alerts
- ai: personalization_enabled, response_detail (concise|detailed|analytical), proactive_suggestions
- privacy: analytics_enabled

## Tasks
- [ ] \`user_settings\` table com todos os campos (ou expandir \`user_profiles\`)
- [ ] Defaults seguros (analytics OFF, notifications ON por padrão)
- [ ] \`GET|PATCH /api/settings\` — sempre filtra por userId da sessão
- [ ] Seed com defaults

## Critérios de aceite
- [ ] Migration aplica sem erro
- [ ] API retorna e persiste todas as preferências
- [ ] Defaults aplicados para usuário sem registro

## Estimativa
P

## Prioridade
Média" \
  "database,backend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-12] 12-03 — SettingToggle e SettingRow: componentes de configuração" \
  "## Objetivo
Componentes reutilizáveis para todas as telas de configuração.

## Referência do protótipo
- \`SettingRow\`: label + descrição muted + slot à direita (toggle, select ou link)
- \`SettingToggle\`: SettingRow com Switch; chama callback no change
- Organização em Cards com SectionHeader

## Tasks
- [ ] \`SettingRow\` com slot à direita flexível
- [ ] \`SettingToggle\` com Switch integrado
- [ ] \`SettingSelect\` com SelectField integrado
- [ ] Testes: toggle chama callback, estado controlado funciona

## Critérios de aceite
- [ ] Componentes funcionam com qualquer tipo de controle à direita
- [ ] Acessíveis por teclado

## Estimativa
P

## Prioridade
Média" \
  "design-system,frontend" \
  "v0.2 Manual MVP"

create_issue \
  "[EPIC-12] 12-04 — Endpoint PATCH /api/settings e GET /api/settings" \
  "## Objetivo
API para ler e atualizar todas as configurações do usuário.

## Tasks
- [ ] \`GET /api/settings\` — retorna configurações do usuário (com defaults)
- [ ] \`PATCH /api/settings\` — atualiza campos específicos (partial update)
- [ ] Validação Zod do body
- [ ] Autenticação obrigatória (requireUserId)
- [ ] Testes: isolamento por usuário, validação de campos

## Critérios de aceite
- [ ] GET retorna defaults para usuário sem settings
- [ ] PATCH aplica apenas campos enviados (não sobrescreve os demais)
- [ ] Sem acesso a settings de outro usuário

## Estimativa
P

## Prioridade
Média" \
  "backend" \
  "v0.2 Manual MVP"

# ============================================================
# EPIC-16 — Integrations (Future)
# ============================================================
echo ""
info "=== EPIC-16 — Integrations (Future) ==="

create_issue \
  "[EPIC-16] 16-01 — Modelar IntegrationConnection e estados de conexão" \
  "## Objetivo
Preparar o domínio para integrações futuras com Plaid/Open Finance sem acoplar o MVP a um provider real.

## Tasks
- [ ] Revisar schema \`integration_connections\`
- [ ] Definir estados: disconnected, connecting, connected, expired, failed, revoked
- [ ] Definir campos mínimos: provider, external_account_id, access_token_encrypted, refresh_token_encrypted, scopes, expires_at
- [ ] Criar documentação de segurança para tokens
- [ ] Criar provider mockado para desenvolvimento

## Critérios de aceite
- [ ] Estados de conexão documentados
- [ ] Tokens nunca aparecem em logs
- [ ] Provider mockado permite simular conexão sem Plaid/Open Finance real

## Notas técnicas
- Future: não entra no MVP manual
- Risk: integrações financeiras exigem cuidado legal, segurança e consentimento explícito

## Estimativa
M

## Prioridade
Baixa" \
  "integrations,backend,security,database" \
  "vFuture Integrations"

create_issue \
  "[EPIC-16] 16-02 — Tela de integrações" \
  "## Objetivo
Criar a experiência de conexão, status e desconexão de integrações financeiras.

## Tasks
- [ ] Rota \`/settings/integrations\` ou seção dentro de \`/settings\`
- [ ] Card por provider: Plaid, Open Finance, Manual Import
- [ ] Estados visuais: conectado, expirado, erro, desconectado
- [ ] Ações: conectar, reconectar, desconectar
- [ ] Empty state explicando alternativa de importação manual

## Critérios de aceite
- [ ] Usuário entende status da integração
- [ ] Desconectar exige confirmação
- [ ] UI funciona com provider mockado

## Notas técnicas
- Future: manter atrás de feature flag até definição do provider real

## Estimativa
M

## Prioridade
Baixa" \
  "integrations,frontend,settings" \
  "vFuture Integrations"

create_issue \
  "[EPIC-16] 16-03 — Webhook handler base para integrações" \
  "## Objetivo
Preparar uma base segura para receber eventos externos de providers financeiros.

## Tasks
- [ ] Criar endpoint \`POST /api/webhooks/integrations/:provider\`
- [ ] Validar assinatura do webhook quando provider suportar
- [ ] Persistir evento bruto em \`webhook_events\`
- [ ] Tornar processamento idempotente por event_id
- [ ] Criar fila/job interno para processar eventos depois
- [ ] Testar replay de webhook sem duplicar transações

## Critérios de aceite
- [ ] Webhook inválido é rejeitado
- [ ] Evento duplicado não gera processamento duplicado
- [ ] Dados sensíveis não aparecem nos logs

## Notas técnicas
- Future: implementar primeiro com provider mockado
- Risk: webhook mal validado pode causar importação indevida ou vazamento

## Estimativa
G

## Prioridade
Baixa" \
  "integrations,backend,security,testing" \
  "vFuture Integrations"

create_issue \
  "[EPIC-16] 16-04 — Sincronização inicial com provider mockado" \
  "## Objetivo
Validar arquitetura de integração antes de conectar provedores reais.

## Tasks
- [ ] Criar adapter \`MockFinanceProvider\`
- [ ] Simular contas externas
- [ ] Simular transações externas
- [ ] Normalizar payload externo para domínio interno
- [ ] Deduplicar transações sincronizadas
- [ ] Mostrar histórico de sync na UI

## Critérios de aceite
- [ ] Sync mockado cria contas/transações corretamente
- [ ] Rodar sync duas vezes não duplica transações
- [ ] Histórico mostra sucesso/falha e quantidade sincronizada

## Notas técnicas
- Future: adapter pattern facilitará Plaid/Open Finance depois

## Estimativa
G

## Prioridade
Baixa" \
  "integrations,backend,frontend,database" \
  "vFuture Integrations"

# ============================================================
# EPIC-13 — Observability & Security
# ============================================================
echo ""
info "=== EPIC-13 — Observability & Security ==="

create_issue \
  "[EPIC-13] 13-01 — Sentry (front + back) + OpenTelemetry" \
  "## Objetivo
Erros e traces visíveis em produção.

## Tasks
- [ ] Sentry SDK no Next.js (client + server + edge)
- [ ] Sentry release vinculada ao deploy (via GitHub Actions)
- [ ] OpenTelemetry: tracing de requests, queries de banco, tool calls de IA
- [ ] Logs estruturados (JSON) com requestId e userId hash — sem PII

## Critérios de aceite
- [ ] Erros de front e back aparecem no Sentry
- [ ] Traces de request visíveis com spans relevantes
- [ ] Nenhum dado financeiro nos logs

## Estimativa
M

## Prioridade
Alta" \
  "infra,security" \
  "v1.0 Production"

create_issue \
  "[EPIC-13] 13-02 — Rate limit global em endpoints sensíveis" \
  "## Objetivo
Proteger endpoints de autenticação, importação e IA contra abuso.

## Tasks
- [ ] Rate limit Redis em: /api/ai/chat, /api/imports, /api/auth/*
- [ ] Sliding window counter por IP + por userId quando autenticado
- [ ] 429 com header Retry-After
- [ ] Métricas de rate limit para alertas

## Critérios de aceite
- [ ] Exceder limite retorna 429 correto
- [ ] Usuário vê mensagem amigável com tempo de reset
- [ ] Métricas de hits/misses disponíveis

## Estimativa
M

## Prioridade
Alta" \
  "backend,security,infra" \
  "v1.0 Production"

# ============================================================
# EPIC-14 — Testing & Production Hardening
# ============================================================
echo ""
info "=== EPIC-14 — Testing & Production Hardening ==="

create_issue \
  "[EPIC-14] 14-01 — Testes E2E dos fluxos críticos (Playwright)" \
  "## Objetivo
Garantia automatizada dos fluxos que não podem quebrar.

## Tasks
- [ ] E2E: onboarding → criar transação manual → ver no dashboard
- [ ] E2E: importar CSV → preview → confirmar → transações aparecem
- [ ] E2E: perguntar à IA → resposta com fonte exibida (modelo mockado)
- [ ] E2E: tentar acessar dado de outro usuário → 403
- [ ] Configurar Playwright no CI com banco de teste
- [ ] Testes de acessibilidade com axe nas páginas críticas

## Critérios de aceite
- [ ] Todos os E2E passam no CI
- [ ] Isolamento por usuário verificado
- [ ] A11y: sem violações críticas nas páginas principais

## Estimativa
G

## Prioridade
Alta" \
  "testing,security" \
  "v1.0 Production"

# ============================================================
# EPIC-15 — Documentation & Open Source
# ============================================================
echo ""
info "=== EPIC-15 — Documentation & Open Source ==="

create_issue \
  "[EPIC-15] 15-01 — README completo com pitch, screenshots e setup" \
  "## Objetivo
Primeira impressão do projeto no GitHub — deve convencer e orientar em menos de 2 minutos.

## Tasks
- [ ] Badge de status (CI, licença, versão)
- [ ] Pitch do produto (o que é, para quem, diferencial)
- [ ] Screenshots das telas principais (dashboard, chat, importação)
- [ ] Stack badge visual
- [ ] Setup em 3 passos (clone, envs, docker up, dev)
- [ ] Link para docs/ (product, architecture, ai-collaboration)
- [ ] Roadmap resumido com status de cada versão
- [ ] Link para CONTRIBUTING

## Critérios de aceite
- [ ] Alguém consegue rodar localmente seguindo só o README
- [ ] Screenshots das telas reais (não wireframes)

## Estimativa
M

## Prioridade
Alta" \
  "docs" \
  "v1.0 Production"

create_issue \
  "[EPIC-15] 15-02 — CONTRIBUTING, CODE_OF_CONDUCT, SECURITY e LICENSE" \
  "## Objetivo
Documentação necessária para um projeto open source saudável.

## Tasks
- [ ] CONTRIBUTING.md: setup local, convenção de branch/commit, fluxo de PR, Definition of Done
- [ ] CODE_OF_CONDUCT.md: Contributor Covenant
- [ ] SECURITY.md: como reportar vulnerabilidade (sem criar issue pública)
- [ ] LICENSE: Decision Needed — MIT recomendado para portfólio

## Critérios de aceite
- [ ] Contribuidor externo consegue abrir um PR seguindo o CONTRIBUTING
- [ ] Vulnerabilidade pode ser reportada de forma privada

## Estimativa
P

## Prioridade
Alta" \
  "docs" \
  "v1.0 Production"

echo ""
log "=============================================="
log "Todas as issues criadas com sucesso!"
log "Repositório: https://github.com/$REPO/issues"
log "Project board: https://github.com/users/$OWNER/projects/$PROJECT_ID"
log "=============================================="
log ""
log "Issues novas nesta versão (v3 — revisado com protótipo):"
log "  + 02-04 — UserMenu, NotificationCenter, AccountScreen e modais de conta"
log "  + 06-05 — CategoriesScreen com gestão de orçamento"
log "  + 08-06 — ChatScreen: UI completa (prompts sugeridos, streaming, feedback)"
log "  + 12-01~04 — EPIC-12 Settings: schema, componentes, endpoints"
log "  + 13-02 — Export e exclusão de dados (LGPD/GDPR)"
log "  ~ Telas separadas de backend em todo o projeto"
log "  ~ Issues enriquecidas com referências ao protótipo"