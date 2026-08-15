# ADR-0007: Component foundations — fields, controls, overlays and messages

- Status: Accepted
- Date: 2026-08-15
- Decision owners: Rustam
- Builds on [ADR-0005](0005-visual-language.md), which set the visual language these four decisions
  apply

## Context

Two components ship. The next eight — `Spinner`, `IconButton`, `Alert`, `Input`, `Textarea`,
`Select`, `Checkbox`, `Switch` — would each have arrived with the same handful of visual questions
attached, answered slightly differently every time.

Four decisions account for almost all of them, and each is inherited by several components. They
were made in one session against a specimen page that rendered every candidate as working interface
in both themes.

## Decision

### 1. Fields are bordered on the card surface

`Input`, `Textarea`, `Select` and every control that inherits their focus treatment use a 1px
`--kreo-border-control` outline on `--kreo-surface-card`, radius `--kreo-radius-md`, height from the
shared control scale. Focus draws the inset ring and recolours the border; invalid recolours the
border to `--kreo-border-danger` and puts the message below in `--kreo-text-danger`. The placeholder
is `--kreo-text-subtle`, measured at 4.93:1 on the card.

No new tokens were required. That is the point of the choice: the field turned out to be the button
contract applied to a different element.

### 2. Secondary controls keep the accent outline

The "fills for controls" direction from the visual refresh is **withdrawn**. It was chosen mainly
with input fields in mind, and decision 1 puts fields on a border instead, which removes its main
application. A neutral fill would also have flattened the difference between the secondary and
tertiary actions, which the accent outline keeps legible at a glance.

### 3. Overlays carry both a border and a shadow

`--kreo-shadow-overlay` returns, dropped in Phase 1 as premature and now earned by `Tooltip`,
`Dialog`, `Menu`, `Popover` and `Toast`. It is deeper in the dark theme, because a charcoal surface
swallows a light shadow.

The border stays as well, and not for taste: **forced-colors mode paints no shadow at all**. A panel
relying on a shadow alone would lose its edge entirely for the users most dependent on having one.

Shadows remain reserved for things that float. Nothing anchored to the page gets one.

### 4. Messages sit on a tinted surface

`Alert`, later `Toast` and inline form errors, use a tinted background rather than a border or a
left rule.

This is the expensive option and was chosen knowing the price. Measuring it produced the most useful
finding of the session: **in the light theme a visible tint and the existing status text are
incompatible.** The status text already sits at 5:1 against white; a tint only darkens the ground,
so solving for contrast drives the tint to 99.5% lightness — a tint indistinguishable from white.

A tinted surface therefore needs a second text value per status, measured against the tint instead
of against the page. Eight new tokens in total:

- `--kreo-surface-success-soft` and its three siblings — the tint;
- `--kreo-text-on-success-soft` and its three siblings — the label on that tint.

The naming is deliberately parallel to `--kreo-text-on-accent`: a colour named for the background it
sits on, not for the thing it means.

The dark theme needs no second value. There the tint is dark and the text is light, so contrast
rises rather than falls, and the ordinary status text survives unchanged — the aliases simply point
at it.

## Consequences

- Every new colour pairing is in `scripts/check-contrast.mjs`, which now measures 51 pairs across
  both themes, including body text on each tint and the placeholder.
- Eight new public tokens under SemVer, plus `--kreo-shadow-overlay`. Additive: a minor version.
- Colour alone must still never carry meaning. A tinted `Alert` is required to carry an icon as
  well, which is a component contract rather than a token.
- The withdrawn fill direction should not be revived without a new ADR; it was considered twice and
  declined on evidence the second time.

## Alternatives considered

- **Sunken fill for fields.** Rejected: it identifies the control by surface, which reads well in
  isolation but collapses when a field sits inside an already-grey panel.
- **Bottom rule for fields.** Rejected: the quietest and the weakest affordance, and it leaves no
  place for the inset focus ring the rest of the system uses.
- **Shadow-only overlays.** Rejected on forced-colors behaviour.
- **Bordered or left-ruled messages.** Both would have cost nothing and were genuinely close. The
  tint was chosen for how much better it separates a message from ordinary body text; the eight
  tokens are the accepted price.

## Review trigger

Revisit if a consumer needs a field on a coloured surface where `--kreo-surface-card` is wrong, if
forced-colors testing shows the overlay border is insufficient on its own, or if the second status
text value proves hard to keep in step as the palette evolves.
