# Kreobuddha UI — Quality Strategy

## Principle

Quality claims require observable evidence. A passing build does not prove component behavior, an
axe scan does not prove complete accessibility, and a Storybook story does not prove package
consumption. Each check has a defined responsibility.

## Verification layers

### 1. Static correctness

Purpose:

- TypeScript correctness;
- lint rules that catch defects;
- deterministic formatting;
- no accidental internal imports.

The non-mutating scripts that exist:

```text
npm run typecheck
npm run lint
npm run lint:css
npm run format:check
```

`lint:css` is Stylelint. It exists because ESLint does not look at stylesheets at all, so until it
was added an invalid property or a malformed value would have shipped silently. Note that it also
catches `no-descending-specificity`, which is a correctness signal in a cascade this flat.

`npm run format` also exists and **rewrites files**, as does `stylelint --fix`; never run either to
satisfy a check.

### 2. Unit and component behavior

Purpose:

- pure token or utility transformations;
- rendering and state transitions;
- user events and callbacks;
- controlled/uncontrolled contracts;
- semantic roles, names, and attributes.

Prefer behavior assertions through roles and accessible names. Avoid large DOM snapshots and tests
that merely repeat implementation details.

### 3. Story interactions

Storybook stories are canonical component fixtures. Interaction tests should cover representative
keyboard and pointer flows, not every cosmetic permutation.

`vitest.config.ts` defines two projects: `unit` runs the focused tests in jsdom, and `storybook`
runs every story in headless Chromium through `@storybook/addon-vitest`. A story's `play` function
becomes its test, so a story is documentation and a test without being written twice.

Use a `play` function for anything that needs real layout — measuring whether a label actually
overflows, or that a focus ring is painted. Those assertions are meaningless in jsdom, which has no
layout at all.

### 4. Automated accessibility

Run axe-based checks against documented component states. Treat serious or critical violations as
failures. Any temporary exception must include:

- exact affected story;
- reason;
- user impact;
- owner or follow-up issue;
- removal condition.

Automated scanning is only a first line of defense. It cannot prove correct focus movement,
meaningful announcements, complete keyboard behavior, or usable forced-colors presentation.

**Every story is scanned in a real browser** by the Storybook Vitest addon, with
`a11y: { test: 'error' }` in `.storybook/preview.tsx` — a violation fails the build. This is the
single automated accessibility gate, and no component writes its own axe test.

There used to be a second, jsdom-based scan per component. It was removed: jsdom neither lays out
nor paints, so it could not judge contrast, and it cost a hand-written test on every component for
a strictly weaker result. The browser scan covers every story automatically, which means new stories
are covered the moment they are written rather than when someone remembers to assert it.

Component tests in jsdom therefore cover behaviour and semantics only. Anything needing real layout
belongs in a story `play` function.

### 4a. Contrast

`npm run check:contrast` resolves the token graph in `src/tokens/colors.css`, measures every colour
pair a shipped component puts on screen in both themes, and exits non-zero below its WCAG 2.2
target — 4.5:1 for text, 3:1 for control borders and the focus ring. It runs in CI.

Every new pairing a component introduces must be added to the script's list, or it goes unmeasured
here. The two layers are complementary and neither replaces the other: the script covers documented
token pairings the components may not currently render, while the browser scan covers whatever a
story actually puts on screen, including combinations nobody thought to declare.

### 5. Manual accessibility

Some of the list below is no longer manual — see §5a. What stays manual is what a runner cannot
judge: what a screen reader actually announces.

For every interactive component, record applicable checks:

- keyboard-only operation;
- visible focus and predictable tab order;
- focus entry, movement, dismissal, and restoration;
- accessible names and descriptions;
- 200% zoom and narrow viewport;
- reduced motion;
- forced-colors/high-contrast behavior;
- VoiceOver spot check for complex widgets and overlays.

Use relevant WAI-ARIA Authoring Practices as guidance, while remembering that APG examples are
illustrative patterns rather than a complete production design system.

### 5a. Browser behaviour

`npm run check:browser` is the second Playwright project, `tests/browser/`, driven by the same
`playwright.config.ts` over the same built Storybook as the visual run.

It exists because the story runner cannot reach a class of behaviour that matters most on exactly
the components where it is hardest to get right. `userEvent` dispatches events from JavaScript: it
computes the tab order itself and fires synthetic keys. The modal focus trap and `Escape` on a
`<dialog>` are neither — they are the engine reacting to real input, and a simulated `Tab` walks
straight out of a modal. Asserting against that would be testing the simulation and calling it the
platform.

It compares nothing against a baseline, so unlike §6 nothing about it is platform-specific and **it
runs in CI**. That is also why forced-colors is asserted here on computed style rather than on a
screenshot: the forced-colors palette belongs to the operating system, and a baseline taken on
macOS would fail on an Ubuntu runner for a reason unrelated to the change under review.

Chromium only, like every other automated check here. ADR-0010 records a one-off run against
WebKit and Firefox, and what it found, rather than the suite pretending to be cross-browser.

### 5b. The workbench

`npm run check:workbench` is the third Playwright project, `tests/workbench/`, and the only check
that judges the library as an interface rather than as a set of components.

`scripts/check-workbench.mjs` drives it: it installs the packed tarball into `examples/workbench`,
type-checks and builds that application, and runs the project against the built output on port
6008. The pack step is shared with §7 through `scripts/pack-package.mjs`, so one `npm run verify`
builds and packs the library once rather than twice.

What it asserts is what the example claims and prose cannot establish: a keyboard-only path from
the top of the page through the navigation to the save button, a modal guard that returns focus to
the control it interrupted, the theme contract surviving a reload, and a 375px viewport with no
horizontal overflow on any tab. It compares nothing against a baseline, so like §5a it runs in CI.

### 6. Visual regression

Visual checks protect intentional states, not every possible prop combination.

The default self-contained option is Playwright screenshot comparison in a fixed CI environment.
Chromatic or another hosted service requires an ADR and explicit approval because it introduces an
external integration.

Rules:

- baseline changes are reviewed, never accepted automatically;
- fonts, time, animation, and data are deterministic;
- meaningful theme, focus, invalid, and long-content states receive priority;
- platform rendering differences are controlled by using the same baseline environment.

The run is `npm run check:visual`, driven by `playwright.config.ts` over the built Storybook, with
`npm run check:visual:update` to rewrite baselines and `tests/visual/__screenshots__/` to review.

**It runs inside `npm run verify` and stands down on CI**, and that follows from the rule above
about a single baseline environment. `scripts/check-visual.mjs` is the wrapper: locally it runs the
comparison, on a runner it explains why it did not and exits zero.

Being in the chain rather than beside it is the point. The baselines cannot be compared on CI, so
the only thing standing between a token change and an unreviewed one is somebody remembering to run
a separate command — and a check nobody is obliged to run is a check that quietly stops being run. The committed baselines are macOS; the runners are Ubuntu, and the
same text does not render identically on both, so a CI job against these baselines would fail for a
reason that has nothing to do with the change under review. The platform is part of the snapshot
path, so a Linux set can be generated and committed beside the macOS one later — that, rather than
loosening the comparison, is what would turn this into a CI gate.

Determinism comes from the components more than from the runner. `Spinner` disables its rotation
under `prefers-reduced-motion`, which the config requests, so a spinner screenshot is reproducible
without masking anything; the run waits on `document.fonts.ready` because Inter loads with
`font-display: swap`, and a screenshot taken before it arrives photographs the fallback family.

The comparison budget is a pixel count rather than a ratio. A ratio that sounds strict is not: a
few tenths of a percent of a screenshot is hundreds of pixels, and the geometry changes worth
catching are smaller than that — changing `--kreo-radius-md` from 4px to 10px moves 82 pixels in
one screenshot. The budget is verified the same way any other check here is: by making that change
and confirming the run fails, then running it unchanged and confirming it does not.

### 7. Package contract

The public package is verified independently of workspace source:

- build the package;
- inspect `npm pack --dry-run` output;
- create the tarball;
- validate package metadata and declarations with agreed package-lint tools;
- install the tarball into an independent, non-workspace React/Vite consumer with its own package
  metadata and lockfile;
- build and run the consumer without source aliases;
- verify React is not bundled;
- verify one-component import does not execute or include the whole library unexpectedly.

`publint` and `@arethetypeswrong/cli` were evaluated and adopted; both run under
`npm run check:package`. `attw` uses the `esm-only` profile, because the Node 10 and CommonJS
failures it reports are the intended consequence of the ESM-only decision in `ARCHITECTURE.md`
rather than defects.

The consumer step is a committed fixture, `examples/react-vite`, driven by
`scripts/check-consumer.mjs` under `npm run check:consumer`. It packs the package, installs the
tarball rather than the directory — a directory install links to the source tree and would defeat
the point — type-checks the fixture against the published declarations, builds it, renders it on
the server, and asserts each property above by name. It runs in CI on every pull request.

Two of its assertions are shaped by what a weaker version of them would have missed. The
single-component entry is built in isolation rather than as a second entry of the main build,
because entries in one build share their common code through a chunk belonging to neither; and it
mounts what it imports, because an entry whose export nobody consumes is dead code that Rollup
drops, leaving an empty bundle to pass the check for no reason.

### 8. Public documentation

Build Storybook statically and verify navigation, source examples, installation instructions, and
links. Documentation must not claim support or functionality that the published artifact lacks.

That build is also what is published: `.github/workflows/pages.yml` deploys `storybook-static` to
GitHub Pages. A project site is served from a sub-path, so the deployed build — and only the
deployed build — sets Vite's `base` from `STORYBOOK_BASE_PATH`; the local build stays unprefixed
because `check:visual`, `check:browser` and `check:workbench` serve it from the root of a port. No
runner checks the deployed site, so the evidence for a Pages change is the run itself plus the site
opened by hand: navigation, both themes, and no asset 404 under the sub-path.

## Change-to-check matrix

| Change | Minimum verification |
|---|---|
| Markdown only | link/content review and diff check |
| Utility or token logic | typecheck, lint, focused unit tests, token/build check |
| Component behavior | typecheck, lint, focused tests, a11y, package build |
| Component styling | component checks plus Storybook build and visual inspection |
| Keyboard/focus behavior | component checks plus `check:browser` for anything the engine owns, and manual keyboard/focus review for the rest |
| Public exports/types | package build, artifact inspection, type/package lint, consumer smoke |
| Build configuration | all static, package, Storybook, and consumer checks |
| Release workflow | `ci.yml` green on the pull request, and the diff read line by line — see below |

### Why the release workflow is the one thing that cannot be rehearsed

Every other row above names a command that can be run before the change lands. `release.yml`
cannot: its distinguishing steps push a tag and publish to npm, and neither has a dry run that
proves the real one works. `npm publish --dry-run` skips the OIDC exchange that is the whole
mechanism, and a tag push either happens or does not.

So the verification is what is available rather than what would be ideal, and it is stated here as
a limitation rather than dressed up:

- `ci.yml` runs on the pull request and covers every check the release job shares with it, which
  after the parity fix is all of them except the two publishing steps;
- the diff is read line by line, because a workflow is a program that will first execute in
  production;
- the first release after a change to this file is watched while it runs, and the ordering inside
  the workflow — tag before publish — exists so that the recoverable step is the one that fails
  first.

## CI stages

The intended required checks are introduced incrementally as their corresponding capability exists:

```text
install with locked dependencies      running
format:check                          running
lint                                  running
typecheck                             running
unit/component tests                  running
story tests in Chromium               running — play functions and axe
contrast check                        running
package build                         running
Storybook build                       running
package artifact checks               running
consumer smoke build                  running — packed tarball in examples/react-vite
workbench checks                      running — packed tarball in examples/workbench, tests/workbench
browser behaviour checks              running — real key presses, tests/browser
visual regression for protected states in `verify`, skipped on CI — macOS baselines
```

The story tests need a browser, so CI installs Chromium via Playwright. Only Chromium: the suite
is not cross-browser, and claiming otherwise would be unsupported.

Do not create empty or permanently skipped CI jobs merely to match this list. A check becomes
required when the feature it validates is real.

GitHub Actions should use minimum permissions. Third-party actions are pinned to a commit SHA with
the corresponding version in a trailing comment: a tag can be repointed by whoever writes to the
action's repository, and a commit cannot. Dependabot proposes the bumps, so the pins move
deliberately rather than rotting. Publishing jobs must be isolated from ordinary pull-request checks.

## Coverage policy

Do not optimize for one repository-wide percentage. Coverage is risk-based:

- every documented interactive contract has a behavior test;
- every composite keyboard model has focused interaction coverage;
- every fixed consumer regression gains a regression test;
- pure transformations cover boundary and invalid inputs;
- untested paths are documented when they cannot be verified reasonably.

A numeric threshold may be added after a representative set of components exists and the metric has
a clear purpose.

## Evidence reporting

Completion reports must list exact commands and classify each as:

- passed;
- failed because of this change;
- failed for a verified pre-existing reason;
- not run, with reason.

Do not summarize an unrun check as successful. Keep screenshots, traces, reports, and package
artifacts only when the repository policy explicitly tracks them.

## Official references

- [Storybook accessibility testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- [Storybook Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)
- [WAI-ARIA Authoring Practices patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [WAI-ARIA keyboard interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
