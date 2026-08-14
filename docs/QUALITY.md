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

Expected scripts after initialization:

```text
npm run typecheck
npm run lint
npm run format:check
```

These names are targets, not permission to invent duplicate tools. Update this document to match the
actual non-mutating scripts accepted in Phase 0.

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

When current Storybook/Vite compatibility is verified, its Vitest integration may turn stories into
browser-based component tests. Do not add parallel test stacks without a distinct responsibility.

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

`publint` and `@arethetypeswrong/cli` are candidates to validate during initialization, not assumed
dependencies.

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
install with locked dependencies
format:check
lint
typecheck
unit/component tests
Storybook interaction and accessibility tests
package build
Storybook build
package artifact checks
consumer smoke build
visual regression for protected states
```

Do not create empty or permanently skipped CI jobs merely to match this future list. A check becomes
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
