# Kreobuddha UI — Code Style

Personal style rules Rustam applies across projects, recorded here so this repository is
self-contained. They sit under `CLAUDE.md` and the accepted ADRs in the source-of-truth order:
where a rule collides with a decision this library has already accepted, the deviation is written
down below rather than resolved silently.

Formatting is not discussed: Prettier decides it. See `.prettierrc.json`.

## Applied

### Arrow functions with explicit return types

No `function` declarations anywhere — components, utilities, and internal handlers are all
arrow-function consts, and anything a module exports annotates its return type explicitly instead
of relying on inference.

```tsx
export const Button = ({ variant = 'filled' }: ButtonProps): ReactElement => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    // ...
  };

  return <button onClick={handleClick} />;
};
```

Enforced by `func-style` and `@typescript-eslint/explicit-module-boundary-types` in
`eslint.config.js`, so it cannot drift.

### One folder per component

A component lives in its own folder with its stylesheet, tests, and stories beside it, all named
after it. Deleting a component means deleting one folder.

```text
src/components/Button/
├── Button.tsx
├── Button.module.css
├── Button.stories.tsx
└── Button.test.tsx
```

### Conditional class names are composed, never interpolated

Template-literal class names accumulate stray spaces and forgotten branches. Class names are
composed from a helper that drops falsy values.

### Prettier

100-character print width, single quotes, `es5` trailing commas, `arrowParens: always`.
`npm run format` rewrites files; `npm run format:check` only reports.

## Deviations, and why

### Named exports, not a default export at the bottom

The house rule default-exports a component at the bottom of its file. Here every component is a
**named export only**: `ARCHITECTURE.md` fixes named exports as the package boundary, and a
default export would either be unreachable through the public barrel or create a second, parallel
way to import the same component. The rule's actual goal — a named function so React DevTools and
stack traces stay readable — is met by the named `const`.

### CSS Modules, not SCSS with BEM

The house rule pairs a component with a `.scss` file written in full BEM selectors, so that every
class name is greppable exactly as it appears in `className`.

This library uses plain CSS Modules, decided in
[ADR-0001](adr/0001-token-prefix-theme-attribute-and-styling-model.md). The reason BEM exists —
making class ownership unambiguous — is already handled by the module scope, and the greppability
argument inverts here: a CSS Module class **is** written literally in both files (`.button` in the
stylesheet, `styles.button` in the component), while the published class name is a generated hash
that no one should be searching for. Adding SCSS would also mean adding a compiler for syntax this
token-driven stylesheet does not use.

### The stylesheet is not imported first — it is not imported from TypeScript at all

The house rule puts a component's own stylesheet import above every other import. The CSS Module
import here does sit first, but the **token layer** is pulled in through a CSS `@import` inside
`Button.module.css` rather than from `src/index.ts`.

This is not a preference. TypeScript preserves side-effect imports in the declarations it emits,
and a `.css` specifier is not resolvable in a `.d.ts`, so importing the stylesheet from the entry
point made the published types fail to resolve for every consumer. Verified with
`@arethetypeswrong/cli`.

### No `@/` alias

Cross-folder imports use relative paths with an explicit `.js` extension. A path alias would have
to survive into the emitted declarations, where consumers cannot resolve it, and the `.js`
extension is what makes those declarations resolve under Node16 module resolution.

### A local helper instead of `clsx`

`clsx` would be this package's **first runtime dependency**, which `ARCHITECTURE.md` puts behind an
ADR. The behaviour needed here is three lines, so the rule's intent — never interpolate class names
into a template literal — is satisfied without adding a dependency to every consumer's bundle.
Revisit if the composition logic ever grows past trivial.

### `I`-prefixed interfaces: not applicable yet

The prefix marks data shapes — API payloads and stored documents. A frontend-only component library
has none; `ButtonProps` is a props interface, which the rule explicitly leaves unprefixed. The rule
applies the moment a real data shape appears.
