# Guia de Colaboração com IA — FinSight AI

> Como usar IA durante o desenvolvimento sem perder autonomia técnica.
> Este é um guia para você, não para a IA.

---

## 1. Objetivo do guia

A IA é uma ferramenta poderosa — mas só quando você sabe o que está fazendo com ela.

**Use IA como:**

- Par de programação (pair programming)
- Revisora técnica
- Mentora de engenharia
- Geradora de alternativas e trade-offs
- Auxiliar de documentação
- Auxiliar de estratégia de testes
- Auxiliar de debugging estruturado

**A IA não substitui:**

- Sua decisão técnica e arquitetural
- Seu entendimento do produto e dos usuários
- Sua revisão crítica do código gerado
- Sua responsabilidade pela qualidade
- Sua responsabilidade por segurança e privacidade
- Seu pensamento de engenharia — análise, síntese, julgamento

**Regra de ouro:** código que você não entende não entra. Se a IA gerou e você não sabe explicar, você ainda não terminou.

---

## 2. Como usar IA como engenheira sênior

A diferença entre usar IA como júnior e como sênior está no que você pede.

| Postura júnior              | Postura sênior                            |
| --------------------------- | ----------------------------------------- |
| "Me dá o código"            | "Qual é o trade-off entre as abordagens?" |
| Aceitar a primeira resposta | Questionar e pedir alternativas           |
| Confiar na IA para decidir  | Usar a IA para informar a sua decisão     |
| Copiar sem ler              | Ler diff linha por linha                  |
| Pedir solução               | Pedir análise de risco                    |

**Práticas concretas:**

- **Pedir trade-offs, não só código.** "Quais são as vantagens e desvantagens de usar Server Action vs Route Handler aqui?"
- **Pedir plano antes de implementação.** "Antes de codar, me mostre o plano: arquivos, dependências, riscos."
- **Pedir riscos.** "Quais são os riscos de segurança ou de performance nessa abordagem?"
- **Pedir alternativas.** "Existe outra forma de fazer isso? Quando eu escolheria uma vs a outra?"
- **Pedir estratégia de testes.** "O que eu preciso testar aqui? Quais são os edge cases críticos?"
- **Pedir revisão arquitetural.** "Esse design vai escalar quando tivermos integrações bancárias?"
- **Pedir análise de impacto.** "Essa mudança afeta o que mais no sistema?"
- **Pedir checklist de produção.** "O que eu preciso verificar antes de mergear isso?"
- **Pedir explicação de decisões.** "Por que você escolheu essa abordagem? O que eu deveria saber sobre isso?"
- **Pedir revisão de PR.** "Revise como Staff Engineer. Aponte severidade de cada problema."
- **Pedir as perguntas difíceis.** "Que perguntas uma pessoa sênior me faria sobre essa implementação?"

---

## 3. Modos de trabalho com IA

Use o modo certo para cada momento do trabalho.

### Product Thinking Mode

**Quando:** você tem uma ideia vaga e precisa transformar em algo estruturado.
**Use para:** definir requisitos, fluxos de usuário, critérios de aceite, escopo do MVP, personas.
**Prompt modelo:**

```
Atue como Product Manager sênior. Tenho esta ideia para o FinSight AI: [ideia].
Me ajude a transformar em: problema a resolver, usuário-alvo, fluxo principal,
critérios de aceite e o que deve ficar de fora do MVP.
```

### Architecture Mode

**Quando:** você precisa tomar uma decisão estrutural — onde algo vai, como se comunica, quais são os limites.
**Use para:** discutir estrutura de pastas, separação de responsabilidades, padrões, trade-offs de design.
**Prompt modelo:**

```
Atue como arquiteto full-stack. Preciso decidir [decisão]. Me mostre:
opções disponíveis, trade-offs de cada uma (escala, testabilidade, segurança, DX),
impacto no FinSight AI, e me faça perguntas para ajudar na decisão.
Não decida por mim — me ajude a pensar.
```

### Implementation Mode

**Quando:** a issue está clara, o design está definido, e você vai codar.
**Use para:** implementar uma issue pequena com o padrão do projeto.
**Prompt modelo:**

```
Atue como Senior Software Engineer. Implemente esta issue seguindo os padrões
do CLAUDE.md e da arquitetura do FinSight AI.

Antes de editar, me mostre o plano: arquivos que serão criados/modificados,
abordagem técnica, decisões tomadas. Depois, implemente de forma incremental.
Ao fim, liste: arquivos alterados, decisões tomadas, testes necessários, riscos.
```

### Refactor Mode

**Quando:** o código funciona mas está difícil de entender, testar ou manter.
**Use para:** melhorar sem mudar comportamento.
**Prompt modelo:**

```
Atue como Staff Engineer. Refatore este código preservando comportamento.

Antes de começar: quais são os problemas do código atual? Quais são os riscos
da refatoração? Como eu posso garantir que o comportamento não mudou?
Proponha o plano incremental antes de executar.
```

### Debug Mode

**Quando:** tem um bug e você não sabe a causa raiz.
**Use para:** investigação estruturada — não para chutar soluções.
**Prompt modelo:**

```
Atue como engenheiro sênior com estratégia de debugging determinística.
Não chute. Levante hipóteses ordenadas por probabilidade. Para cada hipótese,
me diga como verificar (comando, log, test). Só prossiga com a próxima hipótese
após confirmar ou descartar a anterior. Ao encontrar a causa raiz, proponha
a correção mínima e um teste de regressão.

Erro: [mensagem de erro]
Contexto: [o que estava fazendo, stack, logs relevantes]
```

### Test Mode

**Quando:** você implementou algo e precisa definir o que testar.
**Use para:** criar estratégia de testes, identificar edge cases, escrever casos.
**Prompt modelo:**

```
Atue como QA Engineer + Senior Frontend Engineer. Analise esta feature/componente
e proponha: testes unitários (casos críticos + edge cases), testes de integração,
testes E2E, testes de acessibilidade e possíveis regressões. Priorize pelos riscos
mais altos do FinSight AI (isolamento por usuário, dados financeiros, IA).
```

### Review Mode

**Quando:** você terminou a implementação e quer um olhar crítico antes do PR.
**Use para:** revisão como Staff Engineer — arquitetura, segurança, performance, testes.
**Prompt modelo:**

```
Atue como Staff Engineer revisando meu PR no FinSight AI. Avalie:
arquitetura, simplicidade, manutenibilidade, tipagem, segurança, privacidade,
performance, acessibilidade, testes, observabilidade, alinhamento com produto.

Para cada problema encontrado: severidade (crítico/alto/médio/baixo), descrição,
impacto, sugestão de correção. Me mostre o que eu devia ter pensado antes.
```

### Learning Mode

**Quando:** você usou algo que não conhecia bem e quer solidificar o aprendizado.
**Use para:** entender o que foi feito, fixar conceitos, preparar-se para perguntas de entrevista.
**Prompt modelo:**

```
Atue como mentor de engenharia sênior. Acabei de implementar [feature].
Me explique: quais conceitos eu pratiquei, quais decisões foram mais importantes
e por quê, onde eu deveria prestar mais atenção no futuro.
Depois, me faça 5 perguntas para validar meu entendimento — como se fosse
uma revisão técnica ou entrevista.
```

---

## 4. Prompts reutilizáveis

Salve esses prompts. Use sempre que o momento pedir.

### Planejar uma issue

```
Atue como Tech Lead no FinSight AI. Leia esta issue e me ajude a criar
um plano de implementação. Antes de qualquer código:

1. Identifique dependências (outras issues, features, dados)
2. Liste arquivos prováveis de criar/modificar
3. Aponte riscos técnicos (segurança, performance, dados sensíveis)
4. Liste decisões em aberto que preciso tomar
5. Sugira estratégia de testes
6. Estime complexidade (P/M/G)

Só depois disso, me mostre o plano passo a passo.

Issue: [colar a issue aqui]
```

### Implementar uma issue

```
Atue como Senior Software Engineer no FinSight AI. Implemente esta issue
com mudanças pequenas e focadas, seguindo os padrões do CLAUDE.md.

Antes de editar: me mostre o plano (arquivos, abordagem, decisões).
Durante: implemente incrementalmente.
Depois: liste arquivos alterados, decisões tomadas, testes necessários, riscos.

Issue: [colar a issue aqui]
```

### Revisar meu código

```
Atue como Staff Engineer revisando meu PR no FinSight AI.

Avalie com foco em: arquitetura, legibilidade, segurança (especialmente
isolamento por userId e dados financeiros), performance, acessibilidade,
testabilidade e manutenção.

Para cada problema: severidade (crítico/alto/médio/baixo), o que está errado,
por que importa, como corrigir.

Código: [colar o diff ou arquivos aqui]
```

### Criar testes

```
Atue como QA Engineer + Senior Frontend Engineer no FinSight AI.

Analise este componente/feature e proponha:
- Testes unitários (casos críticos + edge cases + erros esperados)
- Testes de integração (fluxo completo)
- Testes E2E (cenário principal + cenário de falha)
- Testes de acessibilidade

Priorize pelos maiores riscos do projeto: isolamento por usuário,
dados financeiros, importação de arquivo, tool calling da IA.

Feature/componente: [descrição ou código]
```

### Debugar erro

```
Atue como engenheiro sênior com estratégia de debugging determinística.

Não chute. Processo:
1. Levante hipóteses por probabilidade
2. Para cada hipótese, diga como verificar (comando, log, teste)
3. Só avance após confirmar/descartar
4. Ao encontrar a causa raiz, proponha correção mínima + teste de regressão

Erro: [mensagem completa]
Contexto: [o que estava fazendo]
Stack trace: [se houver]
Logs relevantes: [se houver]
```

### Refatorar

```
Atue como Staff Engineer no FinSight AI. Refatore este código preservando
comportamento existente.

Antes de começar:
- Quais são os problemas do código atual?
- Quais os riscos da refatoração?
- Como garantir que o comportamento não mudou?
- Qual é o plano incremental?

Só execute após eu aprovar o plano.

Código: [colar aqui]
```

### Melhorar arquitetura

```
Atue como arquiteto full-stack no FinSight AI. Avalie esta decisão
arquitetural que estou considerando.

Me traga: trade-offs, impacto na escala, testabilidade, segurança, DX,
performance, e pelo menos duas alternativas com quando usar cada uma.
Me faça perguntas que me ajudem a decidir — não decida por mim.

Decisão: [descrever aqui]
```

### Criar documentação

```
Atue como Technical Writer. Documente esta feature do FinSight AI.

Inclua: objetivo, problema que resolve, fluxo principal, decisões técnicas
relevantes, como usar, edge cases, limitações conhecidas e como testar.
Escreva para um contribuidor open source que está vendo o código pela
primeira vez.

Feature: [descrição ou código]
```

### Preparar PR

```
Atue como Tech Lead revisando meu PR antes de abrir no GitHub.

Com base nessas mudanças, me ajude a escrever uma descrição de PR clara com:
- Contexto e motivação
- O que foi mudado (sem repetir o diff)
- Como testar localmente
- Riscos identificados
- Screenshots (me diga onde capturar)
- Checklist do FinSight AI

Mudanças: [diff ou descrição]
```

### Aprender com a implementação

```
Atue como mentor de engenharia sênior. Acabei de implementar esta feature
no FinSight AI.

Me explique:
1. Quais conceitos importantes eu pratiquei?
2. Quais decisões foram mais relevantes e por quê?
3. Onde eu deveria prestar mais atenção (segurança, performance, manutenção)?
4. O que eu poderia ter feito diferente?
5. Me faça 5 perguntas como se fosse uma revisão técnica ou entrevista.

Feature: [descrever o que foi implementado]
```

---

## 5. Checklist antes de pedir código para a IA

Responda essas perguntas antes de abrir o chat. Se não souber responder, essa é a primeira conversa — não pedir código ainda.

- [ ] Qual problema estou resolvendo?
- [ ] Qual é o comportamento esperado (critérios de aceite)?
- [ ] Quais arquivos provavelmente serão afetados?
- [ ] Existe padrão parecido já no projeto que posso seguir?
- [ ] Quais testes precisam existir depois?
- [ ] Há risco de segurança ou privacidade (dados financeiros, userId, logs)?
- [ ] Isso entra no MVP ou é melhoria futura?
- [ ] Essa abstração é realmente necessária agora?
- [ ] Qual é o menor incremento que entrega valor?

---

## 6. Checklist depois que a IA gerar código

Antes de aceitar qualquer código gerado:

- [ ] Eu entendi cada linha do que foi gerado?
- [ ] O código segue os padrões do CLAUDE.md e da arquitetura do projeto?
- [ ] Há `any` desnecessário ou tipo errado?
- [ ] Há lógica de domínio dentro de componente de UI?
- [ ] Toda query filtra por `userId`?
- [ ] Há tratamento de erro (loading, error, empty)?
- [ ] Há acessibilidade básica (labels, foco, aria)?
- [ ] Há testes ou, pelo menos, estratégia de teste definida?
- [ ] Há risco de dado sensível em log?
- [ ] A solução é a mais simples que resolve o problema?
- [ ] Eu conseguiria explicar cada decisão em uma revisão de PR ou entrevista?

---

## 7. Como evitar dependência da IA

A IA acelera, mas você precisa manter o músculo técnico.

- **Ler diff linha por linha.** Nunca aceitar código que você não leu.
- **Reescrever partes manualmente.** Especialmente na primeira vez que usa um padrão novo.
- **Pedir explicação sem aceitar cegamente.** "Por que você fez assim?" — e questionar a resposta.
- **Fazer commits pequenos.** Se algo der errado, você sabe exatamente o que causou.
- **Implementar primeiro uma versão simples.** Depois pedir revisão da IA, não o contrário.
- **Usar IA para revisar, não só para gerar.** "Aqui está o que eu escrevi — o que você mudaria?"
- **Manter diário técnico.** Ao final de cada sessão de desenvolvimento, anotar: o que aprendi, o que foi difícil, o que faria diferente.
- **Escrever decisões em ADRs.** `docs/decisions/` — uma decisão arquitetural por arquivo.
- **Fazer perguntas de aprendizagem.** Após cada feature, usar o Learning Mode.
- **Nunca mergear código que você não entende.** Regra inegociável.

---

## 8. Como usar o projeto para crescer como sênior

O FinSight AI não é só um portfólio — é um laboratório de crescimento.

- **Escrever ADRs.** Para cada decisão arquitetural relevante, documentar o porquê.
- **Criar documentação técnica genuína.** Não só "como usar" mas "por que foi feito assim".
- **Pensar em observabilidade como parte da feature.** "O que eu precisaria logar/medir para saber se isso está funcionando?"
- **Pensar em segurança antes, não depois.** "O que pode dar errado com dados financeiros aqui?"
- **Pensar em acessibilidade como critério de aceite.** Não como checklist final.
- **Pensar em DX** — setup, mensagens de erro, documentação, seed — são parte do produto.
- **Pensar em testes antes da implementação.** Escrever os critérios de teste antes do código.
- **Saber justificar trade-offs** para qualquer decisão técnica que tomou.
- **Quebrar problemas grandes em entregas pequenas** que funcionam completamente.
- **Fazer review do próprio PR** antes de pedir revisão de alguém.
- **Medir impacto.** "Como eu saberia que essa feature entregou valor?"
- **Criar issues bem descritas.** A qualidade da sua issue reflete sua clareza de pensamento.
- **Manter roadmap realista.** Saber o que está no MVP e o que não está — e defender isso.

---

## 9. Rotina recomendada de desenvolvimento com IA

### Antes de começar

1. Escolher uma issue com critérios de aceite claros (não começar por issues vagas).
2. Ler a issue completamente e verificar se tem tudo que precisa.
3. Usar o **prompt "Planejar uma issue"** para criar o plano.
4. Revisar o plano — ajustar escopo se necessário antes de começar.
5. Confirmar com você mesma: "eu entendo o que vai ser feito?"

### Durante a implementação

1. Implementar em pequenos passos — um componente, uma função, uma rota de cada vez.
2. Pedir revisão parcial antes de avançar para a próxima camada.
3. Rodar `npm test` e `npm type-check` a cada passo relevante.
4. Corrigir antes de continuar — não acumular problemas.
5. Documentar decisões no momento em que surgem (não depois).

### Antes de abrir PR

1. Usar o **prompt "Revisar meu código"** para uma revisão completa.
2. Rodar o checklist de revisão da seção 6.
3. Garantir que testes existem e passam.
4. Usar o **prompt "Preparar PR"** para escrever a descrição.
5. Confirmar riscos e estratégia de rollback se for algo crítico.

### Depois do PR

1. Registrar aprendizados no diário técnico.
2. Criar follow-up issues para melhorias identificadas mas não implementadas.
3. Atualizar documentação se algum comportamento mudou.
4. Usar o **Learning Mode** para fixar os conceitos da implementação.
5. Refletir: "o que eu faria diferente se começasse essa issue do zero?"

---

## 10. Prompt mestre para trabalhar uma issue

Use este prompt toda vez que for começar uma issue nova.

```
Atue como Tech Lead e Senior Software Engineer no FinSight AI.

Vou te passar uma issue para trabalharmos juntos. Siga este processo:

**Fase 1 — Entendimento**
Leia a issue. Se algo for ambíguo ou bloqueador, me faça no máximo 2 perguntas.
Não pergunte o que você pode inferir do contexto (CLAUDE.md, arquitetura existente).

**Fase 2 — Plano**
Antes de qualquer código, me mostre:
- Arquivos que serão criados ou modificados
- Abordagem técnica e padrões que serão usados
- Decisões em aberto que eu preciso tomar
- Riscos (segurança, dados financeiros, isolamento por userId, performance)
- Estratégia de testes (o que testar, como, prioridade)

Aguarde minha aprovação do plano antes de implementar.

**Fase 3 — Implementação**
Implemente incrementalmente — uma camada de cada vez (db → service → api → UI).
A cada etapa, me mostre o que foi feito antes de avançar.
Siga os padrões do CLAUDE.md: tipagem forte, sem any, componentes pequenos,
isolamento por userId em toda query, sem dados sensíveis em logs.

**Fase 4 — Testes**
Crie ou atualize testes relevantes. Priorize: isolamento por usuário,
regras de negócio, edge cases de importação, tools de IA.

**Fase 5 — Validação**
Me diga como rodar: lint, typecheck, testes unitários, E2E do fluxo afetado.

**Fase 6 — Resumo**
Ao final, me entregue:
- Arquivos criados/modificados
- Decisões técnicas tomadas e por quê
- O que eu deveria revisar com mais atenção
- Follow-ups recomendados (marcar como Future)
- Uma pergunta que uma pessoa sênior me faria sobre essa implementação

Issue:
[COLAR A ISSUE AQUI]
```

---

## 11. Prompt mestre para review sênior

Use para revisar qualquer implementação antes de mergear.

```
Atue como Staff Engineer revisando código do FinSight AI — uma plataforma
financeira pessoal com dados sensíveis, open source e production-ready.

Avalie a implementação pelos seguintes critérios. Para cada problema
encontrado, informe: severidade (crítico / alto / médio / baixo),
descrição clara do problema, por que importa, e sugestão de correção.

**Arquitetura**
- Está na camada correta? (UI vs service vs repository)
- Viola algum padrão da arquitetura do projeto?
- Criou abstração prematura ou complexidade desnecessária?

**Simplicidade e manutenibilidade**
- Está mais complexo do que precisa ser?
- É fácil de entender em 6 meses?
- Nomes são claros e descritivos?

**Tipagem**
- Há `any` desnecessário?
- Tipos explícitos nas bordas?
- Tipos de retorno claros em funções públicas?

**Segurança**
- Toda query filtra por `userId` da sessão?
- Há validação Zod em todo input de API?
- Dados financeiros em algum log?
- Upload sem validação de tipo/tamanho?

**Privacidade (LGPD/GDPR)**
- Dados sensíveis coletados desnecessariamente?
- Dados persistidos além do necessário?
- Export/delete funcionariam corretamente?

**Performance**
- N+1 queries?
- Falta de índice óbvio?
- Dado recalculado que poderia ser cacheado?

**Acessibilidade**
- Labels em inputs?
- Focus ring visível?
- Alternativa textual em gráficos?
- Navegação por teclado funcional?

**Testes**
- Cobre os casos críticos e edge cases?
- Há teste de isolamento por usuário?
- Tool de IA testada com mock (não API real)?

**Observabilidade**
- Eventos de telemetria relevantes?
- Erros logados sem dados sensíveis?
- Custo de IA contabilizado?

**DX**
- Fácil de rodar localmente?
- Mensagens de erro úteis?

**Alinhamento com produto**
- A implementação resolve o problema da issue?
- Respeita o escopo do MVP?
- Algo que deveria ser `Future` foi implementado agora?

**Dívida técnica**
- O que foi deixado para depois? Está documentado como follow-up?
- Algum `TODO` que vai virar problema?

Código para revisar:
[COLAR O DIFF OU ARQUIVOS AQUI]
```

---

## 12. Regras de ouro

- **IA acelera, mas você decide.** A responsabilidade pela qualidade é sua.
- **Código que você não entende não entra.** Nunca.
- **Primeiro clareza, depois sofisticação.** Solução simples que funciona > solução elegante que ninguém entende.
- **Toda feature crítica precisa de teste.** Especialmente as que tocam dados financeiros.
- **Dados financeiros exigem cuidado extra.** Validação, isolamento, sem PII em logs, consentimento.
- **Segurança e privacidade não são opcionais.** São critérios de aceite implícitos em toda feature.
- **Design System evita dívida visual.** Um token errado hoje é dez componentes para atualizar amanhã.
- **Observabilidade é parte da feature.** "Como eu saberia se isso quebrou em produção?"
- **PR pequeno é PR revisável.** PR grande ninguém revisa de verdade.
- **Sênior não é quem escreve mais código — é quem reduz risco e aumenta clareza.**
- **A IA é tão boa quanto sua pergunta.** Invista tempo no prompt; economize tempo no debug.
- **Nunca mergear sem entender.** Se não entendeu, não mergeou — volte para o Learning Mode.
