# ADR-0002: The library issues no external font or icon requests

- Status: Accepted
- Date: 2026-08-14
- Decision owners: Rustam
- Update: the "follow-up conditions for bundling fonts" below are resolved by
  [ADR-0003](0003-bundle-ibm-plex-and-replace-public-sans.md). The decisions in this record — no
  external requests, icons as `ReactNode`, no bundled icon font — all still stand.

## Context

The source design system loads Public Sans, IBM Plex Mono, and Material Symbols Outlined from the
Google Fonts API in its `tokens/fonts.css`, and its `Button` takes icons as Material Symbols glyph
name strings (`icon="arrow_forward"`).

That is reasonable for a single application. For a distributed package it is not:

- every consuming page would make requests to a third-party host it did not choose, which is a
  privacy decision belonging to the application, not to a UI library;
- offline and air-gapped builds break;
- visual regression and accessibility checks stop being deterministic, because rendering depends on
  a network fetch — `QUALITY.md` requires fonts to be deterministic for baseline comparison;
- glyph-name props bind this library's public API to one specific icon font, which
  `COMPONENT_STANDARD.md` forbids ("third-party primitive types must not leak into public component
  types").

## Decision

1. The published stylesheet contains **no `@import`, no `<link>`, and no request to any external
   host**. Font families are declared through `--kreo-font-sans` and `--kreo-font-mono`, whose value
   lists end in platform fallbacks, so the library renders correctly even when the preferred
   families are absent.
2. Loading Public Sans and IBM Plex Mono is documented as the host application's responsibility for
   now, including the exact families and weights required.
3. Components accept icons as **`ReactNode`**, never as a glyph-name string. Material Symbols
   remains a documented recommendation, not a dependency. No icon font is bundled.
4. Self-hosting the two text fonts inside the package is the intended follow-up, so that the library
   delivers its finished appearance without host setup. It is deliberately **not** part of Phase 1.

## Consequences

- Phase 1 output is fully self-contained and deterministic; nothing in the package touches the
  network.
- Until fonts are bundled, a consumer that loads neither family gets the system sans and mono
  fallbacks. The layout holds, but the intended typographic character does not. The README must say
  this plainly rather than claim the look works out of the box.
- Bundling later is a minor version change, not a breaking one: token names do not change, only the
  package gains `@font-face` rules and `.woff2` assets, and `sideEffects` already declares CSS.

## Follow-up conditions for bundling fonts

Bundling requires all three, and each is a separate step:

1. **Binaries.** The design project states none were supplied. They must come from the official
   upstream sources or from Rustam directly.
2. **Licenses verified at the source, not from memory.** Both families are open-licensed, but the
   exact license text must be read and shipped in the package alongside the fonts.
3. **A subsetting and weight decision.** Shipping every weight of two families is far larger than
   this library's entire code output. Only the weights the type roles actually use are candidates.

## Alternatives considered

- **Keep the CDN import.** Rejected for the privacy, offline, and determinism reasons above.
- **Bundle fonts in Phase 1.** Rejected: it requires binaries that do not exist yet and a licensing
  review, neither of which should block the first component.
- **Ship an icon font.** Rejected: the design vocabulary uses about fifteen glyphs, and `ReactNode`
  icons let consumers bring any set at no cost to this package.

## Review trigger

Revisit when the font binaries and their licenses are available, or if a consumer demonstrates that
host-side font setup is a real adoption obstacle.
