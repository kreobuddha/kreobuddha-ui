# ADR-0010: Overlays and composites are built on platform primitives

- Status: Accepted
- Date: 2026-08-16
- Decision owners: Rustam
- Satisfies the gate `docs/ROADMAP.md` puts on Phase 4: an accepted ADR for the
  native/custom/third-party primitive strategy, a runtime dependency and bundle assessment, and a
  defined set of manual keyboard and screen-reader checks
- Applies `--kreo-shadow-overlay`, added in `0.5.0` by [ADR-0007](0007-component-foundations.md) and
  unused since

## Context

Phase 4 is `Tabs`, `Tooltip` and `Dialog`. They are the first components in this library that need
things the previous eleven never did: a layer above the page, focus that moves and comes back,
dismissal, and a keyboard model that is not the browser's default for the element.

`CLAUDE.md` already constrains the answer twice. It asks for native semantics and platform
behaviour before ARIA or a custom interaction model, and it forbids hand-rolled focus management
for overlays without an accepted ADR and focused keyboard tests. This is that ADR.

The platform has changed enough that the usual answer — reach for a headless library — is no longer
the only serious one. `<dialog>` gives a focus trap, an inert background, `Esc`, and the top layer.
The `popover` attribute gives the top layer and light dismissal. CSS anchor positioning places one
element against another with no JavaScript at all, and reached Baseline in 2026 with support in
Chrome 125+, Firefox 132+ and Safari 18.2+ — roughly 91% of traffic.

## Decision

### 1. Platform primitives, no runtime dependency

`<dialog>` for the modal, the `popover` attribute for the tooltip's layer, CSS anchor positioning
for placement. The library ships no positioning or focus-management dependency, and `dependencies`
stays empty.

The reasoning is not only bundle size. A focus trap we write is a focus trap we can get wrong, and
the failure is silent: it looks correct and traps a screen-reader user or lets `Tab` escape behind
the backdrop. The browser's version cannot be got wrong by us. For a project whose stated purpose
includes demonstrating accessibility, borrowing someone else's implementation would also make the
demonstration theirs.

### 2. Placement is CSS anchor positioning, with one stated limit

`@position-try` — the automatic flip when the layer would leave the viewport — needs Safari 18.4+.
On Safari 18.2–18.3 placement is correct and the flip does not happen.

This is documented rather than patched. A polyfill would mean two positioning paths to keep in
agreement, and the failure it prevents is a tooltip that opens downward near the bottom of a window
on one version of one browser. Revisit if a consumer reports it in practice.

### 3. `Tooltip` is a tooltip, and says what it is not

Hover and focus open it; `Esc` closes it. It is **not** reachable by touch, and that is inherent to
the pattern rather than a defect to fix later: there is no hover on a touchscreen.

The consequence is a rule, not a caveat — **a tooltip may only carry content the reader can do
without**. Anything required belongs in a label, a hint, or visible text. `README.md` states this
where a consumer will read it before choosing the component.

A `Toggletip` — same placement, opened by click, reachable by touch and keyboard — is the right home
for content that matters. It goes to the backlog rather than into this phase.

### 4. `Dialog` is controlled

`open` and `onClose`, matching every other component in the library and the way state lives in
React. The component synchronises that prop with the element's imperative `showModal()` and
`close()` internally; a consumer never touches them.

`Esc` always closes, because the platform does it and taking it away would be worse than useless.

**A click on the backdrop also closes, by default.** Native `<dialog>` does not do this, so it is
behaviour the component adds. It is what people expect from a modal on the web. The cost is real and
worth naming: an accidental click beside a half-filled form throws the form away. `dismissOnBackdrop={false}`
turns it off, and a dialog holding unsaved input should set it.

### 5. `Dialog` owns its title

`title` is required and rendered as a heading wired to `aria-labelledby`. A dialog without an
accessible name is a common and serious defect, and a required prop is the version of that rule the
compiler can check — the same argument that made `label` required on `IconButton` and the fields.

The close button and a `footer` slot for actions are optional. Everything else is `children`.

### 6. `Tabs` activates on arrow, and unmounts what is hidden

Moving the arrow keys changes the selected tab immediately. That is the WAI-ARIA recommendation
when panels are cheap, and it is fewer keystrokes for the common case. `activation="manual"` moves
focus without selecting, for a panel expensive enough that arrowing past four of them would fire
four requests.

Only the selected panel is mounted. A consumer whose panel holds form state keeps that state
outside the panel, which is where it belongs anyway.

## Consequences

- No runtime dependency is added, and the published bundle does not grow beyond the components
  themselves.
- Focus trapping, background inertness, `Esc`, and stacking order in `Dialog` are the browser's
  behaviour, not ours, and cannot regress through our own changes.
- Overlays carry **both** a shadow and a border. Forced-colors mode paints no shadow at all, so a
  panel relying on one alone would lose its edge entirely — this was already decided in ADR-0007 and
  now takes effect.
- Tooltip content is constrained by rule 3. This will be uncomfortable at some point; the discomfort
  is the rule working.
- Automated accessibility checks are not sufficient for any of these three. The manual checks below
  are part of each component's definition of done.

## Manual checks required before each Phase 4 component ships

Required by the Phase 4 gate, and recorded here so they are not renegotiated per component.

**Keyboard, every component:**

- `Tab` reaches everything interactive and nothing else; the order matches the visual order.
- `Dialog`: `Tab` and `Shift+Tab` cycle inside and never reach the page behind. `Esc` closes.
  Focus lands inside on open and returns to the trigger on close, including after a backdrop click.
- `Tabs`: arrows move and select; `Home` and `End` jump to the ends; `Tab` leaves the tab list for
  the panel rather than walking through every tab.
- `Tooltip`: focusing the trigger opens it; `Esc` closes it without moving focus.

**Screen reader, at least one of VoiceOver or NVDA:**

- `Dialog` announces its name on open, and the page behind is not reachable.
- `Tabs` announces the selected tab, its position in the set, and the panel it controls.
- `Tooltip` content is announced with the trigger rather than as loose text.

**Also:**

- Both themes, and forced-colors mode — the last is where a shadow-only overlay disappears.
- `prefers-reduced-motion`: no entrance animation, and the component still opens.

## Outstanding checks

Phase 4 shipped with part of the list above unperformed. Recorded here rather than in a pull
request body, because a pull request is read once and this is not done.

| Check | State |
|---|---|
| `Tabs` keyboard — arrows, `Home`/`End`, one tab stop | done, real key presses in a browser |
| `Tooltip` — focus opens, placement, top layer | done, measured in a browser |
| `Dialog` — focus into the panel, return to the trigger | done, real interaction |
| `Dialog` — `Tab` never leaves the panel | done, six real `Tab` presses, focus never left |
| `Dialog` — `Escape` closes | **not done.** The available browser pane produces `keydown` and no `cancel` on a dialog that `:modal` matches. The wiring from `cancel` to `onClose` is covered by a unit test that dispatches the event; whether the browser fires it was not observed here |
| forced-colors mode, all three components | **not done.** The mode cannot be emulated from the available tooling |
| Screen reader, all three components | **not done.** Needs a real assistive technology on a real machine |

None of these is blocked by anything in the code. They need an environment this work did not have,
and they should be run before the library claims conformance anywhere.

## Alternatives considered

- **A headless library — Base UI, Radix, Ark.** Battle-tested accessibility and uniform behaviour
  across browsers. Rejected: it would be this library's first runtime dependency, tens of kilobytes,
  and its API shapes ours. For a portfolio project the accessibility work would also become
  someone else's.
- **Floating UI for placement.** Flips and shifts everywhere, including the Safari versions the
  native path does not. Rejected for the same dependency reason, against a failure that is narrow
  and cosmetic.
- **A hand-rolled focus trap.** Full control, and the likeliest place in the whole library to ship
  an accessibility defect that no test catches.
- **Backdrop click never closes.** Matches the native element exactly and protects typed input.
  Rejected as a default because it is not what people expect from a modal, and the protection is
  available as a prop where it actually matters.

## Review trigger

Reconsider if a consumer reports a real placement failure on Safari 18.2–18.3, if `<dialog>` or
`popover` prove to have a defect we cannot work around without a dependency, or when a component
arrives that needs a composite keyboard model the platform has no element for — a combobox most
likely, which is Phase 5 territory and not covered here.
