# ADR-0016: Four type sizes, body at 16px, and a lighter regular

- Status: Accepted
- Date: 2026-08-18
- Decision owners: Rustam
- Applies: [ADR-0015](0015-good-out-of-the-box-over-configurable.md)
- Amends: [ADR-0005](0005-visual-language.md), which set the eleven-step scale

## Context

`src/tokens/typography.css` declared eleven size steps: 11, 12, 13, 14, 16, 18, 20, 24, 30, 36 and
48. Every one of them is public API under SemVer, and Phase 8 is `1.0.0`, after which removing one
is a breaking change.

Counted before deciding anything, outside `src/tokens/`:

| Token | Referenced by |
| --- | --- |
| `--kreo-text-11` | `--kreo-type-label` |
| `--kreo-text-12` | field hint, field error, `Badge` |
| `--kreo-text-13` | the `sm` size of `Button`, `TextField`, `Textarea`, `Select`; `Tooltip` |
| `--kreo-text-14` | `--kreo-type-body`, `--kreo-type-button`, `--kreo-type-data`; `Button` `md` |
| `--kreo-text-16` | `--kreo-type-body-lg`; `Button` `lg` |
| `--kreo-text-18` | `--kreo-type-heading` |
| `--kreo-text-20` | nothing |
| `--kreo-text-24` | `--kreo-type-title` |
| `--kreo-text-30` | nothing |
| `--kreo-text-36` | `--kreo-type-display` |
| `--kreo-text-48` | nothing |

Three steps were referenced by nothing at all. Of the rest, 11, 12, 13 and 14 span three pixels
between them, and 16 and 18 two — differences a reader cannot see as a difference, but which a
consumer has to choose between and this library has to keep stable for ever.

Rustam asked for four sizes — 12, 16, 24 and 36 — with body at 16, and for `regular` to become 300.
The demonstration built for the decision compared both scales on real components in both themes;
the decision below is what came out of it.

## Decision

The scale is `--kreo-text-12`, `--kreo-text-16`, `--kreo-text-24` and `--kreo-text-36`. The other
seven are removed.

The roles are remapped onto it:

| Role | Was | Is |
| --- | --- | --- |
| `--kreo-type-display` | semibold 36 / tight | unchanged |
| `--kreo-type-title` | semibold 24 / snug | unchanged |
| `--kreo-type-heading` | semibold 18 / snug | semibold **16** / snug |
| `--kreo-type-body` | regular 14 / relaxed | regular **16** / relaxed |
| `--kreo-type-body-lg` | regular 16 / relaxed | **removed** |
| `--kreo-type-label` | medium 11 / 1.2 | medium **12** / 1.2 |
| `--kreo-type-button` | medium 14 / 1 | medium **16** / 1 |
| `--kreo-type-data` | regular 14 / 1.4 | regular **16** / 1.4 |

`--kreo-weight-regular` becomes 300. `medium` stays 500 and `semibold` stays 600. Inter is bundled
as a variable font over `100 900` (ADR-0008), so 300 is a real weight rather than a synthesised one.

**Twelve-pixel text is always set in `medium`, never in `regular`.** This is optical compensation
and it is not optional: at 300 a 12px stroke thins out badly, worst of all on a dark surface.
`Badge`, `--kreo-type-label` and `Button` `sm` already complied; the field hint, the field error,
`Tooltip` and the `sm` size of `TextField`, `Textarea` and `Select` were changed to comply.

## What this costs, and why it was accepted anyway

**`md` and `lg` controls now carry the same text size.** There is nothing between 16 and 24, and
24px inside an input is a heading, not a larger input. So `lg` is a taller, roomier box around body
text — 48px against 40px, with wider padding — rather than a box with bigger text in it. `Button`'s
`size` prop is documented as control height, which is now literally all it is. `--kreo-type-body-lg`
became an exact duplicate of `--kreo-type-body` and is removed under ADR-0015 rule 3.

**`heading` and `body` are the same size.** They are told apart by weight — 600 against 300 — and
with `regular` at 300 that gap is wide. This is measurable, not a matter of taste: it is the same
size step the library already relies on between a `Badge` label and the sentence around it. The
alternative was mapping `heading` to 24, which would have made it an exact duplicate of `title`.

**Control heights do not move.** Measured before deciding: `Button` and `TextField` set their
heights from `--kreo-control-h-*`, not from the type scale, so body going 14 → 16 fills the same
40px box more fully rather than resizing it. This is what made the change cheap; a scale that drove
control geometry would have been a different decision.

## Verification

- `npm run check:contrast` — all pairs still meet their target in both themes. Note what this does
  **not** cover: it measures colour, and weight is not colour. A 300 stroke at 12px would pass it
  and still be unreadable, which is why the medium rule above exists and was checked by rendering
  rather than by the script.
- `npm run check:visual` — 52 of the 60 baselines changed and were regenerated. The eight that did
  not are the ones with no text in the frame.
- `npm run check:browser` — 30 passed unchanged. No behaviour depends on the scale, which is the
  claim that needed evidence rather than assertion.

## Consequences

- Seven public tokens and one public role are removed. This is a breaking change and it happens in
  `0.19.0`, before `1.0.0` fixes the surface. That timing is the whole reason it happens now.
- A consumer using `--kreo-text-14` directly has to move to a role or to `--kreo-text-16`. The
  changelog says so explicitly.
- The demonstration story built to make this decision (`Overview → Type scale`) is removed with it.
  A comparison against a proposal is stale documentation once the proposal has been accepted;
  `Overview → Kit` and the Typography page show what actually ships.
