# Accessibility release checklist

One row per shipped component, one column per claim, and in every cell the command that shows it.
The `1.0.0` gate in [RELEASES.md](RELEASES.md) asks for this list; what makes it worth having is
that a cell either names evidence or says "not verified", and never says "yes".

Taken at `0.19.0` + Phase 8, 2026-08-18. Every number below came from a run:

- `npm test` — 408 tests in 41 files. Two projects: unit tests in jsdom, and every story executed
  in a real Chromium through `@storybook/addon-vitest`, with axe scanning the rendered output;
- `npm run check:contrast` — 146 pairs, both themes, against the WCAG 2.2 targets;
- `npm run check:browser:matrix` — 30 behaviour tests in Chromium, Firefox and WebKit. On macOS,
  WebKit records two expected failures; CI's Linux WebKit passes all thirty, which is the difference
  between the two builds rather than between this library's behaviour on them.

## What the columns mean

| Column | The claim |
| --- | --- |
| **Semantics** | the element the browser sees is the element the pattern needs, and any ARIA is on top of it rather than instead of it |
| **Name** | the accessible name is present and comes from a documented prop or the content |
| **Keyboard** | every operation is reachable and performable from the keyboard alone |
| **Focus** | focus is visible, does not reflow the box, and goes where the pattern requires |
| **Contrast** | every pairing the component puts on screen is measured in both themes |
| **Forced colors** | the component survives `forced-colors: active`, where shadows are not painted |
| **Reduced motion** | motion is dropped rather than slowed under `prefers-reduced-motion: reduce` |

Shorthand for the evidence: **U** = unit tests queried by role and name; **S** = story `play`
functions run in a real Chromium, plus axe over the same render; **B** = `tests/browser/`, real key
presses in three engines; **C** = `check:contrast`; **—** = not applicable to this component.

## The twenty components

| Component | Semantics | Name | Keyboard | Focus | Contrast | Forced colors | Reduced motion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Accordion` | `<details>`/`<summary>`, no ARIA added — U, S | U | B — `Enter` and `Space`, one tab stop per summary | B | C | CSS + S | — |
| `Alert` | `role="alert"` only when `live` — U | U | — | — | C | CSS | — |
| `Badge` | plain `<span>`, out of the tab order — U | content | — | — | C | CSS | — |
| `Button` | `<button>` — U, S | U, S | native | S, `--kreo-focus-ring` inside the box | C | CSS | — |
| `Checkbox` | `<input type="checkbox">` — U, S | U (`label` required) | native | S | C | CSS | — |
| `Dialog` | `<dialog>` + `showModal()` — U, S | `title` — U | B — `Escape` closes; `Tab` never leaves the panel | B — into the panel, page behind inert; **returns to the trigger except on WebKit's macOS build** | C | CSS + B (a non-zero border under `forced-colors`) | CSS |
| `FieldGroup` | `<fieldset>` + `<legend>` — U | `legend` — U | native | native | C | shared `field.module.css` | — |
| `IconButton` | `<button>` — U, S | `label` required, compiler-checked — U, S | native | S | C | CSS | — |
| `Progress` | `role="progressbar"` by decision, not `<progress>` — U, S | `label` required — U | — | — | C | B — track keeps its extent, fill stays visible | CSS |
| `Radio` | `<input type="radio">` — U, S | `label` required — U | native — arrows and one tab stop belong to the group | S | C | CSS | CSS |
| `Select` | native `<select>` — U, S | U | native | S | C | CSS | — |
| `Skeleton` | decorative, out of the accessibility tree — U | — | — | — | C | B — shape survives when the fill is not painted | B — the pulse is dropped, not slowed |
| `Spinner` | `role="status"` only when `label` — U, S | opt-in `label` — U | — | — | C | CSS | CSS — no rotation |
| `Switch` | checkbox underneath, `role="switch"` on top — U, S | `label` required — U | native | S | C | CSS | CSS |
| `Tabs` | WAI-ARIA tabs — U, S | U | **S** — arrows move and select, `Home`/`End` jump, roving `tabindex` keeps one tab stop; real key presses in Chromium through the story runner, and in jsdom through the unit tests | S | C | CSS | — |
| `TextField` | `<input>` + `<label>`, `aria-describedby` ordered hint-then-error — U, S | `label` required — U | native | S | C | shared `field.module.css` | — |
| `Textarea` | `<textarea>` — U, S | `label` required — U | native | S | C | shared `field.module.css` | — |
| `Toast` | `role="status"` region, popover — U, B | U | B — the dismiss button is reachable and `Enter` dismisses (**Tab does not reach it on WebKit's macOS build**, see below) | B — the timer pauses while focus is inside | C | B | CSS |
| `Toggletip` | `popover`, opened by a real `<button>` — U, B | U | B — `Escape` closes and returns focus to the trigger | B | C | B | — |
| `Tooltip` | `popover` + CSS anchor positioning — U, B | U | B — `Escape` closes without moving focus | B — focus opens it and does not move | C | B — the bubble keeps a visible edge | — |

## What is not verified, stated rather than rounded up

- **The screen-reader pass over `Dialog`, `Tabs` and `Tooltip` has not been run.** The VoiceOver
  script is written, in [ADR-0010](adr/0010-overlay-and-composite-strategy.md), and it needs a
  person driving a real assistive technology. No check in this repository stands in for it, so
  **`1.0.0` claims no screen-reader conformance for those three**. It restarts when Rustam runs the
  script.
- **On WebKit's macOS build, closing a `Dialog` does not return focus to its trigger.** The Linux build CI runs does return it, which is how the difference turned out to be the build rather than the engine. Recorded in the test as
  an expected failure, so the day WebKit changes, the suite says so. The decision not to work
  around it is ADR-0010's: overlay focus behaviour belongs to the browser.
- **On WebKit's macOS build, `Tab` does not reach the toast's dismiss button.** Safari leaves buttons out of the
  tab order unless the reader turns on "Press Tab to highlight each item on a webpage". The button
  is a real `<button>` and `Enter` activates it in every engine; what differs is the platform's
  keyboard model, not this markup.
- **`Tabs` keyboard evidence is Chromium, not three engines.** It runs in the story runner rather
  than in `tests/browser/`, which is the project that runs cross-engine. Until Phase 8 this
  document and ADR-0010 both said `check:browser` covered it; that was wrong, and it is corrected
  here rather than quietly.
- **Axe is not the claim.** It runs over every story and a violation fails the build, which is the
  floor rather than the ceiling. Everything above it — semantics, names, keyboard, focus order —
  is asserted by tests written per component, because axe cannot judge any of it.

## When to re-take this

Every `1.x` release that changes a component's markup, keyboard behaviour or focus behaviour. The
commands are three, they are the same three each time, and the row that changes is the row whose
component changed.
