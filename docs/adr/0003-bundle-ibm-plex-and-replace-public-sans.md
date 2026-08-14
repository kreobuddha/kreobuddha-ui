# ADR-0003: Bundle IBM Plex, and replace Public Sans with IBM Plex Sans

- Status: Accepted
- Date: 2026-08-14
- Decision owners: Rustam
- Relates to: [ADR-0002](0002-no-external-font-or-icon-requests.md), whose follow-up this resolves

## Context

ADR-0002 removed the external font requests and left the library rendering in whatever sans and
mono the platform provides — correct, but not the intended typography. Its stated follow-up was to
bundle the fonts once binaries and licences were confirmed.

Confirming them surfaced a problem the design source did not account for. **Public Sans has no
Cyrillic coverage**: the published subsets are `latin`, `latin-ext` and `vietnamese`. IBM Plex Mono,
the mono half of the same pairing, does ship `cyrillic` and `cyrillic-ext`. A Russian-language
interface would therefore render its body text in a per-glyph system fallback while its mono labels
and numerals stayed in the intended face — a visible split exactly where bundling was supposed to
remove one.

## Decision

1. **The sans family becomes IBM Plex Sans.** It covers Cyrillic, and it belongs to the same
   superfamily as the mono already chosen, so the pairing stays deliberate rather than accidental.
   `--kreo-font-sans` changes accordingly; no other token changes.
2. **Both families are bundled in the package.** The library still issues no external request, and
   now it also does not depend on the host loading anything.
3. **Only the four faces the type roles use are shipped** — sans 400 and 600, mono 400 and 500 — each
   split into a Latin and a Cyrillic file behind a `unicode-range`, so a Latin-only page never
   downloads the Cyrillic subsets. Eight files, about 123 KB in total, none of it on the JavaScript
   path.
4. **The font files and their OFL licences live in the published package** under `dist/assets/fonts`.
5. Fonts are obtained from the `@fontsource` packages as development dependencies and copied into
   the source tree, rather than fetched from a CDN or committed from an unverified download.

## Consequences

- The library delivers its intended appearance with a single stylesheet import and no host setup.
- `styles.css` cannot be produced by Vite alone. Library mode inlines every asset it resolves as a
  base64 data URI with no opt-out, which would embed all eight files, inflate them by a third, and
  defeat the `unicode-range` split. `src/fonts.css` is therefore kept out of the module graph and
  joined to the built stylesheet by `scripts/bundle-fonts.mjs`. This is the one piece of custom
  build machinery in the package, and it exists for a documented tool limitation.
- Consumers pay for the fonts whether or not they want them. If a real consumer needs the tokens
  without the faces, the answer is a separate `./tokens.css` export, which `ARCHITECTURE.md` already
  reserves for a demonstrated need — not an option flag.
- The design source still names Public Sans. That document has to be corrected, otherwise the
  library and the design system disagree about the primary typeface.
- Changing the sans family is a visual breaking change. It costs nothing today because nothing has
  been published, and it would be a major version later.

## Alternatives considered

- **Keep Public Sans, Latin only.** Rejected: it makes a Russian-language product's body text
  unstyled, and Russian-language products are the expected consumers.
- **Public Sans plus a separate Cyrillic family in the fallback chain.** Rejected: two different
  drawings in one line of mixed text are conspicuous, and it doubles the faces to maintain.
- **A variable font for each family.** Not chosen now: one variable file per family covers every
  weight including the six this library never uses, and the static subsets are smaller for the four
  that it does.
- **Leave the fonts to the host.** That is the state ADR-0002 described, and it never produced the
  intended appearance.

## Review trigger

Revisit if a consumer needs a weight outside 400/500/600, if a non-Latin, non-Cyrillic script is
required, or if the package's install size becomes a reported adoption obstacle.
