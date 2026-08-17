# Kreobuddha UI — Component Standard

## Purpose

This document defines the minimum engineering contract for every public component. Component count
is not a success metric. A component is shipped only after its API, behavior, documentation, and
verification are coherent.

## Required design sequence

Before implementation, write down:

1. User problem and intended use.
2. Non-goals and explicitly unsupported behavior.
3. Public API and exported types.
4. Semantic element or ARIA pattern.
5. Accessible-name contract.
6. Keyboard and focus behavior.
7. Supported visual and behavioral states.
8. Required existing tokens and any proposed new token.
9. Stories and test cases.
10. Compatibility or dependency implications.

## Folder shape

The default colocated structure is:

```text
src/components/Button/
├── Button.tsx
├── Button.module.css
├── Button.stories.tsx
└── Button.test.tsx
```

There is no per-folder `index.ts`. The public barrel at `src/index.ts` re-exports the component
file directly, so a folder barrel is a file nothing imports — and a pure re-export module does not
survive the bundler's tree shaking, which left the emitted declarations pointing at a JavaScript
file that was never written.

Additional files are added only for a real concern, not to enforce symmetry. Cross-component test
helpers belong in a shared test location rather than being duplicated.

## Public API conventions

- Use named exports.
- Name props `ComponentNameProps`.
- Prefer native prop names such as `disabled`, `required`, `readOnly`, `name`, and `type`.
- Extend the root native element props where doing so preserves a clear contract.
- Omit conflicts explicitly rather than shadowing native behavior silently.
- `className` and `style` target the root semantic element.
- Event callbacks follow React/native conventions unless a controlled value API benefits from a
  focused callback such as `onValueChange`.
- Do not expose internal DOM structure, CSS Module names, primitive-library types, or implementation
  utilities as public API.
- Avoid boolean-prop combinations that create invalid states; prefer a small variant union or
  composition.
- Do not add polymorphic rendering without an accepted ADR.

## Controlled and uncontrolled behavior

- A component is controlled or uncontrolled only when the use case requires state ownership.
- Controlled: `value` plus `onValueChange`.
- Uncontrolled, when supported: `defaultValue` plus internal state.
- Do not switch modes after mount; warn or prevent ambiguous behavior in development if needed.
- Document default state, reset behavior, and callback timing.

## Semantics and accessibility

- Prefer a native element that already supplies required semantics and keyboard behavior.
- Add ARIA only when native semantics are insufficient.
- Every focusable interactive control must have an accessible name.
- Visible labels are preferred for form controls; descriptions and errors must be programmatically
  associated.
- Keyboard behavior follows platform conventions and relevant WAI-ARIA Authoring Practices for
  composite widgets.
- Focus-visible styling must be clearly visible and must not be removed without an equivalent.
- Disabled, read-only, loading, and invalid states must have explicit semantic behavior.
- Loading must not make an action ambiguous or cause accidental duplicate submission.
- Status must not be communicated by color alone.
- Motion must respect reduced-motion preference.
- Components must remain operable in forced-colors mode where applicable.
- Automated accessibility checks complement, but do not replace, keyboard and focus review.

## Styling and tokens

- Component-local styles use CSS Modules unless an accepted ADR changes the strategy.
- A component stylesheet declares its dependency on the token layer with `@import '../../styles.css'`
  rather than importing a stylesheet from the `.tsx` file. TypeScript keeps side-effect imports in
  the declarations it emits, where a `.css` specifier is not resolvable, which breaks the published
  types for every consumer.
- Any new foreground/background pairing must be added to `scripts/check-contrast.mjs`. A pairing
  that is not in that list is not measured.
- Theme-relevant values use semantic or justified component tokens.
- Do not use reference palette values directly in component styles.
- Do not hardcode a light-theme value and patch dark mode inside every component.
- Avoid `!important` except for a documented interoperability constraint.
- Keep specificity low and stable.
- Use logical properties when they improve RTL resilience.
- CSS Module class names are private.
- A new public CSS custom property requires documentation and SemVer consideration.

## States to consider

Not every component needs every state, but each applicable state must be deliberately accepted or
excluded:

- default;
- hover;
- pressed/active;
- focus-visible;
- selected/checked;
- disabled;
- read-only;
- loading;
- invalid;
- empty;
- long content;
- icon-only;
- light and dark themes;
- reduced motion;
- forced colors;
- RTL-sensitive layout.

## Story requirements

Stories are English, deterministic, and focused on behavior. Include applicable examples for:

- minimal usage;
- variants and sizes;
- meaningful states and edge cases;
- composition with adjacent components;
- keyboard or interaction flow via a `play` function;
- both themes;
- long content and narrow viewport where layout risk exists.

Do not duplicate a full Cartesian product of states if a smaller set proves the same contract.

## Test requirements

Tests should observe user-facing behavior:

- role and accessible name;
- state and semantic attributes;
- keyboard and pointer interaction;
- focus movement and restoration;
- callbacks and controlled behavior;
- disabled/loading/invalid behavior;
- regressions discovered during consumer adoption.

Avoid large DOM snapshots as the primary test. Test implementation details only when they are part of
the public contract.

## Definition of Done

A public component is done when:

- its purpose, API, semantics, states, and non-goals are documented;
- public props and exported types are intentional;
- native props and refs behave according to the project convention;
- semantic tokens replace theme-specific hardcoded values;
- focused behavior and interaction tests pass;
- automated accessibility checks pass for documented stories;
- keyboard and focus behavior has been manually reviewed where applicable;
- representative stories and English documentation exist;
- visual behavior has been inspected in both supported themes;
- package build, declarations, and public exports pass;
- the packed consumer still works when the public boundary changes;
- limitations and unverified claims are stated honestly;
- `CHANGELOG.md` gains an entry in the same pull request when the change is user-visible. The
  release policy asks for a written changelog rather than a changeset — see
  [ADR-0013](adr/0013-changesets-declined.md).

