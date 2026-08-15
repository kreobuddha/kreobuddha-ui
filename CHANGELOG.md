# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

While the version is below `1.0.0` the public API can still change; breaking changes are called out
explicitly rather than treated as disposable.

## [Unreleased]

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

[unreleased]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/kreobuddha/kreobuddha-ui/releases/tag/v0.3.0
