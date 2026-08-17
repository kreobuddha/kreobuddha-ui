# ADR-0017: `size` is a control's geometry, not its type

- Status: Accepted
- Date: 2026-08-17
- Decision owners: Rustam
- Amends: [ADR-0016](0016-four-type-sizes-and-a-lighter-regular.md), which left `sm` setting its own
  type
- Applies: [ADR-0015](0015-good-out-of-the-box-over-configurable.md)

## Context

Rustam's objection was about `Textarea`: its `Sizes` story makes no sense, because a textarea's
height comes from `rows`, and the type ought to come from the page rather than from a prop.

ADR-0016 had already taken most of `size`'s work away. Measured on `TextField` immediately after it:

| `size` | Shell height | Text | Padding |
| --- | --- | --- | --- |
| `sm` | 34px | 12px / 500 | 12px |
| `md` | 42px | 16px / 300 | 16px |
| `lg` | 50px | 16px / 300 | 20px |

`md` and `lg` differed in geometry alone. Only `sm` still carried a type of its own, and on
`Textarea` — which has no control height — `size` had been reduced to padding plus that one type
override.

ADR-0016 also contains a sentence that was not true when it was written: that `Button`'s `size` is
"documented as control height, which is now literally all it is". `Button` `sm` was still setting
`--kreo-text-12`. The sentence described where this was going rather than where it was.

## What was measured before deciding

The obvious worry with dropping the `sm` override is that 16px will not fit a 32px control. It
does. Body type is 16px on a 1.65 line height, so the line box is 26.4px inside a 32px minimum —
measured in the browser rather than computed on paper, and confirmed after the change with
`scrollHeight > clientHeight` on every control at every size: nothing is clipped, and no shell
height moved.

The other option Rustam weighed was the literal reading — the field declares no type at all and
inherits from the page. That one is measurably unsafe here: `src/styles.css` is nothing but token
imports, the library ships no page styles by design (ADR-0001), and `.control` is already
`font: inherit`. On a consumer page with no body font, "inherit" resolves to the browser default
and the input renders in Times. Making that safe would mean shipping a page-level rule, which is
the thing ADR-0001 refused.

## Decision

**`size` sets the control's geometry — its height and its padding — and nothing else.** The type is
`--kreo-type-body` at every size, on `TextField`, `Textarea`, `Select` and `Button` alike.

The type is declared once, on the shared `.shell` in `src/components/field/field.module.css`,
rather than repeated in each size class of each of the three field components. `.control` inherits
it, as it already did.

On `Textarea`, `size` is padding alone. That is a thin prop and it stays: it is the same name
meaning the same density as on `TextField`, which is what lets a form mix the two without them
looking like different libraries.

Twelve-pixel text still exists, and is unchanged — `Badge`, `--kreo-type-label`, the field hint and
error, and `Tooltip`. It is a decision about what a piece of text *is*, not about how tall the box
around it happens to be, which is the distinction this ADR is drawing.

## Consequences

- `sm` controls carry body-sized text. A dense form is a form with shorter controls, not a form in
  smaller type, which is the point: a form does not change voice when a control changes height.
- No public API is removed. `size` keeps its three values on all four components; what changes is
  what they do.
- Visual baselines for every `sm` control changed and were regenerated.
- The sentence in ADR-0016 quoted above is now true. It is left as written rather than edited, and
  this record is what makes the difference visible.
