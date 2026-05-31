# FinSight AI — Product Documentation

> Documento de produto (Product Discovery). Escrito da perspectiva de Product Manager Sênior.
> Versão: 0.1 · Status: living document

**Decision Needed — idioma do repositório:** este documento está em português para acompanhar o processo de discovery. Como o projeto é open source e visa portfólio internacional (vagas remotas em USD), recomenda-se traduzir os `/docs` e o README para inglês na fase de hardening (v1.0). Manter PT-BR no produto (UI) e EN na documentação técnica é uma combinação válida.

---

## 1. Visão geral do produto

**FinSight AI** é uma plataforma de análise financeira pessoal com IA, full-stack, production-ready e open source. O usuário conecta, importa ou cadastra seus dados financeiros e o produto transforma isso em clareza: para onde o dinheiro vai, quais padrões existem, onde há risco e onde há oportunidade de economia.

**Problema que resolve.** Controle financeiro pessoal hoje vive em dois extremos ruins: planilhas (poderosas mas trabalhosas, sem inteligência, fáceis de abandonar) e apps fechados (bonitos mas caixas-pretas, sem transparência sobre dados e sem capacidade de responder perguntas abertas). Entre os dois, falta uma ferramenta que seja ao mesmo tempo transparente, automatizada e conversacional.

**Para quem é.** Pessoas que querem entender e organizar a vida financeira sem virar especialistas em finanças — desde quem só quer parar de se surpreender com a fatura até quem está endividado e precisa de um plano de quitação, passando por autônomos com renda variável e por usuários técnicos que querem analisar os próprios dados.

**Proposta de valor.** Você conversa com seus próprios dados financeiros em linguagem natural e recebe respostas fundamentadas nos números reais — não em achismo. A categorização é automática, os insights são acionáveis, e nada acontece com seus dados sem o seu consentimento.

**Por que IA faz sentido aqui.** Finanças pessoais são um problema de _interpretação de dados desestruturados_: extratos vêm em formatos diferentes, descrições de transação são crípticas ("PAG\*IFD3344"), e a pergunta que o usuário quer fazer ("posso me dar ao luxo de viajar?") não mapeia para um filtro de tabela. IA resolve as três pontas: normaliza e categoriza dados sujos, responde perguntas abertas com contexto, e gera insights proativos que o usuário não pensaria em buscar. Sem IA, isso vira uma planilha bonita.

**Diferença para um app financeiro comum.** Apps tradicionais mostram _o que aconteceu_ (dashboards estáticos). O FinSight responde _por que_ e _o que fazer_ — e mostra de onde tirou a resposta. Além disso, é open source e transparente sobre uso de dados, o oposto da caixa-preta.

**Diferença para uma planilha.** Zero manutenção manual de fórmulas, categorização automática, perguntas em linguagem natural, e insights proativos. A planilha exige que você já saiba o que perguntar; o FinSight sugere o que vale a pena olhar.

**Como produto real e como projeto open source.** Como produto, é usável de verdade para controle financeiro pessoal (suporta entrada manual + importação de extrato, como um Mobills com IA). Como projeto open source, é uma demonstração técnica densa: RAG sobre dados pessoais, tool calling fundamentado, ingestão de PDF/CSV, arquitetura full-stack moderna, segurança de dados sensíveis e observabilidade.

---

## 2. Personas

### Persona 1 — Mariana, a organizadora

- **Perfil:** 29 anos, analista de marketing, CLT, renda estável de ~R$ 6k. Usa o cartão para tudo e olha a fatura no fim do mês com susto.
- **Dores:** não sabe para onde o dinheiro vai; assinaturas esquecidas; sensação de que "some dinheiro".
- **Objetivos:** ter visão clara dos gastos por categoria; identificar desperdícios; conseguir poupar um pouco todo mês.
- **Comportamentos:** quer setup rápido, baixa tolerância a trabalho manual; usa muito no celular.
- **Funcionalidades-chave:** importação de extrato, categorização automática, dashboard, alertas de assinatura.
- **Riscos de experiência:** abandonar se o onboarding exigir muito esforço; frustração se a categorização errar muito.
- **O que faz continuar:** o app entrega valor já no primeiro extrato importado (tempo até primeiro valor curto).

### Persona 2 — Rafael, o endividado

- **Perfil:** 35 anos, técnico, tem 3 empréstimos em bancos diferentes e se perde nas parcelas e juros.
- **Dores:** não sabe qual dívida quitar primeiro; juros corroendo a renda; ansiedade financeira.
- **Objetivos:** um plano claro de quitação; entender quanto economiza pagando uma dívida antes da outra.
- **Comportamentos:** motivado mas precisa de orientação concreta e não-julgadora; checa com frequência.
- **Funcionalidades-chave:** módulo de dívidas, estratégia de quitação (avalanche/bola de neve) sugerida pela IA, projeções.
- **Riscos de experiência:** tom alarmista ou julgador afastaria; promessas absolutas gerariam frustração se não se concretizarem.
- **O que faz continuar:** ver a dívida diminuir e a IA confirmar que o plano está funcionando.

### Persona 3 — Carla, a autônoma

- **Perfil:** 41 anos, designer freelancer, renda variável (R$ 3k a R$ 12k/mês), múltiplos clientes.
- **Dores:** meses bons e ruins; dificuldade de separar PF de PJ; não sabe quanto pode gastar.
- **Objetivos:** suavizar o fluxo de caixa; entender a média real de renda; planejar reserva para meses fracos.
- **Comportamentos:** lança receitas manualmente (recebe por fora do banco às vezes); precisa de flexibilidade.
- **Funcionalidades-chave:** lançamentos manuais, receitas recorrentes e avulsas, fluxo de caixa, metas de reserva.
- **Riscos de experiência:** modelos rígidos de "salário fixo" não servem; precisa de visão de média móvel.
- **O que faz continuar:** o app lida bem com a irregularidade dela em vez de assumir renda fixa.

### Persona 4 — Diego, o analítico

- **Perfil:** 33 anos, engenheiro de software, gosta de dados e quer entender padrões finos dos próprios gastos.
- **Dores:** apps fechados não deixam ele explorar; planilha dá trabalho; quer perguntas ad-hoc.
- **Objetivos:** fazer perguntas abertas ("compare meu gasto com delivery vs supermercado nos últimos 6 meses"); exportar dados.
- **Comportamentos:** explora a fundo, testa limites, valoriza transparência e a possibilidade de ver/exportar tudo.
- **Funcionalidades-chave:** chat com IA, exportação de dados, transparência sobre fontes das respostas, open source.
- **Riscos de experiência:** desconfia de respostas sem fonte; abandona se perceber a IA "inventando" números.
- **O que faz continuar:** respostas auditáveis (a IA mostra de quais dados tirou cada número) e poder ver o código.

---

## 3. Objetivos do produto

### Negócio

- Criar um projeto open source relevante e tecnicamente respeitado (estrelas, forks, uso real).
- Demonstrar maturidade de produto _e_ de engenharia em um único artefato de portfólio.
- Construir uma base arquitetural escalável que comporte integrações futuras (Open Finance) sem reescrita.
- Reduzir a fricção da análise financeira pessoal a ponto de o autor usar o próprio produto no dia a dia ("dogfooding").

### Produto

- Dar clareza sobre hábitos financeiros em menos de 5 minutos após o primeiro dado.
- Automatizar a categorização com qualidade alta (meta: >85% de acerto sem correção manual).
- Permitir perguntas em linguagem natural com respostas fundamentadas em dados reais.
- Gerar insights acionáveis e proativos (não só reativos).
- Ajudar o usuário a reduzir gastos e quitar dívidas com planos concretos.
- Ser confiável e seguro com dados sensíveis por padrão.

### Experiência do usuário

- Reduzir a sensação de complexidade financeira; traduzir dados em linguagem simples.
- Evitar tom alarmista ou julgador — o produto é um copiloto, não um juiz.
- Ajudar a decidir melhor sem prometer certezas absolutas.
- Ser visualmente claro, confiável e acessível em desktop e mobile.

---

## 4. Proposta de valor

- **One-liner:** Converse com seu dinheiro. O FinSight AI transforma seus extratos em respostas claras.
- **Elevator pitch:** O FinSight AI é um copiloto financeiro pessoal e open source. Você importa extratos ou lança gastos manualmente, e ele categoriza tudo automaticamente, monta seu dashboard, e responde perguntas em linguagem natural sobre a sua vida financeira — sempre mostrando de onde tirou cada número. Diferente de planilhas, não dá trabalho; diferente de apps fechados, é transparente sobre seus dados e ainda te ajuda a montar um plano para quitar dívidas e bater metas.

**Benefícios principais:** clareza imediata, categorização sem esforço, respostas auditáveis, planos acionáveis de economia e quitação, controle total dos próprios dados.

**Diferenciais:** chat fundamentado (tool calling sobre dados reais, sem alucinar números), transparência sobre fontes, suporte a entrada manual + importação, módulo de dívidas com estratégia, open source.

**Casos de uso:** entender gastos do mês; achar assinaturas esquecidas; planejar quitação de dívidas; acompanhar metas; suavizar fluxo de caixa de renda variável; exportar dados para análise própria.

**Limites do produto / o que ele NÃO promete:**

- Não é aconselhamento financeiro profissional, jurídico ou de investimento — é uma ferramenta de organização e análise. `Risk`
- Não garante retornos, economia específica ou quitação em prazo determinado; projeções são estimativas.
- Não executa transações nem movimenta dinheiro.
- No MVP, não conecta automaticamente a bancos (sem Plaid/Open Finance — isso é `Future`).
- Não substitui um contador para questões fiscais.

---

## 5. Escopo do MVP

### Must Have

- Autenticação (OAuth) e onboarding mínimo (moeda, objetivo principal, consentimento de dados).
- Lançamento manual de transações (despesa/receita/transferência) + recorrências.
- Importação de CSV com preview, mapeamento de colunas, validação e deduplicação.
- Categorização (manual + sugestão automática com confirmação).
- Dashboard com saldo, receitas, despesas, evolução mensal, top categorias e últimas transações.
- Listagem de transações com busca, filtros, edição, exclusão e detalhe.
- Empty states, loading e error states de qualidade.

### Should Have

- Chat com IA (tool calling sobre dados reais) e histórico de conversa.
- Importação de PDF (parsing de extratos).
- Insights proativos básicos (gasto incomum, aumento de categoria, assinaturas).
- Metas financeiras com acompanhamento de progresso.
- Módulo de dívidas com estratégia de quitação.

### Could Have

- Relatórios mensais com resumo gerado por IA e exportação PDF/CSV.
- Aprendizado de categorização a partir das correções do usuário.
- Projeções de fluxo de caixa.
- Categorização em lote.

### Won't Have Now (`Future`)

- Integrações bancárias automáticas (Plaid / Open Finance) e webhooks.
- Multi-usuário / contas compartilhadas / família.
- App mobile nativo (o MVP é web responsivo).
- Multi-moeda simultânea (MVP: moeda única por usuário).
- Storybook publicado (decisão na Fase 2).

---

## 6. Funcionalidades do produto

> Formato resumido por funcionalidade. As entidades de dados citadas estão detalhadas na seção 10.

### 6.1 Autenticação e onboarding

- **Objetivo:** permitir entrada segura e capturar o mínimo de contexto para personalizar a experiência.
- **Problema que resolve:** fricção de cadastro e falta de contexto inicial para os insights.
- **Usuário-alvo:** todas as personas.
- **Fluxo:** login OAuth → (se primeiro acesso) onboarding de 3 passos: moeda padrão → objetivo financeiro principal → consentimento sobre uso de dados e explicação de IA/privacidade → dashboard com empty state guiado.
- **Estados:** novo usuário (onboarding), usuário recorrente (vai direto ao dashboard), sessão expirada (re-login).
- **Regras de negócio:** sessão via JWT; consentimento obrigatório antes de qualquer processamento de IA; logout invalida a sessão.
- **Critérios de aceite:** usuário cria conta com OAuth e cai no onboarding; preferências persistem; logout funciona; sem consentimento, IA fica desabilitada.
- **Dados:** `User`, `UserProfile`.
- **Erros:** falha de OAuth, e-mail já existente em outro provider.
- **Segurança:** nunca logar tokens; consentimento auditável.
- **Telemetria:** `signup_completed`, `onboarding_step_completed`, `onboarding_completed`, `time_to_first_value`.
- **MVP:** sim. **Future:** preferências avançadas, 2FA.

### 6.2 Dashboard financeiro

- **Objetivo:** dar uma leitura do mês em um relance.
- **Fluxo:** ao entrar, vê cards de saldo/receita/despesa/economia, gráfico de evolução, top categorias, últimas transações, insights e alertas.
- **Estados:** sem dados (empty com CTA para importar/lançar), dados parciais (1 conta só), dados completos.
- **Regras:** período padrão = mês corrente; valores sempre com moeda do perfil.
- **Critérios de aceite:** métricas batem com a soma das transações do período; empty state oferece importar/lançar; insights aparecem quando há base de dados suficiente.
- **Dados:** `Transaction`, `Category`, `AIInsight`.
- **Telemetria:** `dashboard_viewed`, `insight_clicked`.
- **MVP:** sim (insights são Should Have).

### 6.3 Gestão de transações

- **Objetivo:** ser a fonte da verdade dos lançamentos, vindos de import ou manual.
- **Fluxo:** lista agrupada por data → clicar abre painel de detalhe → editar categoria/nota/valor; criar manual via formulário; excluir com confirmação.
- **Estados:** lista cheia, vazia, filtrada sem resultados, erro de carregamento.
- **Regras:** transação pertence a exatamente um usuário e uma conta; origem (`manual`/`import`/`recurring`) é registrada e imutável; soft delete.
- **Critérios de aceite:** CRUD completo; busca e filtros funcionam; recategorização persiste; badge de origem visível.
- **Dados:** `Transaction`, `Category`, `Tag`, `Account`.
- **Telemetria:** `transaction_created_manual`, `transaction_recategorized`, `transaction_deleted`.
- **MVP:** sim. **Future:** tags avançadas, anexos.

### 6.4 Importação de dados

- **Objetivo:** trazer extratos para dentro com o mínimo de erro.
- **Fluxo:** upload CSV/PDF → parsing → mapeamento de colunas (CSV) → preview com validação por linha → deduplicação → confirmação → persistência → resumo.
- **Estados:** upload em progresso, parsing, preview, erros por linha, concluído, falha.
- **Regras:** importações duplicadas detectadas por hash (data+valor+descrição+conta); confirmação obrigatória antes de salvar; histórico auditável; rollback do job quando possível.
- **Critérios de aceite:** CSV importa com mapeamento; duplicatas sinalizadas e não duplicadas; erros por linha exibidos; histórico registrado.
- **Dados:** `ImportJob`, `ImportRow`, `UploadedFile`, `Transaction`.
- **Erros:** arquivo inválido/corrompido, formato não reconhecido, linha malformada.
- **Segurança:** limite de tamanho; validação de tipo; arquivo varrido e descartado após processamento conforme política. `Risk` (dados sensíveis em arquivos).
- **Telemetria:** `import_started`, `import_completed`, `import_failed`, `import_rows_error_count`.
- **MVP:** CSV sim; PDF é Should Have.

### 6.5 Categorização inteligente

- **Objetivo:** classificar transações sem trabalho manual.
- **Fluxo:** transação chega → IA sugere categoria com score de confiança → usuário confirma/corrige → (futuro) sistema aprende regra recorrente.
- **Regras:** sugestões NÃO são aplicadas automaticamente sem confirmação, salvo se o usuário ativar isso nas configurações; correções têm prioridade sobre a IA.
- **Critérios de aceite:** sugestão exibe confiança; correção persiste; aplicação em lote pede confirmação.
- **Dados:** `Transaction`, `Category`.
- **Telemetria:** `category_suggested`, `category_accepted`, `category_corrected`.
- **MVP:** categorização manual + sugestão simples. **Future:** aprendizado por regras, lote.

### 6.6 Chat com IA financeira

- **Objetivo:** responder perguntas abertas com base nos dados reais do usuário.
- **Fluxo:** usuário pergunta → IA decide quais _tools_ chamar → consulta dados → responde com streaming, citando os dados usados → usuário dá feedback (👍/👎).
- **Estados:** ocioso (com sugestões), pensando/consultando, streaming, erro, rate limit atingido.
- **Regras:** toda resposta indica que foi gerada por IA; números vêm de tool calls (não de "memória"); disclaimers quando a pergunta pede aconselhamento; escopo limitado a finanças do próprio usuário. `Risk` (alucinação, prompt injection).
- **Critérios de aceite:** respostas usam dados reais via tools; fontes exibidas; streaming funciona; feedback registrado; sem dados de outros usuários jamais.
- **Dados:** `AIConversation`, `AIMessage`, `AIEmbedding`, todas as tools de leitura.
- **Telemetria:** `ai_question_asked`, `ai_tool_called`, `ai_response_feedback`, `ai_tokens_used`.
- **MVP:** Should Have (núcleo do diferencial).
- **Exemplos de perguntas:** onde mais gastei esse mês; quanto gastei com delivery nos últimos 3 meses; o que posso reduzir; minha renda cobre meus gastos fixos; previsão para os próximos 2 meses; quais assinaturas recorrentes tenho; meu gasto com cartão aumentou; qual categoria mais impactou o orçamento.

### 6.7 Insights e recomendações

- **Objetivo:** apontar proativamente o que merece atenção.
- **Fluxo:** job analisa dados → gera insights com severidade → usuário vê, aplica, ignora ou marca como útil.
- **Regras:** insight tem severidade e status; ignorar remove da lista; recomendações acionáveis quando possível.
- **Critérios de aceite:** insights gerados com base em regras/IA; severidade visível; ações (aplicar/ignorar/útil) funcionam.
- **Dados:** `AIInsight`.
- **Telemetria:** `insight_generated`, `insight_applied`, `insight_dismissed`, `insight_marked_useful`.
- **MVP:** Should Have (versão por regras antes de IA).

### 6.8 Relatórios

- **Objetivo:** consolidar períodos e permitir exportação.
- **Fluxo:** escolher período/tipo → ver cards + gráficos + tabela → resumo por IA → exportar CSV/PDF.
- **Critérios de aceite:** relatório por mês/categoria/período; exportação funciona; comparação entre períodos.
- **Dados:** `Transaction`, `Category`, `AIInsight`.
- **MVP:** Could Have.

### 6.9 Metas financeiras

- **Objetivo:** dar direção e acompanhamento a objetivos.
- **Fluxo:** criar meta (valor, prazo, categorias relacionadas) → acompanhar progresso → receber projeção e recomendação da IA.
- **Regras:** meta pertence ao usuário; progresso calculado a partir de transações/aportes; status (ativa/concluída/atrasada).
- **Critérios de aceite:** CRUD de metas; progresso correto; projeção exibida.
- **Dados:** `FinancialGoal`.
- **MVP:** Should Have.

### 6.10 Integrações (`Future`)

- **Objetivo:** sincronizar dados bancários automaticamente.
- **Inclui:** Plaid, Open Finance, webhooks, estado de conexão, reautorização, sincronização, logs, segurança.
- **Dados:** `IntegrationConnection`, `WebhookEvent`.
- **MVP:** não. Toda a arquitetura deve deixar o "encaixe" pronto (origem da transação já prevê `integration`).

### 6.11 Configurações

- **Objetivo:** dar controle de perfil, segurança, privacidade e dados.
- **Inclui:** perfil, moeda, dia de fechamento, preferências, notificações, limites/modelo de IA, consentimentos, exportar dados, excluir conta, gerenciar integrações (Future).
- **Regras:** usuário pode exportar e excluir todos os seus dados (LGPD/GDPR); exclusão é irreversível e confirmada.
- **Critérios de aceite:** exportação gera JSON/CSV; exclusão remove dados; toggles de notificação persistem.
- **Dados:** `UserProfile`, `NotificationPreference`, `AuditLog`.
- **MVP:** sim (perfil, moeda, privacidade básica, export/delete).

---

## 7. Requisitos funcionais

**Auth**

- RF001 — O usuário deve conseguir criar conta e autenticar via OAuth.
- RF002 — O sistema deve manter sessão segura via JWT e permitir logout.
- RF003 — O sistema deve exigir consentimento de uso de dados antes de processar IA.

**Onboarding**

- RF010 — O usuário deve definir moeda padrão no primeiro acesso.
- RF011 — O usuário deve informar um objetivo financeiro principal.
- RF012 — O sistema deve registrar a conclusão do onboarding.

**Dashboard**

- RF020 — O sistema deve exibir saldo, receitas, despesas e economia do período.
- RF021 — O sistema deve exibir evolução mensal e top categorias.
- RF022 — O sistema deve exibir empty state quando não houver dados.

**Transactions**

- RF030 — O usuário deve criar, editar e excluir transações manualmente.
- RF031 — O usuário deve buscar, filtrar e ordenar transações.
- RF032 — O usuário deve recategorizar e adicionar notas/tags.
- RF033 — O sistema deve registrar a origem de cada transação.

**Import**

- RF040 — O usuário deve importar transações via CSV.
- RF041 — O sistema deve permitir mapeamento de colunas e preview antes de salvar.
- RF042 — O sistema deve detectar e sinalizar duplicatas.
- RF043 — O sistema deve manter histórico auditável de importações.
- RF044 — O usuário deve importar via PDF (`Should Have`).

**Categories**

- RF050 — O sistema deve sugerir categorias automaticamente para transações.
- RF051 — O sistema deve exibir a confiança da sugestão.
- RF052 — O sistema não deve aplicar sugestões sem confirmação, salvo configuração explícita.

**AI Chat**

- RF060 — O usuário deve perguntar em linguagem natural sobre suas finanças.
- RF061 — O sistema deve responder via streaming usando tool calling sobre dados reais.
- RF062 — O sistema deve indicar as fontes/dados usados na resposta.
- RF063 — O sistema deve registrar conversas e permitir feedback.
- RF064 — O sistema deve sinalizar que a resposta foi gerada por IA.

**Insights**

- RF070 — O sistema deve gerar insights com severidade e status.
- RF071 — O usuário deve poder aplicar, ignorar ou marcar insight como útil.

**Reports**

- RF080 — O usuário deve gerar relatórios por mês/categoria/período (`Could Have`).
- RF081 — O usuário deve exportar relatórios em CSV/PDF.

**Goals**

- RF090 — O usuário deve criar, editar e excluir metas.
- RF091 — O sistema deve acompanhar progresso e exibir projeção.

**Integrations (`Future`)**

- RF100 — O sistema deve conectar contas via Plaid/Open Finance.
- RF101 — O sistema deve processar webhooks de sincronização.

**Settings**

- RF110 — O usuário deve editar perfil, moeda e preferências.
- RF111 — O usuário deve exportar todos os seus dados.
- RF112 — O usuário deve excluir a conta e todos os dados.

---

## 8. Requisitos não funcionais

- **Segurança:** isolamento de dados por usuário em toda query; tokens nunca logados; validação de toda entrada com Zod.
- **Privacidade:** conformidade com LGPD/GDPR; dados nunca usados para treino; export e delete self-service.
- **Performance:** dashboard < 1s com dados em cache; importação de 1.000 linhas < 10s; streaming de IA começa em < 2s.
- **Acessibilidade:** WCAG 2.1 AA; navegação por teclado; foco visível; gráficos com alternativa textual.
- **Observabilidade:** tracing distribuído (OpenTelemetry), erros (Sentry), métricas de API e de custo de IA.
- **Escalabilidade:** arquitetura stateless no app; cache em Redis; índices adequados no Postgres.
- **Resiliência:** falha de IA não derruba o app (degrada graciosamente); importação com rollback.
- **Testabilidade:** lógica de negócio em services puros, testável sem I/O.
- **DX:** setup local com um comando; seed de dados; tipos compartilhados.
- **Custo de IA:** rate limit por usuário; cache de respostas frequentes; escolha de modelo (Haiku para tarefas baratas). `Risk`
- **Auditoria:** ações sensíveis (export, delete, import) registradas em `AuditLog`.
- **Manutenibilidade:** separação clara por domínio; convenções documentadas.

---

## 9. Regras de negócio

1. Toda transação pertence a exatamente um usuário e não é acessível por outros (`Risk` se violado).
2. Dados financeiros nunca cruzam entre usuários — todo acesso filtra por `userId`.
3. Importações duplicadas são detectadas por hash de (data + valor + descrição + conta).
4. Sugestões de IA não são aplicadas automaticamente sem confirmação, exceto se o usuário ativar essa opção.
5. O sistema sempre indica quando uma resposta foi gerada por IA.
6. O sistema não apresenta aconselhamento financeiro como certeza absoluta; projeções têm disclaimer.
7. O usuário pode exportar e excluir todos os seus dados a qualquer momento.
8. O histórico de importação é auditável e imutável.
9. Integrações externas armazenam apenas o necessário (tokens cifrados, dados mínimos).
10. A origem de uma transação (`manual`/`import`/`recurring`/`integration`) é registrada e imutável.
11. Exclusão usa soft delete no produto; hard delete só no fluxo de exclusão de conta.

---

## 10. Modelo de dados conceitual

> Detalhamento físico (campos, índices, constraints) está em `architecture.md`. Aqui é a visão de produto.

| Entidade                 | Responsabilidade                           | Relacionamentos                        | Nota de segurança              | MVP    |
| ------------------------ | ------------------------------------------ | -------------------------------------- | ------------------------------ | ------ |
| `User`                   | Identidade e autenticação                  | 1:1 `UserProfile`; 1:N quase tudo      | Raiz do isolamento por usuário | Sim    |
| `UserProfile`            | Preferências (moeda, objetivo, fechamento) | 1:1 `User`                             | —                              | Sim    |
| `Account`                | Conta/origem (Nubank, Itaú, dinheiro)      | N:1 `User`; 1:N `Transaction`          | —                              | Sim    |
| `Transaction`            | Lançamento financeiro                      | N:1 `User`, `Account`, `Category`      | Núcleo sensível                | Sim    |
| `Category`               | Categoria de gasto/receita                 | 1:N `Transaction`                      | —                              | Sim    |
| `Tag`                    | Marcação livre                             | N:N `Transaction` via `TransactionTag` | —                              | Could  |
| `TransactionTag`         | Junção transação↔tag                       | —                                      | —                              | Could  |
| `ImportJob`              | Um processo de importação                  | N:1 `User`; 1:N `ImportRow`            | Auditável                      | Sim    |
| `ImportRow`              | Linha de um import                         | N:1 `ImportJob`                        | —                              | Sim    |
| `UploadedFile`           | Arquivo enviado                            | N:1 `User`/`ImportJob`                 | Descarte pós-processo          | Sim    |
| `AIConversation`         | Sessão de chat                             | N:1 `User`; 1:N `AIMessage`            | —                              | Should |
| `AIMessage`              | Mensagem (user/assistant/tool)             | N:1 `AIConversation`                   | Sem PII em logs                | Should |
| `AIInsight`              | Insight gerado                             | N:1 `User`                             | —                              | Should |
| `AIEmbedding`            | Vetor para RAG                             | N:1 `User`/`Transaction`               | Isolado por usuário            | Should |
| `FinancialGoal`          | Meta financeira                            | N:1 `User`                             | —                              | Should |
| `Debt`                   | Dívida/empréstimo                          | N:1 `User`                             | —                              | Should |
| `IntegrationConnection`  | Conexão bancária                           | N:1 `User`                             | Tokens cifrados                | Future |
| `WebhookEvent`           | Evento recebido                            | N:1 `IntegrationConnection`            | —                              | Future |
| `AuditLog`               | Trilha de ações sensíveis                  | N:1 `User`                             | Append-only                    | Sim    |
| `NotificationPreference` | Toggles de notificação                     | 1:1/N:1 `User`                         | —                              | Sim    |

> Nota: adicionei `Debt` ao modelo porque o módulo de dívidas (tela 6) virou um diferencial do produto e não estava na lista original.

---

## 11. Fluxos principais

Para cada fluxo: passo a passo, sucesso, erro, empty, dados, atenção.

1. **Criar conta + onboarding** — OAuth → moeda → objetivo → consentimento → dashboard vazio guiado. _Erro:_ OAuth falha → retry. _Atenção:_ não pedir dado demais.
2. **Primeira transação manual** — Lançamentos → tipo → preencher → salvar → aparece no dashboard. _Empty:_ CTA destacado. _Atenção:_ validar valor/data.
3. **Importar CSV** — upload → mapear colunas → preview → resolver duplicatas → confirmar → resumo. _Erro:_ linha inválida sinalizada sem bloquear as válidas.
4. **Importar PDF** — upload → parsing → preview (sem mapeamento manual) → confirmar. _Atenção:_ qualidade do parser varia por banco. `Risk`
5. **Corrigir categorias** — abrir transação → trocar categoria → (opcional) aplicar a similares. _Atenção:_ confirmação antes de lote.
6. **Perguntar à IA** — digitar → IA chama tools → streaming com fontes → feedback. _Erro:_ IA indisponível → mensagem clara, dados ainda acessíveis. _Atenção:_ nunca inventar números.
7. **Ver dashboard** — entrar → métricas + gráficos + insights. _Empty/parcial:_ estados dedicados.
8. **Criar meta** — definir valor/prazo/categorias → acompanhar → projeção da IA.
9. **Relatório mensal** — período → cards/gráficos/tabela → resumo IA → exportar.
10. **Conectar integração** (`Future`) — escolher banco → OAuth do provedor → sincronizar.
11. **Exportar dados** — Configurações → exportar → JSON/CSV. _Atenção:_ registrar em auditoria.
12. **Excluir conta** — Configurações → confirmar (dupla confirmação) → hard delete → logout.

---

## 12. Experiência de interface

- **Rotas principais:** `/dashboard`, `/chat`, `/transactions`, `/import`, `/entries` (lançamentos), `/categories`, `/goals`, `/debts`, `/reports`, `/settings`, `/onboarding`, `/auth`.
- **Layout:** AppShell com sidebar fixa (desktop) + topbar; conteúdo com PageHeader consistente.
- **Menu lateral:** grupos "Principal" (dashboard, chat, transações, importar, lançamentos) e "Análise" (categorias, metas, dívidas, relatórios) + configurações.
- **Topbar:** logo, notificações, avatar/menu de conta.
- **Breadcrumbs:** apenas em telas profundas (ex.: detalhe de importação). Caso contrário, PageHeader basta.
- **Empty/loading/error states:** componentes dedicados e reutilizáveis (ver design-system.md).
- **Feedbacks:** toasts para ações (salvo, importado, excluído); modais para confirmações destrutivas; drawer/painel lateral para detalhe de transação.
- **Componentes principais:** MetricCard, ChartCard, TransactionRow/List, AIChat, InsightCard, ImportPreviewTable, GoalProgressCard, DebtCard.
- **Mobile:** sidebar vira drawer/bottom-nav; tabelas viram listas; filtros colapsáveis; ações primárias sempre acessíveis.
- **Desktop:** master-detail (lista + painel), grid de 12 colunas no dashboard.

---

## 13. Métricas de produto

- **Ativação:** % que conclui onboarding; % que adiciona o primeiro dado (manual ou import).
- **Tempo até primeiro valor (TTFV):** minutos entre signup e primeiro dashboard com dados.
- **Retenção:** D1/D7/D30; usuários ativos semanais.
- **Engajamento de dados:** transações criadas/importadas; importações concluídas vs falhas.
- **IA:** perguntas feitas; tool calls por pergunta; feedback positivo/negativo; tokens/custo por usuário.
- **Insights:** gerados, visualizados, aplicados, ignorados.
- **Metas:** criadas; % concluídas.
- **Relatórios:** gerados; exportações.
- **Qualidade:** taxa de erro de importação; taxa de correção de categoria (proxy de acerto da IA).
- **Funil de onboarding:** taxa de conclusão por passo.

---

## 14. Riscos e cuidados

| Item                                              | Tipo   | Impacto | Probabilidade | Mitigação                                                                     |
| ------------------------------------------------- | ------ | ------- | ------------- | ----------------------------------------------------------------------------- |
| Vazamento/cruzamento de dados entre usuários      | `Risk` | Crítico | Baixa         | Isolamento por `userId` em toda query; testes de autorização; revisão.        |
| Dados sensíveis em arquivos importados            | `Risk` | Alto    | Média         | Limite de tamanho, validação de tipo, descarte pós-processo, sem PII em logs. |
| Alucinação de IA (números inventados)             | `Risk` | Alto    | Média         | Números só via tool calls; exibir fontes; testes com mocks; disclaimers.      |
| Prompt injection (via descrição de transação/PDF) | `Risk` | Alto    | Média         | Sanitização; separar dados de instruções; escopo de tools restrito.           |
| Custo de IA descontrolado                         | `Risk` | Médio   | Média         | Rate limit, cache, modelo barato para tarefas simples, orçamento por usuário. |
| Importação incorreta (parsing PDF)                | `Risk` | Médio   | Alta          | Preview obrigatório, confirmação, rollback, suporte incremental por banco.    |
| Confiança do usuário (tom/segurança)              | `Risk` | Alto    | Média         | Tom não-julgador; transparência de dados; sem promessas absolutas.            |
| Complexidade/escopo do MVP                        | `Risk` | Médio   | Alta          | Escopo Must Have enxuto; IA e PDF como Should; integrações como Future.       |
| Interface densa demais                            | `Risk` | Médio   | Média         | Hierarquia clara, empty states, progressive disclosure.                       |
| Dependência de APIs externas                      | `Risk` | Médio   | Baixa (MVP)   | Integrações fora do MVP; abstração de provider quando entrarem.               |
| LGPD/GDPR                                         | `Risk` | Alto    | Baixa         | Consentimento, export/delete, auditoria, minimização de dados.                |

---

## 15. Roadmap de produto

- **Fase 0 — Setup e fundação:** base técnica, design system, banco, auth, CI/CD.
- **Fase 1 — MVP manual:** auth, dashboard básico, transações manuais, categorias, gráficos.
- **Fase 2 — Importação:** CSV (e depois PDF), validação, preview, histórico.
- **Fase 3 — IA financeira:** chat, tool calling, insights, categorização inteligente.
- **Fase 4 — Relatórios e metas:** relatórios, metas, dívidas, projeções, exportação.
- **Fase 5 — Integrações (`Future`):** Plaid/Open Finance, webhooks, sincronização.
- **Fase 6 — Hardening:** observabilidade, segurança avançada, E2E, performance, docs OSS.

> Detalhamento em versões (0.1 → 1.0) está em `roadmap.md`.
