# ADR-0004: Contrast corrections, a control-border token, and the loading contract

- Status: Accepted
- Date: 2026-08-14
- Decision owners: Rustam
- Amends: [ADR-0001](0001-token-prefix-theme-attribute-and-styling-model.md), which adopted the
  design source's palette as authored

## Context

Four complaints came out of using `Button`: the dark-theme green looked dull and its label read
poorly, the danger hue looked orange and read poorly in dark, `loading` was indistinguishable from
`disabled`, and a long label pushed the button out of its container.

Measuring the palette turned two of those from preferences into defects, and a contrast script
written for the occasion found a third that nobody had reported:

| Pair | Measured | Required |
|---|---|---|
| Dark filled accent, label `#08201a` | 4.59:1 | 4.5:1 — passing, but with no margin |
| Dark filled danger, label `#08201a` | **3.15:1** | 4.5:1 |
| Outlined button border on the page | **1.61:1** light, **1.87:1** dark | 3:1 |

The danger failure had a structural cause: `--kreo-danger-500` was never remapped for the dark
theme, and danger fills borrowed `--kreo-text-on-accent` — a near-black tuned for green. The border
failure had one too: a single `--kreo-border-strong` served both decorative separators, which are
exempt from a contrast requirement, and the visible boundary of an interactive control, which is
not (WCAG 2.2 SC 1.4.11).

## Decision

1. **The dark accent brightens** to `#5cbf9b` / `#6bcaa8` / `#7ad5b5`. Contrast against the dark
   label rises as the green lightens, so brightening fixes both complaints at once. Making the
   label white instead would have moved the wrong way — white on the old green measures 3.71:1.
2. **Danger moves red** to `#a62b28` (light) and gains a dark remap at `#c0392b`, with hover values
   chosen to keep at least 5:1 against white.
3. **New public token `--kreo-text-on-danger`.** Danger fills must not reuse the accent's label
   colour; that reuse worked only while both happened to be white and failed silently in dark.
4. **New public token `--kreo-border-control`**, the boundary of an interactive control, set to a
   neutral that meets 3:1 in both themes. `--kreo-border-input` becomes an alias of it.
   `--kreo-border-strong` keeps its value and its decorative role; no component uses it now.
5. **`loading` and `disabled` are visually separate contracts.** Disabled stays dimmed with
   `cursor: not-allowed`. Loading keeps full colour, takes `cursor: progress`, and fades its
   content to `opacity: 0` while a spinner is laid over the button. `opacity` rather than
   `visibility` deliberately: the latter would drop the label out of the accessibility tree and
   take the button's accessible name with it. Because the content keeps its box, the button's size
   is identical in both states.
6. **Long labels truncate by default**, and a new `textWrap` prop lets them wrap instead. Size
   classes move from `height` to `min-height` so a wrapped label can grow the button.
7. **Contrast is verified, not asserted.** `scripts/check-contrast.mjs` resolves the token graph,
   measures every pair a component puts on screen in both themes, and fails the build below target.
   It runs in CI.

## Consequences

- Three visual changes are visible immediately: a brighter dark accent, a redder danger, and
  noticeably darker outlined borders. The last one is the largest departure from the design source,
  and it is not negotiable — the previous border was not perceivable enough to identify a control.
- `--kreo-text-on-danger` and `--kreo-border-control` are additive, and so is `textWrap`: a minor
  version, not a breaking one.
- The spinner is internal to `Button` for now. `ROADMAP.md` has a public `Spinner` in Phase 2;
  extract it there rather than shipping two implementations.
- The rotation duration is a literal in the component stylesheet. The motion scale holds transition
  durations, and a looping rotation is a different kind of value that no shipped token expresses.
- Under `prefers-reduced-motion: reduce` the spinner does not rotate. A static ring still reads as
  an indicator, and `aria-busy` carries the state regardless.
- Every future colour pairing has to be added to the script's list, or it goes unmeasured. That is
  the maintenance cost of the guarantee.

## Alternatives considered

- **Keep the dark green and switch its label to white.** Rejected: measured 3.71:1, worse than the
  4.59:1 it would replace.
- **Raise `--kreo-border-strong` itself.** Rejected: it would darken decorative dividers that have
  no contrast requirement, changing the calm, low-contrast surfaces the design depends on.
- **A spinner in the leading icon slot with the label still visible.** Rejected: the width then
  stays stable only for buttons that already carry an icon, which is not a contract.
- **Freezing the button's width in JavaScript when loading starts.** Rejected: stateful, fragile,
  and hostile to server rendering.

## Review trigger

Revisit when a real consumer reports the truncation hiding meaningful text, when `Spinner` is
extracted, or if a brand other than this one ever needs the palette.
