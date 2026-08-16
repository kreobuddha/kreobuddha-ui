# ADR-0011: `Toast` is a provider, one polite region, and a queue of three

- Status: Accepted
- Date: 2026-08-16
- Decision owners: Rustam
- Required before implementation by the plan for the `0.15.0` batch: `Toast` is the only component
  in it that could force an architectural change, and the change is a provider

## Context

Every component this library ships is a function of its props. Nothing in it holds state for the
application, nothing renders outside its own subtree, and there is no context, no provider and no
hook in the public API. `Toast` is the first component that asks for all three at once.

The reason is that a toast is not raised by the thing that draws it. It is raised at the moment a
save fails, from a callback several levels below any place a floating stack of messages could
reasonably be rendered — and it has to appear in a fixed place on screen no matter where in the
tree that callback lives. That is what a provider is for, and it is why the decision cannot be
deferred to "whatever the component ends up needing".

The alternative is real and was considered: the consumer holds an array of messages and renders a
region, exactly as they already hold every other piece of state in this library. It keeps the
package free of context and keeps the component a function of its props.

Rustam chose the provider. The rest of this record is the shape that choice takes, and the parts
that are not implied by it.

## Decision

### 1. `ToastProvider` owns the list; `useToast()` raises them

```tsx
<ToastProvider>{app}</ToastProvider>;

const { toast, dismiss } = useToast();

toast({ tone: 'danger', title: 'Save failed', children: 'The workspace was changed.' });
```

`toast(options)` returns the id it assigned; `dismiss(id)` removes that toast early. `useToast()`
outside a provider throws with a message naming the provider, rather than returning a no-op — a
toast that silently never appears is a bug that takes an afternoon to find.

The provider renders the region itself. There is no second component for a consumer to place, and
therefore no way to forget to place it.

### 2. One region, `aria-live="polite"`, never `assertive`

All toasts share a single live region. Politeness is not configurable: `assertive` interrupts
whatever the reader is being told at that moment, and nothing that arrives in a corner and vanishes
by itself deserves that. A message urgent enough to interrupt belongs in an `Alert` with `live`, in
the flow of the page, where it stays until it is dealt with.

The region is always mounted and empty when there is nothing to show — a live region announces what
changes inside it, and a region mounted at the same moment as its first message announces nothing.
This is the same rule `Toggletip` follows.

### 3. The region is in the top layer

`popover="manual"`, as `Tooltip` and `Toggletip` use it, and for the reason that decides it: a save
can fail while a modal `Dialog` is open, and a toast drawn under the dialog it is about would be
worse than no toast at all. A `z-index` cannot win against the top layer; only the top layer can.

**What a real engine actually does, observed before this record was accepted** (Chromium 141, a
`popover="manual"` element shown while `components-dialog--default` had a modal `<dialog>` open):

- the popover stays open — `showModal()` does not close it;
- it is **painted above** the dialog panel, which is the thing that decides this rule;
- it is **not hit-testable**. Everything outside a modal dialog is blocked by it, so
  `elementsFromPoint` over the toast returns the `<dialog>`, and the toast's dismiss button cannot
  be clicked until the dialog closes.

The third point is the platform being consistent — a modal is modal — and it is a limitation of
this component, not a defect to work around. A toast raised over a modal dialog is seen and
announced, and it is dismissed by its own timer rather than by the reader. `README.md` says so, and
`tests/browser/` asserts all three, so an engine changing any of them is caught here rather than by
a consumer.

### 4. Three visible by default, the rest queued

At most `limit` toasts are on screen, and `limit` is `3` unless the application says otherwise.
Further ones wait and appear as room is made, rather than being dropped: a dropped toast is a
message the application believed it had delivered.

Newest is nearest the corner the region is anchored to. A toast that is superseded before it is
ever shown is still shown — deduplication is the application's business, and this component has no
way to know that two messages mean the same thing.

### 5. Auto-dismiss, paused by hover **and** by focus

Five seconds by default. The default is `ToastProvider`'s `duration` prop, a single toast overrides
it with its own `duration`, and `duration: 0` keeps that toast until it is dismissed.

Both numbers are defaults rather than constants because the right ones depend on the message: a
line of confirmation and a paragraph explaining a failed import are not read in the same time. What
is not configurable is the pause rule below, which is what makes any of these numbers safe.

The timer stops while a pointer is over the region or focus is inside it, and resumes when both are
gone. Without the pause this component is an accessibility trap by construction: a reader who is
slower than five seconds, or who is tabbing towards the dismiss button, is chasing a message that
is being taken away from them.

### 6. Reachable by keyboard, without a hotkey

Every toast carries a dismiss button, so it is in the tab order, and the pause-on-focus rule above
is what makes tabbing to it safe.

There is deliberately **no** global hotkey to jump to the region. `F6` is what the WAI-ARIA
Authoring Practices suggest, and it is a keystroke this library would have to claim from every
application that embeds it, on the strength of no consumer having asked. The region sits at the end
of the document, so the keyboard route to it is long but real, and it is stated in `README.md`
rather than implied.

### 7. The region sits in the bottom-inline-end corner

`inset-block-end` and `inset-inline-end`, not `bottom` and `right`: the library's stylesheets are
written in logical properties throughout, and in a right-to-left document the stack belongs in the
corner that reads as "after", not the one that is physically on the right.

The newest toast is nearest that corner, so the message that just arrived is the one closest to
where the reader's attention already is, and the older ones are pushed away from it rather than
displaced by it. The corner is not a prop: a second placement would be a second layout to keep
correct in both writing directions and both themes, on the strength of nobody having asked.

### 8. A toast draws itself, and borrows the tones rather than the component

The item is `Toast`'s own markup. It is **not** the `Alert` component, and the difference is
deliberate: rendering `Alert` would make every future change to a toast's shape a change to a
banner that sits in the page, and the two are only similar today.

What is shared is what should be — the colour. A toast uses the same four tinted surfaces and the
same text-on-tint tokens `Alert` uses (`--kreo-surface-*-soft`, `--kreo-text-on-*-soft`), so
"something failed" is one colour everywhere in the library, and the pairs are already measured in
`scripts/check-contrast.mjs`. The batch adds no new colour pair.

The four tone marks are shared too, and for the same reason as the colour: they exist so a tone is
not carried by colour alone, and two components drawing different marks for `danger` would be worse
than either drawing none. They move from `src/components/Alert/icons.tsx` to `src/internal/`, where
both components read them. They stay unexported and outside the public API — ADR-0002 and ADR-0009
keep an icon set out of this package, and a file moving does not change that.

What `Toast` adds on top is the floating surface itself: an overlay shadow and a border, because
this item floats over arbitrary content while an `Alert` sits in the flow of a page that already
frames it.

## Consequences

- The library gains its first context, its first hook and its first component that renders outside
  its own subtree. `ToastProvider` and `useToast` become public API under SemVer.
- An application must wrap its tree. A component library that requires a wrapper is a heavier thing
  to adopt than one that does not, and this is the cost of the decision in rule 1.
- Three components are now in the top layer. `Toast` does not compose the shared overlay stylesheet,
  because that file is about placing a bubble against an anchor and this region is placed against
  the viewport — so the two do not drift into one another.
- `Alert` and `Toast` share tokens and marks, not markup. Either can be restyled without touching
  the other, which is the point of rule 8; the price is that keeping them looking related is now a
  matter of discipline rather than of the compiler, and the two visual baselines are what show it
  when they diverge.
- The tone marks move out of `src/components/Alert/`. `Alert` renders exactly what it rendered
  before, so no baseline and no public API changes with the move.
- The timer, the queue and the pause make this the first component in the library with meaningful
  behaviour under time. Its tests use fake timers, and the pause-on-hover rule is checked in a real
  browser, because a pointer that never really enters anything cannot pause anything.

## Alternatives considered

- **A controlled list, no provider.** Keeps the package context-free and every component a function
  of its props. Rejected by Rustam. It moves the queue, the timers and the pause rules into every
  application that wants a toast, and those rules are exactly the part that is easy to get wrong.
- **Rendering the existing `Alert` inside the floating region.** One markup, one dismiss button, one
  place to fix a message surface. Rejected by Rustam: it welds a floating, timed, stacked item to a
  banner that lives in the page, and the first restyling of either would have to be a restyling of
  both. Sharing the tokens keeps the consistency that made it attractive and drops the coupling.
- **A `placement` prop for the region's corner.** Rejected: see rule 7.
- **Fixed limit and duration.** Rejected by Rustam: see rule 5. The pause rule is what makes a
  configurable timer safe, and that one stays fixed.
- **`assertive` for the danger tone.** Rejected: see rule 2. The tone that would want it is the tone
  whose message should not be disappearing on a timer in the first place.
- **A `<dialog>`-based region.** Would sit in the top layer too, but a dialog is modal or it is
  nothing useful here, and a toast must never take focus.
- **Dropping the oldest toast when the limit is reached.** Simpler than a queue, and it makes the
  application's most recent messages the ones most likely to be missed under load, which is when
  messages matter most.
- **An `F6` hotkey to the region.** See rule 6. Revisit if a consumer asks.

## Review trigger

- A consumer needs two regions in different corners, or needs to render the region somewhere
  specific — the single implicit region is the part of rule 1 most likely to be outgrown first.
- A screen-reader run shows the polite region losing announcements when three arrive at once.
- The top-layer behaviour in rule 3 changes in an engine, or the check that established it starts
  failing.
