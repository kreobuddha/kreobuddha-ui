# ADR-0001: Token prefix, theme attribute, and styling model

- Status: Accepted
- Date: 2026-08-14
- Decision owners: Rustam

## Context

A design system for this library was authored separately in a Claude Design project ("UI library
design system"). It defines a complete visual foundation — a warm neutral ramp, one evergreen
accent, semantic hues, type roles, spacing, shape, and motion — and it already expresses all of it
as CSS custom properties named `--kreo-*`, with dark mode selected by `[data-kreo-theme="dark"]`.

`ARCHITECTURE.md` had previously proposed `data-kui-theme` as the theme attribute and left the CSS
prefix open, requiring an accepted ADR before public release. Those two names now conflict, and the
conflict has to be resolved before any token ships, because documented semantic CSS custom
properties are public API under SemVer.

The design project also ships components as `.jsx` with inline style objects and a single global
`styles.css`. This repository's `COMPONENT_STANDARD.md` requires TypeScript components with
CSS Modules for component-local styles.

## Decision

1. The public CSS custom property prefix is **`--kreo-`**.
2. Dark mode is selected by **`data-kreo-theme="dark"`** on a host element, normally `<html>`.
   Light is the default and requires no attribute. Theme state belongs to the host application; the
   library never stores a preference nor reads `prefers-color-scheme` at module load.
3. Token values are adopted from the design project **as authored**, in three layers: reference
   ramps (`--kreo-neutral-*`, `--kreo-accent-*`, and the semantic hues), semantic aliases
   (`--kreo-surface-*`, `--kreo-text-*`, `--kreo-border-*`), and composite type roles
   (`--kreo-type-*`). Components reference semantic or composite tokens only, never a numeric ramp
   value.
4. Component-local styles use **CSS Modules in `.tsx` components**, not inline style objects and not
   a global stylesheet of component classes. The token layer stays plain global CSS, because tokens
   are the customization boundary and must be addressable by consumers.
5. Only the token layer and the component styles that Phase 1 actually needs are ported. The design
   project is the source for visual *values*; this repository remains the source for public API,
   semantics, and behavior.

## Consequences

- `ARCHITECTURE.md` is updated: `data-kui-theme` is replaced by `data-kreo-theme`, and the prefix is
  no longer an open question.
- Every `--kreo-*` custom property this library documents becomes public API. Renaming or removing
  one is a major version change; adding one is a minor change.
- Dark mode costs nothing per component: it is a remap of the same token names, so component CSS
  never branches on theme.
- Consumers who want a different look override semantic aliases, not component classes. CSS Module
  class names stay private.
- Porting is manual and value-by-value. The design project's `.jsx` sources are a reference for
  visual states, not code to copy — they use inline styles, mouse-driven hover state, and a
  `:focus-visible` check in JavaScript, all of which CSS handles natively and more correctly.

## Alternatives considered

- **Keep `--kui-` / `data-kui-theme`.** Rejected: `kui` exists only as a proposal in a document,
  while `kreo` is already implemented across seven token files, sixteen specimen cards, and seven
  components. Renaming buys nothing and invalidates the design source.
- **Adopt the design project's global stylesheet wholesale.** Rejected: it would make component
  class names public API by accident and contradicts `COMPONENT_STANDARD.md`.
- **Support both attributes during a transition.** Rejected: nothing has shipped, so there is
  nothing to transition from.

## Review trigger

Revisit if a real consumer needs multiple themes on one page (which would require scoping tokens to
a container rather than the document), if a second brand is ever supported, or if the design project
renames its own tokens.
