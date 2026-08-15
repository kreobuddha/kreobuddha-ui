# Component recipe

`COMPONENT_STANDARD.md` says what a good component **is**. This says what to **type**. It exists so
the mechanical part of a component is never re-derived, and it should be followed top to bottom.

Run `npm run new:component Name` first — it writes the four files below with the skeleton already in
place. Everything after that is filling in and deleting what does not apply.

## 1. The four files

```text
src/components/Name/
├── Name.tsx
├── Name.module.css
├── Name.stories.tsx
└── Name.test.tsx
```

No per-folder `index.ts`. The public barrel re-exports the component file directly; a folder barrel
is a file nothing imports, and a pure re-export module does not survive tree shaking, which leaves
the emitted declarations pointing at JavaScript that was never written.

`Name.module.css` opens with `@import '../../styles.css';`. Never import a stylesheet from the
`.tsx` file: TypeScript keeps side-effect imports in the declarations it emits, and a `.css`
specifier is not resolvable there, which breaks the published types for every consumer.

## 2. The export

Two lines in `src/index.ts`, alphabetically placed, with the `.js` extension so the declarations
resolve under Node16 module resolution:

```ts
export { Name } from './components/Name/Name.js';
export type { NameProps, NameTone } from './components/Name/Name.js';
```

## 3. Contrast pairs

Every foreground/background pairing the component puts on screen goes into the `PAIRS` list in
`scripts/check-contrast.mjs`. A pairing that is not in that list is not measured, in either theme.

`TEXT` is 4.5:1 and applies to anything read as words. `NON_TEXT` is 3:1 and applies to borders that
identify a control, focus rings, and status marks such as dots and icons.

Reuse an existing pair rather than adding a duplicate — most components put familiar colours on
familiar surfaces.

## 4. Tests

These run in jsdom, so they test behaviour and semantics only. Accessibility scanning is not done
here; the browser story run covers it, and duplicating it costs a test per component for a weaker
result.

Write, where they apply:

- role and accessible name;
- keyboard operation and focus movement;
- the controlled or uncontrolled contract, and callback timing;
- disabled, loading, read-only and invalid behaviour;
- `className` and native props reaching the root element, and `ref` pointing at it;
- anything a consumer reported as broken, as a regression test.

Do **not** assert layout. jsdom has none, so any assertion about size, overflow or painted colour is
meaningless there — put it in a story `play` function instead.

## 5. Stories

Every story becomes a test in the browser run, and every story is scanned by axe automatically.

- minimal usage;
- each variant and size, in one story per axis rather than a full grid;
- the meaningful states, edge cases and composition with a neighbouring component;
- a `play` function for anything needing real layout: focus rings, truncation, measured width;
- long content and a narrow container wherever layout could break.

## 6. The three documents that must move

- **`README.md`** — the prop table and the paragraphs describing behaviour a consumer cannot guess.
- **`CHANGELOG.md`** — an entry under `## [Unreleased]`, describing user-visible impact rather than
  the diff.
- **`docs/ROADMAP.md`** — the component's status on its phase.

## 7. Verification

`npm run test:one -- Name` while working: the unit project alone, under a second.

`npm run verify` before opening the pull request: format, lint, stylelint, types, all tests
including the browser run, contrast, build, Storybook build and the package contract. It must pass
before merge, and CI runs it again independently.

Look at the component in Storybook in **both themes** before calling it done. Nothing in the list
above catches a component that passes every check and looks wrong.

## 8. Release

One component, one release. Version bump, a new heading in the changelog, merge, tag; the publishing
workflow does the rest.
