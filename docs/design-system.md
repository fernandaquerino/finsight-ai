# FinSight AI — Design System & UI Discovery

> Perspectiva: Product Designer Sênior + Design System Lead.
> Versão: 0.1 · Status: living document

> **Nota sobre referências:** a fase de discovery visual já foi feita de forma colaborativa. Existem 8 wireframes de baixa/média fidelidade aprovados (Dashboard, Chat com IA, Importar, Categorias, Metas, Dívidas, Lançamentos manuais, Configurações, Transações). Este documento extrai os padrões deles e os formaliza num sistema — os wireframes são a referência, não o layout final pixel-perfect.

---

## 1. Design direction

**Tom visual:** sóbrio, confiável, "calmo". Finanças geram ansiedade; a interface precisa reduzir, não amplificar. Fundo claro/escuro neutro, superfícies brancas, bordas finas (0.5px), muito espaço em branco. Nada de gradientes chamativos, sombras pesadas ou neon.

**Sensação desejada:** "isto é sério com meu dinheiro, mas é fácil de entender". Premium pela contenção, não pelo excesso.

**Estilo de interface:** flat, data-first. O dado é o herói; o cromo da interface recua.

**Densidade visual:** média-alta em telas de dados (transações, categorias) e média no dashboard. Densidade controlada por hierarquia tipográfica e agrupamento, não por linhas/bordas.

**Equilíbrio fintech + IA:** o fintech traz a sobriedade (números monoespaçados, cores semânticas disciplinadas); a IA traz um sotaque próprio (uma única cor de marca — roxo — reservada para tudo que é "inteligência": chat, insights, sugestões). Assim o usuário aprende: roxo = a IA está falando.

**Evitar genérico:** não usar o shadcn "cru". A diferenciação vem de (1) cor de marca roxa usada com parcimônia e propósito, (2) números em fonte monoespaçada tabular, (3) padrão master-detail consistente, (4) microcopy não-julgadora.

**Premium sem perder clareza:** menos elementos, mais respiro; uma cor de destaque só; tipografia com hierarquia forte.

**Transmitir confiança:** badges de origem do dado (`extrato`/`manual`), a IA sempre citando fontes, e transparência sobre privacidade visível nas Configurações.

---

## 2. Análise de referências (síntese dos wireframes)

Padrões extraídos e adotados:

- **Layout:** AppShell com sidebar fixa (180px) agrupada em "Principal" / "Análise", topbar fina com logo + notificações + avatar. Conteúdo com PageHeader (título + subtítulo de contexto, ex.: "Maio 2026 · 97 lançamentos").
- **Cards:** superfície branca, borda 0.5px, radius grande (12px), padding generoso. MetricCards usam fundo secundário (sem borda) para diferenciar de cards de conteúdo.
- **Gráficos:** barras para evolução mensal (receita vs despesa lado a lado), donut para composição por categoria, barras de progresso horizontais para categorias/metas/dívidas.
- **Tabelas/listas:** transações como lista agrupada por data (não tabela paginada densa) — mais legível para uso pessoal. Master-detail: clicar abre painel lateral, sem modal.
- **Menus/filtros/ações:** filtros como chips arredondados (estado "on" em roxo claro); busca inline com ícone; ação primária sempre visível no canto do PageHeader.
- **Empty states:** CTA claro ("Arraste seu extrato" / "Adicionar lançamento").
- **Cores:** neutro dominante + roxo como marca/IA + verde (receita/positivo) + vermelho (despesa/negativo/risco) + âmbar (atenção). Categorias têm paleta própria, separada das cores semânticas.
- **Hierarquia:** título 16px/500, subtítulo 12px secundário, valores em destaque 18-26px.
- **Espaçamento:** ritmo vertical em rem (1/1.5/2rem), gaps internos em px (8/12/16).
- **Densidade:** confortável; cada linha de transação tem ~34px de ícone + duas linhas de texto.
- **Sensação geral:** limpa, confiável, sem ruído.

**O que NÃO trazer:** gradientes, sombras fortes, excesso de cores por categoria competindo com as semânticas, tabelas densas estilo "planilha" como navegação primária.

---

## 3. Identidade visual inicial

Paleta (tokens em formato Tailwind/shadcn, HSL para facilitar dark mode):

```ts
const colors = {
  background: "...", // page bg neutro
  foreground: "...", // texto primário
  primary: "...", // roxo de marca / IA
  secondary: "...", // superfícies secundárias
  muted: "...", // texto/fundo discreto
  border: "...", // bordas 0.5px
  success: "...", // receita / positivo
  warning: "...", // atenção
  danger: "...", // despesa / risco
  info: "...", // informativo
};
```

Valores propostos (CSS variables, light / dark):

| Token                 | Light         | Dark          | Uso                        |
| --------------------- | ------------- | ------------- | -------------------------- |
| `--background`        | `0 0% 99%`    | `240 6% 8%`   | fundo da página            |
| `--foreground`        | `240 10% 12%` | `0 0% 96%`    | texto primário             |
| `--card`              | `0 0% 100%`   | `240 5% 11%`  | superfície de card         |
| `--muted`             | `240 5% 96%`  | `240 4% 16%`  | superfície secundária      |
| `--muted-foreground`  | `240 4% 46%`  | `240 5% 65%`  | texto secundário           |
| `--border`            | `240 6% 90%`  | `240 4% 20%`  | bordas                     |
| `--primary` (roxo/IA) | `248 53% 50%` | `248 60% 68%` | marca, IA, ações primárias |
| `--success` (receita) | `162 70% 33%` | `162 55% 52%` | valores positivos          |
| `--danger` (despesa)  | `0 72% 48%`   | `0 70% 62%`   | valores negativos, risco   |
| `--warning`           | `33 90% 45%`  | `38 90% 60%`  | atenção, "acima da média"  |
| `--info`              | `212 80% 45%` | `212 75% 62%` | informativo                |

**Estados:** hover = superfície `muted`; focus = anel de 2px na cor `primary` com offset; disabled = opacidade 50% + cursor not-allowed.

**Cores de gráfico** (sequência categórica, distinta das semânticas):

```ts
const chartColors = [
  "#1D9E75",
  "#534AB7",
  "#D85A30",
  "#BA7517",
  "#378ADD",
  "#888780",
];
```

**Cores de categoria financeira** (mapa estável — a mesma categoria sempre na mesma cor):

```ts
const categoryColors = {
  alimentacao: "#1D9E75",
  moradia: "#534AB7",
  transporte: "#D85A30",
  assinaturas: "#BA7517",
  saude: "#378ADD",
  lazer: "#D4537E",
  outros: "#888780",
};
```

> Regra: receitas/despesas usam SEMPRE verde/vermelho semânticos; cores de categoria são para composição (donut, barras de categoria) e nunca para indicar positivo/negativo.

---

## 4. Tipografia

- **Fonte principal:** Geist Sans (ou Inter como fallback). Limpa, ótima para dados, gratuita.
- **Fonte de números:** Geist Mono (ou variante tabular da principal) com `font-variant-numeric: tabular-nums` para alinhar valores em colunas.
- **Hierarquia:**
  - h1 / título de página: 20px / 500
  - h2 / seção: 16px / 500
  - h3 / card title: 14px / 500
  - body: 14px / 400, line-height 1.6
  - small / meta: 12px / 400 (texto secundário)
  - micro / labels uppercase: 11px / 500, letter-spacing 0.06em
  - valores grandes (métricas): 18–26px / 500, tabular-nums
- **Pesos:** apenas 400 e 500. Evitar 600/700 (peso visual desnecessário).
- **Line-height:** 1.6 para prosa, 1.3 para títulos.
- **Letter-spacing:** só em labels uppercase.
- **Regra anti-poluição:** no máximo dois pesos e três tamanhos por tela; nunca uppercase em conteúdo (só em labels de seção).

---

## 5. Layout system

- **Grid:** dashboard em 12 colunas; cards usam `repeat(auto-fit, minmax(...))`.
- **Container:** max-width ~1200px no conteúdo, sidebar fora do container.
- **Sidebar:** fixa 180px no desktop; grupos "Principal" e "Análise".
- **Topbar:** ~48px, logo à esquerda, ações à direita.
- **PageHeader:** título + subtítulo de contexto + ação primária à direita; padrão em todas as telas.
- **Cards:** radius 12px, borda 0.5px, padding 1rem 1.25rem.
- **Responsividade / breakpoints:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- **Mobile:** sidebar → bottom-nav (4-5 itens principais) + drawer para o resto; tabelas → listas; filtros colapsáveis; painel de detalhe vira tela cheia (push) em vez de painel lateral.
- **Desktop:** master-detail (lista + painel lateral 230px).
- **Densidade:** dashboard arejado; telas de dados mais densas.
- **Largura de tabelas / overflow:** `table-layout: fixed` em telas estreitas; scroll horizontal no wrapper quando inevitável.
- **Telas com muitos filtros:** barra de filtros que colapsa em um botão "Filtros" no mobile.

---

## 6. Componentes base do design system

> Convenção: `genérico` vive em `components/ui` (base shadcn), `produto` vive em `features/*/components` ou `components/app`.

### Foundation (shadcn como base)

Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Badge, Tooltip, Popover, Dialog, Drawer, Tabs, Toast.

- Variantes típicas (Button): `primary | secondary | ghost | destructive`, tamanhos `sm | md`.
- Estados: default, hover, focus-visible, disabled, loading.
- A11y: focus trap em Dialog/Drawer; labels em todos os inputs; `aria-label` em IconButton.

### Layout (produto)

AppShell, Sidebar, Topbar, PageHeader, SectionHeader, Card, MetricCard, ChartCard, EmptyState, LoadingState, ErrorState.

### Data display

Table, DataTable (TanStack Table), DataFilterBar, Pagination, DateRangePicker, CategoryBadge, TransactionAmount (formata + colore por sinal), StatusBadge, TrendIndicator (▲▼ com cor).

### Finance-specific

TransactionList, TransactionRow, TransactionForm, CategorySelector, AccountSelector, ImportPreviewTable, ImportStatusCard, GoalProgressCard, InsightCard, BudgetRiskCard, DebtCard, DebtStrategyPanel.

### AI-specific

AIChat, AIChatMessage, AIInput, AISuggestionPrompt, AIInsightCard, AIThinkingState, AIResponseFeedback, SourceReference, ToolCallPreview.

### Charts

SpendingByCategoryChart (donut), MonthlyTrendChart (linha), IncomeVsExpenseChart (barras), CashflowChart, GoalProgressChart, RecurringExpensesChart.

Para cada componente, documentar (no Storybook ou em MDX): objetivo, variantes, estados, props principais, regras de a11y, exemplo de uso, base (shadcn ou não), genérico vs produto.

---

## 7. Padrões de tela

(Resumo; as 8 telas de referência já materializam estes padrões.)

- **Dashboard:** PageHeader → grid de MetricCards (3-4) → ChartCard de evolução → top categorias → últimas transações → insights/alertas. Empty: CTA importar/lançar. Parcial: banner "conecte mais contas para insights melhores".
- **Transações:** PageHeader com seletor de período + exportar → MetricCards do período → DataFilterBar (busca + chips) → lista agrupada por data → painel de detalhe (master-detail) com histórico e insight da IA → paginação.
- **Importação CSV/PDF:** dropzone → lista de arquivos com progresso → (CSV) mapeamento de colunas → ImportPreviewTable com validação por linha → resolução de duplicatas → confirmação → ImportStatusCard com pipeline (parse → categorização → embeddings → indexado).
- **Chat IA:** layout duas colunas (conversa + sidebar de insights/sugestões); mensagens user/assistant; AIThinkingState durante tool calls; SourceReference ao fim das respostas; AIResponseFeedback.
- **Insights:** lista de InsightCards com severidade (cor), motivo, ação recomendada, botões aplicar/ignorar/útil; filtros por tipo/severidade.
- **Relatórios:** filtros de período → cards de resumo → gráficos → tabela → resumo por IA → exportar.
- **Metas:** lista de GoalProgressCards com barra de progresso, prazo, e insight contextual da IA ("no ritmo atual você chega em outubro").
- **Dívidas:** MetricCards (total, parcelas/mês, juros) → DebtCards ordenados por estratégia → DebtStrategyPanel da IA (avalanche/bola de neve) com economia estimada.
- **Configurações:** seções em cards (Perfil, Contas conectadas, Notificações com switches, IA & dados com escolha de modelo + "dados para treino: Nunca" + exportar/excluir).

---

## 8. UX states

| Estado                              | Mensagem                                                         | Ação primária     | Ação secundária  | Componente       | Tom              |
| ----------------------------------- | ---------------------------------------------------------------- | ----------------- | ---------------- | ---------------- | ---------------- |
| Empty (sem dados)                   | "Vamos começar? Importe um extrato ou lance um gasto."           | Importar extrato  | Lançar manual    | EmptyState       | Convidativo      |
| First experience                    | Onboarding guiado de 3 passos                                    | Avançar           | —                | Onboarding       | Acolhedor        |
| Loading                             | Skeletons na forma do conteúdo                                   | —                 | —                | LoadingState     | Neutro           |
| Error                               | "Não consegui carregar isso agora."                              | Tentar de novo    | —                | ErrorState       | Calmo, sem culpa |
| Success                             | Toast "Transação salva"                                          | —                 | Desfazer         | Toast            | Leve             |
| Partial data                        | Banner "Conecte mais contas para insights completos"             | Conectar          | Dispensar        | Card             | Informativo      |
| Import in progress                  | Pipeline com etapas                                              | —                 | Cancelar         | ImportStatusCard | Transparente     |
| Import failed                       | "3 linhas tiveram problema."                                     | Revisar linhas    | Importar o resto | ImportStatusCard | Construtivo      |
| Import completed                    | "97 transações importadas."                                      | Ver transações    | —                | ImportStatusCard | Positivo         |
| AI loading                          | "Consultando seus dados..."                                      | —                 | —                | AIThinkingState  | Transparente     |
| AI failed                           | "Não consegui responder agora. Seus dados continuam acessíveis." | Tentar de novo    | —                | AIChatMessage    | Calmo            |
| No transactions                     | igual Empty                                                      | —                 | —                | EmptyState       | —                |
| No insights yet                     | "Ainda não há insights — preciso de mais dados."                 | Importar mais     | —                | EmptyState       | Honesto          |
| Integration disconnected (`Future`) | "Conexão com o banco expirou."                                   | Reautorizar       | —                | Card             | Neutro           |
| Rate limit                          | "Você atingiu o limite de perguntas por agora."                  | Ver quando reseta | —                | Toast/Card       | Sem culpar       |
| Permission denied                   | "Você não tem acesso a isso."                                    | Voltar            | —                | ErrorState       | Neutro           |
| Offline/degraded                    | "Você está offline. Mostrando dados em cache."                   | —                 | —                | Banner           | Informativo      |

---

## 9. Acessibilidade

- WCAG 2.1 AA; contraste mínimo 4.5:1 (texto), 3:1 (componentes/gráficos).
- Navegação por teclado completa; foco visível (anel de 2px); ordem de tabulação lógica.
- Labels em todos os campos; mensagens de erro associadas via `aria-describedby`.
- Tabelas com `<th scope>`; DataTable navegável por teclado.
- Modais/Drawers com focus trap e retorno de foco ao fechar.
- Toasts com `role="status"` (não interrompem); confirmações destrutivas em Dialog com `role="alertdialog"`.
- Gráficos com `role="img"` + `aria-label` descritivo e tabela alternativa acessível.
- Chat acessível: regiões `aria-live="polite"` para streaming; mensagens com autoria clara.
- Navegação por headings (h1 por página, h2 por seção).
- Informação nunca só por cor: sinal de valor também por `+/−` e ícone; severidade de insight por ícone + texto.

---

## 10. Data visualization guidelines

- **Linha:** evolução temporal contínua (saldo, fluxo de caixa ao longo dos meses).
- **Barra:** comparação entre categorias discretas ou receita vs despesa por mês.
- **Donut/pie:** composição de um todo (gasto por categoria) — máximo ~6 fatias, resto em "Outros".
- **Evitar gráfico:** quando 1-2 números bastam → use MetricCard.
- **Positivo/negativo:** verde para entradas, vermelho para saídas; nunca depender só da cor (usar sinal).
- **Tendência:** TrendIndicator com seta + % + cor.
- **Dados insuficientes:** estado "preciso de mais dados" em vez de gráfico vazio enganoso.
- **Legendas:** sempre presentes em gráficos multi-série; clicáveis para destacar.
- **Tooltip:** valor formatado + categoria + data; aparece no hover/focus.
- **A11y:** alternativa textual/tabela; cores com contraste suficiente.
- **Muitos dados:** agregar (por mês, por categoria), permitir drill-down.
- **Comparação mês a mês:** barras agrupadas ou linha com duas séries + delta em texto.

---

## 11. AI UX guidelines

- **Indicar IA:** toda resposta tem marcador visual (ícone/borda roxa) e a IA se identifica.
- **Consultando dados:** AIThinkingState mostra "consultando seus dados" e, opcionalmente, ToolCallPreview ("buscando transações de alimentação").
- **Mostrar tool calls:** resumir em linguagem humana o que foi consultado; detalhe expansível para o usuário técnico.
- **Fontes/contexto:** SourceReference ao fim ("baseado em 23 transações de maio").
- **Incerteza:** quando a IA não tem dados suficientes, dizer isso — não chutar.
- **Confirmação antes de mudar:** qualquer ação que altere dados (aplicar categoria em lote) pede confirmação explícita.
- **Tom:** copiloto, não autoridade; sem julgamento ("você gastou demais" → "seu gasto com X foi 17% acima da sua média").
- **Disclaimers financeiros:** projeções e recomendações vêm com aviso de que são estimativas, não aconselhamento profissional.
- **Feedback:** 👍/👎 em cada resposta, alimentando avaliação de qualidade.
- **Alucinação:** números só de tool calls; se a tool não retornou, a IA não inventa.
- **Limitações:** explicar escopo (só finanças do próprio usuário).
- **Sem promessas absolutas:** "você pode economizar até X" em vez de "você vai economizar X".

---

## 12. Design tokens

```ts
export const tokens = {
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
  },
  spacing: {
    page: "1.5rem",
    section: "2rem",
    card: "1rem",
    gapSm: "0.5rem",
    gapMd: "0.75rem",
    gapLg: "1rem",
  },
  fontSize: {
    micro: "11px",
    small: "12px",
    body: "14px",
    h3: "14px",
    h2: "16px",
    h1: "20px",
    metric: "24px",
  },
  fontWeight: { regular: 400, medium: 500 },
  lineHeight: { tight: 1.3, normal: 1.6 },
  shadow: { none: "none", focus: "0 0 0 2px hsl(var(--primary))" }, // sombras só funcionais
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    drawer: 30,
    modal: 40,
    toast: 50,
  },
  breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
  motion: {
    fast: "120ms",
    base: "200ms",
    slow: "320ms",
    ease: "cubic-bezier(0.4,0,0.2,1)",
  },
};
```

---

## 13. shadcn/ui strategy

- **Usar como base:** Button, Input, Select, Dialog, Drawer, Dropdown, Popover, Tooltip, Tabs, Switch, Checkbox, Badge, Toast (Sonner), Skeleton.
- **Customizar fortemente:** tokens de cor/tipografia (theme), Card (radius/borda do FinSight), Table (envolver TanStack Table no DataTable).
- **Organização:**
  - `components/ui/*` — primitivos shadcn (não editar a lógica, só tokens).
  - `components/app/*` — componentes de layout/produto genéricos (AppShell, PageHeader, MetricCard).
  - `features/*/components/*` — componentes de domínio (TransactionRow, AIChat...).
- **Consistência:** todas as cores via CSS variables; sem hex hardcoded.
- **Evitar duplicação:** um único `TransactionAmount`, `CategoryBadge`, `EmptyState` reutilizados.
- **Variantes:** documentadas via `cva` (class-variance-authority).
- **Testar base:** smoke tests dos componentes críticos (Button, Input, Dialog) + visual no Storybook.
- **Tema claro/escuro:** via `next-themes` + variáveis; testar ambos.

---

## 14. Storybook / component documentation

**`Decision Needed`:** Storybook entra no MVP ou na v1.0?

- **Recomendação:** configurar cedo (Fase 0/1) mas crescer incrementalmente. Para portfólio open source, um Storybook publicado é alto valor de sinalização (mostra rigor de design system).
- **Componentes com stories prioritários:** Button, Input, MetricCard, ChartCard, TransactionRow, EmptyState/Loading/Error, InsightCard, AIChatMessage.
- **Estados a documentar:** todas as variantes/estados (hover, focus, disabled, loading, empty, error).
- **Organização:** por camada (Foundation / Layout / Data / Finance / AI / Charts).
- **Uso como doc visual + portfólio:** publicar via Chromatic ou GitHub Pages.

---

## 15. Entregáveis desta fase

1. ✅ Direção visual — seção 1.
2. ✅ Paleta inicial — seção 3.
3. ✅ Tokens iniciais — seção 12.
4. ✅ Tipografia — seção 4.
5. ✅ Layout system — seção 5.
6. ✅ Componentes base — seção 6.
7. ✅ Padrões de tela — seção 7.
8. ✅ Estados de UX — seção 8.
9. ✅ Guidelines de gráficos — seção 10.
10. ✅ Guidelines de IA — seção 11.
11. ✅ Estratégia shadcn — seção 13.
12. **Primeiros componentes a implementar:** theme/tokens → AppShell (Sidebar + Topbar) → PageHeader → Button/Input/Card → MetricCard → EmptyState/Loading/Error → TransactionRow/List → ChartCard. (Ver EPIC-01 no backlog.)
13. **Riscos e decisões em aberto:**
    - `Decision Needed` — Storybook no MVP? (recomendado: sim, incremental)
    - `Decision Needed` — fonte: Geist vs Inter.
    - `Decision Needed` — idioma da UI (PT-BR) vs docs (EN).
    - `Risk` — densidade das telas de dados em mobile; validar cedo com protótipo.
    - `Risk` — consistência de cor de categoria conforme a lista de categorias cresce.
