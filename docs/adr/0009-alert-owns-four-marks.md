# ADR-0009: `Alert` owns four marks

- Status: Accepted
- Date: 2026-08-15
- Decision owners: Rustam
- Narrows [ADR-0002](0002-no-external-font-or-icon-requests.md), which keeps an icon set out of the
  package; the rule itself is unchanged

## Context

ADR-0007 decided that a tinted `Alert` must carry an icon, because colour alone may not convey
meaning. ADR-0002 decided the package bundles no icon set, and that icons are `ReactNode` so
consumers bring their own.

Together those two make a component that requires something it cannot supply. Leaving the icon
entirely to the consumer turns "must carry an icon" into a hope: whoever forgets gets an alert whose
type is expressed by colour and nothing else, which is exactly the failure the requirement exists to
prevent.

## Decision

`Alert` ships four marks of its own — one per tone — and an `icon` prop that replaces them.

The marks are deliberately **not** an icon library:

- they are not exported from the package;
- they are not themeable, sized or named as a public API;
- they live inside the component's own folder and are used by nothing else;
- a consumer's `icon` replaces them entirely, so nobody is stuck with this drawing.

ADR-0002's rule stands as written. What it rules out is shipping an icon *set* for consumers to
draw from, and binding a public prop to a third-party glyph vocabulary. A component drawing its own
four shapes so it can keep a promise is a different thing, and the boundary is that these shapes
cannot be reached from outside `Alert`.

## Consequences

- The requirement from ADR-0007 is now enforceable rather than aspirational: an alert always has a
  mark, whether or not the consumer supplies one.
- Four small inline SVGs, about 700 bytes, on the CSS-and-markup side rather than the JavaScript
  path.
- The same argument will arrive again for any component that must not rely on colour alone — a
  future `Toast` most obviously. The test to apply is the boundary above: marks a component owns and
  nobody can import are fine; a set is not.
- If a third component needs the same four shapes, that is the signal to reconsider, because at
  that point they are a set in everything but name.

## Alternatives considered

- **Consumer supplies the icon, always.** Cleanest against ADR-0002 as literally worded, and it
  makes the icon requirement unenforceable. Rejected on that.
- **Drop the icon requirement.** Would leave tone carried by colour alone, which fails the rule the
  project applies everywhere else.
- **Ship a small public icon set.** The thing ADR-0002 exists to prevent, and it would commit the
  library to a visual vocabulary it has no reason to own.

## Review trigger

Revisit when a second component needs marks of its own, and reconsider entirely if a third does.
