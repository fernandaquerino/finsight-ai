# FinSight AI — Kanban Board Setup

## Colunas

| Coluna      | Significado                                                 |
| ----------- | ----------------------------------------------------------- |
| Backlog     | Tudo que ainda não foi refinado/priorizado                  |
| Ready       | Refinada, atende a Definition of Ready, pronta para começar |
| In Progress | Em desenvolvimento ativo (1 por pessoa idealmente)          |
| Code Review | PR aberto, aguardando revisão                               |
| QA          | Em verificação (testes manuais/E2E, validação de critérios) |
| Done        | Mergeado, deployado em preview/prod, critérios atendidos    |

## Labels recomendadas

`frontend` · `backend` · `ai` · `database` · `design-system` · `security` · `testing` · `docs` · `infra` · `bug` · `enhancement` · `good first issue` · `help wanted`

Labels de controle: `Decision Needed` · `Risk` · `Future` · `blocked`.

## Milestones

Alinhados ao roadmap: `v0.1 Foundation`, `v0.2 Manual MVP`, `v0.3 Import MVP`, `v0.4 AI MVP`, `v0.5 Reports/Goals/Debts`, `v1.0 Production`.

## Prioridades

`P0` crítica (bloqueia) · `P1` alta · `P2` média · `P3` baixa. Usar como label ou campo de projeto.

## Convenção de branches

```
main                      # produção
feat/<epic>-<n>-slug      # feature  → feat/06-02-transaction-list
fix/<slug>                # correção → fix/dashboard-empty-state
chore/<slug>              # tarefa de manutenção
docs/<slug>               # documentação
```

## Convenção de commits (Conventional Commits)

```
feat(transactions): add grouped list with master-detail
fix(dashboard): correct monthly total aggregation
chore(ci): cache npm store
docs(architecture): add ingestion flow diagram
test(ai): mock model in chat e2e
```

Tipos: `feat` `fix` `chore` `docs` `test` `refactor` `perf` `style` `build` `ci`.

## Definition of Ready

Uma issue está pronta para entrar em "Ready" quando:

- [ ] Tem descrição, objetivo e escopo claros.
- [ ] Tem critérios de aceite verificáveis.
- [ ] Tem estimativa e prioridade.
- [ ] Dependências identificadas e desbloqueadas.
- [ ] Labels aplicadas.
- [ ] (Se UI) referência visual ou padrão de tela indicado.

## Definition of Done

Uma issue está "Done" quando:

- [ ] Critérios de aceite atendidos.
- [ ] Código revisado e aprovado em PR.
- [ ] Lint, typecheck e testes passando no CI.
- [ ] Testes relevantes adicionados (unit/integration/e2e conforme o caso).
- [ ] Isolamento por usuário verificado (se toca dados).
- [ ] A11y básica verificada (se UI).
- [ ] Sem regressão em preview deploy.
- [ ] Documentação atualizada se necessário.
