# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

While the version is below `1.0.0` the public API can still change; breaking changes are called out
explicitly rather than treated as disposable.

## [Unreleased]

### Fixed

- **The published stylesheet carried the token layer twenty times.** Every component stylesheet
  declares its dependency on the tokens with `@import '../../styles.css'`, and Vite inlines that
  import once per CSS module rather than once per output file, so `dist/styles.css` repeated the
  whole `:root` block — and the reduced-motion block beside it — for each of the twenty modules.
  It was 40,220 of the file's 79,085 bytes and made no difference to a single rendered pixel:
  custom properties resolve where they are used. **The stylesheet is now 38.6 kB instead of
  85.0 kB.** Nothing about the theming contract changed; the dark theme still declares the same
  properties under `[data-kreo-theme='dark']`, which is a theme and not a repeat.

### Added

- **Every export is rendered on a server, on every pull request.** `check:consumer` rendered eight
  of the twenty-one exports without a DOM; it now renders all of them, `useToast` included, and
  fails when an export is not in that render. What is claimed and what is not is written down in
  [ADR-0018](docs/adr/0018-server-rendering-is-verified-rsc-is-not-claimed.md): server rendering is
  verified, React Server Components are not claimed, and the package ships no `'use client'`
  directive — inside an App Router tree, wrap the import in your own client module.
- **The cascade contract is written down.** The published stylesheet is unlayered, so a rule of
  yours with equal specificity wins by loading after it. Fixed for the `1.x` line by
  [ADR-0019](docs/adr/0019-the-stylesheet-is-unlayered.md), because adopting `@layer` later would
  silently change which rules win.
- **The behaviour suite runs in three engines.** `npm run check:browser:matrix` runs
  `tests/browser/` in Chromium, Firefox and WebKit, and it is what CI and the release workflow run.
  Measured on 2026-08-18: Chromium 30 passed, Firefox 30 passed, WebKit 28 passed with two
  differences recorded as expected failures — a modal dialog does not return focus to its trigger,
  and Safari leaves buttons out of the tab order unless the reader turns that on. The project now
  states a browser matrix instead of declining one; nothing changed in the library to earn it.
- **`npm run check:api`** compares the built exports, the package subpaths and the `--kreo-*`
  custom properties against a snapshot committed at `scripts/public-api.snapshot.json`, and fails
  when any of them moves. Exports, subpaths and custom properties are versioned contracts that
  nothing had ever read: `publint` and `attw` inspect the package's shape rather than its
  contents. It runs in `verify`, in CI and in the release workflow.
- **[`docs/MIGRATION.md`](docs/MIGRATION.md)** — what an upgrade actually costs, token by token.
  Only `0.19.0` requires any edit in the whole `0.x` line.

## [0.19.0] — 2026-08-18

**The typography decisions this library had been carrying without ever making.** Thirteen defects
were collected against `0.18.0` and every one is closed here, but the release is really two
decisions and their consequences: the type scale is four sizes instead of eleven, and a control's
`size` prop is its geometry rather than its type.

Both are breaking, and both happen now on purpose. Phase 8 is `1.0.0`, after which every `--kreo-*`
custom property is fixed for the `1.x` line — so the surface carried into it is decided rather than
inherited. [ADR-0015](docs/adr/0015-good-out-of-the-box-over-configurable.md) writes down the
principle the other two apply: the library is a set of finished decisions, not a kit for making
them, and a token nothing references has not earned a public name.

### Changed — breaking

- **The type scale is four sizes instead of eleven, and body is 16px instead of 14px.**
  `--kreo-text-12`, `--kreo-text-16`, `--kreo-text-24` and `--kreo-text-36` are the whole scale.
  `--kreo-text-11`, `--kreo-text-13`, `--kreo-text-14`, `--kreo-text-18`, `--kreo-text-20`,
  `--kreo-text-30` and `--kreo-text-48` are removed — the last three were referenced by nothing in
  the library, and the rest sat within two or three pixels of a neighbour. A consumer reading one
  of them directly should move to a `--kreo-type-*` role, which is the interface that says what a
  size is _for_. See [ADR-0016](docs/adr/0016-four-type-sizes-and-a-lighter-regular.md).
- **`--kreo-type-body-lg` is removed.** With body at 16px it resolved to exactly
  `--kreo-type-body`. Replace it with `--kreo-type-body`.
- **`--kreo-type-heading` is 16px, and `--kreo-type-label` is 12px.** `heading` is now body-sized
  and separated from body by weight rather than size; `label` moves up one pixel.
- **`--kreo-weight-regular` is 300 instead of 400.** Inter ships as a variable font over `100 900`,
  so this is a real weight. Twelve-pixel text in the library is always `medium` and never
  `regular` — at 300 a 12px stroke thins out too far, most visibly on a dark surface.
- **`size` on `Button`, `TextField`, `Textarea` and `Select` sets the control's geometry and
  nothing else.** All three sizes are set in `--kreo-type-body`, including `sm`, which used to drop
  to 12px — a dense form is now a form with shorter controls rather than a form in smaller type. On
  `Textarea`, where height comes from `rows`, `size` is the padding alone. Control heights are
  unchanged; 16px text fits a 32px control with room to spare, which was measured rather than
  assumed. See [ADR-0017](docs/adr/0017-size-is-geometry-not-type.md).

### Fixed

- **`Tabs` no longer grows a vertical scrollbar.** The tab list scrolls horizontally when the tabs
  outrun the width, and setting one overflow axis makes CSS compute the other as `auto` rather than
  leaving it `visible` — so a single pixel poking out below became a vertical scrollbar, which
  narrowed the box enough to raise a horizontal one with nothing to scroll. The axis is now pinned
  shut, and the pixel is gone as well: the selected tab's indicator sat at `-1px`, below the scroll
  container's content box, where the lower half of a 2px bar was clipped instead of painted over
  the rule. It now sits at `0` and is drawn whole.
- **A button in flight is dimmed as well as spinning.** `loading` kept full colour, so a button
  that refuses activation still read as pressable; `disabled` was the only state with the library's
  visual convention for "not right now". `loading` is the lighter of the two — dimming it as far as
  `disabled` drags the spinner below the contrast this library asks of a status mark, because
  `opacity` composites an element and its descendants as one group. The amount was measured in both
  themes rather than chosen. `IconButton` gets the same treatment. See
  [ADR-0014](docs/adr/0014-loading-is-dimmed-too.md), which amends ADR-0004 §5.
- **`Dialog`'s documentation page is readable again.** Its stories defaulted to `open: true` with a
  no-op `onClose`, so arriving at the page opened a modal that could not be closed by button, by
  Escape, or by clicking away — and the native dialog's top layer put it over the prose and the prop
  table the reader had come for. The stories now open the dialog from a real trigger and close it
  for real. `children` also has a description, so it is no longer a blank row in the table.
- **Prop tables offer controls a value can be typed into.** `exactOptionalPropertyTypes` makes every
  optional prop `T | undefined`, which react-docgen reports as a union and Storybook renders as a
  JSON object editor — so `Toast`'s `duration`, a number of milliseconds, arrived as "Set object".
  `ReactNode` props did worse: `Tooltip`'s `children` printed the React element's internals into the
  table. Documentation-site only; no type changed.
- **Markdown tables render as tables.** Storybook's MDX pipeline runs CommonMark, which has no table
  syntax, so the tables on the Installation and Accessibility pages were being parsed as one
  paragraph and drawn as their own pipe characters. `remark-gfm` joins the documentation build — no
  runtime dependency is added, and nothing reaches `dist`.
- **Switching the theme no longer flashes the page white.** A documentation page is rebuilt from
  scratch whenever a global changes, and the surface used to be painted by a React element — so for
  the frame in between, nothing painted it. `data-kreo-theme` and the page surface now live on the
  preview document, outside React's reach, and hold across the rebuild. Documentation-site only; no
  packaged file is involved.

### Changed

- **The Storybook theme is a switch rather than a two-item dropdown.** A dropdown of two costs a
  click to open and lets the reader land on the value already selected. Documentation-site only.

## [0.18.0] — 2026-08-17

**No component behaviour or public API changed.** No component was added, no prop, type, export or
`--kreo-*` custom property was added, removed or altered. This release is the release pipeline, the
documentation, and one file that should never have been in the package.

This is the release that closes Phase 7 and states the library's status in words: **public beta,
meaning the whole `0.x` line rather than a separate tag.** There is no `next` dist-tag and no
prerelease suffix — `npm install @kreobuddha/ui` is the beta — and `README.md` now lists the four
things it does not promise: the API moves, no screen-reader conformance is claimed, no browser
support matrix is claimed, and the component set grows only on evidence.

### Fixed

- **`dist/demo/DialogSection.d.ts` and `dist/demo/ToastSection.d.ts` are no longer published.**
  Declarations for two Storybook sections had shipped in every release from the day `src/demo/` was
  created up to and including `0.17.0`: `tsconfig.build.json` excluded `src/docs` and never
  excluded `src/demo`. Nothing in `src/index.ts` reached them, so no consumer could have imported
  them and none was affected — which is exactly why nobody noticed for fourteen minor versions.
  Found by reading `npm pack --dry-run` output rather than assuming it.

### Changed

- **The release workflow now runs the same gate as a pull request**, which its own comment had
  claimed while four checks were missing: `check:css`, `check:consumer`, `check:workbench` and
  `check:browser` — precisely the checks that cross the package boundary or touch a browser.
  Publishing is the one action here that cannot be undone, and it had been passing weaker checks
  than an ordinary pull request. The workflow also refuses to run from any ref but `master`, since
  `workflow_dispatch` accepts any ref while the release rules require a verified protected branch.
  Releases now take a few minutes longer, deliberately.
- **Every component's documentation page has a description saying why the component exists**, not
  only what it renders, and `disabled` on `Button` and `IconButton` and `rows` on `Textarea` are
  now documented. Those three props were always accepted through the native prop spread; they were
  invisible in the generated tables because nothing declared them, and declaring them changes what
  the tables show rather than what the components accept.
- `docs/RELEASES.md` records the tarball review with numbers, settles the package name as a closed
  question, and gives each of the eight prerelease gates its state and the file that shows it —
  including the three that are not fully met. `docs/PROJECT_BRIEF.md`'s beta success criteria carry
  the same treatment.
- The documentation site was read end to end by someone reading it as a stranger would:
  `Introduction.mdx` said "Nineteen components" and omitted `Radio`, and `Composition.mdx` did not
  cover `FieldGroup` + `Radio`, which is how a group of options is built. Both fixed.

### Added

- [ADR-0013](docs/adr/0013-changesets-declined.md) — Changesets is declined rather than left as a
  standing candidate. One maintainer means the coordination problem it solves does not exist here;
  `CHANGELOG.md` is prose that explains user-visible effect and `scripts/release-notes.mjs` already
  reads the release notes out of it. The ADR names what would reopen the decision: a second regular
  contributor, or a second package in this repository.

## [0.17.0] — 2026-08-17

### Added

- `Radio` — one option in a choice where exactly one answer is possible. A real
  `<input type="radio">`, so the arrow keys, the single tab stop for the whole group and form
  participation are the platform's rather than a reimplementation. Its label, hint, error and
  focus ring are `Checkbox`'s, and the round mark is the one shape it does not share: it says the
  options are exclusive before anything is clicked.

  **`name` is required**, unlike the native attribute. A radio without a name belongs to no group,
  which means it can be turned on and never off again — the same reasoning that made `label`
  required on the fields.

  It brings no question of its own: no legend, no fieldset, no `options` array. `FieldGroup`
  already asks the question, lays the options out and carries the error for the choice as a whole,
  so a group is those two composed — which is how `Checkbox` and `Switch` have always been grouped.

  The first component in the library added because a consumer proved the need: `kreobuddhas-planning-poker`
  had built a deck picker out of three action buttons with a `--selected` class, with no group, no
  chosen state and no arrow keys. See [`docs/adoption/planning-poker.md`](docs/adoption/planning-poker.md).

- `docs/adoption/planning-poker.md` — what the first independent consumer asked of this library,
  what it got, and what it built itself, each finding observed by running the application and
  carrying a verdict. It also measures what thirteen minor versions cost an application that
  imports one component: 0.24 kB of JavaScript, and a stylesheet that is deliberately whole.

### Changed

- `README.md` says that `Toast` needs a `ToastProvider` above the tree and that `useToast` throws
  without one. It was the only component here that is not import-and-render, and the only place
  that said so was its generated page — one click away from the reader deciding whether to use it.

## [0.16.0] — 2026-08-17

**No component behaviour or public API changed.** No component was added, no prop, type, export or
`--kreo-*` custom property was added, removed or altered. This release is documentation, an example
application, and the infrastructure that publishes them.

### Added

- **A documentation site** at <https://kreobuddha.github.io/kreobuddha-ui/>, built from Storybook
  and deployed to GitHub Pages. Every component has a Docs page whose **prop table is generated from
  the TypeScript types**, so it cannot drift from the code the way a hand-written table does.
- **Foundations pages** covering what a consumer needs before the first component: installation and
  the ESM-only peer contract, the `data-kreo-theme` contract and the three override conventions, the
  colour, typography, spacing and motion tokens, accessibility, and composition. The token pages
  **resolve `--kreo-*` values from the published stylesheet at render time** rather than listing
  them, so they follow the theme switch and cannot go stale when a token changes.
- **Accessibility is documented including what is not verified** — the screen-reader pass is parked,
  and WebKit does not return focus to the trigger when a dialog closes.
- **`examples/workbench`** — _Devkit Console_, a settings and diagnostics interface composed
  entirely from this library over deterministic local fixtures, with no fake backend and no
  wall-clock timers. It installs the packed tarball like the existing consumer fixture, never a
  source alias, and it sets `data-kreo-theme` and persists the choice itself — demonstrating that
  the library owns neither.
- **`npm run check:workbench`** — a third Playwright project that checks the workbench's claims
  instead of asserting them: the keyboard-only path from the header through the tabs to save, the
  unsaved-changes dialog returning focus to the tab it interrupted, and a 375px viewport with no
  horizontal overflow. It compares against no baseline, so it runs on CI.

### Changed

- **`README.md` no longer duplicates the API.** The nineteen hand-maintained component sections —
  about a hundred prop-table rows — are replaced by a list of the nineteen names, each linking to
  its generated page. Install, usage, theming, fonts, the package boundary and development stay.
  The cost, stated rather than hidden: `README.md` is the npm landing page, so a reader arriving
  from npm now needs one click for a prop table.
- `homepage` in the package manifest points at the documentation site instead of the README anchor.
- `docs/COMPONENT_RECIPE.md` §6 — a new component no longer earns a hand-written README table. It
  documents itself through JSDoc on its props and above the component, which is what the generator
  reads.

### Removed

- **Density is removed from the documented scope.** It was a promise in seven documents and was
  never implemented, so **no code changed and nothing a consumer uses was affected**. The `sm`/`md`/
  `lg` size scale covers what the slices actually needed. Recorded in
  [ADR-0012](docs/adr/0012-density-is-dropped.md), which supersedes the density lines in ADR-0005.

## [0.15.0] — 2026-08-16

### Added

- `Toast` — messages raised from anywhere and drawn in the corner of the viewport. This is the
  library's first context, first hook and first component that renders outside its own subtree:
  `ToastProvider` wraps your tree and `useToast()` gives you `toast(options)`, which returns an id,
  and `dismiss(id)`. Outside a provider the hook throws rather than quietly doing nothing. Three are
  on screen at once by default and the rest wait rather than being dropped; each leaves after five
  seconds, `duration: 0` keeps one until it is dismissed, and both defaults are `ToastProvider`
  props. The timer stops while a pointer is over the stack or focus is inside it and resumes where
  it stopped, which is what makes the whole thing safe for a reader who is slower than five seconds.
  One `aria-live="polite"` region, mounted from the start and never `assertive`. It lives in the top
  layer, so a toast raised while a modal `Dialog` is open is painted above it — but it cannot be
  clicked while that dialog is open, which is the platform being consistent about modality and is
  documented rather than worked around. See ADR-0011.
- `Toggletip` — the bubble `Tooltip` is not allowed to carry, opened on purpose. A tooltip opens on
  hover and on focus, so it does not exist on a touchscreen; anything the reader actually needs
  goes here instead, where a click, Enter, Space or a tap opens it. The trigger keeps its own
  `onClick` and `ref` and gains `aria-expanded`; Escape closes and returns focus to it; a pointer
  outside closes it and a pointer inside does not, so the text can be selected and a link inside
  followed. The content is mounted only while open, because a `role="status"` region announces what
  changes inside it and text that was merely revealed changes nothing.
- The top layer, the anchor positioning and the raised overlay surface now live in one internal
  stylesheet shared by `Tooltip` and `Toggletip`. No public API changed; `Tooltip` looks and
  behaves exactly as it did.
- `Accordion` — sections that open and close, built on `<details>` and `<summary>`. The disclosure
  button, the tab stop, Enter and Space, and the expanded/collapsed announcement are all the
  platform's; the component adds no ARIA and no state. `exclusive` shares one `name` across the
  sections, which is how the browser — not this library — keeps a single section open, and two
  accordions on a page never close each other. `defaultOpen` is an initial value, so a parent
  re-render cannot reopen a section the reader closed. There is no height animation: animating a
  `<details>` means taking its state back from the browser.
- `Progress` — a bar for work whose extent is known, and, with no `value`, for work whose extent is
  not. The indeterminate state reports no `aria-valuenow` at all, so nothing announces a percentage
  nobody measured; its segment travels the track, and stands still in the middle of it under
  `prefers-reduced-motion`. `label` is required and becomes the accessible name. The component
  draws no number of its own — only the consumer knows whether "3 of 7 files" or "42%" is the
  honest wording. It is a `div` with `role="progressbar"` rather than a native `<progress>`, which
  is a deliberate departure from platform-semantics-first, taken to keep one styling model instead
  of three vendor pseudo-element sets, and paid for with tests that assert every attribute the
  native element would have supplied.
- `Skeleton` — a placeholder block that holds the shape of content while it loads. It has no props
  of its own: the default is one line of text at the surrounding size, `1em` tall and as wide as
  its container, and every other shape is the `style` or `className` you already write. It is
  always hidden from assistive technology and cannot be unhidden, so the wait is announced once, by
  the text or the `aria-busy` or the labelled `Spinner` around it, rather than twice. The pulse
  stops completely under `prefers-reduced-motion`, and in forced-colors mode, where the fill is not
  painted, it keeps its shape with a system-coloured outline.

- A second Playwright project, `tests/browser/`, run by `npm run check:browser` and in CI. It sends
  real key presses to a real engine, which is the only way to check the things the story runner
  simulates rather than exercises: `Escape` on a modal `<dialog>`, the focus trap, and the inert
  page behind it. It also asserts that the `Dialog` panel and the `Tooltip` bubble still compute a
  border under `forced-colors: active`, where no shadow is painted. This closes most of the
  outstanding list in ADR-0010; the screen-reader check remains open.

### Changed

- `README.md` now states a `Dialog` limitation on WebKit: closing it does not return focus to the trigger, as it does on
  Chromium and Firefox. The behaviour belongs to the engine and is stated rather than worked
  around — see `README.md` and ADR-0010.

## [0.14.0] — 2026-08-16

### Added

- `Dialog` — a real `<dialog>` opened with `showModal()`, so the focus trap, the inert page behind,
  the top layer and `Escape` are the browser's rather than a reimplementation. Controlled through
  `open` and `onClose`: every way of closing calls back rather than closing on its own, so the
  element and the consumer's state cannot disagree. `title` is required and becomes the accessible
  name. A backdrop click closes by default; `dismissOnBackdrop={false}` is for a dialog holding a
  form. Only the body scrolls, so the heading and the actions stay reachable.
- Contrast measurements for the panel's title, body, description and close button.

### Added

- `Tooltip` — a description that opens on hover and on focus and closes on `Escape` without moving
  focus. It enters the browser's top layer through the `popover` attribute, so nothing on the page
  can cover it and no portal is involved, and it is placed with CSS anchor positioning — no
  measuring, no scroll listener, no runtime dependency. Hover waits about 400ms so a pointer
  crossing a row of buttons sets off nothing; focus opens at once. **It may only carry what the
  reader can do without: there is no hover on a touchscreen.**
- `--kreo-shadow-overlay`, added in `0.5.0` and unused since, is finally applied. The tooltip keeps
  a border as well, because forced-colors mode paints no shadow at all.
- A contrast measurement for text on the overlay surface, and a visual baseline for the open
  tooltip — the first state that lives in the top layer, and so the first that a screenshot of the
  story root would have missed entirely.

### Changed

- `prepare` became `prepack`. Installing the package no longer builds it, which is what `prepare`
  made every consumer do; the build still runs before `npm pack` and `npm publish`, so the
  published tarball is unaffected.
- Workflow inputs reach the shell through the environment instead of being expanded into the script
  body. An expanded `${{ }}` is text spliced into the program before the shell sees it, which is how
  a workflow input becomes a command.

### Added

- A consumer fixture in `examples/react-vite`, packed and installed from a tarball in CI. It
  resolves the package through its own `exports` map with no alias back to `src`, renders without a
  DOM, and fails if a public export is missing from it — which already caught one export drifting
  out of sync.
- Visual regression over a curated list of protected states, in both themes. Baselines are macOS
  only and the check runs locally rather than in CI, because the runners are Linux and the
  screenshots would not match; the platform is part of the baseline path, so a Linux set can be
  added beside it.
- `SECURITY.md`, `CONTRIBUTING.md` and a Dependabot configuration.

## [0.13.0] — 2026-08-16

### Added

- `Tabs` — a tab list and its panel, with the full WAI-ARIA keyboard model: arrows move and select,
  `Home` and `End` jump to the ends, the list wraps, and a roving tabindex keeps the whole list to
  one tab stop so `Tab` reaches the panel. `activation="manual"` moves focus without selecting, for
  a panel expensive enough that arrowing past four of them would fire four requests. A disabled tab
  reports `aria-disabled` and stays reachable, so a keyboard user is never left with an unexplained
  gap. Only the selected panel is mounted.
- Contrast measurements for the selected tab's indicator and a disabled tab's label.

### Fixed

- The published stylesheet no longer carries six literal `@import "../../styles.css"` rules, and
  the six field-family stylesheets in a Storybook build no longer fail to load. An `@import` in a
  CSS module reached through `composes` is not inlined by the bundler: it survives into the build
  as a rule whose path resolves to nothing. Each component now declares the token dependency
  itself, and `field.module.css` — which is only ever reached through `composes` — declares none.
- `npm run check:css` reads the built stylesheets and fails on an un-inlined `@import` or a missing
  token layer. Nothing looked inside a CSS artifact before: `publint` and `attw` check shape and
  types, and `build-storybook` exits 0 whether or not what it wrote can load.

## [0.12.0] — 2026-08-16

### Added

- `Checkbox` — a drawn box over a real checkbox, with the label as part of the target. Supports
  `indeterminate`, which has no HTML attribute and so cannot be set without a ref; it is a visual
  and assistive state only and still submits as unchecked.
- `Switch` — a checkbox underneath with `role="switch"` over it, so it is announced as on or off
  while keeping native keyboard handling and form participation. No `required`: a switch is always
  in one of its two states.
- `FieldGroup` — a real `<fieldset>` and `<legend>`, so a set of controls is announced as a group.
  Its hint and error describe the set rather than each control, and `disabled` switches off
  everything inside it natively.
- Contrast measurements for the box edge, the switch track and the thumb in both states.

## [0.11.0] — 2026-08-16

### Added

- `Select` — a native single-choice `<select>` with the same label, hint, error and invalid
  contract as the other fields. `placeholder` becomes a disabled first option with an empty value,
  so the field cannot report a choice nobody made and native `required` means what it says. The
  chevron is drawn by the component, because the platform paints a different arrow per operating
  system.
- A contrast measurement for the chevron.

### Changed

- The wiring the three fields repeat — generated ids, the `aria-describedby` order, the invalid
  flag, and the label, shell and message styles — now lives in one internal place instead of three
  copies. No public API, class name or rendered markup changed.

## [0.10.0] — 2026-08-16

### Added

- `Textarea` — a multi-line text field with the same label, hint, error and invalid contract as
  `TextField`; a field should not behave differently because it holds more than one line. Height
  comes from `rows` and nothing else, so the field never grows mid-sentence and pushes the rest of
  the form down. The reader can drag it taller, `resize="none"` takes that away, and dragging is
  vertical only — a wider box breaks the form's column and does not make prose easier to read.

## [0.9.0] — 2026-08-15

### Added

- `TextField` — a single-line text input that renders its own label, hint and error, and wires them
  to the input so they are announced with it rather than sitting near it. `error` is what makes the
  field invalid; there is no separate flag, and when both are present the error is announced before
  the hint. Sizes match `Button`, so a field and a button sit level side by side. `prefix` and
  `suffix` slots sit inside the border, and every native `<input>` prop passes through.
- Contrast measurements for the seven pairings a field introduces, including the focus and invalid
  borders and the value on the card surface.

### Changed

- Releases now tag the commit and publish a GitHub release from the same workflow run that
  publishes to npm, with notes read out of this file. Four releases had reached npm with a tag and
  no GitHub release, because both were manual steps taken afterwards.

## [0.8.0] — 2026-08-15

### Added

- `Alert` — a message about what happened or what is true, in four tones, with an optional title
  and an optional close button. Each tone carries its own mark so the kind of message never depends
  on colour alone, and `icon` replaces it. Announcement is opt-in through `live`: a banner already
  on screen should not interrupt, while a `danger` alert that appears in response to something
  does.
- Contrast measurements for the pairing `Alert` introduces: the dismiss button, a ghost control on
  a tinted surface no other control uses.

## [0.7.0] — 2026-08-15

### Added

- `IconButton` — a square button carrying a mark instead of a word, matching `Button` in variants,
  states and geometry, plus an `xs` size for marks inside another control. `label` is required and
  checked by the compiler: an icon carries no text, so there is nowhere else an accessible name
  could come from. It doubles as the hover tooltip.

## [0.6.0] — 2026-08-15

### Added

- `Spinner` — a ring that turns while something is in flight, in three sizes. It is decorative
  unless given a `label`, which turns it into a `status` with that accessible name; making the
  announcement opt-in is what stops a screen reader hearing the same thing twice when the spinner
  sits beside the word "Loading". It takes its colour from the surrounding text and stops turning
  under `prefers-reduced-motion`.

### Changed

- `Button` uses the public `Spinner` for its loading state instead of a private copy of the same
  ring. Behaviour is unchanged; the duplication is gone.

## [0.5.0] — 2026-08-15

### Added

- Eight tokens for message surfaces: `--kreo-surface-{success,warning,danger,info}-soft` and the
  labels measured against them, `--kreo-text-on-{success,warning,danger,info}-soft`. A tinted
  surface needs its own label colour, because the status text is tuned against the page and does
  not survive being placed on its own tint in the light theme.
- `--kreo-shadow-overlay`, for components that float over the page. Overlays keep a border as well:
  forced-colors mode paints no shadow, and a panel relying on one would lose its edge there.
- `docs/COMPONENT_RECIPE.md`, the mechanical checklist for adding a component, and
  `npm run new:component`, which writes its four files with a skeleton that already passes.
- `npm run verify`, which chains the nine checks into one call, and `npm run test:one`, which runs
  the unit project alone for a fast inner loop.

### Changed

- The accessibility gate is now the browser scan alone. The jsdom axe test each component carried
  was removed along with the `axe-core` dependency: jsdom cannot judge contrast, and the browser
  scan already covers every story automatically.

### Fixed

- Button and field labels render at the weight the tokens declare. The type roles ask for weight
  500, which the bundled static pair did not contain, and CSS font matching resolved it silently to 400. Inter now ships as a variable font covering 100–900, so the declared scale and the shipped
  font agree. A Latin page downloads 140 bytes more than before for it.
- Contrast measurement now covers the placeholder colour, the field border, and body text on each
  message tint — 51 pairs across both themes, up from 31.

## [0.4.0] — 2026-08-15

### Added

- `Badge` — a short non-interactive status or category label. Tones `neutral`, `accent`,
  `success`, `warning`, `danger`, `info`, plus an optional decorative `dot`. It renders a plain
  `<span>` with no ARIA role and stays out of the tab order.
- Contrast measurements for the pairings `Badge` introduces: the status marks and the accent on
  `--kreo-surface-card`, and body text on `--kreo-surface-card`.

## [0.3.0] — 2026-08-14

First release published to npm. Earlier version numbers existed only as git tags and were never
available from a registry: `0.1.0` was the visual language, `0.2.0` made the repository installable
from git for a single consumer.

### Added

- `Button` — variants `filled`, `outlined`, `ghost`; sizes `sm`, `md`, `lg`; `danger`, `loading`,
  `fullWidth`, `textWrap`, `icon` and `iconEnd`. Defaults to `type="button"` so a button inside a
  form cannot submit it by accident.
- Semantic design tokens published as `@kreobuddha/ui/styles.css`, with light and dark themes
  selected by the `data-kreo-theme` attribute. Every `--kreo-*` custom property in that stylesheet
  is public API.
- Inter bundled as WOFF2 subsets, so no external font request is made at runtime.

[unreleased]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.19.0...HEAD
[0.19.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/kreobuddha/kreobuddha-ui/releases/tag/v0.3.0
