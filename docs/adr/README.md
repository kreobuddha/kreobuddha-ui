# Architecture Decision Records

Use ADRs for decisions that affect repository structure, runtime dependencies, public APIs,
compatibility, styling, tokens, testing, or releases.

## Status values

- `Proposed` — under discussion; not a source of truth yet.
- `Accepted` — current decision.
- `Superseded` — replaced by a newer ADR; link both records.
- `Rejected` — considered and not chosen; retain the reason.

## Naming

```text
0001-short-decision-title.md
0002-next-decision-title.md
```

Never reuse a number. Keep each record focused on one decision.

## Template

```md
# ADR-NNNN: Decision title

- Status: Proposed
- Date: YYYY-MM-DD
- Decision owners: Rustam

## Context

What concrete problem requires a decision now? Include verified constraints and avoid hypothetical
future requirements.

## Decision

State the chosen option and its scope.

## Consequences

List benefits, costs, compatibility effects, maintenance obligations, and verification changes.

## Alternatives considered

List credible alternatives and why they were not chosen now.

## Review trigger

State what new evidence would justify revisiting the decision.
```

## Initial decision queue

Create these ADRs only when the corresponding decision is actively reviewed:

1. Single-package repository, npm, and package naming.
2. ESM build, declarations, package exports, and React peer range.
3. CSS Modules, semantic CSS variables, theme attribute, and token prefix.
4. Storybook and test-runner responsibilities.
5. Primitive strategy for Dialog, Tooltip, and composite widgets.
6. Changesets and npm publication strategy.
7. Hosted documentation and visual-regression services.

Do not create empty ADRs merely to populate the directory.

