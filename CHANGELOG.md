# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

While the version is below `1.0.0` the public API can still change; breaking changes are called out
explicitly rather than treated as disposable.

## [Unreleased]

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

[unreleased]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/kreobuddha/kreobuddha-ui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/kreobuddha/kreobuddha-ui/releases/tag/v0.3.0
