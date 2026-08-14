# Kreobuddha UI — Architecture

## Decision status

This document defines the intended architecture. During initialization, Claude must validate tool
compatibility and turn decisions that materially affect public API or repository structure into
accepted ADRs. It must not silently replace these constraints with a larger scaffold.

## Repository shape

Start with one publishable npm package in one repository. Test and documentation tooling may have
local configuration, but must not introduce another publishable package or a workspace boundary.

```text
kreobuddha-ui/
├── .storybook/
├── docs/
│   └── adr/
├── examples/
│   └── react-vite/          # added when packed-package smoke testing is introduced
├── src/
│   ├── components/
│   ├── styles/
│   ├── tokens/
│   └── index.ts
├── tests/                   # cross-component/package tests only
├── CLAUDE.md
├── INIT_PROMPT.md
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

`examples/react-vite` is an isolated, non-workspace consumer fixture with its own package metadata
and lockfile, or a temporary generated project if that proves simpler. It exists only to install the
packed tarball and must not become a second published package.

Do not introduce workspaces, Turborepo, a separate tokens package, or a documentation application
until a real limitation of the one-publishable-package structure is demonstrated.

## Dependency direction

```text
public index
    ↓
components
    ↓
internal primitives and utilities
    ↓
semantic tokens and shared styles
```

Rules:

- Consumers import only documented package exports.
- Components may use internal primitives; internal primitives never import public component
  barrels.
- Components do not import stories, tests, examples, or Storybook configuration.
- The isolated consumer fixture installs a packed package artifact when testing the public boundary.
- Circular dependencies are not accepted.

## Public package boundary

The initial intended export surface is:

- `.` for named React components and public types;
- `./styles.css` for the complete supported stylesheet;
- optionally `./tokens.css` only after a real tokens-only consumer use case is verified;
- `./package.json` if required by package tooling.

Additional component subpath exports are deferred. Internal source paths are not public API.

Package rules:

- ESM-only unless consumer evidence requires another format.
- Named exports only.
- `react` and `react-dom` are peer dependencies and are externalized from the bundle.
- The final React peer range is decided during initialization after compatibility verification.
- JavaScript should remain side-effect-free; emitted CSS must be declared intentionally.
- Published files are allowlisted.
- `dist` is generated and should not be committed unless an accepted ADR changes that policy.
- Package metadata remains private until publication is explicitly approved.

## Build

Vite library mode produces the JavaScript and the stylesheet; `tsc -p tsconfig.build.json` emits the
declarations. Three constraints were found by verification rather than chosen, and changing any of
them silently breaks the published package:

- **The JavaScript output preserves the module tree** (`preserveModules`). Bundling to one file left
  every `./components/….js` path in the emitted declarations pointing at something that does not
  exist.
- **No stylesheet is imported from TypeScript.** TypeScript keeps side-effect imports in the
  declarations it emits, and a `.css` specifier is not resolvable there, so the published types
  failed for every consumer. Component stylesheets pull in the token layer with a CSS `@import`
  instead.
- **The `@font-face` rules are joined to the built stylesheet afterwards** by
  `scripts/bundle-fonts.mjs`. Library mode inlines every asset it resolves as a base64 data URI with
  no opt-out, which would embed all eight font files and defeat their `unicode-range` split.

That script is the only custom build machinery in the package, and it exists for a documented tool
limitation rather than a preference.

Required properties:

- ESM output;
- TypeScript declarations matching public exports;
- extracted CSS;
- external React runtime;
- source maps if they do not expose unintended source material;
- deterministic output;
- no access to `window` or `document` during module evaluation;
- an inspectable package tarball;
- consumer smoke verification using the tarball.

## Styling

The intended baseline is plain CSS plus CSS Modules for component-local styles.

- No runtime CSS-in-JS.
- No Tailwind requirement in consuming applications.
- No global reset shipped by the library.
- Low specificity and predictable cascade behavior.
- CSS Modules class names are implementation details.
- Consumers may pass `className` and `style` to the root semantic element when the component API
  permits it.
- Logical properties are preferred where direction can matter.
- `prefers-reduced-motion` and `forced-colors` are handled where applicable.

Cascade layers may separate tokens and components if the browser support decision permits them:

```css
@layer kreobuddha.tokens, kreobuddha.components;
```

## Token model

The token values come from the design source named in ADR-0001 and are ported as authored, so the
reference ramps and semantic aliases arrive together rather than growing component by component.
What is still deliberately withheld is machinery: no token compiler, no generated scale, and no
component tokens beyond the ones a shipped component actually needs.

The conceptual layers are:

1. **Reference tokens** — raw palette, spacing, typography, radii, shadows, motion, and layers.
2. **Semantic tokens** — background, foreground, border, action, focus, disabled, and status roles.
3. **Component tokens** — introduced only where the semantic layer cannot express a stable component
   contract.

Components consume semantic or justified component tokens, not raw color values. Documented
semantic CSS custom properties are public API and follow SemVer.

Theme state belongs to the host application. The DOM contract is:

```html
<html data-kreo-theme="dark">
```

The library must not store theme preference or read system preference at module load. Light is the
default and needs no attribute; dark values remap the same semantic token names.

The public CSS custom property prefix is `--kreo-`. Both the prefix and the theme attribute are
settled in [ADR-0001](adr/0001-token-prefix-theme-attribute-and-styling-model.md), which also
records that token values are adopted from the separate Claude Design project rather than invented
here.

Density is handled by tokens rather than per-component branches. It is introduced only after the
first component validates both comfortable and compact modes.

## Component API

- Prefer native elements and native prop names.
- Extend native element props with precise omissions where appropriate.
- Public prop types use names such as `ButtonProps`, not internal data-interface conventions.
- `className` and `style` apply to the root semantic element.
- Refs are supported consistently according to the accepted React peer range.
- Controlled components use `value` and `onValueChange`; optionally `defaultValue` for explicitly
  supported uncontrolled behavior.
- Variants and sizes use documented string unions.
- Stable state selectors may use `data-state`, `data-disabled`, or `data-invalid` when justified.
- Do not expose polymorphic `as` or `asChild` APIs without an ADR and real consumer need.
- Third-party primitive types must not leak into public component types.

## Complex components

`Dialog`, `Tooltip`, and future composite widgets require a separate decision between:

- native platform behavior;
- an established accessible primitive library;
- a custom implementation.

Do not hand-roll focus trapping, dismissal layers, collision positioning, or composite keyboard
navigation merely to avoid a dependency. Equally, do not add a primitive library before a planned
component requires it. Record the decision and its effect on bundle size, public types, styling,
SSR, and accessibility testing in an ADR.

## Storybook and examples

Storybook is the intended component workbench and public static documentation surface. Stories are
deterministic canonical fixtures, not decorative screenshots.

The independent React/Vite example is a package-consumer contract test. It should eventually install
the packed tarball and must not import `src/` or use an alias that bypasses package exports.

## SSR and browser behavior

- Importing the package must not access browser globals.
- Browser APIs are used only in effects or event handlers with appropriate guards.
- Generated IDs must be stable across server and client rendering where components support SSR.
- Browser support is documented only after CI and manual smoke evidence exist.

## When to revisit architecture

Create or update an ADR when:

- adding a runtime dependency;
- adding a package or workspace boundary;
- changing package formats or exports;
- adding a public CSS variable category;
- choosing a complex-component primitive;
- changing React or browser support;
- changing the styling model;
- introducing release automation or a hosted visual-regression service.
