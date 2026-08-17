# ADR-0015: Good out of the box, before configurable

- Status: Accepted
- Date: 2026-08-17
- Decision owners: Rustam

## Context

Rustam put it plainly: the less small-scale customisation there is, the better — the library should
look good out of the box. This is a statement about what the library is for, and until now it has
been applied case by case without ever being written down. ADR-0012 dropped density for a version of
this reason. ADR-0010 refused a configurable overlay layer for another. Each was argued from
scratch.

The cost of not having it written down is visible in the token layer. `src/tokens/typography.css`
declares eleven size steps; three of them — `--kreo-text-20`, `--kreo-text-30` and `--kreo-text-48` —
are referenced by nothing at all, not even by a composite role. They exist because a scale looked
like the kind of thing that should be complete. Completeness was the argument, and it was never
tested against a use.

Every `--kreo-` custom property is public API under SemVer (`docs/ARCHITECTURE.md`). A token that
exists is a token a consumer may set, which makes it something this library has to keep working
across versions and has to reason about in every combination with every other token. Phase 8 is
`1.0.0`, after which removing one is a breaking change. So the surface being carried into `1.0.0` is
worth deciding on purpose rather than inheriting.

## Decision

**The library is a set of finished decisions, not a kit for making them.** A consumer installs it
and gets something that already looks right; configuration is what is left over after the decisions
have been made, not the product.

Concretely:

1. **A new `--kreo-` custom property needs a stated need now.** A real consumer or a real component
   has to be unable to do its job without it. Symmetry with an existing token, completeness of a
   scale, and "somebody might want to" are not needs.
2. **A token with no reference is removed, not kept.** If nothing in the library uses it, the library
   has not shown that it is the right value — it is an untested guess with a public name on it.
3. **Two tokens that resolve to the same value are one token.** Whichever the library actually uses
   stays; the other goes.
4. **Prefer composite roles over raw scales at the point of use.** `--kreo-type-body` is a decision;
   `--kreo-text-14` is a number. A consumer restyling a role changes something coherent; a consumer
   restyling a number changes whatever happens to reference it.
5. **A prop that only exists to let a consumer undo a default is not added.** The default is changed
   instead, or the default is defended.

None of this closes the door on theming. The theme contract in ADR-0001 — semantic aliases, one
attribute, no build step — is what a consumer is meant to reach for, and it stays.

## What this does not change

`--kreo-radius-full: 999px` stays as it is. Rustam asked whether `50%` would be better and whether
the token is needed at all, and the measurement says no on both counts.

`50%` is wrong, not merely different: `Badge` and `Progress` are not square, and a percentage radius
on a non-square box draws an ellipse rather than a pill. `999px` is the standard way to say "round
the ends however tall this happens to be", and it is doing exactly that.

The token stays because it is used, which is rule 2 read in the other direction. It is not
customisation for its own sake; it is the one name for a shape three components share, and removing
it would mean repeating a magic number in three stylesheets.

## Consequences

- The typography scale is cut from eleven sizes to four, and `--kreo-type-body-lg` is removed as a
  duplicate. That is this ADR's first application and is recorded separately in ADR-0016.
- Adding a token now costs an argument. That is the point, and it will occasionally be annoying.
- Some consumers will want a value the library does not expose. The answer is a CSS Module class
  name of their own over the top, or a request that the library change its mind — not a token added
  on the assumption that exposure is free. It is not free; it is a promise.
- This ADR is a rule about defaults, not a licence to remove props that carry real semantics. A prop
  that changes what a component *means* — `tone`, `variant`, `size` — is not customisation in the
  sense used here.
