# Workbench

**Devkit Console** — a settings and diagnostics interface for a fictional local developer tool,
composed entirely from `@kreobuddha/ui`. It exists to answer a question the component gallery
cannot: do these components make a coherent interface when they have to work together?

Run it from the repository root:

```bash
npm run check:workbench
```

That packs the package, installs the tarball here, type-checks, builds, and runs the Playwright
`workbench` project against the built output. To look at it rather than check it, install the
tarball once with the command above and then:

```bash
npm --prefix examples/workbench run dev
```

## What it is not

Not a second published package, not a workspace member, and not the consumer fixture.
`examples/react-vite` is a contract fixture: it imports every export into a bare `<main>` to prove
the package boundary works, and deliberately has no layout. This one has layout, navigation and a
flow through it, and imports only what it actually uses.

It resolves the library the same way the fixture does — the **packed tarball**, installed unsaved,
never `../../src` and never a bundler alias. `scripts/check-workbench.mjs` asserts that, because a
demonstration that reads the source tree demonstrates the source tree.

## What is deliberately absent

- **No backend and no mock-service layer.** Every value comes from `src/fixtures/`.
- **No timers.** The diagnostics placeholder state is entered and left by pressing a button, so
  both states are reachable and every screenshot of this page matches the last one.
- **No storage beyond the theme**, which is stored precisely because that is the thing being
  demonstrated.

## The theme is the host's job

`@kreobuddha/ui` publishes one theming contract — `data-kreo-theme="dark"` on a host element — and
deliberately stores nothing and reads no system preference. So the workbench does the other half
itself: `src/theme.ts` sets the attribute and remembers the choice in `localStorage`, and the
inline script in `index.html` applies it before the first paint. Fifteen lines, and they are the
documentation for what an application owes the library.

## What the browser run checks

`tests/workbench/console.spec.ts`, served from `dist` on port 6008:

- the keyboard-only flow — `Tab` through the header into the tab list, arrows between tabs, `Tab`
  onward to Save, and the unsaved-changes `Dialog` returning focus to the tab it interrupted;
- the theme surviving a reload;
- a 375px viewport with no horizontal overflow, on all three tabs.

It compares nothing against a baseline, so like `check:browser` it runs in CI.
