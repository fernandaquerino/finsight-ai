# FinSight AI — Design System & UI Discovery

> Perspective: Senior Product Designer + Design System Lead.
> Version: 0.1 · Status: living document

> **Note on references:** the visual discovery phase was done collaboratively. There are 8 approved low/medium-fidelity wireframes (Dashboard, AI Chat, Import, Categories, Goals, Debts, Manual entries, Settings, Transactions). This document extracts their patterns and formalizes them into a system — the wireframes are the reference, not the final pixel-perfect layout.

> UI copy below is quoted in Brazilian Portuguese because that is the product's displayed text (the app's UI is in PT-BR).

---

## 1. Design direction

**Visual tone:** sober, trustworthy, "calm". Finances cause anxiety; the interface must reduce it, not amplify it. Neutral light/dark background, white surfaces, thin borders (0.5px), lots of white space. No flashy gradients, heavy shadows or neon.

**Desired feeling:** "this is serious about my money, but it's easy to understand". Premium through restraint, not excess.

**Interface style:** flat, data-first. The data is the hero; the interface chrome recedes.

**Visual density:** medium-high on data screens (transactions, categories) and medium on the dashboard. Density controlled by typographic hierarchy and grouping, not by lines/borders.

**Fintech + AI balance:** fintech brings the sobriety (monospaced numbers, disciplined semantic colors); AI brings its own accent (a single brand color — purple — reserved for everything that is "intelligence": chat, insights, suggestions). This way the user learns: purple = the AI is speaking.

**Avoid generic:** don't use "raw" shadcn. Differentiation comes from (1) a purple brand color used sparingly and with purpose, (2) numbers in a monospaced tabular font, (3) a consistent master-detail pattern, (4) non-judgmental microcopy.

**Premium without losing clarity:** fewer elements, more breathing room; one accent color only; typography with strong hierarchy.

**Convey trust:** data-origin badges (`statement`/`manual`), the AI always citing sources, and privacy transparency visible in Settings.

---

## 2. Reference analysis (synthesis of the wireframes)

Patterns extracted and adopted:

- **Layout:** AppShell with a fixed sidebar (180px) grouped into "Main" / "Analysis", a thin topbar with logo + notifications + avatar. Content with a PageHeader (title + context subtitle, e.g. "May 2026 · 97 entries").
- **Cards:** white surface, 0.5px border, large radius (12px), generous padding. MetricCards use a secondary background (no border) to differentiate from content cards.
- **Charts:** bars for monthly trend (income vs expense side by side), donut for composition by category, horizontal progress bars for categories/goals/debts.
- **Tables/lists:** transactions as a list grouped by date (not a dense paginated table) — more readable for personal use. Master-detail: clicking opens a side panel, no modal.
- **Menus/filters/actions:** filters as rounded chips ("on" state in light purple); inline search with an icon; the primary action always visible in the corner of the PageHeader.
- **Empty states:** clear CTA ("Drop your statement" / "Add entry").
- **Colors:** dominant neutral + purple as brand/AI + green (income/positive) + red (expense/negative/risk) + amber (attention). Categories have their own palette, separate from the semantic colors.
- **Hierarchy:** title 16px/500, subtitle 12px secondary, highlighted values 18-26px.
- **Spacing:** vertical rhythm in rem (1/1.5/2rem), inner gaps in px (8/12/16).
- **Density:** comfortable; each transaction row has a ~34px icon + two lines of text.
- **Overall feel:** clean, trustworthy, no noise.

**What NOT to bring in:** gradients, strong shadows, excess category colors competing with the semantic ones, dense "spreadsheet"-style tables as primary navigation.

---

## 3. Initial visual identity

Palette (tokens in Tailwind/shadcn format, HSL to make dark mode easier):

```ts
const colors = {
  background: "...", // neutral page bg
  foreground: "...", // primary text
  primary: "...", // brand / AI purple
  secondary: "...", // secondary surfaces
  muted: "...", // discreet text/background
  border: "...", // 0.5px borders
  success: "...", // income / positive
  warning: "...", // attention
  danger: "...", // expense / risk
  info: "...", // informational
};
```

Proposed values (CSS variables, light / dark):

| Token                   | Light         | Dark          | Use                        |
| ----------------------- | ------------- | ------------- | -------------------------- |
| `--background`          | `0 0% 99%`    | `240 6% 8%`   | page background            |
| `--foreground`          | `240 10% 12%` | `0 0% 96%`    | primary text               |
| `--card`                | `0 0% 100%`   | `240 5% 11%`  | card surface               |
| `--muted`               | `240 5% 96%`  | `240 4% 16%`  | secondary surface          |
| `--muted-foreground`    | `240 4% 46%`  | `240 5% 65%`  | secondary text             |
| `--border`              | `240 6% 90%`  | `240 4% 20%`  | borders                    |
| `--primary` (purple/AI) | `248 53% 50%` | `248 60% 68%` | brand, AI, primary actions |
| `--success` (income)    | `162 70% 33%` | `162 55% 52%` | positive values            |
| `--danger` (expense)    | `0 72% 48%`   | `0 70% 62%`   | negative values, risk      |
| `--warning`             | `33 90% 45%`  | `38 90% 60%`  | attention, "above average" |
| `--info`                | `212 80% 45%` | `212 75% 62%` | informational              |

**States:** hover = `muted` surface; focus = a 2px ring in the `primary` color with offset; disabled = 50% opacity + not-allowed cursor.

**Chart colors** (categorical sequence, distinct from the semantic ones):

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

**Financial category colors** (stable map — the same category always in the same color):

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

> Rule: income/expenses ALWAYS use semantic green/red; category colors are for composition (donut, category bars) and never to indicate positive/negative.

---

## 4. Typography

- **Primary font:** Geist Sans (or Inter as a fallback). Clean, great for data, free.
- **Number font:** Geist Mono (or a tabular variant of the primary) with `font-variant-numeric: tabular-nums` to align values in columns.
- **Hierarchy:**
  - h1 / page title: 20px / 500
  - h2 / section: 16px / 500
  - h3 / card title: 14px / 500
  - body: 14px / 400, line-height 1.6
  - small / meta: 12px / 400 (secondary text)
  - micro / uppercase labels: 11px / 500, letter-spacing 0.06em
  - large values (metrics): 18–26px / 500, tabular-nums
- **Weights:** only 400 and 500. Avoid 600/700 (unnecessary visual weight).
- **Line-height:** 1.6 for prose, 1.3 for titles.
- **Letter-spacing:** only on uppercase labels.
- **Anti-clutter rule:** at most two weights and three sizes per screen; never uppercase in content (only in section labels).

---

## 5. Layout system

- **Grid:** dashboard in 12 columns; cards use `repeat(auto-fit, minmax(...))`.
- **Container:** max-width ~1200px on content, sidebar outside the container.
- **Sidebar:** fixed 180px on desktop; "Main" and "Analysis" groups.
- **Topbar:** ~48px, logo on the left, actions on the right.
- **PageHeader:** title + context subtitle + primary action on the right; a pattern on all screens.
- **Cards:** radius 12px, border 0.5px, padding 1rem 1.25rem.
- **Responsiveness / breakpoints:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- **Mobile:** sidebar → bottom-nav (4-5 main items) + drawer for the rest; tables → lists; collapsible filters; the detail panel becomes full screen (push) instead of a side panel.
- **Desktop:** master-detail (list + 230px side panel).
- **Density:** airy dashboard; denser data screens.
- **Table width / overflow:** `table-layout: fixed` on narrow screens; horizontal scroll on the wrapper when unavoidable.
- **Screens with many filters:** a filter bar that collapses into a "Filters" button on mobile.

---

## 6. Design system base components

> Convention: `generic` lives in `components/ui` (shadcn base), `product` lives in `features/*/components` or `components/app`.

### Foundation (shadcn as a base)

Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Badge, Tooltip, Popover, Dialog, Drawer, Tabs, Toast.

- Typical variants (Button): `primary | secondary | ghost | destructive`, sizes `sm | md`.
- States: default, hover, focus-visible, disabled, loading.
- A11y: focus trap in Dialog/Drawer; labels on all inputs; `aria-label` on IconButton.

### Layout (product)

AppShell, Sidebar, Topbar, PageHeader, SectionHeader, Card, MetricCard, ChartCard, EmptyState, LoadingState, ErrorState.

### Data display

Table, DataTable (TanStack Table), DataFilterBar, Pagination, DateRangePicker, CategoryBadge, TransactionAmount (formats + colors by sign), StatusBadge, TrendIndicator (▲▼ with color).

### Finance-specific

TransactionList, TransactionRow, TransactionForm, CategorySelector, AccountSelector, ImportPreviewTable, ImportStatusCard, GoalProgressCard, InsightCard, BudgetRiskCard, DebtCard, DebtStrategyPanel.

### AI-specific

AIChat, AIChatMessage, AIInput, AISuggestionPrompt, AIInsightCard, AIThinkingState, AIResponseFeedback, SourceReference, ToolCallPreview.

### Charts

SpendingByCategoryChart (donut), MonthlyTrendChart (line), IncomeVsExpenseChart (bars), CashflowChart, GoalProgressChart, RecurringExpensesChart.

For each component, document (in Storybook or in MDX): purpose, variants, states, main props, a11y rules, usage example, base (shadcn or not), generic vs product.

---

## 7. Screen patterns

(Summary; the 8 reference screens already materialize these patterns.)

- **Dashboard:** PageHeader → grid of MetricCards (3-4) → trend ChartCard → top categories → latest transactions → insights/alerts. Empty: import/add CTA. Partial: "connect more accounts for better insights" banner.
- **Transactions:** PageHeader with a period selector + export → period MetricCards → DataFilterBar (search + chips) → list grouped by date → detail panel (master-detail) with history and an AI insight → pagination.
- **CSV/PDF import:** dropzone → file list with progress → (CSV) column mapping → ImportPreviewTable with per-row validation → duplicate resolution → confirmation → ImportStatusCard with a pipeline (parse → categorization → embeddings → indexed).
- **AI chat:** two-column layout (conversation + insights/suggestions sidebar); user/assistant messages; AIThinkingState during tool calls; SourceReference at the end of responses; AIResponseFeedback.
- **Insights:** list of InsightCards with severity (color), reason, recommended action, apply/ignore/useful buttons; filters by type/severity.
- **Reports:** period filters → summary cards → charts → table → AI summary → export.
- **Goals:** list of GoalProgressCards with a progress bar, deadline, and a contextual AI insight ("at the current pace you'll get there in October").
- **Debts:** MetricCards (total, installments/month, interest) → DebtCards ordered by strategy → AI DebtStrategyPanel (avalanche/snowball) with estimated savings.
- **Settings:** sections in cards (Profile, Connected accounts, Notifications with switches, AI & data with a model choice + "data for training: Never" + export/delete).

---

## 8. UX states

> The "Message" column shows the product's displayed copy, in Brazilian Portuguese.

| State                               | Message                                                          | Primary action    | Secondary action | Component        | Tone             |
| ----------------------------------- | ---------------------------------------------------------------- | ----------------- | ---------------- | ---------------- | ---------------- |
| Empty (no data)                     | "Vamos começar? Importe um extrato ou lance um gasto."           | Import statement  | Add manual       | EmptyState       | Inviting         |
| First experience                    | A guided 3-step onboarding                                       | Next              | —                | Onboarding       | Welcoming        |
| Loading                             | Skeletons in the shape of the content                            | —                 | —                | LoadingState     | Neutral          |
| Error                               | "Não consegui carregar isso agora."                              | Try again         | —                | ErrorState       | Calm, no blame   |
| Success                             | Toast "Transação salva"                                          | —                 | Undo             | Toast            | Light            |
| Partial data                        | Banner "Conecte mais contas para insights completos"            | Connect           | Dismiss          | Card             | Informational    |
| Import in progress                  | Pipeline with steps                                              | —                 | Cancel           | ImportStatusCard | Transparent      |
| Import failed                       | "3 linhas tiveram problema."                                     | Review rows       | Import the rest  | ImportStatusCard | Constructive     |
| Import completed                    | "97 transações importadas."                                      | See transactions  | —                | ImportStatusCard | Positive         |
| AI loading                          | "Consultando seus dados..."                                      | —                 | —                | AIThinkingState  | Transparent      |
| AI failed                           | "Não consegui responder agora. Seus dados continuam acessíveis." | Try again         | —                | AIChatMessage    | Calm             |
| No transactions                     | same as Empty                                                    | —                 | —                | EmptyState       | —                |
| No insights yet                     | "Ainda não há insights — preciso de mais dados."                 | Import more       | —                | EmptyState       | Honest           |
| Integration disconnected (`Future`) | "Conexão com o banco expirou."                                   | Reauthorize       | —                | Card             | Neutral          |
| Rate limit                          | "Você atingiu o limite de perguntas por agora."                  | See when it resets| —                | Toast/Card       | No blame         |
| Permission denied                   | "Você não tem acesso a isso."                                    | Back              | —                | ErrorState       | Neutral          |
| Offline/degraded                    | "Você está offline. Mostrando dados em cache."                   | —                 | —                | Banner           | Informational    |

---

## 9. Accessibility

- WCAG 2.1 AA; minimum contrast 4.5:1 (text), 3:1 (components/charts).
- Full keyboard navigation; visible focus (2px ring); logical tab order.
- Labels on all fields; error messages associated via `aria-describedby`.
- Tables with `<th scope>`; DataTable navigable by keyboard.
- Modals/Drawers with focus trap and focus return on close.
- Toasts with `role="status"` (non-interrupting); destructive confirmations in a Dialog with `role="alertdialog"`.
- Charts with `role="img"` + a descriptive `aria-label` and an accessible alternative table.
- Accessible chat: `aria-live="polite"` regions for streaming; messages with clear authorship.
- Navigation by headings (h1 per page, h2 per section).
- Information never by color alone: the value sign also by `+/−` and an icon; insight severity by icon + text.

---

## 10. Data visualization guidelines

- **Line:** continuous time trend (balance, cash flow across months).
- **Bar:** comparison between discrete categories or income vs expense per month.
- **Donut/pie:** composition of a whole (spending by category) — at most ~6 slices, the rest in "Others".
- **Avoid a chart:** when 1-2 numbers are enough → use a MetricCard.
- **Positive/negative:** green for inflows, red for outflows; never rely on color alone (use the sign).
- **Trend:** TrendIndicator with an arrow + % + color.
- **Insufficient data:** a "need more data" state instead of a misleading empty chart.
- **Legends:** always present in multi-series charts; clickable to highlight.
- **Tooltip:** formatted value + category + date; appears on hover/focus.
- **A11y:** textual/table alternative; colors with sufficient contrast.
- **Lots of data:** aggregate (by month, by category), allow drill-down.
- **Month-over-month comparison:** grouped bars or a line with two series + a delta in text.

---

## 11. AI UX guidelines

- **Indicate AI:** every response has a visual marker (icon/purple border) and the AI identifies itself.
- **Querying data:** AIThinkingState shows "querying your data" and, optionally, a ToolCallPreview ("fetching food transactions").
- **Show tool calls:** summarize in human language what was queried; an expandable detail for the technical user.
- **Sources/context:** SourceReference at the end ("based on 23 transactions from May").
- **Uncertainty:** when the AI doesn't have enough data, say so — don't guess.
- **Confirmation before changing:** any action that changes data (apply a category in batch) asks for explicit confirmation.
- **Tone:** copilot, not authority; no judgment ("you spent too much" → "your spending on X was 17% above your average").
- **Financial disclaimers:** projections and recommendations come with a notice that they are estimates, not professional advice.
- **Feedback:** 👍/👎 on each response, feeding a quality evaluation.
- **Hallucination:** numbers only from tool calls; if the tool returned nothing, the AI doesn't make it up.
- **Limitations:** explain the scope (only the user's own finances).
- **No absolute promises:** "you could save up to X" instead of "you will save X".

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
  shadow: { none: "none", focus: "0 0 0 2px hsl(var(--primary))" }, // shadows only functional
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

- **Use as a base:** Button, Input, Select, Dialog, Drawer, Dropdown, Popover, Tooltip, Tabs, Switch, Checkbox, Badge, Toast (Sonner), Skeleton.
- **Customize heavily:** color/typography tokens (theme), Card (FinSight radius/border), Table (wrap TanStack Table in DataTable).
- **Organization:**
  - `components/ui/*` — shadcn primitives (don't edit the logic, only tokens).
  - `components/app/*` — generic layout/product components (AppShell, PageHeader, MetricCard).
  - `features/*/components/*` — domain components (TransactionRow, AIChat...).
- **Consistency:** all colors via CSS variables; no hardcoded hex.
- **Avoid duplication:** a single `TransactionAmount`, `CategoryBadge`, `EmptyState` reused.
- **Variants:** documented via `cva` (class-variance-authority).
- **Test the base:** smoke tests of the critical components (Button, Input, Dialog) + visual in Storybook.
- **Light/dark theme:** via `next-themes` + variables; test both.

---

## 14. Storybook / component documentation

**`Decision Needed`:** does Storybook come in the MVP or in v1.0?

- **Recommendation:** set it up early (Phase 0/1) but grow it incrementally. For an open source portfolio, a published Storybook is high signaling value (shows design-system rigor).
- **Components with priority stories:** Button, Input, MetricCard, ChartCard, TransactionRow, EmptyState/Loading/Error, InsightCard, AIChatMessage.
- **States to document:** all variants/states (hover, focus, disabled, loading, empty, error).
- **Organization:** by layer (Foundation / Layout / Data / Finance / AI / Charts).
- **Use as visual doc + portfolio:** publish via Chromatic or GitHub Pages.

---

## 15. Deliverables of this phase

1. ✅ Visual direction — section 1.
2. ✅ Initial palette — section 3.
3. ✅ Initial tokens — section 12.
4. ✅ Typography — section 4.
5. ✅ Layout system — section 5.
6. ✅ Base components — section 6.
7. ✅ Screen patterns — section 7.
8. ✅ UX states — section 8.
9. ✅ Chart guidelines — section 10.
10. ✅ AI guidelines — section 11.
11. ✅ shadcn strategy — section 13.
12. **First components to implement:** theme/tokens → AppShell (Sidebar + Topbar) → PageHeader → Button/Input/Card → MetricCard → EmptyState/Loading/Error → TransactionRow/List → ChartCard. (See EPIC-01 in the backlog.)
13. **Open risks and decisions:**
    - `Decision Needed` — Storybook in the MVP? (recommended: yes, incremental)
    - `Decision Needed` — font: Geist vs Inter.
    - `Decision Needed` — UI language (PT-BR) vs docs (EN).
    - `Risk` — data-screen density on mobile; validate early with a prototype.
    - `Risk` — category color consistency as the category list grows.
