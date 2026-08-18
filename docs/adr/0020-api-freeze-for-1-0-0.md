# ADR-0020: The `1.0.0` API freeze

- Status: Accepted
- Date: 2026-08-18
- Decision owners: Rustam
- Applies: [ADR-0015](0015-good-out-of-the-box-over-configurable.md)

## Context

`1.0.0` means one thing that `0.x` did not: an export, a prop, a `--kreo-*` custom property, a DOM
shape or a documented keyboard behaviour cannot be renamed or removed without a major version. The
`0.x` line said in `README.md` that a minor could break any of them, and `0.19.0` used that
licence deliberately — the type scale went from eleven sizes to four, and `size` stopped setting
type.

So the question this record answers is not "is the API good" but "is this the surface we are
willing to carry", asked once, per item, before it stops being free to change.

The surface is now measurable rather than remembered: `scripts/public-api.snapshot.json`, checked
on every pull request by `npm run check:api`, holds **21 value exports, 40 exported types, 3
package subpaths and 135 custom properties**.

## Decision

**The surface recorded in `scripts/public-api.snapshot.json` at `1.0.0` is frozen for the `1.x`
line, unchanged.** Nothing is removed in this release, and the reasoning per group is below.

### The exports and their types — frozen as they are

Twenty components, `useToast`, and the types that name their props. Each was designed as its own
slice against `COMPONENT_STANDARD.md` and shipped with tests, stories and a documentation page;
none is a candidate for removal, and no name is ambiguous enough to be worth a rename that every
consumer would pay for.

### The three subpaths — frozen

`.`, `./styles.css`, `./package.json`. Per-component subpath exports stay unbuilt, as
`ARCHITECTURE.md` has said since Phase 0 and as the adoption notes measured: the stylesheet is a
fixed cost paid at first import, and no consumer has shown it dominating their bundle.

### The 135 custom properties — frozen, including 28 the library does not use itself

This is the part worth writing down, because it looks like a contradiction of ADR-0015, which says
a token nothing references has not earned a public name.

Twenty-eight declared properties are referenced by no component in the library. They fall into two
kinds, and neither is what ADR-0015 was aimed at:

- **scale steps** — `--kreo-space-0/7/10/12/20`, `--kreo-radius-xs/xl`, `--kreo-neutral-500/950`,
  `--kreo-accent-100`, `--kreo-leading-normal`, `--kreo-tracking-normal/tight`. A scale is the
  vocabulary a consumer lays out their own screens with, and a scale with holes in it is worse
  than a scale with steps the library happens not to need. `--kreo-space-10` missing between 8 and
  12 would be a defect, not a saving;
- **semantic names for states a consumer's own controls have too** — `--kreo-surface-page`,
  `--kreo-text-inverse`, `--kreo-surface-inverse`, `--kreo-border-inverse`, `--kreo-text-disabled`,
  `--kreo-surface-disabled`, `--kreo-border-input`, `--kreo-border-strong`, `--kreo-border-subtle`,
  `--kreo-surface-accent-soft`, `--kreo-text-link-hover`,
  `--kreo-duration-instant`, `--kreo-transition-fade`, `--kreo-type-display`, `--kreo-type-data`.
  These are how an application matches the library rather than approximating it, and two of them —
  `--kreo-surface-page` and `--kreo-type-data` — are already used by `examples/workbench`, which is
  a consumer composing screens the library does not ship.

ADR-0015 was written against eleven type sizes the library could not tell apart, three of which
nothing anywhere referenced. That cut happened, in ADR-0016. Cutting a spacing scale to the steps
twenty components happen to use is a different act with a different consequence, and it is not
made here.

**What that costs, stated plainly:** these 28 are now promises. Removing one is a `2.0.0`, and
each is a value that has to keep meaning what its name says. That is the price of the decision,
and it is paid deliberately rather than by omission.

### What was removed before the freeze rather than in it

`0.19.0`, one release earlier and on purpose: seven `--kreo-text-*` sizes, `--kreo-type-body-lg`,
and the meaning of `size` on four controls. The freeze inherits the surface those decisions left,
which is why they were taken when they were.

## Consequences

- a consumer can pin `^1.0.0` and know that an export, a prop or a `--kreo-*` name will not
  disappear under them;
- `check:api` turns the freeze into a check rather than an intention: a rename fails the build and
  has to be argued in a pull request;
- the deprecation policy in `RELEASES.md` starts binding, having never applied in `0.x`;
- an addition is still a minor version, so the surface can grow — the freeze constrains removal and
  renaming, not the arrival of a component a consumer proves.

## Alternatives considered

- **Cut the 28 unreferenced properties first.** Rejected above: it confuses "the library does not
  use it" with "nobody needs it", and a scale with holes is a worse public interface than a
  complete one. It stays available as a `2.0.0` decision if the evidence ever arrives.
- **Freeze the exports and leave the tokens fluid.** Rejected: `ARCHITECTURE.md` and
  `RELEASES.md` have both said since Phase 0 that documented `--kreo-*` properties are public API
  under SemVer. Exempting them at the moment it starts to matter would make that sentence
  decorative.
- **Delay the freeze to `1.1.0`.** Rejected as a contradiction in terms: `1.0.0` is the freeze.

## Review trigger

A consumer whose bundle is dominated by the stylesheet — which reopens the subpath question — or a
component whose props are found to be wrong in use, which is a deprecation cycle under
`RELEASES.md` rather than a rename.
