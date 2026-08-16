# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

While the version is below `1.0.0` the public API can still change; breaking changes are called out
explicitly rather than treated as disposable.

## [Unreleased]

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

[unreleased]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.14.0...HEAD
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
