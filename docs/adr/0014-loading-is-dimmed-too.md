# ADR-0014: A button in flight is dimmed as well

- Status: Accepted
- Date: 2026-08-17
- Decision owners: Rustam
- Amends: [ADR-0004](0004-contrast-corrections-and-the-loading-contract.md) §5, which made `loading`
  and `disabled` visually separate contracts by keeping `loading` at full colour

## Context

ADR-0004 §5 fixed a real defect. Before it, `loading` and `disabled` were both dimmed and nothing
else told them apart — an action already under way looked exactly like an action that was
unavailable. The fix separated them, and it separated them along two axes at once: it gave
`loading` a spinner laid over the button, and it took the dimming away.

The spinner is the part that did the work. It says "in flight" in a way nothing else in the
library does, and it is not a state `disabled` can ever be in. The dimming was doing something
else entirely, and losing it cost something: a button in flight refuses activation — `inactive`
sets `cursor: progress` and the handler does not fire — but at full colour it still reads as
pressable. The one visual convention this library has for "not pressable right now" was reserved
for `disabled` alone, for a reason that no longer applies once a spinner is present.

Rustam raised this directly: `disabled` is dimmed and not clickable, `loading` has a spinner and is
not clickable, and the two facts should look consistent.

## What measurement changed about the decision

Dimming `loading` the obvious way — reusing `disabled`'s `opacity: 0.45` — was implemented first
and then measured in the browser, in both themes. It fails.

`opacity` composites an element and its descendants over the page **as one group**. Fading the
button therefore fades the spinner with it, and the spinner is the one thing separating this state
from `disabled`:

| Spinner against its own button | Undimmed | At `opacity: 0.45` |
| --- | --- | --- |
| Filled, light | 6.87:1 | 2.16:1 |
| Outlined and ghost, light | 8.00:1 | 2.25:1 |
| Filled, dark | 7.57:1 | 2.52:1 |
| Outlined and ghost, dark | 7.72:1 | 2.52:1 |

The library asks 3:1 of a status mark (`docs/docs/Accessibility.mdx`, and every non-text pair in
`scripts/check-contrast.mjs`). All four fail it.

No spinner colour recovers this. Because the compositing pulls the spinner and the button toward
the page together, the best ratio achievable over *any* spinner colour at `0.45` is 2.71:1 — still
short. The only free variable is how much dimming there is.

Measured across the range in both themes. Light is the stricter of the two — a white spinner on a
filled button loses more when the group is composited toward a near-white page than a light spinner
loses toward a near-black one — so the light column is what sets the value:

| `opacity` | Worst in dark | Worst in light | Meets 3:1 |
| --- | --- | --- | --- |
| 0.45 | 2.52:1 | 2.16:1 | no |
| 0.55 | 3.15:1 | 2.64:1 | no — light fails |
| 0.60 | 3.51:1 | 2.92:1 | no — light fails |
| **0.65** | **3.91:1** | **3.24:1** | **yes** |
| 0.70 | 4.33:1 | 3.60:1 | yes |

## Decision

**`loading` is dimmed, at `opacity: 0.65`; `disabled` keeps `0.45`.** The two states do not share a
value, which is not a compromise but an improvement on the original proposal: `disabled` stays
visibly the fainter of the two, so the amount of dimming is itself a second signal behind the
spinner.

The value is the least dimming that clears 3:1 in both themes. It is not a round number chosen for
looks — move it down and the spinner stops meeting the bar the library sets for every other status
mark.

Under `forced-colors: active` neither is faded. `disabled` takes `GrayText`, as before, and
`loading` returns to full strength with the spinner carrying the state — a faded control is not one
of that mode's conventions, and "in flight" is not "unavailable".

What keeps the two states apart is no longer the dimming:

- `loading` shows a spinner; `disabled` never does. This is the difference a reader sees first.
- `loading` takes `cursor: progress`; `disabled` takes `cursor: not-allowed`.
- `loading` stays focusable and reports `aria-busy`; `disabled` is natively disabled, removed from
  the tab order and inert. This difference is the one that matters to a keyboard user waiting on an
  action, and it is untouched.

Everything else ADR-0004 §5 decided still stands. The content keeps its box and fades to
`opacity: 0` under the spinner rather than being hidden with `visibility`, so the button's size is
identical in both states and its accessible name survives.

## Consequences

**`scripts/check-contrast.mjs` does not cover this and cannot be made to.** It resolves the token
graph and measures pairs of resolved colours; the number that matters here is produced by
compositing at a given `opacity`, which the script has no notion of. The ratios above were measured
in a real browser and are stated as such — they are not claimed as script-verified, and a future
change to `--kreo-accent-500` or to the page surface will not re-check them. Anyone changing the
loading opacity or the spinner has to repeat the measurement by hand.

`IconButton` shares the pattern and takes the same change, so the two do not drift.

The visual baselines for the loading states move in both themes. That is the change, photographed.
