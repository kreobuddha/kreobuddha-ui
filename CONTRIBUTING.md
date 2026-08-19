# Contributing

Thank you for looking. This file is the outside view of a process that is already written down in
`docs/` — it says where things are and what a change has to clear, rather than repeating either.

## What this project is

A small, deliberately slow component library. Scope is decided before code: `docs/ROADMAP.md` says
what is planned, and a roadmap entry is a plan rather than permission. Components land one at a
time, each as its own reviewed slice.

That means **an unsolicited pull request adding a new component is likely to be declined**, however
good it is — not because of its quality, but because the decision to build it has not been made yet.
Open an issue first and let's agree on the shape.

Bug reports, accessibility findings, and reports of the package misbehaving in a real consumer are
welcome without any preamble. They are the most useful thing this project can receive, because they
are the evidence it is designed around.

## Before you write code

Read, in this order:

| Document                                                   | What it settles                               |
| ---------------------------------------------------------- | --------------------------------------------- |
| [`docs/COMPONENT_STANDARD.md`](docs/COMPONENT_STANDARD.md) | what a good component **is**                  |
| [`docs/COMPONENT_RECIPE.md`](docs/COMPONENT_RECIPE.md)     | what to **type**, step by step                |
| [`docs/CODE_STYLE.md`](docs/CODE_STYLE.md)                 | house style, including comments               |
| [`docs/QUALITY.md`](docs/QUALITY.md)                       | what counts as verified                       |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)             | package boundary, styling model, token layers |
| [`docs/adr/`](docs/adr/)                                   | decisions already taken, and why              |

A decision recorded in an ADR is not re-litigated in a pull request. If new evidence justifies
revisiting one, that is a new ADR, and the existing one names the evidence that would qualify.

## The gate

One command, and it must pass before a pull request is opened:

```bash
npm run verify
```

It runs format, lint, stylelint, types, the unit tests, the story tests in a real Chromium under
axe, the contrast measurement, the package build, the Storybook build and the package contract
checks.

CI runs it too, but not on every pull request, because the browser half of it takes minutes and a
feature branch rarely needs to wait for that answer:

| When                                               | What CI runs                                   | Browsers  |
| -------------------------------------------------- | ---------------------------------------------- | --------- |
| A pull request into a release branch               | `verify-fast` — the inner loop below           | none      |
| The merge that lands it in the release branch      | `verify` — the gate, against that exact commit | Chromium  |
| A pull request from a release branch into `master` | `verify`, `browser-matrix`, `node-compat`      | all three |
| `master`                                           | `verify`, `browser-matrix`, `node-compat`      | all three |

The gate therefore still runs against every merge; it just runs after it rather than in front of
it, so a regression is attributed to one commit instead of surfacing at release time among all of
them.

Firefox and WebKit are the exception, and they are deliberately late. Fetching three engines took
anywhere from 33 seconds to half an hour depending on whether the Actions cache happened to be warm
for that branch, and the answer has never differed from the one the release run gives. So
`browser-matrix` — the evidence behind the cross-engine claim in `docs/QUALITY.md` — runs when a
release is proposed, which is where that claim is published. `verify` keeps Chromium, because the
story tests, `check:workbench` and `check:browser` all need a real browser on every merge.

`node-compat` installs, builds, packs and consumes the package on Node 20.19 and 22 — the floor and
the middle of the range `engines` declares; `verify` covers 24. The rest of the list is not
repeated per version because its verdict does not depend on one.

None of this changes what is expected of you before opening a pull request: run `npm run verify`
locally. CI running less is not permission to check less.

While working, the fast loop is:

```bash
npm run verify:fast
```

Format, lint, stylelint, types and the unit tests, in a few seconds. For one component alone,
`npm run test:one -- Name`.

Requirements that are easy to miss:

- **Every colour pairing a component puts on screen goes into `PAIRS` in
  `scripts/check-contrast.mjs`.** A pairing that is not listed is not measured, in either theme.
- **Stories are tests.** Every story runs in the browser and is scanned by axe; a violation fails
  the build. Put anything needing real layout — focus rings, truncation, measured width — into a
  `play` function, because jsdom has no layout and an assertion about it there is meaningless.
- **Look at the component in Storybook in both themes** before calling it done. Nothing in the list
  above catches something that passes every check and looks wrong.
- Do not weaken a type, a test, a lint rule or an accessibility check to make the gate pass.

## Pull requests

Keep the change to one slice. Commit subjects are conventional and lowercase (`feat: add Textarea`,
`chore: release 0.12.0`, `docs: …`); the body explains why, not what the diff already shows.

If the change touches a component's public props, a documented CSS custom property, DOM semantics or
keyboard behaviour, it is compatibility-sensitive: say so in the description, and update
`CHANGELOG.md` and `docs/ROADMAP.md` as `docs/COMPONENT_RECIPE.md` §6 requires. The prop table is
generated from the types, so a new or changed prop is documented by its JSDoc in the source rather
than by editing `README.md`.

Releases are not part of a feature pull request. They are a separate versioning commit followed by a
manually dispatched workflow.

## Licence

By contributing you agree that your contribution is licensed under the [MIT](LICENSE) licence that
covers this repository.
