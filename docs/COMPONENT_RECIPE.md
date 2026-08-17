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

Then use it in the consumer fixture, `examples/react-vite/src/main.tsx`. That file is not a demo:
`npm run check:consumer` compares its imports against the published `dist/index.d.ts` and fails
with the missing name, because a component that ships without ever being used through the package
boundary is a component nobody has proven resolves there.

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

Then pick **one or two** of those stories for `tests/visual/protected-states.spec.ts` and run
`npm run check:visual:update` to record their baselines. One or two, not the matrix: a snapshot per
story would be hundreds of baselines, most re-photographing the same pixels, and a baseline nobody
reads is a baseline nobody reviews.

What earns a place is a state where the tokens do the work and no other check would notice a
change — the focus ring, the invalid treatment, a size scale, or whatever this component draws that
the others do not. Review the new baselines like code before committing them.

## 6. What the component owes its documentation

**The prop table is generated, so there is no table to write.** Storybook derives it from the
TypeScript types via `react-docgen`, and `tags: ['autodocs']` gives every component a Docs page
without anyone adding one. What that generator can only read, and never invent, is the prose beside
each prop — so the documentation work moved into the source:

- **JSDoc on the props themselves**, in the component's `Props` interface. A comment above a prop
  becomes its description in the published table. A prop with no comment ships as a bare name and a
  type, which is the new equivalent of an undocumented prop.
- **A JSDoc block directly above the exported component**, which `react-docgen` reads as the
  description at the top of that component's Docs page. This is where behaviour a consumer cannot
  guess from the types belongs — the keyboard model, focus handling, and what the component
  deliberately does not own — stated next to a live example instead of in a file far from the code.

Then the two documents that still must move by hand:

- **`CHANGELOG.md`** — an entry under `## [Unreleased]`, describing user-visible impact rather than
  the diff.
- **`docs/ROADMAP.md`** — the component's status on its phase.

**`README.md` is no longer one of them.** It links to the documentation site and lists the component
names; a new component earns one name in that list and nothing more. It carried about a hundred
hand-copied table rows until `0.16.0`, and every one was a promise to remember something at the
moment a prop changed.

## 7. Verification

`npm run test:one -- Name` while working: the unit project alone, under a second.

`npm run verify` before opening the pull request: format, lint, stylelint, types, all tests
including the browser run, contrast, build, Storybook build, the package contract and the consumer
fixture. It must pass before merge, and CI runs it again independently.

`npm run check:visual` compares the protected states against their baselines. It is the one check
CI cannot run for you — the baselines are macOS and the runners are Ubuntu — so a change to a token
or a component stylesheet that nobody runs it against is a change nobody has looked at.

Look at the component in Storybook in **both themes** before calling it done. Nothing in the list
above catches a component that passes every check and looks wrong.

## 8. Release

One component, one release. Version bump, a new heading in the changelog, merge, then run the
release workflow with that version. It publishes, tags the commit and writes the GitHub release
from the changelog heading — so the heading has to be there before the run, not after.

**The one exception: a batch that closes a phase may share a release.** When several components are
approved together as the remainder of a phase, their entries collect under `## [Unreleased]` and the
version is raised once, at the end, for all of them. What does not relax is the work itself: each
component is still designed, built and fully verified on its own, one at a time, before the next is
started. The batch is named in `docs/ROADMAP.md`, so the exception is written down rather than
inferred from a changelog with several components under one heading, and how the batch lands — one
pull request or one each — is decided there too. `0.15.0` — `Skeleton`, `Progress`, `Accordion`,
`Toggletip`, `Toast`, landed as a single pull request — was the first.
