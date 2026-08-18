# ADR-0019: The published stylesheet stays unlayered

- Status: Accepted
- Date: 2026-08-18
- Decision owners: Rustam

## Context

`@kreobuddha/ui/styles.css` contains no `@layer`. Every rule it ships is therefore an ordinary
rule, and a consumer overriding one competes with it on specificity first and document order
second — which means the order of their `import` statements decides who wins between two rules of
equal specificity.

That has never been written down. It has also never caused a problem: the one independent consumer
overrides nothing, because the library's answer to "make it look different here" is the token
layer, and custom properties are not affected by any of this.

`1.0.0` is where it stops being free to leave open. Introducing layers later moves every library
rule below every unlayered rule in the consumer's stylesheet — that is what a layer *is* — so a
consumer whose override currently loses would suddenly win, and one who carefully matched
specificity would find they no longer need to. The behaviour of existing styling changes without
any of their code changing. That is a major version, and the choice is therefore now or `2.0.0`.

## Decision

**No `@layer`, and the contract is stated instead.**

- library rules are unlayered, single-class, and documented as implementation details — class names
  are not public API, and have never been;
- a consumer who needs to override a rule wins by loading their stylesheet after
  `@kreobuddha/ui/styles.css`, which is the ordinary CSS answer and needs nothing from this
  package;
- the supported way to change how the library looks is the `--kreo-*` token layer, which resolves
  where a property is used and is unaffected by cascade order entirely.

## Consequences

- nothing changes for any consumer today, and the file is one decision less ambiguous;
- a consumer who puts their stylesheet first and expects to win is wrong, and now wrong against a
  written contract rather than against silence;
- adopting layers in `1.x` is not possible; it waits for a major version, which is the price of
  choosing now rather than the accident of not choosing;
- the check that keeps this honest already exists: `check:css` reads the built stylesheet, so a
  `@layer` arriving through a dependency or a build change would be visible in review rather than
  in a consumer's page.

## Alternatives considered

- **Wrap everything in `@layer kreo`.** The tidy answer, and the one most libraries reach for. It
  makes every consumer rule beat every library rule regardless of specificity, which is genuinely
  friendlier — for consumers who override rules. This one has none, and `ADR-0015` is explicit that
  the library ships finished decisions rather than a kit; a layer is a feature for the kit reading.
  Rejected on absent evidence, not on merit.
- **Layer only the token layer.** Rejected: custom properties do not participate in this problem,
  so it would be a change with no effect.
- **Leave it undecided until someone asks.** Rejected: after `1.0.0` the answer to that question
  becomes "wait for `2.0.0`", and arriving there by default is worse than arriving by decision.

## Review trigger

A consumer whose own styles conflict with the library's and who cannot resolve it by load order —
the evidence being their stylesheet, not a preference. If layers are adopted then, they go into the
next major version with a migration note in [`MIGRATION.md`](../MIGRATION.md).
