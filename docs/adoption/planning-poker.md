# Adoption notes — Planning Poker

The Phase 6 record: what an independent application asked of this library, what it got, and what it
had to build itself. Everything here was observed by running the application, not inferred from
reading it. Each finding carries a verdict, because an adoption note that only lists complaints
gives the next phase nothing to act on:

- **general gap** — the library should close it, and a real consumer scenario has now demonstrated
  the need that `ROADMAP.md` asks for before a backlog candidate enters scope;
- **application's own** — the application solves it, and the library is right not to grow a
  component for it;
- **documentation friction** — the API exists and works; finding it was the problem;
- **known cost** — a deliberate design decision whose price is now measured rather than estimated.

## The consumer

[`kreobuddha/kreobuddhas-planning-poker`](https://github.com/kreobuddha/kreobuddhas-planning-poker)
— a real-time estimation tool: React 19, TypeScript, Vite, Firebase (Firestore + anonymous auth),
Redux Toolkit Query. It is an independent public repository with its own conventions, not an example
in this one, and it was written before this phase was planned.

It has depended on `@kreobuddha/ui` since `0.3.0`, but only for `Button`. Everything else it needed —
text fields, an error banner, status labels, a deck picker, vote cards — it built with its own SCSS.
That gap between "installs the package" and "uses the library" is what makes it a useful consumer.

## What was measured

The application was upgraded `0.3.0` → `0.16.0` with no other change: no component was swapped, no
markup was touched. `npm run build` and `npm run lint` pass, and the full flow — create a session,
ask a question, vote, reveal, average — was driven in the browser with no console errors.

| Build output | `0.3.0` | `0.16.0` |
| --- | --- | --- |
| `dist/assets/index-*.js` | 856.59 kB (gzip 260.27 kB) | 856.83 kB (gzip 260.35 kB) |
| `dist/assets/index-*.css` | 17.02 kB (gzip 3.75 kB) | 43.53 kB (gzip 7.65 kB) |
| fonts | 4 static `woff2`, 63.79 kB | 2 variable `woff2`, 66.99 kB |

Read together with the findings below:

- **The JavaScript is evidence of tree shaking in a real application**, not a fixture. Thirteen minor
  versions and fifteen new components later, an application still importing only `Button` pays
  0.24 kB more. `scripts/check-consumer.mjs` asserts this property with markers; this measures it.
- **The stylesheet is not tree-shaken and is not meant to be** — see "known cost" below.
- **The font change is expected** and was made in `0.5.0`: the static pair did not contain weight
  500, so the declared type scale resolved silently to 400. The variable font costs 3.2 kB more and
  makes the shipped weights match the documented ones.

## Findings

### 1. Fields without labels — the plainest win of the whole upgrade

The application's four text inputs are bare `<input>` elements with a `placeholder` and no `<label>`.
A placeholder is not an accessible name and disappears the moment anything is typed, so today those
fields are unusable by anyone not looking at them.

`TextField` and `Select` make `label` a **required** prop, so the same field cannot be built wrong.
That requirement was recorded as an API decision when the field layer landed; this is the first time
it has been observed catching a real application.

**Verdict: application's own.** The API exists, it is right, and the application should adopt it.

### 2. No component for a group of mutually exclusive options

`DeckPicker` presents three card decks and exactly one is active. It is built as a row of
`<button type="button">` elements with a `--selected` modifier class, which is a toggle behaviour
expressed with action semantics: nothing tells assistive technology that these three belong to one
group, that one of them is chosen, or that the arrow keys should move between them.

`VoteCards` is the same shape — one card of eight is selected — though its cards also clear on a
second press, which is not radio behaviour.

The library ships `Checkbox` and `Switch`, which are independent, and `Tabs`, which owns a panel.
Nothing covers "pick one of a few, in place".

**Verdict: general gap.** This is the demonstrated need `ROADMAP.md` requires before a candidate
enters scope, and it is the strongest candidate for the `0.17.0` slice. Its design is not settled
here: whether it is a `RadioGroup` on native `<input type="radio">` or a segmented control on the
roving-tabindex model already written for `Tabs` is a design decision that gets made in its own
slice, with an ADR if it introduces a new interaction model.

### 3. `ToastProvider` is invisible from the README

`README.md` lists `Toast` among the status components and links to its generated page. Nothing on
the npm landing page says that `Toast` is the one component in the library that needs a provider
mounted above the tree, or that `useToast` throws without it. A reader deciding whether to use it
learns the cost only after one click and one scroll.

Every other component in the library is `import` and render. This one is not, and that difference is
worth one line where the components are listed.

**Verdict: documentation friction.** A one-line note in `README.md` beside the component list, not a
new document.

### 4. The error banner reimplements `Alert`

`Room.tsx` renders `room__banner`: a `role="alert"` div, a message, and a `Button variant="ghost"`
labelled "Dismiss", with its own SCSS.

`Alert` covers all of it — `tone`, `live` (which chooses `role="alert"` for `danger` and
`role="status"` for the quieter tones), `onDismiss` with `dismissLabel`. The application was written
against `0.3.0`, before `Alert` existed in `0.8.0`, and simply never revisited the decision.

What the swap has to answer, and what the room screen is a good test of: an action that failed is a
*notification*, not a state of the screen — the session behind it is still live. That is the
argument for `useToast` instead of `Alert` here, and the room is where the two are compared against
a real case rather than in the abstract.

**Verdict: application's own**, and the comparison is a real test of both APIs.

### 5. Both home buttons spin at once

Observed, not read: pressing "Create session" puts a spinner in **both** the create and the join
button. `Home.tsx` keeps one `busy` flag and passes it to both `Button loading={busy}`.

`Button`'s `loading` is per-button and behaves correctly — the fault is entirely the application's
single flag. It is recorded because it is the kind of defect an adoption pass is supposed to find,
and because it is invisible in the diff and obvious in the browser.

**Verdict: application's own.**

### 6. Status labels are hand-built where `Badge` exists

`ParticipantList` draws the `admin` marker and the `voted` / `waiting` status with two spans and two
SCSS rules. `Badge` is exactly this component, with tones, and its documentation makes the point the
application already respects — the text carries the meaning, the colour does not.

**Verdict: application's own.**

### 7. The stylesheet is all-or-nothing — the price, measured

`@kreobuddha/ui/styles.css` is the complete stylesheet: 80.77 kB raw, 8.11 kB gzipped, every
component's rules plus the token layer and the `@font-face` block. An application importing one
component links all of it. In this application's own build it minified to 43.53 kB (gzip 7.65 kB) —
up from 17.02 kB (gzip 3.75 kB) — while it was still using `Button` alone.

This is not a defect. `docs/ARCHITECTURE.md` names `./styles.css` "the complete supported
stylesheet" and defers per-component subpath exports until a consumer proves they are needed. This
consumer does not prove it: 4 kB of additional gzipped CSS sits beside 260 kB of gzipped JavaScript,
most of it the Firebase SDK, and the difference disappears once the application actually adopts the
components it is paying for.

**Verdict: known cost.** Recorded with a number so the next consumer argues from data. It becomes a
gap when an application ships a small bundle and can show the CSS dominating it.

## Not gaps

Recorded so they are not rediscovered as oversights:

- **Layout primitives (`Stack`, `Card`, `Grid`).** The application lays out its screens in SCSS with
  grid and flex, and never wanted a component for it. Adding a layout layer would be an abstraction
  built for symmetry, which `CLAUDE.md` rules out.
- **Vote cards and the results grid.** These are the application's domain, not a design system's.
  They stay in the application no matter how tempting a `Card` component looks from here.
- **Theme switching.** The application sets `data-kreo-theme` in `index.html` and owns the choice,
  which is the contract the workbench demonstrates. Nothing was missing.
