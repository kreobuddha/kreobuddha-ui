# Kreobuddha UI — Roadmap

## How to use this roadmap

This file records direction, not blanket implementation permission. Each phase requires approval.
Finish and verify the current phase before starting the next. Reduce feature scope before reducing
verification quality.

## Status

Phases 0 through 4 are complete. The repository is public at `kreobuddha/kreobuddha-ui` with CI
green, and the package is published to npm as `@kreobuddha/ui` (ADR-0006). Nineteen components
ship: `Button`, `IconButton`, `Badge`, `Spinner`, `Alert`, `TextField`, `Textarea`, `Select`,
`Checkbox`, `Switch`, `FieldGroup`, `Tabs`, `Tooltip`, `Dialog` — all released — and `Skeleton`,
`Progress`, `Accordion`, `Toggletip` and `Toast`, which are unreleased and due in `0.15.0`.

The batch of five below is complete and not yet released; preparing `0.15.0` is what remains of it.
It entered scope ahead of Phase 5 by Rustam's decision rather than by the backlog rule; see
"Component batch, released together as `0.15.0`". Phase 5 is next after it and not started.

Phase 3 is complete: `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch` and `FieldGroup` are
done, and a settings form composes from them with no wrapper of its own.

Phase 4 is complete: `Tabs`, `Tooltip` and `Dialog` are done, on the platform primitives accepted
in [ADR-0010](adr/0010-overlay-and-composite-strategy.md) and with no runtime dependency added.
The keyboard and forced-colors checks that ADR requires are now automated in `tests/browser/` and
run in CI under `npm run check:browser`. **The screen-reader check is still not done.** One
cross-engine limitation is accepted and stated rather than worked around: WebKit does not return
focus to the trigger when the dialog closes. Both are recorded in that ADR.

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

## Phase 2 — Simple actions and feedback — **done**

Candidate components:

- `IconButton` — **done**: square, `label` required and compiler-checked;
- `Spinner` — **done**, extracted from `Button` rather than shipped twice;
- `Badge` — **done** in `0.4.0`: tones and an optional dot, non-interactive, no new tokens;
- `Alert` — **done**: four tones, owned marks (ADR-0009), opt-in announcement.

Goal: validate shared sizing, semantic statuses, icon composition, loading behavior, and state
matrices without introducing complex focus management.

Each component remains a separate approved slice.

## Phase 3 — Form foundation — **done**

Candidate components:

- `TextField` — **done**;
- `Textarea` — **done**;
- `Checkbox` — **done**;
- `Switch` — **done**;
- native single `Select` — **done**.

Goal: build a coherent accessible settings form with labels, descriptions, errors, required,
disabled, read-only, and controlled behavior.

Exit criteria:

- a form can be composed without application-specific wrappers;
- field associations and keyboard behavior are covered;
- form-state or schema libraries remain consumer concerns.

## Phase 4 — Composite navigation and overlays — **done**

Candidate components:

- `Tabs` — **done**;
- `Tooltip` — **done**;
- `Dialog` — **done**.

Goal: demonstrate keyboard models, focus movement/restoration, portals, dismissal, layering, and
overlay testing.

Before implementation — **satisfied by [ADR-0010](adr/0010-overlay-and-composite-strategy.md)**:

- ~~accept an ADR for native/custom/third-party primitive strategy~~ — platform primitives:
  `<dialog>`, the `popover` attribute, CSS anchor positioning;
- ~~evaluate runtime dependency and bundle implications~~ — none added, `dependencies` stays empty;
- ~~define manual keyboard and screen-reader checks~~ — listed in the ADR, and part of each
  component's definition of done.

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

## Component batch, released together as `0.15.0`

Five candidates entered active scope **by Rustam's decision**, not by the rule below that a real
consumer scenario has to demonstrate the need first. The exception is recorded here rather than
left as a silent contradiction; the rule itself stands for everything else in the backlog.

Each is a separate slice — its own branch, its own pull request, its own full verification — and
they share only the release, which is the second deliberate exception, to
`COMPONENT_RECIPE.md` §8. Phase 5 remains the next phase after them.

- `Skeleton` — **done**;
- `Progress` — **done**, as a `div` with `role="progressbar"` by Rustam's decision rather than as a
  native `<progress>`; the departure from platform-semantics-first and what it buys are stated in
  the component, in `README.md` and in the changelog;
- `Accordion` — **done**, on `<details>`/`<summary>` with the `name` attribute for exclusive
  opening. Support checked before implementation rather than remembered: Chrome and Edge 120,
  Firefox 130, Safari 17.2, ~90% of users (caniuse, `mdn-html_elements_details_name`, checked
  2026-08-16). Where it is missing, sections open independently;
- `Toggletip` — **done**, delivering what [ADR-0010](adr/0010-overlay-and-composite-strategy.md)
  promised. Its arrival is what justified extracting the shared overlay layer into
  `src/components/overlay/`, on the model of `src/components/field/`;
- `Toast` — **done**, on [ADR-0011](adr/0011-toast-ownership-and-announcement.md), accepted by
  Rustam before implementation because a provider is an architectural decision rather than a
  styling one. It is the library's first context, first hook and first component that renders
  outside its own subtree. It draws its own markup on `Alert`'s tinted surfaces rather than
  rendering `Alert`, by Rustam's decision: the colour is shared, the markup is not.

## Backlog candidates

- `Popover`
- `Combobox`
- `Menu`
- `EmptyState`
- `Table`
- `Pagination`
- `Drawer`
- `Breadcrumbs`

A candidate enters active scope only when a real consumer scenario demonstrates the need and the
project can support its semantic and keyboard contract.

## Blocked on upstream

Work that is decided and cannot proceed yet. Each entry names what has to happen elsewhere first,
so it is picked up when that happens rather than rediscovered.

- **TypeScript 7.** Wanted, and blocked by the linter: `typescript-eslint@8.67.0` declares
  `peer typescript ">=4.8.4 <6.1.0"`, and that is the latest stable release — everything above it
  on npm is an `8.67.1` alpha. Installing TypeScript 7 alongside it fails `npm ci` outright.

  The only way through today is `--legacy-peer-deps`, which means accepting a resolution npm has
  already called incorrect in order to get a green run — ruled out by `CLAUDE.md`, which says not
  to weaken a check to make it pass.

  Take it when `typescript-eslint` ships a release whose peer range admits TypeScript 7. Dependabot
  will raise the pull request; it was closed once already, as
  [#32](https://github.com/kreobuddha/kreobuddha-ui/pull/32).

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

