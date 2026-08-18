# Kreobuddha UI — Roadmap

## How to use this roadmap

This file records direction, not blanket implementation permission. Each phase requires approval.
Finish and verify the current phase before starting the next. Reduce feature scope before reducing
verification quality.

## Status

Phases 0 through 7 are complete, the current release is `0.19.0`, and **Phase 8 — `1.0.0` — is
open**. The repository is public at
`kreobuddha/kreobuddha-ui` with CI green, and the package is published to npm as `@kreobuddha/ui`
(ADR-0006) as a **public beta** — which is the whole `0.x` line rather than a separate tag, so
there is no `next` channel and no prerelease suffix. Twenty components
ship: `Button`, `IconButton`, `Badge`, `Spinner`, `Alert`, `TextField`, `Textarea`, `Select`,
`Checkbox`, `Switch`, `FieldGroup`, `Tabs`, `Tooltip`, `Dialog`, `Skeleton`, `Progress`,
`Accordion`, `Toggletip` and `Toast` in `0.15.0`, and `Radio` in `0.17.0` — the first component
added because a consumer proved the need.

`0.19.0` belongs to no phase. It collected thirteen defects against `0.18.0` and closed all of
them, but what it really carries is two typography decisions the library had been postponing, both
breaking and both taken deliberately before Phase 8 rather than inside `1.x`:
[ADR-0016](adr/0016-four-type-sizes-and-a-lighter-regular.md) cuts the type scale from eleven sizes
to four, moves body to 16px and `--kreo-weight-regular` to 300;
[ADR-0017](adr/0017-size-is-geometry-not-type.md) makes `size` on `Button`, `TextField`, `Textarea`
and `Select` the control's geometry alone. Both apply the principle
[ADR-0015](adr/0015-good-out-of-the-box-over-configurable.md) writes down.
[ADR-0014](adr/0014-loading-is-dimmed-too.md), from the same release, amends ADR-0004 §5 so a
`loading` button is dimmed as well as spinning. **The `--kreo-*` surface a consumer sees today is
therefore the one Phase 8 freezes for the whole `1.x` line**, which is why the cut happened now.

Phase 5 added no component. It made what exists inspectable by someone who is not Rustam: a
documentation site at [kreobuddha.github.io/kreobuddha-ui](https://kreobuddha.github.io/kreobuddha-ui/)
with foundations pages and prop tables generated from the types, an example application composing
the library, and a `README.md` that links to the site instead of duplicating the API. It closes as
`0.16.0`, in which no component behaviour or public API changed.

Phase 3 is complete: `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch` and `FieldGroup` are
done, and a settings form composes from them with no wrapper of its own.

Phase 4 is complete: `Tabs`, `Tooltip` and `Dialog` are done, on the platform primitives accepted
in [ADR-0010](adr/0010-overlay-and-composite-strategy.md) and with no runtime dependency added.
The keyboard and forced-colors checks that ADR requires are now automated in `tests/browser/` and
run in CI under `npm run check:browser`. **The screen-reader check is not done and is parked by
Rustam's decision** — see "Parked by decision" below; the phase is complete without it, and the
library claims no screen-reader verification for these components until it is run. One
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
(ADR-0003), and a contrast check that runs in CI (ADR-0004). The `sm`/`md`/`lg` sizes covered the
need a single component can demonstrate, and they went on covering it — density was deferred here
and dropped in ADR-0012.

Deliverables:

- smallest useful reference and semantic token set;
- original light theme and focused interaction states;
- dark theme only if explicitly included after token/API review;
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

## Phase 5 — Workbench and public documentation — **done**

Goal: prove components in a coherent frontend-only technical interface.

Deliverables, each met:

- static Storybook foundation pages — `src/docs/*.mdx`, with the token pages resolving
  `--kreo-*` values from the stylesheet at render time rather than retyping them, so a token change
  cannot leave the page stale;
- a deterministic developer-tool settings/diagnostics workbench — `examples/workbench`, **Devkit
  Console**, installed from a packed tarball like the fixture and never from `../../src`;
- a theme control that belongs to the host demo — the workbench sets `data-kreo-theme` and persists
  the choice itself, demonstrating the contract that the library owns neither;
- responsive and keyboard-only flow — verified by a runner rather than asserted, in the `workbench`
  Playwright project under `npm run check:workbench`;
- installation, tokens, theming, accessibility, composition, and contribution docs;
- static deployment after separate approval — `.github/workflows/pages.yml`, deploying to
  [kreobuddha.github.io/kreobuddha-ui](https://kreobuddha.github.io/kreobuddha-ui/).

The workbench uses local fixtures and no fake backend architecture.

Two things the phase settled beyond its deliverables. **Density was dropped rather than deferred**
([ADR-0012](adr/0012-density-is-dropped.md)) and the promise removed from the seven documents that
carried it. And **`README.md` stopped duplicating the API**: the nineteen hand-maintained prop
tables are gone, replaced by links to generated ones, with `COMPONENT_RECIPE.md` §6 rewritten so a
new component documents itself through JSDoc on its props instead.

Exit criteria, all met: a stranger can read installation, theming, tokens, accessibility and every
component's prop table without cloning the repository; the workbench composes the library from local
fixtures with its keyboard and 375px claims checked by a runner; nothing in the repository promises
density; and `0.16.0` changed no component behaviour.

## Phase 6 — First independent consumer — **done**

Goal: integrate a released package into an independent frontend project.

**The consumer installs published versions from npm only** — Rustam's decision, taken during this
phase and replacing the original "packed prerelease". A local tarball resolves through the same
`exports` map, so it proves the package boundary, but it leaves the application's manifest pointing
at a file no one else has and its lockfile describing an artifact that was never published. When a
component the application needs is not released yet, the application waits for the release. That is
why `Radio` ships in `0.17.0` before the deck picker adopts it, rather than after.

The consumer is
[`kreobuddhas-planning-poker`](https://github.com/kreobuddha/kreobuddhas-planning-poker) — a
real-time estimation tool on React, Vite and Firebase, written before this phase and depending on
this package since `0.3.0`, for `Button` alone. It is an independent repository, not an example in
this one.

Deliverables:

- ~~install a versioned/tarball package instead of source aliases~~ — the application was upgraded
  `0.3.0` → `0.16.0` from npm, with the build and the full flow verified in the browser;
- ~~document missing APIs and friction~~ — [`adoption/planning-poker.md`](adoption/planning-poker.md),
  every finding observed by running the application and carrying a verdict;
- ~~fix general library gaps without adding app-specific components~~ — `Radio` is done: the one
  general gap the consumer proved (finding 2), shipped as a single native option that `FieldGroup`
  groups, rather than as a `RadioGroup` duplicating what `FieldGroup` already does or a
  `SegmentedControl` departing from platform semantics. Rustam chose that design before it was
  built. `README.md` also gained the line saying `Toast` needs a provider (finding 3);
- ~~add regressions for adoption issues~~ — `Radio` carries its own unit tests and stories, and it
  is used in `examples/react-vite`, which `npm run check:consumer` compares against the published
  declarations: the gap the consumer found cannot silently reopen;
- ~~record package size and tree-shaking evidence~~ — measured on the application, not the fixture:
  seven more components cost **9.20 kB of JavaScript, 0.55 kB gzipped**, the stylesheet did not
  move because it was already whole, and markers belonging to `Dialog`, `Progress`, `Tabs`,
  `Checkbox` and `Switch` are absent from a bundle that imports none of them.

Exit criteria, all met: an independent application, written before this phase and not by this
repository's rules, runs on the published package; every point of friction it hit is written down
with a verdict rather than remembered; the one general gap it proved is closed by a component whose
design was chosen before it was built; and what adoption costs is a measured number.

One decision the phase produced beyond its deliverables. **A consumer installs published versions
only** — a local tarball would have let the deck picker adopt `Radio` a release early, at the cost
of a manifest pointing at a file nobody else has. `0.17.0` therefore shipped before the adoption
that motivated it, and the order — ship, adopt, measure — is what the next consumer follows.

## Phase 7 — Public beta — **done**

Goal: release a defensible beta after real consumption.

**Four of the six deliverables existed before the phase opened.** `CONTRIBUTING.md`, `SECURITY.md`
and `docs/RELEASES.md` were written in earlier phases; CI pins its actions by SHA and runs the full
gate on Node 22 and 24; the package name has been settled by publication since `0.3.0`; the
documentation site shipped in Phase 5. Recording that plainly matters more than a tidy list of
completions: this phase **reviewed** those four rather than building them, and what it produced is
the difference between what they claimed and what they did.

Three such differences were found, and they became the phase:

- **the release ran a weaker gate than a pull request**, while a comment in `release.yml` said the
  opposite. `check:css`, `check:consumer`, `check:workbench` and `check:browser` — the four checks
  that cross the package boundary or touch a browser — were missing from the one action that cannot
  be undone;
- **the site's first page said "Nineteen components" and did not list `Radio`**;
- **Changesets sat unresolved** in `RELEASES.md` on a condition that had already been satisfied.

Deliverables:

- ~~final package-name confirmation~~ — closed rather than carried forward: `RELEASES.md`
  "Current status" records that `@kreobuddha/ui` has been the published name since `0.3.0`, the
  scope belongs to Rustam and npm's trusted publisher is bound to the repository and `release.yml`
  by name, so a rename is now a consumer migration and not an open question;
- ~~reviewed CI and package artifacts~~ — the release gate now runs the same steps as `ci.yml` in
  the same order and refuses to start from any ref but `master`; the tarball was read rather than
  assumed — **127 files, 152.0 kB packed, 419.5 kB unpacked** — and the reading found two
  `dist/demo/*.d.ts` declarations that had shipped in every release since `src/demo/` was created;
- ~~Changesets/release flow if accepted~~ — declined, [ADR-0013](adr/0013-changesets-declined.md);
- ~~the public Storybook reviewed as beta documentation~~ — all twenty Docs pages read in the built
  site in both themes, as a reader who is not Rustam. `Introduction.mdx` corrected to twenty
  components, `FieldGroup` + `Radio` documented in `Composition.mdx`, and every component gained a
  description answering "why it exists" rather than only "what it is";
- ~~tagged prerelease~~ — **satisfied by `0.18.0`**, per the decision below;
- ~~contribution, security, and release documentation~~ — present before the phase, and re-read
  against what the repository does; the prerelease gates and the beta success criteria now carry
  their evidence per item instead of standing as an unchecked list.

Two decisions, recorded here so they are not re-argued:

- **Beta is a state, not a version number.** The whole `0.x` line is a prerelease under SemVer, so
  the phase closes with an ordinary `0.18.0`. No prerelease suffix, no `next` dist-tag: what
  `npm install @kreobuddha/ui` gives you is the beta, and `README.md` says so along with the four
  things it does not promise.
- **Changesets is declined**, with the two pieces of evidence that would reopen it named in
  ADR-0013 — a second regular contributor, or a second package in this repository.

Exit criteria, all met: no document describes an open question that has in fact been answered; the
irreversible action no longer passes a weaker gate than the reversible one; every prerelease gate
names the file that shows its state, and the three that are not fully met say so; and the site tells
a stranger what `0.18.0` actually contains.

Publishing, tagging, GitHub settings, and deployment each require explicit approval.

## Phase 8 — `1.0.0` — **in progress**

Goal: stabilize evidence-backed public contracts. The requirements are the `1.0.0` gates in
[RELEASES.md](RELEASES.md#100-gates); component count alone cannot trigger `1.0.0`, and **no
component is added in this phase**. What `1.0.0` promises is that the exports, the props and the
`--kreo-*` custom properties a consumer depends on stop moving without a major version — so the
phase is about turning each gate from a sentence into a file or a command.

### Where each gate stands

Read at `0.19.0`, before any slice of this phase ran:

| Gate | State at `0.19.0` | Closed by |
| --- | --- | --- |
| at least one independent application consuming a published version | met, at `0.16.0` — no consumer outside this repository has run `0.19.0` | the consumer's own upgrade, which is Rustam's and not this repository's work |
| adoption feedback resolved or documented | **met** — all seven verdicts re-read at `1.0.0`, with the two that closed named and the one that changed measured; the note says plainly that it is a re-read rather than a new run, and that the consumer is still on `0.16.0` | [`adoption/planning-poker.md`](adoption/planning-poker.md) |
| stable package and token exports | stable in practice, recorded nowhere and checked by nothing | a committed snapshot of the exports and `--kreo-*` names, verified by a check in `verify` and CI |
| reviewed deprecation and migration policy | the policy exists in `RELEASES.md`; no migration document does, and `0.19.0` removed tokens without ever marking them `@deprecated` | `MIGRATION.md` for `0.x` → `1.0.0`, and a policy that matches what the project actually does |
| documented browser/React support supported by evidence | **met** — the behaviour suite runs in Chromium, Firefox and WebKit in CI and in the release gate, with two WebKit differences recorded as expected failures; React 19 is stated as a decision rather than a fact | `docs/QUALITY.md` §5a, `README.md` |
| accessibility release checklist for all shipped interactive components | the material exists across `tests/browser/`, `check:contrast` and the Accessibility page; the checklist as one reviewable artifact does not | a per-component table naming the evidence for each claim |
| explicit API freeze review | not done | an ADR listing what is frozen for `1.x` and what was removed before the freeze |

### Deliverables

- status documents that match the released version, each piece of evidence stamped with the
  version it was observed at;
- a public-API snapshot that a change cannot slip past unnoticed — the counterpart to
  `check:css`, which exists because six `@import` statements shipped for several releases without
  anyone reading the built stylesheet;
- `MIGRATION.md`, and a deprecation policy reconciled with what `0.19.0` actually did;
- a measured browser matrix rather than a declined one, with each cross-engine difference either
  fixed in its own slice or written down;
- an accessibility release checklist per interactive component;
- the SSR and cascade contracts decided rather than implied — a server-render check, a recorded
  position on React Server Components, and a recorded position on `@layer`;
- an API freeze ADR, a re-taken tarball review, and the `1.0.0` release itself.

### Exit criteria

- every gate above names a file or a command, and a gate that is not met says so;
- `npm run verify` is green, and the public-API check fails on an intentional change to an export
  or a token;
- no document claims screen-reader conformance, browser support or adoption beyond what was
  observed;
- `CHANGELOG.md` describes `1.0.0` in terms of what a consumer must migrate;
- the release runs from CI on Rustam's explicit approval of that exact version.

### What this phase cannot close

The screen-reader pass over `Dialog`, `Tabs` and `Tooltip` — parked below — needs a person driving
a real assistive technology. Unless Rustam runs the script in ADR-0010 before the release, `1.0.0`
ships with the same statement the beta carries: **no screen-reader conformance is claimed** for
those three. A version number does not turn an unverified claim into a verified one.

## Component batch, released together as `0.15.0`

Five candidates entered active scope **by Rustam's decision**, not by the rule below that a real
consumer scenario has to demonstrate the need first. The exception is recorded here rather than
left as a silent contradiction; the rule itself stands for everything else in the backlog.

Each is a separate slice — designed, built and fully verified on its own, one at a time, and each
its own commit — and they share both the pull request and the release. The shared release is the
second deliberate exception, to `COMPONENT_RECIPE.md` §8, now written down there. The shared pull
request is Rustam's call on how to land the batch, taken once the five were done: five reviews of
one branch that was built in order would have been five readings of the same history. What is not
relaxed is the verification — `npm run verify` ran green for each component before the next was
started. Phases 5, 6 and 7 followed them and are complete.

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

## Parked by decision

Work that was specified, is not blocked by anything technical, and is deliberately not being done
now. Each entry names what would restart it, so it is picked up as a decision rather than found as
an oversight.

- **The screen-reader pass over `Dialog`, `Tabs` and `Tooltip`.** The manual checks
  [ADR-0010](adr/0010-overlay-and-composite-strategy.md) asked for; the exact VoiceOver script is
  written there, under "The screen-reader script", and stays valid. Everything else on that
  ADR's outstanding list has since been automated in `tests/browser/`; this is what is left,
  because it needs a real assistive technology driven by a person and no check in this repository
  can stand in for it. Parked by Rustam on 2026-08-16. It restarts when he runs the script, or when
  a component's semantics change in a way that makes the answer matter. Until then the project
  claims no screen-reader conformance for these three — `CLAUDE.md` forbids claiming what was not
  observed.

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

