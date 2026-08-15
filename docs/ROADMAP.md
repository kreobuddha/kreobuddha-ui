# Kreobuddha UI — Roadmap

## How to use this roadmap

This file records direction, not blanket implementation permission. Each phase requires approval.
Finish and verify the current phase before starting the next. Reduce feature scope before reducing
verification quality.

## Status

Phase 0 and Phase 1 are complete. The repository is public at `kreobuddha/kreobuddha-ui` with CI
green; the package is published to npm as `@kreobuddha/ui` (ADR-0006). Phase 2 is in progress: `Badge` and `Spinner` are
done, `IconButton` and `Alert` are not started.

## Phase 0 — Local repository and package foundation — **done**

Goal: create the smallest verified package foundation without production components.

Candidate deliverables:

- local Git repository named `kreobuddha-ui`, initial branch `master`;
- accepted package manager, runtime version policy, license, and provisional package metadata;
- strict TypeScript and Vite library build;
- intentional package exports and declaration output;
- non-mutating lint and format checks;
- minimal test capability needed to verify the toolchain;
- optional minimal Storybook setup only if approved;
- package tarball inspection and minimal consumer smoke path;
- honest English README and public-project hygiene files.

Exit criteria:

- approved verification passes;
- repository status and generated files are reviewed;
- no private material is present;
- no production component has been claimed or published;
- commit and remote creation remain behind separate approval gates.

## Phase 1 — Tokens and `Button` vertical slice — **done**

Goal: validate the complete component workflow with one component.

Delivered beyond the original list: dark theme (ADR-0001), bundled IBM Plex with Cyrillic coverage
(ADR-0003), and a contrast check that runs in CI (ADR-0004). Density remains deferred — the sizes
`sm`/`md`/`lg` cover the need a single component can demonstrate.

Deliverables:

- smallest useful reference and semantic token set;
- original light theme and focused interaction states;
- dark theme and density only if explicitly included after token/API review;
- `Button` purpose, non-goals, API, semantics, stories, behavior tests, accessibility checks, and
  English docs;
- built package and consumer use of `Button` through public exports.

Exit criteria:

- `Button` meets `COMPONENT_STANDARD.md`;
- tokens are sufficient but not speculative;
- the packed consumer works;
- the next component is not started automatically.

## Phase 2 — Simple actions and feedback

Candidate components:

- `IconButton`;
- `Spinner` — **done**, extracted from `Button` rather than shipped twice;
- `Badge` — **done** in `0.4.0`: tones and an optional dot, non-interactive, no new tokens;
- `Alert`.

Goal: validate shared sizing, semantic statuses, icon composition, loading behavior, and state
matrices without introducing complex focus management.

Each component remains a separate approved slice.

## Phase 3 — Form foundation

Candidate components:

- `TextField`;
- `Textarea`;
- `Checkbox`;
- `Switch`;
- native single `Select`.

Goal: build a coherent accessible settings form with labels, descriptions, errors, required,
disabled, read-only, and controlled behavior.

Exit criteria:

- a form can be composed without application-specific wrappers;
- field associations and keyboard behavior are covered;
- form-state or schema libraries remain consumer concerns.

## Phase 4 — Composite navigation and overlays

Candidate components:

- `Tabs`;
- `Tooltip`;
- `Dialog`.

Goal: demonstrate keyboard models, focus movement/restoration, portals, dismissal, layering, and
overlay testing.

Before implementation:

- accept an ADR for native/custom/third-party primitive strategy;
- evaluate runtime dependency and bundle implications;
- define manual keyboard and screen-reader checks.

Do not implement all three as one slice.

## Phase 5 — Workbench and public documentation

Goal: prove components in a coherent frontend-only technical interface.

Deliverables:

- static Storybook foundation pages;
- a deterministic developer-tool settings/diagnostics workbench;
- theme and density controls that belong to the host demo;
- responsive and keyboard-only flow;
- installation, tokens, theming, accessibility, composition, and contribution docs;
- static deployment after separate approval.

The workbench uses local fixtures and no fake backend architecture.

## Phase 6 — First independent consumer

Goal: integrate a packed prerelease into `session-lab` or another independent frontend project.

Deliverables:

- install a versioned/tarball package instead of source aliases;
- document missing APIs and friction;
- fix general library gaps without adding app-specific components;
- add regressions for adoption issues;
- record package size and tree-shaking evidence.

## Phase 7 — Public beta

Goal: release a defensible beta after real consumption.

Deliverables:

- final package-name confirmation;
- reviewed CI and package artifacts;
- Changesets/release flow if accepted;
- public Storybook;
- tagged prerelease;
- contribution, security, and release documentation.

Publishing, tagging, GitHub settings, and deployment each require explicit approval.

## Phase 8 — `1.0.0`

Goal: stabilize evidence-backed public contracts.

Requirements are defined in `RELEASES.md`. Component count alone cannot trigger `1.0.0`.

## Backlog candidates

- `Toast`
- `Popover`
- `Combobox`
- `Menu`
- `Accordion`
- `Progress`
- `Skeleton`
- `EmptyState`
- `Table`
- `Pagination`
- `Drawer`
- `Breadcrumbs`

A candidate enters active scope only when a real consumer scenario demonstrates the need and the
project can support its semantic and keyboard contract.

## Explicitly deferred

- backend and remote data;
- monorepo/workspace split;
- separate tokens package;
- custom icon library;
- component generator or CLI;
- Figma automation;
- hosted visual regression service;
- multi-brand theming;
- data grid, date picker, rich-text editor, and file uploader;
- automatic npm publishing.

