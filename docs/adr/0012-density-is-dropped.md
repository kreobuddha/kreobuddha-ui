# ADR-0012: Density is dropped, not deferred

- Status: Accepted
- Date: 2026-08-16
- Decision owners: Rustam
- Supersedes the density lines in [ADR-0005](0005-visual-language.md)

## Context

Density has been promised since the project brief was written and deferred at every point since. It
appears in seven documents as future work: a goal in `PROJECT_BRIEF.md`, a product scenario next to
theme, a state and a story requirement in `COMPONENT_STANDARD.md`, a visual-priority item in
`QUALITY.md`, two Phase 1 lines and one Phase 5 deliverable in `ROADMAP.md`, and a consequence and
a review trigger in ADR-0005.

What was promised is concrete enough to name. Density would have been a token layer — the spacing
and control-height tokens resolving to two sets of values — selected by a host-level contract
alongside `data-kreo-theme`, giving every component a `comfortable` and a `compact` mode without
per-component branches. `ARCHITECTURE.md` records exactly that shape, and records that it waits for
a component that validates both modes.

Nineteen components have now shipped and none of them asked. Every slice that could have needed a
tighter control reached for the `sm` size instead, which is what the `sm`/`md`/`lg` scale is for.
No consumer has asked either, because the only consumers are this repository's own example and
fixture. Meanwhile `CLAUDE.md:67` already lists density among the values that deliberately diverge
from the original design source, so the repository currently promises in seven places something it
elsewhere describes as a settled divergence.

A promise that has survived five phases without a requirement behind it is not a deferral. Phase 5
is the phase that makes this repository legible to a stranger, and a stranger reading the goals
would reasonably expect density to arrive. It is not going to.

## Decision

Density is dropped from the documented scope of this project. There is no density token layer, no
`comfortable`/`compact` contract, and no host-level density attribute.

The `sm`/`md`/`lg` size scale on individual components is the whole of what this library offers for
control sizing, and that is stated as the answer rather than as a placeholder.

The seven documents that carried the promise are edited to remove it. Accepted ADRs are records and
are not rewritten: ADR-0005's density consequence and its review trigger stand as history, and this
record supersedes them. `CLAUDE.md:67` also stands, because it is already accurate.

No code changes. Density was never implemented, so there is nothing to remove from `src/`, from the
tokens, or from the public API. This decision changes documents only.

## Consequences

- The stated scope becomes honest: nothing in the repository promises work that is not coming.
- The size scale carries the full weight of control sizing. A consumer who wants a tighter table
  row sets `size="sm"` and accepts that spacing around it does not follow.
- Data-dense layouts are the real cost. A table of many rows, or a settings panel meant to show
  more at once, would want the whole spacing scale to tighten together — and `size="sm"` on each
  control does not do that. This is the scenario that reopens the decision.
- ADR-0005's review trigger loses one of its three conditions. The other two — a monospace need and
  the dark statuses — are unaffected.
- One less axis in every visual and story matrix. `COMPONENT_STANDARD.md` no longer asks for a
  density state or a density story, and `QUALITY.md` no longer prioritises a density screenshot.

## Alternatives considered

- **Keep deferring.** Rejected because it is what the last five phases did. The promise cost
  nothing to keep and therefore was never examined; Phase 5 is the point where documentation is
  read by someone who cannot ask.
- **Implement density now, in Phase 5.** Rejected: no requirement drives it, and building a token
  layer to close a documentation gap is the wrong direction. `CLAUDE.md` asks for the smallest
  design that satisfies the requirement now, and there is no requirement now.
- **Delete the promise silently.** Rejected. Seven documents changing with no record of why is
  exactly the drift this ADR directory exists to prevent, and the cost above is real enough to be
  worth writing down.
- **Extend the size scale instead — an `xs` size.** Rejected as a different decision with no demand
  behind it either, and one that would not solve the spacing problem density was meant to solve.

## Review trigger

Revisit when a real consumer builds a data-dense interface — a table or a list of many rows — and
demonstrates that per-component `size="sm"` leaves the layout too loose. Concrete evidence from a
consumer, not a preference stated in advance.
