# INJECTED_BUGS.md

50 bugs deliberados, pequenos (1–11 linhas cada) e independentes, injetados na branch `bug-insert-intentional-bugs` para tasks de debugging de coding agents.

> **Não corrija nada neste repositório antes de gerar os snapshots do benchmark.** Este arquivo descreve comportamento e reprodução, não o patch.

## Top 15 bugs (do melhor para o pior)

Critérios: multi-step, estado React, histórico/navegação, filtros, async/race, múltiplos componentes, teclado/foco, evidência visual, chance de correção superficial.

1. Bug 01 — Filtros criam histórico mas Voltar/Avançar não reaplica — divergência URL × UI, multi-step, browser history e correção superficial tentadora (mascarar o sintoma sem sincronizar).
2. Bug 05 — Painel de detalhe herda estado da transação anterior — form de edição/confirmação de exclusão vaza entre itens e grava/exclui o item errado.
3. Bug 28 — Seletor de mês desincronizado da URL no Back/Forward — client state × URL × server render no mesmo dashboard.
4. Bug 31 — Seletor de mês reabre com o ano obsoleto — estado não resetado ao fechar/reabrir popover; só aparece na 2ª abertura.
5. Bug 10 — Recategorizar recarrega a lista antes de o PATCH terminar — race dependente de timing; a correção "com setTimeout" passa em rede rápida.
6. Bug 16 — Conta do lançamento manual reseta após salvar — 1º save funciona, o 2º grava na conta errada silenciosamente.
7. Bug 07 — "Receitas" mantém a categoria de despesa oculta — filtros combinados + chips derivados dos itens filtrados = lista vazia sem saída óbvia.
8. Bug 24 — Sidebar colapsada vaza para o drawer mobile — estado compartilhado entre AppShell/Sidebar/MobileSidebar + resize.
9. Bug 34 — Categoria obsoleta ao alternar Despesa↔Receita — o `<select>` mostra um valor e o form envia outro.
10. Bug 18 — Formulário de edição reabre com dados em cache antigos — stale cache do React Query visível só via Back do navegador.
11. Bug 08 — Chips Extrato/Manual assimétricos — trocar de origem limpa o filtro e o chip ativo não desliga.
12. Bug 26 — Notificações voltam a "não lidas" ao reabrir o popover — estado resetado na reabertura; badge, sino e lista inconsistentes.
13. Bug 03 — Erro HTTP vira "Nenhuma transação cadastrada" — loading/error/empty/success inconsistentes (cabeçalho fica em "Carregando").
14. Bug 44 — Sugestões de conta ficam bloqueadas após remover a conta — estado armazenado em vez de derivado; reseta ao trocar de passo.
15. Bug 47 — Edição preseleciona a 1ª conta em vez da conta da transação — valor de formulário incorreto que só corrompe dado no "Salvar".

## Como usar

- **Pré-requisitos por tag** (aparecem em `Área`):
  - `[DB]` Postgres com usuário onboarded, ≥2 contas, categorias de despesa/receita e transações (`npm run db:up && npm run db:migrate && npm run db:seed`).
  - `[Redis]` Redis ativo (`npm run db:up`); sem Redis o cache falha em silêncio e os bugs 38/39 não se manifestam.
  - `[Viewport]` responsividade — use DevTools (larguras indicadas).
  - `[Storybook]` `npm run storybook` (componentes de design system sem tela no app).
- **Reverter um bug:** `git apply -R -C1 injected-bugs/patches/BUG-XX.patch` (cada patch é independente; `-C1` é necessário só quando dois bugs tocam linhas vizinhas do mesmo arquivo, como 20/44). Aplicar os 50 em ordem sobre `HEAD` reproduz exatamente a árvore atual.
  **Remova `injected-bugs/` do snapshot entregue ao agente — os patches são a solução.**

## Estado do projeto após a injeção

| Verificação | Antes | Depois |
| --- | --- | --- |
| `npx tsc --noEmit` | ok | ok |
| `npx eslint src e2e` | ok | ok (0 erros) |
| `npx vitest run` | 434 passed / 9 skipped | 434 passed / 9 skipped — **nenhum teste existente detecta os bugs** |
| `next build` | — | ok |
| `next dev` | — | sobe; `/login` 200, `/` redireciona para `/login`. `/api/health` = 503 porque Postgres/Redis (Docker) não estavam rodando |

**Limitações honestas:** sem Docker/DB não consegui rodar fluxos E2E com dados. Os comportamentos dos bugs **01, 05, 07, 08, 13, 14, 19, 20, 21, 22, 25, 26, 28, 29, 30, 31, 32, 44 e 50** foram confirmados com testes Testing Library/unitários descartáveis (já removidos). Os demais foram validados por leitura de código; os que dependem de DB/Redis estão marcados.

**Funcionalidades pedidas que não existem no projeto** (não foram criadas, conforme instrução): paginação, busca com debounce, multi-select/indeterminate, drag-and-drop/reorder, optimistic update. Os bugs de estado/async/histórico foram concentrados nos fluxos que existem.

**Comportamentos pré-existentes (NÃO injetados) que podem confundir a avaliação:** chips de categoria derivados dos itens já filtrados; `selectedId` persiste quando um filtro esconde a transação (painel "reaparece"); "Todas" fica ativo mesmo com filtro de origem; `onChanged` faz refetch sem `AbortSignal`; `CommandSearch` navega com `?q=` mas `/transacoes` lê `search`; `parseMoney`/`parseBalance` removem todos os pontos ("12.50" → 1250); `Avatar` nunca reseta `imgError`; `ThemeToggle` (ícone) usa o tema salvo e não o resolvido; ao filtrar, a tela inteira vira skeleton (barra de filtros desmonta e o foco se perde); `BarChartCard` fixa "· 2026"; edição por `?id=` não re-prefilla ao trocar de id.

---

## BUG-01 — Filtros de transações: URL e UI divergem no Voltar/Avançar

Benchmark Potential: EXCELLENT
Área: Transações / TransactionsScreen `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionsScreen/TransactionsScreen.tsx

Resumo do bug:
Cada mudança de filtro passa a criar uma entrada no histórico do navegador, mas a tela não reage quando o usuário navega no histórico; URL e UI ficam em estados diferentes.

Passos para reproduzir:
1. Abrir `/transacoes` sem query.
2. Clicar no chip "Despesas" (URL `?kind=expense`).
3. Clicar no chip "Receitas" (URL `?kind=income`).
4. Clicar no botão Voltar do navegador.

Comportamento com bug:
A URL volta para `?kind=expense`, mas o chip "Receitas" continua ativo e a lista/contador continuam de receitas; nenhuma requisição nova é feita. Voltar mais uma vez vai para `/transacoes` e a tela segue mostrando receitas.

Comportamento correto esperado:
Após Voltar/Avançar, chips, lista, contador e URL refletem o mesmo filtro.

Before screenshot:
Barra de endereço com `/transacoes?kind=expense`, chip "Receitas" destacado, todas as linhas da lista são receitas e o texto "Mostrando N de M" corresponde às receitas.

After screenshot esperado após correção:
Com a mesma URL `?kind=expense`, o chip "Despesas" fica destacado e a lista mostra só despesas com o contador correspondente.

Edge case de desempate:
Voltar até `/transacoes` (sem query): "Todas" ativo e lista completa; depois Avançar duas vezes até `?kind=income`; recarregar a página em qualquer ponto deve manter o que a tela mostrava.

Por que é difícil:
O sintoma só aparece ao navegar no histórico e há mais de um jeito de "consertar" (sincronizar com o histórico ou mudar a política de history), com trade-offs diferentes. Uma correção que apenas esconde o sintoma quebra deep-link ou gera loop de navegação.

Complexidade provável da correção: MEDIUM

---

## BUG-02 — Filtro de origem não é restaurado a partir da URL

Benchmark Potential: GOOD
Área: Transações / TransactionsScreen `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionsScreen/TransactionsScreen.tsx

Resumo do bug:
Ao carregar `/transacoes?origin=import` (reload ou link compartilhado), o filtro de origem é ignorado embora continue na URL.

Passos para reproduzir:
1. Abrir `/transacoes` e clicar em "Extrato" (URL `?origin=import`).
2. Recarregar a página (F5).
3. Observar chips e lista.
4. Clicar em qualquer chip de categoria.

Comportamento com bug:
Após o reload o chip "Extrato" está inativo e a lista mostra todas as origens, mas a barra de endereço ainda tem `origin=import`. Ao clicar em outro filtro, `origin` some da URL.

Comportamento correto esperado:
A tela restaura todos os filtros presentes na URL, inclusive `origin`.

Before screenshot:
URL com `?origin=import`, chip "Extrato" sem destaque, lista contendo transações manuais com o badge "Manual".

After screenshot esperado após correção:
Chip "Extrato" destacado e apenas transações importadas na lista.

Edge case de desempate:
Abrir `?kind=expense&origin=manual&categoryId=<uuid>`: todos os três filtros devem ser aplicados; `?origin=valor-invalido` não deve quebrar a tela.

Por que é difícil:
O filtro "funciona" quando clicado; só falha no carregamento. É uma omissão de uma linha em um mapeamento de várias chaves.

Complexidade provável da correção: EASY

---

## BUG-03 — Erro HTTP da listagem vira "Nenhuma transação cadastrada"

Benchmark Potential: GOOD
Área: Transações / TransactionsScreen `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionsScreen/TransactionsScreen.tsx

Resumo do bug:
Respostas de erro da API não são tratadas como erro; a tela cai no estado "vazio" com CTA de cadastro e o cabeçalho fica em "Carregando".

Passos para reproduzir:
1. Interceptar `GET /api/transactions` para responder 500 com corpo `{"error":{"code":"INTERNAL_ERROR","message":"x"}}` (DevTools → Local Overrides, ou Playwright `page.route`). Não pare o Postgres: o layout autenticado também depende do banco.
2. Abrir `/transacoes`.
3. Observar o corpo da página e o texto ao lado dos cards de resumo.

Comportamento com bug:
Aparece "Nenhuma transação cadastrada" com o botão "Lançamento manual", cards zerados e o texto "Carregando" permanece ao lado dos cards. Nenhum ErrorState nem botão "Tentar novamente".

Comportamento correto esperado:
ErrorState "Não foi possível carregar as transações" com botão "Tentar novamente"; retry recarrega quando a API volta.

Before screenshot:
EmptyState com ícone de recibo, título "Nenhuma transação cadastrada" e botão primário "Lançamento manual"; ao lado dos cards, o texto "Carregando".

After screenshot esperado após correção:
Bloco de erro com ícone de alerta, título "Não foi possível carregar as transações" e botão "Tentar novamente".

Edge case de desempate:
Abrir `/transacoes?kind=foo` (API responde 422) deve mostrar erro, não vazio; após restaurar a API, "Tentar novamente" deve recarregar a lista.

Por que é difícil:
A tela "funciona" sem exceção, então o defeito só aparece em falhas. Checar apenas `data` indefinido corrige o 500 mas mascara a diferença entre 4xx/5xx.

Complexidade provável da correção: EASY

---

## BUG-04 — Estado vazio ignora filtros de origem/conta/período

Benchmark Potential: GOOD
Área: Transações / TransactionsScreen `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionsScreen/TransactionsScreen.tsx

Resumo do bug:
Quando um filtro sem resultados é de origem, conta ou datas, a tela mostra a mensagem de "sem transações cadastradas" em vez de "nenhum resultado para os filtros".

Passos para reproduzir:
1. Usar um usuário sem transações importadas (só manuais).
2. Abrir `/transacoes` e clicar em "Extrato".

Comportamento com bug:
Título "Nenhuma transação cadastrada", texto "Adicione sua primeira movimentação…" e botão "Lançamento manual", como se a conta estivesse vazia.

Comportamento correto esperado:
"Nenhum resultado encontrado" / "Remova filtros ou tente uma busca diferente", sem CTA de cadastro.

Before screenshot:
Chip "Extrato" ativo, EmptyState com título "Nenhuma transação cadastrada" e botão "Lançamento manual".

After screenshot esperado após correção:
EmptyState com título "Nenhum resultado encontrado" e sem botão de cadastro.

Edge case de desempate:
Abrir `/transacoes?from=2026-01-01&to=2026-01-02` (sem dados) e `?kind=expense` sem despesas: o segundo já mostra o texto certo, o primeiro não.

Por que é difícil:
Depende do tipo de filtro aplicado; corrigir só o caso testado (origem) deixa datas/conta de fora.

Complexidade provável da correção: EASY

---

## BUG-05 — Painel de detalhe herda o estado da transação anterior

Benchmark Potential: EXCELLENT
Área: Transações / TransactionsScreen + TransactionDetailPanel `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionsScreen/TransactionsScreen.tsx
- src/features/transactions/components/TransactionDetailPanel/TransactionDetailPanel.tsx

Resumo do bug:
Ao selecionar outra transação com o painel aberto, o painel não reinicia: modo de edição, valores do formulário e confirmação de exclusão da transação anterior permanecem.

Passos para reproduzir:
1. Abrir `/transacoes` (largura ≥1280px) com ≥2 transações.
2. Clicar na linha A e em "Editar" (formulário com os dados de A).
3. Sem fechar o painel, clicar na linha B.
4. Alterar qualquer campo e clicar em "Salvar alterações".

Comportamento com bug:
O painel continua em "Editar transação" com a descrição/valor/data de A enquanto B está destacada; ao salvar, B é sobrescrita com os dados de A. Variante: clicar "Excluir" em A (confirmação) e depois clicar em B mantém o prompt "Excluir esta transação?" — confirmar exclui B.

Comportamento correto esperado:
Selecionar outra transação mostra o painel dela em modo de visualização, sem confirmação pendente nem valores da anterior.

Before screenshot:
Painel com título "Editar transação" e campo Descrição igual ao da linha A, enquanto a linha B tem o marcador de seleção.

After screenshot esperado após correção:
Painel com título "Detalhe da transação" mostrando descrição, valor e conta de B.

Edge case de desempate:
Abrir "Recategorizar" em A e clicar em B: o select inline não deve permanecer aberto; repetir com a confirmação de exclusão pendente.

Por que é difícil:
O sintoma só aparece na segunda seleção e há vários estados locais vazando (modo, form, confirmação, recategorização); resetar só um deixa os outros.

Complexidade provável da correção: MEDIUM

---

## BUG-06 — Painel fixo cobre a lista entre 1024px e 1279px

Benchmark Potential: MEDIUM
Área: Transações / TransactionsScreen `[Viewport]` `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionsScreen/TransactionsScreen.tsx

Resumo do bug:
A reserva de espaço para o painel de detalhe começa em um breakpoint maior que o do painel fixo; numa faixa de larguras o painel cobre a coluna direita da lista.

Passos para reproduzir:
1. Viewport de 1100px de largura.
2. Abrir `/transacoes` e clicar em uma transação.

Comportamento com bug:
O painel de 380px aparece sobre a lista; valores e datas das linhas ficam escondidos atrás dele e não podem ser clicados.

Comportamento correto esperado:
A lista reserva a coluna do painel e permanece totalmente visível/clicável.

Before screenshot:
Largura 1100px: painel à direita sobrepondo a coluna de valores/datas; lista ocupa toda a largura.

After screenshot esperado após correção:
Mesma largura: lista com margem direita e painel sem sobreposição.

Edge case de desempate:
Testar em 1023px (painel tela cheia), 1024px e 1280px: comportamento consistente em todas as larguras.

Por que é difícil:
Só aparece em uma faixa de viewport e não é detectável em jsdom.

Complexidade provável da correção: EASY

---

## BUG-07 — "Receitas" mantém a categoria de despesa oculta

Benchmark Potential: GOOD
Área: Transações / DataFilterBar `[DB]`
Arquivos modificados:
- src/features/transactions/components/DataFilterBar/DataFilterBar.tsx

Resumo do bug:
Ao trocar para "Receitas" com um chip de categoria ativo, o filtro de categoria continua aplicado (e some da barra), resultando em lista vazia.

Passos para reproduzir:
1. Abrir `/transacoes`.
2. Clicar em um chip de categoria de despesa (ex.: "Alimentação").
3. Clicar em "Receitas".

Comportamento com bug:
"Nenhum resultado encontrado", embora existam receitas; o chip da categoria desaparece (chips vêm dos itens exibidos) e a URL mantém `categoryId`. "Despesas" no mesmo cenário funciona.

Comportamento correto esperado:
"Receitas" limpa a categoria e lista todas as receitas.

Before screenshot:
Chip "Receitas" ativo, EmptyState "Nenhum resultado encontrado", URL com `kind=income&categoryId=…`.

After screenshot esperado após correção:
Lista de receitas (ex.: Salário) e URL apenas com `kind=income`.

Edge case de desempate:
Repetir com categoria de receita ativa + "Despesas" (deve limpar) e confirmar que o toggle de categoria continua preservando o `kind`.

Por que é difícil:
Um chip funciona e o irmão não; testes felizes passam. A correção precisa manter o comportamento de toggle das categorias.

Complexidade provável da correção: EASY

---

## BUG-08 — Chips "Extrato"/"Manual" não alternam corretamente

Benchmark Potential: GOOD
Área: Transações / DataFilterBar `[DB]`
Arquivos modificados:
- src/features/transactions/components/DataFilterBar/DataFilterBar.tsx

Resumo do bug:
O chip "Extrato" só liga/desliga corretamente quando não há outro filtro de origem; trocar de "Manual" para "Extrato" limpa a origem e "Extrato" ativo não desliga.

Passos para reproduzir:
1. Abrir `/transacoes` e clicar em "Manual".
2. Clicar em "Extrato".
3. Clicar em "Extrato" de novo (após ativá-lo a partir do estado sem filtro).

Comportamento com bug:
Passo 2 remove o filtro de origem (lista com todas as origens) em vez de filtrar por Extrato. Com Extrato ativo, novo clique mantém Extrato ativo.

Comportamento correto esperado:
Passo 2 filtra por Extrato; passo 3 desativa o filtro.

Before screenshot:
Após o passo 2: nenhum chip de origem destacado e lista com origens mistas.

After screenshot esperado após correção:
Chip "Extrato" destacado e só transações importadas.

Edge case de desempate:
Sequência Extrato → Manual → Manual → Extrato: estados esperados import, manual, nenhum, import.

Por que é difícil:
O teste do fluxo simples (um clique por chip) passa; falha só na troca entre chips e no segundo clique.

Complexidade provável da correção: EASY

---

## BUG-09 — Barra de chips não rola em telas estreitas

Benchmark Potential: MEDIUM
Área: Transações / DataFilterBar `[Viewport]` `[DB]`
Arquivos modificados:
- src/features/transactions/components/DataFilterBar/DataFilterBar.tsx

Resumo do bug:
Na linha principal de chips, o conteúdo excede a largura e não tem rolagem própria; o excesso vaza para o container da página.

Passos para reproduzir:
1. Viewport de 375px.
2. Abrir `/transacoes` com ≥4 categorias nos resultados.
3. Tentar alcançar os últimos chips de categoria.

Comportamento com bug:
A página inteira ganha rolagem horizontal (ou chips ficam cortados) em vez de só a barra de chips rolar.

Comportamento correto esperado:
A barra de chips rola horizontalmente sozinha; a página não tem scroll horizontal.

Before screenshot:
Largura 375px: cabeçalho e cards deslocados pela rolagem horizontal da página; chips de categoria cortados na borda.

After screenshot esperado após correção:
Página fixa na largura; somente a faixa de chips rola.

Edge case de desempate:
Com o painel de detalhe aberto em 375px (tela cheia) e ao voltar, a rolagem horizontal da barra deve continuar independente.

Por que é difícil:
Depende de viewport e conteúdo; efeito colateral em container pai.

Complexidade provável da correção: EASY

---

## BUG-10 — Recategorizar recarrega a lista antes de o PATCH terminar

Benchmark Potential: EXCELLENT
Área: Transações / TransactionDetailPanel `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionDetailPanel/TransactionDetailPanel.tsx

Resumo do bug:
O refresh da lista é disparado junto com a mutação, e não depois dela; a lista pode voltar com a categoria antiga mesmo com o toast de sucesso.

Passos para reproduzir:
1. DevTools → Network → atrasar/`Slow 3G` as requisições `PATCH /api/transactions/:id`.
2. Abrir `/transacoes`, selecionar uma transação.
3. "Recategorizar" e escolher outra categoria.
4. Esperar o toast "Categoria atualizada".

Comportamento com bug:
O toast aparece, mas painel e linha continuam com a categoria antiga (a listagem foi buscada antes da atualização). Só muda após outra ação que recarregue.

Comportamento correto esperado:
Após o sucesso, painel e linha exibem a nova categoria.

Before screenshot:
Toast "Categoria atualizada" visível, linha e painel ainda com a categoria anterior (ex.: "Alimentação").

After screenshot esperado após correção:
Toast visível e linha/painel com a nova categoria (ex.: "Transporte").

Edge case de desempate:
Com PATCH falhando (offline/500) não deve haver toast de sucesso e a UI deve permanecer consistente; com rede rápida o comportamento correto deve valer também.

Por que é difícil:
É uma race intermitente: em rede local rápida o bug quase não aparece, e adicionar um `setTimeout` "resolve" o teste feliz sem resolver a ordem.

Complexidade provável da correção: MEDIUM

---

## BUG-11 — Painel de detalhe não rola em telas baixas

Benchmark Potential: GOOD
Área: Transações / TransactionDetailPanel `[Viewport]` `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionDetailPanel/TransactionDetailPanel.tsx

Resumo do bug:
O painel (tela cheia no mobile, coluna fixa no desktop) deixou de ter rolagem vertical; conteúdo mais alto que a viewport fica inalcançável.

Passos para reproduzir:
1. Viewport 375×568 (ou janela desktop com ~600px de altura).
2. Abrir `/transacoes`, selecionar uma transação e clicar em "Editar".
3. Tentar chegar em "Salvar alterações".

Comportamento com bug:
Os botões "Salvar alterações"/"Cancelar" (e o "Excluir" na visualização) ficam abaixo da dobra e o painel não rola.

Comportamento correto esperado:
Painel com rolagem vertical própria; todos os botões alcançáveis.

Before screenshot:
Formulário de edição cortado no campo "Data"; botões de ação não visíveis e sem barra de rolagem.

After screenshot esperado após correção:
Painel rolável com botões "Salvar alterações" e "Cancelar" alcançáveis ao final.

Edge case de desempate:
Repetir em desktop com altura curta e na visualização com a confirmação de exclusão aberta.

Por que é difícil:
Só aparece em viewports baixas e não em testes de DOM.

Complexidade provável da correção: EASY

---

## BUG-12 — Ordem das transações do mesmo dia muda após atualizar

Benchmark Potential: MEDIUM
Área: Transações / repositório `[DB]`
Arquivos modificados:
- src/server/repositories/transactions.ts

Resumo do bug:
A listagem não tem critério de desempate para transações com a mesma data, e a ordem passa a variar depois de atualizações.

Passos para reproduzir:
1. Ter 3+ transações na mesma data e anotar a ordem em `/transacoes`.
2. Recategorizar (ou editar a descrição de) a do meio.
3. Recarregar a lista.

Comportamento com bug:
A transação alterada muda de posição dentro do grupo do dia.

Comportamento correto esperado:
Ordem estável dentro do dia (mesma posição antes e depois).

Before screenshot:
Grupo "Hoje" com a transação editada em outra posição em relação ao print anterior.

After screenshot esperado após correção:
Mesma sequência de linhas antes e depois da edição.

Edge case de desempate:
Repetir várias vezes e com diferentes registros; comparar a ordem retornada por `GET /api/transactions` entre chamadas.

Por que é difícil:
Não determinístico e dependente do plano de execução do Postgres; não aparece com uma única transação por dia.

Complexidade provável da correção: EASY

---

## BUG-13 — Rótulos "Hoje/Ontem" errados à noite (fuso)

Benchmark Potential: GOOD
Área: Transações / TransactionList `[Viewport]` (relógio)
Arquivos modificados:
- src/features/transactions/components/TransactionList/TransactionList.tsx

Resumo do bug:
O agrupamento por dia compara datas em UTC enquanto os rótulos usam datas locais; após ~21h no Brasil o dia "de hoje" é classificado errado.

Passos para reproduzir:
1. Fuso `America/Sao_Paulo`; relógio local depois das 21:00 (ou fixar com Playwright `page.clock`).
2. Ter uma transação com data de hoje e outra de ontem.
3. Abrir `/transacoes`.

Comportamento com bug:
A transação de hoje aparece sob "Ontem" e a de ontem sob um rótulo de data longa ("22 de setembro") em vez de "Ontem".

Comportamento correto esperado:
"Hoje" e "Ontem" corretos em qualquer horário.

Before screenshot:
Às 22:00 locais: cabeçalho de grupo "Ontem" contendo a transação criada hoje; não existe grupo "Hoje".

After screenshot esperado após correção:
Grupo "Hoje" com a transação de hoje e "Ontem" com a de ontem.

Edge case de desempate:
Repetir às 20:59 e 21:01 locais e com o relógio na virada do mês.

Por que é difícil:
Depende de horário e fuso; testes com horários diurnos passam.

Complexidade provável da correção: MEDIUM

---

## BUG-14 — Intervalo de um único dia é rejeitado pela API

Benchmark Potential: GOOD
Área: Transações / validação da API `[DB]`
Arquivos modificados:
- src/server/validators/transactions.ts

Resumo do bug:
Filtrar por `from` igual a `to` (um único dia) passa a ser inválido.

Passos para reproduzir:
1. Chamar `GET /api/transactions?from=2026-03-10&to=2026-03-10` (ou abrir `/transacoes?from=2026-03-10&to=2026-03-10`).

Comportamento com bug:
A API responde 422 `INVALID_QUERY` ("from não pode ser depois de to") para intervalos de um dia; a tela mostra erro/vazio conforme o tratamento de erros.

Comportamento correto esperado:
Intervalo de um dia é válido e retorna as transações daquele dia; `from > to` continua 422.

Before screenshot:
Aba Network com a chamada em 422 e a tela sem lista.

After screenshot esperado após correção:
Chamada 200 e lista com as transações do dia 10/03.

Edge case de desempate:
`from=2026-03-11&to=2026-03-10` deve seguir 422; `to` no último dia do mês deve incluir esse dia.

Por que é difícil:
Um caractere de comparação; só falha na fronteira do intervalo.

Complexidade provável da correção: EASY

---

## BUG-15 — "Transações recentes" ordena por criação, não por data

Benchmark Potential: MEDIUM
Área: Dashboard / RecentTransactions `[DB]`
Arquivos modificados:
- src/server/repositories/transactions.ts

Resumo do bug:
A lista do dashboard passa a ordenar pela data de criação do registro, não pela data da transação.

Passos para reproduzir:
1. Em "Lançamento manual", criar uma transação com data de 3 meses atrás.
2. Abrir o Dashboard.
3. Comparar com `/transacoes`.

Comportamento com bug:
A transação antiga aparece no topo de "Transações recentes", acima de transações mais novas por data.

Comportamento correto esperado:
Ordem por data da transação (mais recente primeiro), igual à tela de Transações.

Before screenshot:
Dashboard, card "Transações recentes": primeira linha com data 3 meses atrás ("21/06") acima de linhas mais novas.

After screenshot esperado após correção:
Primeira linha é a de data mais recente.

Edge case de desempate:
Criar duas transações com datas invertidas em relação à ordem de criação; conferir empate na mesma data.

Por que é difícil:
Só aparece com lançamentos retroativos.

Complexidade provável da correção: EASY

---

## BUG-16 — Conta do lançamento manual reseta após salvar

Benchmark Potential: EXCELLENT
Área: Lançamento manual / ManualTransactionScreen `[DB]`
Arquivos modificados:
- src/features/transactions/components/ManualTransactionScreen/ManualTransactionScreen.tsx

Resumo do bug:
Depois de salvar um lançamento, o formulário volta com a primeira conta em vez de manter a conta escolhida.

Passos para reproduzir:
1. Abrir `/lancamento-manual` com ≥2 contas.
2. Selecionar a 2ª conta, preencher valor/descrição e salvar.
3. Preencher um segundo lançamento sem mexer no campo Conta e salvar.

Comportamento com bug:
Após o 1º save o select "Conta" mostra a 1ª conta; o 2º lançamento é gravado na conta errada, com toast de sucesso normal.

Comportamento correto esperado:
O formulário mantém a conta (assim como tipo e categoria) para lançamentos em sequência.

Before screenshot:
Formulário logo após o toast "Transação salva": campo Conta mostrando a 1ª conta (ex.: Nubank) apesar de o usuário ter escolhido Itaú.

After screenshot esperado após correção:
Campo Conta continua em Itaú.

Edge case de desempate:
Com 1 conta não há sintoma; "Limpar" deve continuar voltando para a 1ª conta; repetir 3 salvamentos seguidos.

Por que é difícil:
A primeira interação funciona; falha só depois do save e sem erro visível.

Complexidade provável da correção: EASY

---

## BUG-17 — Falha ao salvar edição no painel não dá feedback

Benchmark Potential: GOOD
Área: Transações / TransactionDetailPanel `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionDetailPanel/TransactionDetailPanel.tsx

Resumo do bug:
Se o PATCH de edição falhar, nenhuma mensagem é exibida; o usuário não sabe se salvou.

Passos para reproduzir:
1. Selecionar a transação A e clicar em "Editar".
2. Alterar data/valor/descrição para ficar idêntico a outra transação da mesma conta (dedupe → 409).
3. Clicar em "Salvar alterações".

Comportamento com bug:
O botão volta de "Salvando..." para "Salvar alterações" e nada mais acontece: sem toast, sem erro.

Comportamento correto esperado:
Toast "Não foi possível salvar" com a mensagem da API ("Já existe uma transação idêntica nesta conta.").

Before screenshot:
Formulário de edição intacto, sem nenhum toast após o clique.

After screenshot esperado após correção:
Toast de erro visível com a mensagem de duplicidade.

Edge case de desempate:
Repetir offline (erro de rede) e com sessão expirada (401); recategorizar/excluir já mostram toast de erro (contraste).

Por que é difícil:
Só aparece no caminho de erro; sucesso funciona.

Complexidade provável da correção: EASY

---

## BUG-18 — Formulário de edição reabre com dados antigos do cache

Benchmark Potential: EXCELLENT
Área: Lançamento manual (modo edição) / hooks de transação `[DB]`
Arquivos modificados:
- src/features/transactions/hooks/useUpdateTransaction.ts

Resumo do bug:
Após editar uma transação, o cache de detalhe do React Query não é invalidado; voltar à tela de edição mostra os valores antigos.

Passos para reproduzir:
1. Abrir `/lancamento-manual?id=<uuid-da-transação>` (modo edição).
2. Alterar a descrição e clicar em "Salvar alterações" (redireciona para `/transacoes`).
3. Em até 30 s, clicar em Voltar no navegador.

Comportamento com bug:
O formulário reabre com a descrição anterior à edição (cache reutilizado, sem refetch).

Comportamento correto esperado:
O formulário mostra os valores já salvos.

Before screenshot:
Tela "Editar transação" com a descrição antiga no campo, enquanto `/transacoes` já mostra a nova.

After screenshot esperado após correção:
Campo Descrição com o novo texto.

Edge case de desempate:
Após >30 s (staleTime) ou recarregando o navegador o valor correto aparece; repetir com edição de valor e de categoria.

Por que é difícil:
Só aparece via Back dentro da janela de stale; ajustar `staleTime` global "conserta" o teste mas piora o restante.

Complexidade provável da correção: MEDIUM

---

## BUG-19 — Onboarding: campo "Seu nome" remove espaços ao digitar

Benchmark Potential: GOOD
Área: Onboarding / OnboardingWizard
Arquivos modificados:
- src/features/onboarding/components/OnboardingWizard.tsx

Resumo do bug:
O nome é aparado a cada tecla, então espaços digitados desaparecem.

Passos para reproduzir:
1. Abrir `/onboarding` → "Começar configuração".
2. Digitar "Ana Paula" no campo "Seu nome".

Comportamento com bug:
O campo mostra "AnaPaula"; nomes compostos não podem ser digitados (colar "  Ana " também é alterado durante a digitação).

Comportamento correto esperado:
O campo preserva o que o usuário digita; o nome é normalizado só ao enviar.

Before screenshot:
Campo Seu nome com "AnaPaula" e o botão "Continuar" habilitado.

After screenshot esperado após correção:
Campo com "Ana Paula".

Edge case de desempate:
Nome só com espaços não deve habilitar "Continuar"; o nome enviado ao servidor deve ser o aparado.

Por que é difícil:
Uma correção rasa (remover o trim) libera nome de espaços; a validação precisa continuar existindo.

Complexidade provável da correção: EASY

---

## BUG-20 — Onboarding (Contas): tipo e saldo persistem após adicionar

Benchmark Potential: GOOD
Área: Onboarding / AccountsStep
Arquivos modificados:
- src/features/onboarding/components/steps/AccountsStep.tsx

Resumo do bug:
Depois de adicionar uma conta, só o nome é limpo; tipo e saldo digitados continuam no formulário.

Passos para reproduzir:
1. No passo "Contas", digitar nome "Reserva", tipo "Poupança", saldo "1.500,00" e clicar em "Adicionar".
2. Digitar só o nome "Carteira 2" e clicar em "Adicionar".

Comportamento com bug:
O formulário continua com "Poupança" e saldo 1.500,00 após o 1º add; a 2ª conta nasce como Poupança (visível no rótulo do item) com o saldo herdado.

Comportamento correto esperado:
O formulário volta ao padrão (Conta corrente, saldo vazio) após cada adição.

Before screenshot:
Formulário após adicionar: Nome vazio, Tipo "Poupança", campo "Saldo inicial" com 1.500,00.

After screenshot esperado após correção:
Nome vazio, Tipo "Conta corrente", saldo vazio.

Edge case de desempate:
Adicionar via chip de sugestão não deve ser afetado por valores digitados; conferir o payload final no passo "Pronto".

Por que é difícil:
Herança silenciosa entre itens; o saldo herdado nem aparece na lista.

Complexidade provável da correção: EASY

---

## BUG-21 — Onboarding: "Voltar" no Perfil não faz nada

Benchmark Potential: MEDIUM
Área: Onboarding / OnboardingWizard
Arquivos modificados:
- src/features/onboarding/components/OnboardingWizard.tsx

Resumo do bug:
O botão "Voltar" do passo Perfil não retorna à tela de boas-vindas.

Passos para reproduzir:
1. `/onboarding` → "Começar configuração" (passo Perfil).
2. Clicar em "Voltar".

Comportamento com bug:
Nada acontece; continua em "Como podemos te chamar?". Nos demais passos "Voltar" funciona.

Comportamento correto esperado:
Volta para "Boas-vindas".

Before screenshot:
Após clicar em Voltar: ainda "Passo 2 de 7 — Perfil".

After screenshot esperado após correção:
"Passo 1 de 7 — Boas-vindas".

Edge case de desempate:
Ir até "Objetivo", voltar duas vezes até Perfil e mais uma vez até Boas-vindas; estado preenchido (nome) deve ser preservado.

Por que é difícil:
Off-by-one no limite inferior, só no primeiro passo.

Complexidade provável da correção: EASY

---

## BUG-22 — Drawer mobile não fecha ao tocar em "Configurações"

Benchmark Potential: GOOD
Área: Navegação / Sidebar + MobileSidebar `[Viewport]`
Arquivos modificados:
- src/components/app/Sidebar/Sidebar.tsx

Resumo do bug:
No menu mobile, tocar em "Configurações" (item do rodapé) navega mas não fecha o drawer; os demais itens fecham.

Passos para reproduzir:
1. Viewport 375px, abrir o app e tocar no hambúrguer.
2. Tocar em "Transações" (drawer fecha).
3. Reabrir o drawer e tocar em "Configurações".

Comportamento com bug:
A rota muda, mas o drawer e o overlay permanecem sobre a nova página até o usuário fechar manualmente.

Comportamento correto esperado:
Qualquer link do menu fecha o drawer.

Before screenshot:
Página de destino ao fundo com o drawer de navegação ainda aberto e overlay escurecido.

After screenshot esperado após correção:
Drawer fechado, página de destino visível.

Edge case de desempate:
Testar todos os itens dos quatro grupos + rodapé; o teste existente cobre só um item.

Por que é difícil:
O caso mais óbvio (itens principais) funciona; um único item do rodapé foge do padrão.

Complexidade provável da correção: EASY

---

## BUG-23 — Sem acesso à busca de comandos entre 768px e 1023px

Benchmark Potential: MEDIUM
Área: Topbar / responsividade `[Viewport]`
Arquivos modificados:
- src/components/app/Topbar/Topbar.tsx

Resumo do bug:
Em larguras de tablet, nem o campo de busca nem o botão de lupa aparecem no topo.

Passos para reproduzir:
1. Viewport 900px de largura.
2. Abrir qualquer página autenticada e procurar a busca no topbar.

Comportamento com bug:
Sem campo e sem ícone de busca; só ⌘/Ctrl+K abre a busca (inacessível em touch).

Comportamento correto esperado:
Sempre há um ponto de entrada visível (ícone abaixo de 1024px, campo a partir de 1024px).

Before screenshot:
Topbar a 900px sem campo de busca nem lupa; só título, tema, notificações e avatar.

After screenshot esperado após correção:
Botão de lupa visível ao lado do título.

Edge case de desempate:
Testar em 767, 768, 1023 e 1024px.

Por que é difícil:
Depende de breakpoints e não aparece em testes de DOM.

Complexidade provável da correção: EASY

---

## BUG-24 — Sidebar colapsada vaza para o drawer mobile

Benchmark Potential: EXCELLENT
Área: AppShell / Sidebar / MobileSidebar `[Viewport]`
Arquivos modificados:
- src/components/app/AppShell/AppShell.tsx
- src/components/app/MobileSidebar/MobileSidebar.tsx

Resumo do bug:
O estado "colapsado" da sidebar desktop é passado ao menu mobile; se o usuário colapsou no desktop e depois reduziu a janela, o drawer abre só com ícones.

Passos para reproduzir:
1. Janela 1280px: clicar no hambúrguer (sidebar vira só ícones).
2. Reduzir a janela para 375px sem recarregar.
3. Clicar no hambúrguer.

Comportamento com bug:
O drawer abre em modo compacto: sem rótulos nem títulos de grupo, apenas ícones (com tooltips), dentro de um drawer largo.

Comportamento correto esperado:
O drawer mobile sempre mostra o menu expandido.

Before screenshot:
Drawer de 288px de largura com uma coluna de ícones sem texto.

After screenshot esperado após correção:
Drawer com rótulos ("Dashboard", "Transações", …) e grupos ("VISÃO GERAL", …).

Edge case de desempate:
Expandir a sidebar no desktop e reabrir o drawer (normal); colapsar de novo e alternar entre larguras várias vezes.

Por que é difícil:
Estado compartilhado entre três componentes e sintoma só após o resize; testes de um componente isolado passam.

Complexidade provável da correção: MEDIUM

---

## BUG-25 — Atalho Ctrl/⌘+K não funciona com Caps Lock/Shift

Benchmark Potential: MEDIUM
Área: Topbar / CommandSearch (teclado)
Arquivos modificados:
- src/components/app/CommandSearch/CommandSearch.tsx

Resumo do bug:
O atalho da busca de comandos só responde quando a tecla K é minúscula.

Passos para reproduzir:
1. Ativar Caps Lock (ou segurar Shift).
2. Pressionar Ctrl+K (Windows/Linux) ou ⌘+K (macOS).

Comportamento com bug:
Nada abre (e o atalho do navegador não é interceptado). Sem Caps Lock funciona.

Comportamento correto esperado:
O atalho abre a busca independentemente de maiúsculas/minúsculas.

Before screenshot:
Página inalterada após o atalho, sem diálogo.

After screenshot esperado após correção:
Diálogo "Busca de comandos" aberto com foco no campo.

Edge case de desempate:
Com o diálogo aberto o atalho não deve gerar erro; com foco em outro input o atalho deve continuar funcionando.

Por que é difícil:
Só aparece com um modificador de teclado específico.

Complexidade provável da correção: EASY

---

## BUG-26 — Notificações voltam a "não lidas" ao reabrir o popover

Benchmark Potential: GOOD
Área: Topbar / NotificationsPanel
Arquivos modificados:
- src/components/app/NotificationsPanel/NotificationsPanel.tsx

Resumo do bug:
O estado lido/não lido é recarregado ao abrir o popover, desfazendo "Marcar lidas".

Passos para reproduzir:
1. Clicar no sino e em "Marcar lidas" (badge "0 novas", ponto vermelho some).
2. Fechar com Esc.
3. Clicar no sino novamente.

Comportamento com bug:
Volta "3 novas", o ponto vermelho reaparece no sino e os pontos de não lida voltam nos itens.

Comportamento correto esperado:
O estado lido persiste enquanto a sessão está aberta.

Before screenshot:
Popover reaberto mostrando o chip "3 novas" e o botão "Marcar lidas" habilitado.

After screenshot esperado após correção:
Chip "0 novas" e botão desabilitado; sino sem ponto.

Edge case de desempate:
Navegar para outra página e reabrir o sino; fechar clicando fora em vez de Esc.

Por que é difícil:
O teste do fluxo dentro de uma única abertura passa; falha na reabertura.

Complexidade provável da correção: EASY

---

## BUG-27 — Tema explícito é sobrescrito quando o SO muda de aparência

Benchmark Potential: GOOD
Área: Tema / ThemeProvider (+ Toaster/ThemeToggle)
Arquivos modificados:
- src/components/app/theme-provider.tsx

Resumo do bug:
Uma mudança de `prefers-color-scheme` do sistema sobrescreve o tema escolhido pelo usuário.

Passos para reproduzir:
1. Emular `prefers-color-scheme: dark` (DevTools → Rendering).
2. Clicar no botão de tema do topbar até o app ficar em "claro" (2 cliques a partir do padrão).
3. Alternar a emulação para `light` e depois para `dark`.

Comportamento com bug:
O app passa a seguir o SO (escurece) mesmo com o tema claro escolhido; ao recarregar volta ao claro (localStorage).

Comportamento correto esperado:
Somente o tema "system" segue o SO; escolha explícita é respeitada.

Before screenshot:
Página escura com `localStorage.theme = "light"` (visível em Application → Local Storage).

After screenshot esperado após correção:
Página permanece clara após a mudança do SO.

Edge case de desempate:
Escolher "escuro" com SO claro e alternar o SO; verificar toasts (Sonner) e classe `dark` no `<html>`.

Por que é difícil:
Só dispara no evento de mudança do SO; o reload mascara o problema.

Complexidade provável da correção: MEDIUM

---

## BUG-28 — Seletor de mês do dashboard desincroniza da URL no Voltar

Benchmark Potential: EXCELLENT
Área: Dashboard / DashboardHeader + MonthYearPicker `[DB]`
Arquivos modificados:
- src/features/dashboard/components/DashboardHeader/DashboardHeader.tsx

Resumo do bug:
O botão do seletor guarda o mês escolhido em estado próprio e deixa de acompanhar o `?month=` da URL.

Passos para reproduzir:
1. Abrir o Dashboard e, no seletor, escolher "Mar" (URL `/?month=2026-03`).
2. Escolher "Mai" (URL `/?month=2026-05`).
3. Clicar em Voltar no navegador.

Comportamento com bug:
URL, subtítulo ("Aqui está como Março está indo"), métricas e donut voltam a Março, mas o botão do seletor continua "Maio de 2026".

Comportamento correto esperado:
O botão do seletor sempre reflete o mês da URL.

Before screenshot:
Botão "Maio de 2026" ao lado de subtítulo "Aqui está como Março está indo" e URL `?month=2026-03`.

After screenshot esperado após correção:
Botão "Março de 2026" coerente com subtítulo e URL.

Edge case de desempate:
Avançar de volta (deve ir a Maio), abrir link direto `/?month=2026-03` em nova aba e recarregar.

Por que é difícil:
Server-render, URL e estado client interagem; "resolver" atualizando o estado no Back exige ouvir navegação em vez de derivar da prop.

Complexidade provável da correção: MEDIUM

---

## BUG-29 — Dezembro é inalcançável no seletor de mês

Benchmark Potential: GOOD
Área: Dashboard / parse de `?month=` `[DB]`
Arquivos modificados:
- src/features/dashboard/month.ts

Resumo do bug:
`?month=YYYY-12` é tratado como inválido e cai no mês corrente.

Passos para reproduzir:
1. Abrir `/?month=2026-12` (ou escolher "Dez" no seletor).

Comportamento com bug:
O dashboard mostra o mês corrente (não dezembro) e o seletor volta para o mês atual; a URL continua com `2026-12`.

Comportamento correto esperado:
Dezembro selecionável e exibido.

Before screenshot:
URL `?month=2026-12`, botão do seletor e subtítulo indicando o mês corrente (ex.: Setembro).

After screenshot esperado após correção:
Botão "Dezembro de 2026", subtítulo "…como Dezembro está indo" e métricas de dezembro.

Edge case de desempate:
`2026-01`, `2026-11`, `2025-12`, `2026-13`, `2026-00` (só os dois últimos devem cair no mês corrente).

Por que é difícil:
Off-by-one na fronteira superior; meses 1–11 funcionam.

Complexidade provável da correção: EASY

---

## BUG-30 — Período mensal termina no dia errado

Benchmark Potential: GOOD
Área: Dashboard / período mensal `[DB]`
Arquivos modificados:
- src/features/dashboard/month.ts

Resumo do bug:
O último dia do período é calculado com o mês errado; dependendo do mês, o fim do período fica curto ou avança para o mês seguinte.

Passos para reproduzir:
1. Criar uma transação em 31/03 e outra em 02/03 (mesmo ano).
2. Abrir `/?month=2026-03` e comparar receitas/despesas com a soma manual.
3. Abrir `/?month=2026-02` e comparar (existindo transações em 01–03/03).

Comportamento com bug:
Março ignora os dias 29–31; fevereiro inclui transações de 1–3 de março.

Comportamento correto esperado:
Cada mês soma somente os dias 1 ao último dia do próprio mês.

Before screenshot:
Cards de março sem o valor da transação de 31/03; donut sem a categoria dessa transação.

After screenshot esperado após correção:
Cards e donut incluem a transação de 31/03.

Edge case de desempate:
Abril (30 dias) inclui 1º de maio; janeiro e agosto acertam "por coincidência" — testar meses de 28, 29, 30 e 31 dias e ano bissexto.

Por que é difícil:
Depende do mês e de dados nas bordas; os totais parecem plausíveis.

Complexidade provável da correção: EASY

---

## BUG-31 — Seletor de mês reabre com o ano de "montagem"

Benchmark Potential: EXCELLENT
Área: Dashboard e Onboarding / MonthYearPicker
Arquivos modificados:
- src/components/app/MonthYearPicker/MonthYearPicker.tsx

Resumo do bug:
Ao reabrir o popover, a grade de meses volta para o ano em que o componente foi montado, não para o ano do mês atualmente selecionado.

Passos para reproduzir:
1. Abrir o Dashboard (ano atual, ex.: 2026) e abrir o seletor.
2. Navegar para 2025 e escolher "Mar" (dashboard vai para `2025-03`).
3. Abrir o seletor novamente.

Comportamento com bug:
A grade mostra 2026 e "Mar" não aparece destacado; o usuário precisa navegar de volta para encontrar a seleção atual.

Comportamento correto esperado:
A grade abre no ano da seleção atual (2025) com "Mar" destacado.

Before screenshot:
Popover aberto com cabeçalho "2026" e nenhum mês destacado, enquanto o botão diz "Março de 2025".

After screenshot esperado após correção:
Popover com cabeçalho "2025" e "Mar" destacado.

Edge case de desempate:
Repetir após Voltar/Avançar do navegador (mês muda via URL) e no passo Perfil do onboarding.

Por que é difícil:
A primeira abertura funciona e os testes que só mudam o ano dentro de uma sessão passam; o erro é referência a um valor "congelado".

Complexidade provável da correção: MEDIUM

---

## BUG-32 — "Saídas" da tela de transações contam transferências

Benchmark Potential: GOOD
Área: Transações / SummaryCards `[DB]` (transferência via seed)
Arquivos modificados:
- src/features/transactions/components/TransactionsScreen/TransactionsScreen.tsx

Resumo do bug:
O total de "Saídas" passa a incluir qualquer tipo que não seja receita, inclusive transferências.

Passos para reproduzir:
1. Ter uma receita de R$ 100 e uma transferência de R$ 40 na lista (criada via seed/DB; o formulário só cria receita/despesa).
2. Abrir `/transacoes`.

Comportamento com bug:
"Saídas" mostra R$ 40,00 mesmo sem nenhuma despesa.

Comportamento correto esperado:
"Saídas" soma apenas despesas; transferências ficam fora.

Before screenshot:
Cards: Entradas R$ 100,00, Saídas R$ 40,00, Resultado R$ 140,00.

After screenshot esperado após correção:
Saídas R$ 0,00.

Edge case de desempate:
Lista só com transferências; combinação de filtros `kind=income` (deve funcionar igual).

Por que é difícil:
Sem transferências nos dados o bug é invisível.

Complexidade provável da correção: EASY

---

## BUG-33 — Barras do gráfico ficam esmaecidas ao sair do gráfico

Benchmark Potential: MEDIUM
Área: Dashboard / BarChart `[DB]`
Arquivos modificados:
- src/components/charts/BarChart/BarChart.tsx

Resumo do bug:
O destaque por hover não é desfeito quando o mouse deixa o gráfico.

Passos para reproduzir:
1. Passar o mouse sobre as barras de um mês do card "Receitas vs. despesas".
2. Mover o mouse para fora do gráfico.

Comportamento com bug:
Os demais meses permanecem com 30% de opacidade indefinidamente.

Comportamento correto esperado:
Todas as barras voltam à opacidade normal ao sair do gráfico.

Before screenshot:
Cursor fora do card; apenas um mês com cor cheia, os outros claros.

After screenshot esperado após correção:
Todas as barras com cor cheia.

Edge case de desempate:
Sair pela borda superior/inferior e re-entrar; trocar de mês rapidamente.

Por que é difícil:
Evento de saída ausente; só perceptível visualmente.

Complexidade provável da correção: EASY

---

## BUG-34 — Lançamento manual: categoria obsoleta ao alternar Despesa↔Receita

Benchmark Potential: EXCELLENT
Área: Lançamento manual / ManualTransactionScreen `[DB]`
Arquivos modificados:
- src/features/transactions/components/ManualTransactionScreen/ManualTransactionScreen.tsx

Resumo do bug:
Ao trocar o tipo, a categoria do tipo anterior permanece no valor do formulário enquanto o select exibe outra opção.

Passos para reproduzir:
1. Abrir `/lancamento-manual` (Despesa, categoria preselecionada, ex.: "Alimentação").
2. Clicar em "Receita".
3. Preencher valor e descrição e clicar em "Salvar transação" sem tocar na categoria.
4. Conferir a transação em `/transacoes`.

Comportamento com bug:
O select mostra a 1ª categoria de receita (ex.: "Salário") e a pré-visualização perde o ícone da categoria, mas a receita é salva com a categoria de despesa "Alimentação".

Comportamento correto esperado:
Ao trocar o tipo, a categoria passa para uma categoria válida do novo tipo; o que aparece é o que é salvo.

Before screenshot:
Lista de transações com a receita exibindo a categoria "Alimentação"; no form, pré-visualização com ícone genérico.

After screenshot esperado após correção:
Receita salva com "Salário" e pré-visualização com o ícone de Salário.

Edge case de desempate:
Despesa → Receita → Despesa; usar "Limpar" no meio; trocar o tipo antes de as categorias terminarem de carregar.

Por que é difícil:
Divergência entre o valor mostrado e o valor do form só se percebe ao salvar; o campo "parece" correto.

Complexidade provável da correção: MEDIUM

---

## BUG-35 — Dashboard mostra "Sem movimentações" quando o saldo é zero

Benchmark Potential: GOOD
Área: Dashboard / DashboardMetrics `[DB]`
Arquivos modificados:
- src/features/dashboard/components/DashboardMetrics/DashboardMetrics.tsx

Resumo do bug:
O aviso de mês vazio é exibido quando o saldo é zero, não quando não há transações.

Passos para reproduzir:
1. Ter num mês receita de R$ 100 e despesa de R$ 100 (saldo 0).
2. Abrir o Dashboard nesse mês.

Comportamento com bug:
Abaixo dos cards aparece "Sem movimentações em <mês>" apesar de existirem transações.

Comportamento correto esperado:
O aviso só aparece quando o mês realmente não tem transações.

Before screenshot:
Cards (Receitas R$ 100, Despesas R$ 100, Saldo R$ 0) seguidos do bloco "Sem movimentações em Setembro".

After screenshot esperado após correção:
Somente os cards, sem o bloco de vazio.

Edge case de desempate:
Mês realmente vazio (deve mostrar o aviso); mês com saldo diferente de zero (não deve).

Por que é difícil:
Condição plausível que funciona na maioria dos meses; falha na coincidência receita = despesa.

Complexidade provável da correção: EASY

---

## BUG-36 — Gráfico de histórico some se qualquer mês estiver vazio

Benchmark Potential: GOOD
Área: Dashboard / DashboardHistory `[DB]`
Arquivos modificados:
- src/features/dashboard/components/DashboardHistory/DashboardHistory.tsx

Resumo do bug:
O card "Receitas vs. despesas" é substituído pelo estado vazio quando qualquer um dos 6 meses não tem movimentação.

Passos para reproduzir:
1. Usar um usuário com transações apenas no mês atual (meses anteriores vazios).
2. Abrir o Dashboard.

Comportamento com bug:
O card mostra "Nenhum dado disponível para o período" apesar de haver dados no mês atual.

Comportamento correto esperado:
O gráfico é exibido sempre que existir movimentação em algum dos 6 meses.

Before screenshot:
Card "Receitas vs. despesas" com ícone de gráfico esmaecido e a mensagem de vazio.

After screenshot esperado após correção:
Gráfico de barras com uma barra de receitas/despesas no mês atual e barras zeradas nos demais.

Edge case de desempate:
Usuário sem nenhuma movimentação nos 6 meses (vazio correto); usuário com dados nos 6 meses.

Por que é difícil:
Com seed completo (6 meses) o bug não aparece.

Complexidade provável da correção: EASY

---

## BUG-37 — Dashboard não volta ao estado inicial depois de excluir tudo

Benchmark Potential: GOOD
Área: Dashboard / repositório `[DB]`
Arquivos modificados:
- src/server/repositories/transactions.ts

Resumo do bug:
A checagem "usuário tem transações?" considera também as excluídas (soft delete).

Passos para reproduzir:
1. Usuário com exatamente 1 transação.
2. Em `/transacoes`, abrir a transação e excluí-la.
3. Abrir o Dashboard.

Comportamento com bug:
O dashboard completo aparece com métricas zeradas e gráficos vazios em vez do estado inicial "Vamos dar o primeiro passo juntos".

Comportamento correto esperado:
Sem transações ativas, o dashboard mostra o estado vazio inicial.

Before screenshot:
Dashboard com cards R$ 0,00, "Sem movimentações em <mês>" e cartões de gráfico vazios.

After screenshot esperado após correção:
Bloco "Vamos dar o primeiro passo juntos" com botões "Importar extrato" e "Lançar manualmente".

Edge case de desempate:
Excluir uma de duas transações (dashboard normal); excluir a última e recriar uma.

Por que é difícil:
Só aparece depois de excluir a última transação; a seed padrão não a exercita.

Complexidade provável da correção: EASY

---

## BUG-38 — Cache do dashboard não é invalidado após mutações

Benchmark Potential: GOOD
Área: Dashboard / cache `[DB]` `[Redis]`
Arquivos modificados:
- src/server/services/dashboard/cache.ts

Resumo do bug:
Criar, editar ou excluir transações não limpa o cache do dashboard; os números ficam desatualizados até o TTL de 60 s.

Passos para reproduzir:
1. Abrir o Dashboard (popula o cache).
2. Em "Lançamento manual", criar uma despesa no mês atual.
3. Voltar ao Dashboard por navegação (menu lateral) em menos de 60 s.

Comportamento com bug:
Métricas, donut e histórico não incluem a nova despesa; ela aparece só depois de ~60 s ou de outra invalidação.

Comportamento correto esperado:
Dashboard reflete imediatamente a mutação.

Before screenshot:
Dashboard com "Despesas no mês" igual ao valor anterior, enquanto "Transações recentes" já lista a nova despesa.

After screenshot esperado após correção:
"Despesas no mês" e donut incluem a nova despesa.

Edge case de desempate:
Repetir com edição de categoria e com exclusão; sem Redis (falha silenciosa) o sintoma não aparece.

Por que é difícil:
Depende de Redis e de janela de tempo; testes unitários usam um `invalidate` mockado e passam.

Complexidade provável da correção: MEDIUM

---

## BUG-39 — Donut de categorias reutiliza o cache de outro mês

Benchmark Potential: GOOD
Área: Dashboard / DonutChart `[DB]` `[Redis]`
Arquivos modificados:
- src/server/services/dashboard/category-breakdown.ts

Resumo do bug:
O cache de composição de gastos não diferencia o período consultado.

Passos para reproduzir:
1. Abrir `/?month=2026-05` e observar o donut.
2. Em menos de 60 s, trocar o seletor para outro mês com gastos diferentes.

Comportamento com bug:
Cards de métricas mudam para o novo mês, mas donut e legenda mostram as fatias do primeiro mês.

Comportamento correto esperado:
Donut do mês selecionado.

Before screenshot:
Mês B com cards de valores diferentes e donut/legenda idênticos aos do mês A.

After screenshot esperado após correção:
Donut e legenda de B, ou estado vazio se B não tem despesas.

Edge case de desempate:
Trocar para um mês sem despesas (deve mostrar "Nenhum dado disponível"); voltar ao mês A.

Por que é difícil:
Só ocorre dentro do TTL e com Redis; o mesmo mês repetido parece correto.

Complexidade provável da correção: EASY

---

## BUG-40 — Login descarta a query do `callbackUrl`

Benchmark Potential: GOOD
Área: Autenticação / página de login `[DB]`
Arquivos modificados:
- src/app/(auth)/login/page.tsx

Resumo do bug:
Depois do login o usuário é enviado ao caminho de destino sem os parâmetros de query.

Passos para reproduzir:
1. Deslogado, abrir `/?month=2026-03` (redireciona para `/login?callbackUrl=…`).
2. Entrar com e-mail e senha.

Comportamento com bug:
Cai em `/` (mês corrente); o `?month=2026-03` se perde.

Comportamento correto esperado:
Redireciona para `/?month=2026-03`.

Before screenshot:
Dashboard do mês corrente com URL `/` após o login.

After screenshot esperado após correção:
Dashboard de março com URL `/?month=2026-03`.

Edge case de desempate:
Repetir com login por Google/GitHub e com `callbackUrl` externo/`//host` (deve continuar indo para `/`).

Por que é difícil:
Envolve o fluxo completo de auth; sanitização de URL e preservação de query competem.

Complexidade provável da correção: EASY

---

## BUG-41 — DataList mostra erro em vez de loading ao tentar novamente

Benchmark Potential: MEDIUM
Área: Design system / DataList `[Storybook]`
Arquivos modificados:
- src/components/app/DataList/DataList.tsx

Resumo do bug:
Quando há mensagem de erro e um novo carregamento começa, a lista continua exibindo o erro.

Passos para reproduzir:
1. Storybook → DataList; definir `error="Falha ao carregar"` e `isLoading` verdadeiro nos controls.

Comportamento com bug:
Mostra o ErrorState; o skeleton nunca aparece durante o novo carregamento.

Comportamento correto esperado:
Enquanto carrega, mostra o skeleton; o erro só aparece se o carregamento terminar em erro.

Before screenshot:
ErrorState "Não foi possível carregar agora / Falha ao carregar" com `isLoading` ligado.

After screenshot esperado após correção:
Skeleton de 4 linhas.

Edge case de desempate:
`isLoading` sem erro, erro sem `isLoading` e lista vazia sem nenhum dos dois.

Por que é difícil:
Precedência entre estados; os estados isolados funcionam.

Complexidade provável da correção: EASY

---

## BUG-42 — ChartCard mostra "sem dados" em vez do skeleton

Benchmark Potential: MEDIUM
Área: Design system / ChartCard `[Storybook]`
Arquivos modificados:
- src/components/app/ChartCard/ChartCard.tsx

Resumo do bug:
Com `isLoading` e `isEmpty` ao mesmo tempo (dados ainda `[]` enquanto carrega), o card exibe a mensagem de vazio.

Passos para reproduzir:
1. Storybook → ChartCard; ligar `isLoading` e `isEmpty`.

Comportamento com bug:
"Nenhum dado disponível para o período".

Comportamento correto esperado:
Skeleton enquanto carrega, mensagem de vazio só depois.

Before screenshot:
Card com ícone de gráfico esmaecido e a mensagem de vazio, com `isLoading` ligado.

After screenshot esperado após correção:
Bloco skeleton de 240px de altura.

Edge case de desempate:
Alternar `isLoading` de true para false com `isEmpty` ligado (skeleton → vazio).

Por que é difícil:
Precedência entre estados; casos isolados funcionam.

Complexidade provável da correção: EASY

---

## BUG-43 — "Limpar" não restaura a data do lançamento manual

Benchmark Potential: GOOD
Área: Lançamento manual / ManualTransactionScreen
Arquivos modificados:
- src/features/transactions/components/ManualTransactionScreen/ManualTransactionScreen.tsx

Resumo do bug:
O botão "Limpar" zera valor e descrição mas mantém a data digitada.

Passos para reproduzir:
1. Abrir `/lancamento-manual`.
2. Alterar a data para `01/03/2026`, preencher valor e descrição.
3. Clicar em "Limpar".
4. Preencher novamente e salvar.

Comportamento com bug:
Valor/descrição limpos, data continua `01/03/2026`; o novo lançamento sai com a data antiga.

Comportamento correto esperado:
"Limpar" restaura todos os campos, incluindo a data de hoje.

Before screenshot:
Formulário limpo exceto o campo Data com `01/03/2026` e a pré-visualização mostrando essa data.

After screenshot esperado após correção:
Data com a data de hoje.

Edge case de desempate:
Limpar em modo edição (`?id=`); limpar depois de trocar o tipo para Receita.

Por que é difícil:
Reset parcial de formulário; o dado errado só aparece ao salvar.

Complexidade provável da correção: EASY

---

## BUG-44 — Sugestões de conta ficam bloqueadas após remover a conta

Benchmark Potential: GOOD
Área: Onboarding / AccountsStep
Arquivos modificados:
- src/features/onboarding/components/steps/AccountsStep.tsx

Resumo do bug:
A disponibilidade dos chips de sugestão passa a depender de um histórico de cliques e não da lista real de contas.

Passos para reproduzir:
1. No passo "Contas", clicar na sugestão "Nubank" (chip desabilita).
2. Remover a conta "Nubank" pelo X.
3. Tentar clicar em "Nubank" de novo.

Comportamento com bug:
O chip continua desabilitado e a conta não pode ser re-adicionada por sugestão. Variantes: adicionar "Itaú" manualmente não desabilita o chip (permite duplicar); avançar e voltar reabilita todos os chips mesmo com contas existentes.

Comportamento correto esperado:
O chip fica desabilitado exatamente enquanto existir uma conta com aquele nome.

Before screenshot:
Lista de contas vazia e chip "Nubank" acinzentado/desabilitado.

After screenshot esperado após correção:
Chip "Nubank" habilitado.

Edge case de desempate:
Adicionar manualmente "Itaú" e depois clicar no chip "Itaú"; avançar/voltar de passo.

Por que é difícil:
Estado armazenado que deveria ser derivado; três sintomas distintos.

Complexidade provável da correção: EASY

---

## BUG-45 — Aviso "sem contas" pisca durante o carregamento

Benchmark Potential: MEDIUM
Área: Lançamento manual / ManualTransactionScreen `[DB]`
Arquivos modificados:
- src/features/transactions/components/ManualTransactionScreen/ManualTransactionScreen.tsx

Resumo do bug:
Enquanto as contas carregam, o formulário exibe o aviso de que não há contas cadastradas.

Passos para reproduzir:
1. Network → Slow 3G, sem cache.
2. Abrir `/lancamento-manual`.

Comportamento com bug:
Aparece "Você ainda não tem contas cadastradas. Crie uma conta no onboarding…" e depois some quando as contas chegam.

Comportamento correto esperado:
Sem aviso durante o carregamento; só quando a lista carregada está vazia.

Before screenshot:
Formulário com o aviso cinza no topo e select Conta desabilitado ("Sem contas").

After screenshot esperado após correção:
Formulário sem aviso enquanto carrega.

Edge case de desempate:
Usuário realmente sem contas (aviso permanece); API de contas falhando.

Por que é difícil:
Só visível com latência; distinguir carregando/vazio/erro.

Complexidade provável da correção: EASY

---

## BUG-46 — Barra de progresso do onboarding anuncia o passo errado

Benchmark Potential: MEDIUM
Área: Onboarding / OnboardingProgress (acessibilidade)
Arquivos modificados:
- src/features/onboarding/components/OnboardingProgress.tsx

Resumo do bug:
O valor atual exposto para tecnologias assistivas fica um passo atrás e, no primeiro passo, abaixo do mínimo.

Passos para reproduzir:
1. Abrir `/onboarding` e inspecionar o elemento `role="progressbar"` (Accessibility tree).
2. Avançar um passo e inspecionar de novo.

Comportamento com bug:
No passo 1 o valor atual é 0 (mínimo é 1); em cada passo o valor é o do passo anterior, embora o texto visível e o `aria-label` estejam corretos.

Comportamento correto esperado:
Valor atual igual ao passo exibido (1 a 7).

Before screenshot:
Accessibility tree: progressbar "Passo 1 de 7: Boas-vindas", valuemin 1, valuenow 0.

After screenshot esperado após correção:
valuenow 1.

Edge case de desempate:
Último passo (valuenow 7 = max) e cada passo intermediário.

Por que é difícil:
Sem sintoma visual; só a árvore de acessibilidade denuncia.

Complexidade provável da correção: EASY

---

## BUG-47 — Editar preseleciona a 1ª conta e move a transação ao salvar

Benchmark Potential: GOOD
Área: Transações / TransactionDetailPanel (edição) `[DB]`
Arquivos modificados:
- src/features/transactions/components/TransactionDetailPanel/TransactionDetailPanel.tsx

Resumo do bug:
O campo "Conta" do formulário de edição vem preenchido com a primeira conta do usuário, não com a conta da transação.

Passos para reproduzir:
1. Ter ≥2 contas e selecionar uma transação da 2ª conta (ex.: Itaú).
2. Aguardar as contas carregarem e clicar em "Editar".
3. Alterar somente a descrição e clicar em "Salvar alterações".

Comportamento com bug:
O select Conta mostra a 1ª conta (ex.: Nubank); após salvar, a transação passa para a 1ª conta sem aviso.

Comportamento correto esperado:
O campo Conta mostra a conta da transação; salvar sem tocar nele preserva a conta.

Before screenshot:
Painel de edição com Conta = "Nubank" enquanto a linha selecionada é da conta "Itaú"; depois do save, linha com conta "Nubank" no detalhe.

After screenshot esperado após correção:
Conta = "Itaú" no formulário e após salvar.

Edge case de desempate:
Transação da 1ª conta (sem sintoma); abrir "Editar" antes de as contas carregarem; trocar a conta manualmente e salvar.

Por que é difícil:
O valor incorreto é plausível e só corrompe dados no envio; não aparece com transações da primeira conta.

Complexidade provável da correção: EASY

---

## BUG-48 — Categorias de tipos diferentes com o mesmo nome se fundem

Benchmark Potential: MEDIUM
Área: Lançamento manual / API de categorias `[DB]`
Arquivos modificados:
- src/app/api/categories/route.ts

Resumo do bug:
A deduplicação do endpoint ignora o tipo (despesa/receita); "Outros" existe nos dois e uma das versões desaparece.

Passos para reproduzir:
1. Abrir `/lancamento-manual` e listar as categorias de Despesa.
2. Alternar para Receita e listar as categorias.

Comportamento com bug:
Só uma das variantes de "Outros" é retornada: Receita mostra apenas "Salário" (ou Despesa perde "Outros", conforme a ordem do banco). O mesmo vale no "Recategorizar" do painel.

Comportamento correto esperado:
Receita: "Salário" e "Outros"; Despesa: todas, incluindo "Outros".

Before screenshot:
Select de categoria de Receita com apenas "Salário".

After screenshot esperado após correção:
Select com "Salário" e "Outros".

Edge case de desempate:
`GET /api/categories` direto; usuário com categorias personalizadas de mesmo nome em tipos diferentes.

Por que é difícil:
Depende de nomes repetidos entre tipos e da ordem do banco; a dedupe correta (por tipo) já existe em outros pontos e pode ser confundida.

Complexidade provável da correção: EASY

---

## BUG-49 — Consentimento de IA vem marcado por padrão

Benchmark Potential: MEDIUM
Área: Onboarding / OnboardingWizard (privacidade)
Arquivos modificados:
- src/features/onboarding/components/OnboardingWizard.tsx

Resumo do bug:
O estado inicial do consentimento é "aceito", contrariando a exigência de consentimento explícito.

Passos para reproduzir:
1. `/onboarding` → avançar até "Privacidade e uso de IA" sem interagir com o switch.
2. Concluir o onboarding.

Comportamento com bug:
O switch já vem ligado; o onboarding grava `aiConsentAt` sem ação do usuário.

Comportamento correto esperado:
Switch desligado por padrão; consentimento só com ação explícita.

Before screenshot:
Passo "Privacidade e uso de IA" com o switch "Autorizo o uso dos meus dados pela IA" ligado.

After screenshot esperado após correção:
Switch desligado.

Edge case de desempate:
Ligar, voltar e avançar (mantém o valor escolhido); "Pular configuração" não deve registrar consentimento.

Por que é difícil:
Um valor inicial; o problema é de produto/conformidade, sem quebra visível.

Complexidade provável da correção: EASY

---

## BUG-50 — Busca de páginas só encontra prefixos

Benchmark Potential: MEDIUM
Área: Topbar / CommandSearch
Arquivos modificados:
- src/components/app/CommandSearch/CommandSearch.tsx

Resumo do bug:
A filtragem de páginas na busca de comandos deixou de encontrar termos no meio do nome.

Passos para reproduzir:
1. Abrir a busca (⌘/Ctrl+K).
2. Digitar "manual" (ou "extrato", "ações").

Comportamento com bug:
"Nenhuma página encontrada" apesar de existirem "Lançamento manual", "Importar extrato" e "Transações".

Comportamento correto esperado:
Páginas cujo nome contém o termo aparecem na seção "Páginas".

Before screenshot:
Seção Páginas exibindo "Nenhuma página encontrada" com o campo contendo "manual".

After screenshot esperado após correção:
Item "Lançamento manual" listado.

Edge case de desempate:
"MANUAL" em maiúsculas; termo com espaço; campo vazio (lista completa).

Por que é difícil:
Digitar o início do nome funciona; só falha com termos internos.

Complexidade provável da correção: EASY
