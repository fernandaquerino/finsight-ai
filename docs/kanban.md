# FinSight AI — Kanban Board Setup

## Columns

| Column      | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| Backlog     | Everything not yet refined/prioritized                       |
| Ready       | Refined, meets the Definition of Ready, ready to start       |
| In Progress | In active development (1 per person ideally)                 |
| Code Review | PR open, awaiting review                                      |
| QA          | In verification (manual/E2E tests, criteria validation)      |
| Done        | Merged, deployed to preview/prod, criteria met               |

## Recommended labels

`frontend` · `backend` · `ai` · `database` · `design-system` · `security` · `testing` · `docs` · `infra` · `bug` · `enhancement` · `good first issue` · `help wanted`

Control labels: `Decision Needed` · `Risk` · `Future` · `blocked`.

## Milestones

Aligned with the roadmap: `v0.1 Foundation`, `v0.2 Manual MVP`, `v0.3 Import MVP`, `v0.4 AI MVP`, `v0.5 Reports/Goals/Debts`, `v1.0 Production`.

## Priorities

`P0` critical (blocks) · `P1` high · `P2` medium · `P3` low. Use as a label or project field.

## Branch convention

```
main                      # production
feat/<epic>-<n>-slug      # feature  → feat/06-02-transaction-list
fix/<slug>                # fix      → fix/dashboard-empty-state
chore/<slug>              # maintenance task
docs/<slug>               # documentation
```

## Commit convention (Conventional Commits)

```
feat(transactions): add grouped list with master-detail
fix(dashboard): correct monthly total aggregation
chore(ci): cache npm store
docs(architecture): add ingestion flow diagram
test(ai): mock model in chat e2e
```

Types: `feat` `fix` `chore` `docs` `test` `refactor` `perf` `style` `build` `ci`.

## Definition of Ready

An issue is ready to move to "Ready" when:

- [ ] It has a clear description, goal and scope.
- [ ] It has verifiable acceptance criteria.
- [ ] It has an estimate and a priority.
- [ ] Dependencies identified and unblocked.
- [ ] Labels applied.
- [ ] (If UI) a visual reference or screen pattern indicated.

## Definition of Done

An issue is "Done" when:

- [ ] Acceptance criteria met.
- [ ] Code reviewed and approved in a PR.
- [ ] Lint, typecheck and tests passing in CI.
- [ ] Relevant tests added (unit/integration/e2e as appropriate).
- [ ] Per-user isolation verified (if it touches data).
- [ ] Basic a11y verified (if UI).
- [ ] No regression in the preview deploy.
- [ ] Documentation updated if needed.
