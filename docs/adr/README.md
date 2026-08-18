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

## Decision queue

What the queue was opened with, and where each item stands. An entry leaves the list when an ADR
records it.

| Decision | Status |
| --- | --- |
| Single-package repository, npm, and package naming | ADR-0001 |
| ESM build, declarations, package exports, React peer range | ADR-0001, ADR-0006 |
| CSS Modules, semantic CSS variables, theme attribute, token prefix | ADR-0001 |
| Primitive strategy for `Dialog`, `Tooltip` and composite widgets | ADR-0010 |
| Who owns toast state, and how a toast is announced | ADR-0011 |
| Comfortable and compact density | ADR-0012 — dropped, not deferred |
| How `loading` and `disabled` differ on a button | ADR-0004 §5, amended by ADR-0014 |
| How much of the library a consumer is meant to configure | ADR-0015 |
| How many type sizes and weights the scale carries | ADR-0016 — applies ADR-0015, amends ADR-0005 |
| What a control's `size` prop controls | ADR-0017 — geometry, not type; amends ADR-0016 |
| npm publication and release authentication | ADR-0006 |
| Server rendering, and what is claimed about React Server Components | ADR-0018 |
| Whether the published stylesheet is layered | ADR-0019 — unlayered, and the contract stated |
| Storybook and test-runner responsibilities | open — settled in practice, never written down |
| Changesets instead of a hand-written changelog | ADR-0013 — declined; the changelog is written, not generated |
| Hosted documentation and visual-regression services | open — visual regression runs locally against committed baselines; adopting a hosted service would need this ADR |

Do not create empty ADRs merely to populate the directory. The remaining "settled in practice" entry
is honest rather than tidy: the arrangement works and nobody has had to defend it, which is precisely
when an ADR is cheap to write and expensive to skip.

