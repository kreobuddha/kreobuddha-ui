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
  behaviour, not ours, and cannot regress through our own changes. The other side of that bargain
  is that where an engine gets one of them wrong, so do we: WebKit does not return focus to the
  trigger when the dialog closes, and this is accepted as a stated limitation rather than patched.
  See "The one cross-engine run" below.
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

Most of it has since been closed, and by automation rather than by hand: `tests/browser/` is a
second Playwright project that drives the built Storybook with real key presses in a real engine,
and it runs in CI under `npm run check:browser`. A check that lives in a test does not have to be
remembered.

| Check | State |
|---|---|
| `Tabs` keyboard — arrows, `Home`/`End`, one tab stop | done — in the story runner's real Chromium, through the stories' `play` functions, and in jsdom through the unit tests. Not in `tests/browser/`, which is the cross-engine project; corrected in Phase 8, where this row had implied otherwise |
| `Tooltip` — focus opens, placement, top layer | done, measured in a browser |
| `Tooltip` — `Esc` closes without moving focus | done, automated in `tests/browser/overlays.spec.ts` |
| `Dialog` — focus into the panel, return to the trigger | done, real interaction — **Chromium and Firefox; not WebKit**, see below |
| `Dialog` — `Tab` never leaves the panel | done, automated: six real `Tab` presses, and the page behind is never focused |
| `Dialog` — the page behind is inert | done, automated: a script cannot move focus to the trigger while the modal is open |
| `Dialog` — `Escape` closes | done, automated. The earlier note stands as history: the browser pane available then produced `keydown` and no `cancel`. A real press in a real engine does fire `cancel`, and `onClose` runs |
| forced-colors mode | done for the overlays, automated: with `forced-colors: active` emulated, the `Dialog` panel and the `Tooltip` bubble each still compute a non-zero border, which is what ADR-0007 asked for and what a shadow-only overlay would fail. Asserted on computed style rather than on a screenshot, because the forced-colors palette is the operating system's and a baseline would not survive the move from macOS to Ubuntu |
| Screen reader, all three components | **not done, and parked by Rustam's decision** rather than pending. It needs a real assistive technology on a real machine; the script is below and stays here so the check can be picked up unchanged. Recorded in `ROADMAP.md` under "Parked by decision" so it is not rediscovered as an oversight |

### The one cross-engine run

> **Superseded by a runner in Phase 8, 2026-08-18.** The behaviour suite now runs in all three
> engines on every pull request, through `npm run check:browser:matrix`, and the WebKit focus
> difference below is recorded in the test itself as an expected failure rather than in prose — so
> the day the engine changes, the run says so. Phase 8 also found a second WebKit difference this
> hand-run never covered: Safari leaves buttons out of the tab order unless the reader turns that
> on, which the toast's dismiss button meets. The account below stands as the history of what was
> known when this ADR was accepted.

The automated project is Chromium, like everything else here. The same file was also run once, by
hand and not in any chain, against Playwright's WebKit 26.5 and Firefox 153 builds — enough to say
something about the other engines without claiming a cross-browser suite that does not exist.

Firefox passed all four behaviour checks. WebKit passed three and failed one, and the failure is
worth stating plainly: **on WebKit, closing the dialog does not return focus to the trigger.** It
closes correctly, `Escape` works, the trap holds — but focus lands on `<body>`, and it does so
whether the dialog is closed by `Escape` or by the close button. A keyboard user on that engine
loses their place in the page.

**Decided: this stays as a stated limitation and is not worked around.** Decision 1 above is that
overlay focus behaviour is the browser's, and a restoration path written here would be the first
crack in it — code that has to be right in every engine, kept in agreement with the engines that
already do it correctly, to compensate for one of the three. The cost is named rather than hidden:
a keyboard user closing a dialog in Safari is returned to the top of the document instead of to the
control they opened it from.

Two things would reopen this. The first is a consumer reporting it in practice. The second is
confirmation in shipping Safari — Playwright's WebKit is a build for testing, and the behaviour
above was observed there rather than in the browser people actually use.

### The screen-reader script

Three checks, one component each, on a real machine with VoiceOver (`Cmd`+`F5`). Run Storybook
(`npm run storybook`) and open each story from the sidebar.

1. **`Dialog` announces its name, and the page behind is unreachable.** Open
   `Components/Dialog → Focus Returns To The Trigger`. `Tab` to "Delete workspace", press `Enter`.
   Expected: VoiceOver announces the dialog and reads "Delete workspace" as its name, not just
   "dialog". Then `VO`+`→` repeatedly through the whole panel: nothing from the page behind should
   ever be read. `Escape` returns to the trigger and it is announced again.
2. **`Tabs` announces the selection, the position and the panel.** Open
   `Components/Tabs → Default`. `Tab` into the tab list, then press `→`. Expected: each tab is read
   as a tab, as selected, and with its position in the set ("2 of 3" or the equivalent). One more
   `Tab` moves to the panel, and the panel's content is read as belonging to that tab.
3. **`Tooltip` is read with its trigger.** Open `Components/Tooltip → Default`. `Tab` to the
   button. Expected: the tooltip text is read as the button's description, after its name, in one
   announcement — not as separate loose text encountered later while navigating.

Record the result here, per line, including what was actually announced when it differs.

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
