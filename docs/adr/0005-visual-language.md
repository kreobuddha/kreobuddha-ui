# ADR-0005: A new visual language

- Status: Accepted
- Date: 2026-08-14
- Decision owners: Rustam
- Supersedes the palette and typography decisions in
  [ADR-0001](0001-token-prefix-theme-attribute-and-styling-model.md) and
  [ADR-0003](0003-bundle-ibm-plex-and-replace-public-sans.md); the prefix, theme attribute and
  styling model from ADR-0001 are unchanged, as is the no-external-requests rule from
  [ADR-0002](0002-no-external-font-or-icon-requests.md)

## Context

The controls, the colour and the typeface were all found unsatisfying at once. Rather than patch
them, the whole visual language was redesigned in a series of specimen pages built in Storybook —
candidates rendered as working interface, in both themes, so choices were made by looking rather
than by reading hex codes.

The intended character moved from "industrial clarity" to **calm and editorial**: restrained
surfaces, hierarchy carried by typography and spacing, and an accent used sparingly.

## Decision

### Typeface — Inter, alone

IBM Plex Sans read as engineering, which pulled against the new direction. **Inter** replaces it.
Two weights, 400 and 600, each split into Latin and Cyrillic subsets: four files, about 64 KB.

**No monospace family is bundled, and `--kreo-font-mono` is removed.** The requirement behind "use
a mono for data" is aligned numerals, and Inter provides them through `tnum`, exposed as
`--kreo-numeric-tabular`. A second family would be justified by a component that renders code, and
none exists. Mono is also gone from button and field labels, where it had been the loudest source
of the technical character being left behind.

### Colour — neutral grey, one berry accent

The neutral ramp has no temperature, so any accent sits on it cleanly. The accent is **berry
`#93357f`**, chosen over blue, teal and several others: it reads as interactive without being a
default browser link, and it leaves blue free for the informational status.

Two rules govern every value, and both were reached by measurement rather than taste:

1. **A status carries two colours.** `--kreo-text-*` is readable text at 4.5:1; `--kreo-icon-*` is
   a brighter mark for dots, icons and borders, which need only 3:1. One value cannot do both — an
   amber dark enough to read as text is a brown, which is exactly why the first warning candidate
   looked muddy.
2. **The dark theme runs quieter than the light one.** At equal contrast a colour reads louder on a
   dark surface. Green shows it first and is currently the only status calmed for it: 5.8:1 against
   the 7:1 the other three use.

A third finding shaped the light palette: lightness must be **solved per hue**, not chosen. A fixed
lightness across four hues produced contrasts from 3.7:1 to 9.8:1, which reads as dust. Green also
needs more saturation than its neighbours — it is the lightest hue at any lightness, so reaching
5:1 on white forces it dark, and a dark green with little chroma is just a dark neutral.

### Shape — 4px controls

Controls move from 6px to **4px**, and the rest of the scale follows: cards 10 → 8px, modals
14 → 12px. A sharp control inside a soft container reads as an inconsistency rather than as intent.

### Secondary buttons carry the accent

The outlined variant takes the accent for its label and border, so the hierarchy reads as accent
fill, accent outline, neutral text rather than depending on weight alone.

## Consequences

- Every colour and the entire type scale changed. Nothing has been published, so nothing breaks;
  after publication this would be a major version.
- `--kreo-font-mono` and `--kreo-type-*` mono roles are gone. New public tokens arrive:
  `--kreo-numeric-tabular`, `--kreo-text-success|warning|info`, `--kreo-icon-*`,
  `--kreo-*-mark`.
- The package is lighter: four font files instead of eight, roughly 64 KB instead of 123 KB.
- `scripts/check-contrast.mjs` grew from sixteen pairs to thirty-one. Every status role, in both
  themes, is now measured on each run.
- Density remains deferred. The `sm`/`md`/`lg` sizes cover what a single component can demonstrate.
- The version moves to `0.1.0` to mark that the visual language has settled, though the package
  stays private and unpublished.

## Alternatives considered

- **Blue accent.** Rejected after seeing it: correct but anonymous, and it would have collided with
  the informational status.
- **Crimson danger.** Rejected on measurement — 30 degrees from the accent, too close to read as a
  different kind of action. Pushing danger past roughly hue 18 collides with warning instead, which
  leaves a narrow corridor around hue 4–10.
- **Keeping a monospace family.** Rejected: tabular figures cover the real need at no cost.
- **Sand and terracotta accents.** Rejected: both sit too close to the warning and danger hues.
- **One saturation for both themes.** This is what produced the neon green, and abandoning it is
  the second rule above.

## Review trigger

Revisit when a real consumer renders code and needs a monospace family, when density is introduced,
or if the remaining three dark statuses turn out to need the same calming the green received.
