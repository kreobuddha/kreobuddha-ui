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

This runs at two levels:

- The focused test in `Button.test.tsx` executes axe inside jsdom, which neither lays out nor
  paints, so its `color-contrast` rule is disabled there.
- **Every story is scanned in a real browser** by the Storybook Vitest addon, with
  `a11y: { test: 'error' }` in `.storybook/preview.tsx` — a violation fails the build. Because this
  layer has real layout and painting, its contrast findings are real. It caught a token that had
  been shipping below the threshold and that the token-level check below did not cover.

### 4a. Contrast

`npm run check:contrast` resolves the token graph in `src/tokens/colors.css`, measures every colour
pair a shipped component puts on screen in both themes, and exits non-zero below its WCAG 2.2
target — 4.5:1 for text, 3:1 for control borders and the focus ring. It runs in CI.

Every new pairing a component introduces must be added to the script's list, or it goes unmeasured
here. The two layers are complementary and neither replaces the other: the script covers documented
token pairings the components may not currently render, while the browser scan covers whatever a
story actually puts on screen, including combinations nobody thought to declare.

### 5. Manual accessibility

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

### 6. Visual regression

Visual checks protect intentional states, not every possible prop combination.

The default self-contained option is Playwright screenshot comparison in a fixed CI environment.
Chromatic or another hosted service requires an ADR and explicit approval because it introduces an
external integration.

Rules:

- baseline changes are reviewed, never accepted automatically;
- fonts, time, animation, and data are deterministic;
- meaningful theme, density, focus, invalid, and long-content states receive priority;
- platform rendering differences are controlled by using the same baseline environment.

### 7. Package contract

The public package is verified independently of workspace source:

- build the package;
- inspect `npm pack --dry-run` output;
- create the tarball;
- validate package metadata and declarations with agreed package-lint tools;
- install the tarball into an independent, non-workspace React/Vite consumer with its own package
  metadata and lockfile, or an equivalent temporary generated consumer;
- build and run the consumer without source aliases;
- verify React is not bundled;
- verify one-component import does not execute or include the whole library unexpectedly.

`publint` and `@arethetypeswrong/cli` were evaluated and adopted; both run under
`npm run check:package`. `attw` uses the `esm-only` profile, because the Node 10 and CommonJS
failures it reports are the intended consequence of the ESM-only decision in `ARCHITECTURE.md`
rather than defects.

The consumer step is currently a temporary generated app rather than a committed fixture. It is a
local step; CI does not run it yet.

### 8. Public documentation

Build Storybook statically and verify navigation, source examples, installation instructions, and
links. Documentation must not claim support or functionality that the published artifact lacks.

## Change-to-check matrix

| Change | Minimum verification |
|---|---|
| Markdown only | link/content review and diff check |
| Utility or token logic | typecheck, lint, focused unit tests, token/build check |
| Component behavior | typecheck, lint, focused tests, a11y, package build |
| Component styling | component checks plus Storybook build and visual inspection |
| Keyboard/focus behavior | component checks plus manual keyboard/focus review |
| Public exports/types | package build, artifact inspection, type/package lint, consumer smoke |
| Build configuration | all static, package, Storybook, and consumer checks |
| Release workflow | full CI in a non-publishing dry run |

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
consumer smoke build                  local only — no committed fixture yet
visual regression for protected states not started
```

The story tests need a browser, so CI installs Chromium via Playwright. Only Chromium: the suite
is not cross-browser, and claiming otherwise would be unsupported.

Do not create empty or permanently skipped CI jobs merely to match this list. A check becomes
required when the feature it validates is real.

GitHub Actions should use minimum permissions. Third-party actions should be pinned according to the
accepted supply-chain policy. Publishing jobs must be isolated from ordinary pull-request checks.

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
