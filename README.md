# Kreobuddha UI

An accessible, themeable React component library for developer tools, technical products, and
data-dense frontend applications.

## Status: stable — `1.0.0`

**Twenty components ship today** — they are listed, and linked to their documentation, under
[Components](#components). Everything else in [docs/ROADMAP.md](docs/ROADMAP.md) is a plan, not an
available feature.

**`1.0.0` means the public API is frozen.** An export, a prop, a `--kreo-*` custom property, the
DOM a component renders and the keyboard behaviour it documents cannot be renamed or removed
without a major version — see
[ADR-0020](docs/adr/0020-api-freeze-for-1-0-0.md). The surface is recorded in
`scripts/public-api.snapshot.json` and compared against the built package on every pull request,
so a change to it has to be intended and described rather than noticed later. Upgrading from `0.x`?
[docs/MIGRATION.md](docs/MIGRATION.md) lists the edits, and only `0.19.0` requires any.

Four things it does not promise:

- **No screen-reader conformance is claimed** for `Dialog`, `Tabs` and `Tooltip`. The pass is written
  and has not been run, and no automated check here stands in for it.
- **The browser matrix is what a runner measured, and no wider.** The behaviour suite runs in
  Chromium, Firefox and WebKit on every pull request; the story and visual checks stay Chromium-only.
  Two differences in WebKit's macOS build are recorded rather than fixed: a modal dialog does not
  return focus to its trigger, and Safari leaves buttons out of the tab order unless the reader turns
  that on. Its Linux build does both, which is why the tests name the platform as well as the engine.
  Nothing is claimed about older engines, because nothing runs there — see
  [docs/QUALITY.md](docs/QUALITY.md).
- **Server rendering works; React Server Components are not claimed.** Every export is rendered
  without a DOM on every pull request. Inside an App Router tree, wrap the import in your own
  `'use client'` module — the package ships no directive, by
  [ADR-0018](docs/adr/0018-server-rendering-is-verified-rsc-is-not-claimed.md).
- **The set grows only on evidence.** A component arrives when a real consumer needs one, so a gap in
  the list is deliberate rather than a queue position.

Everything the site says is _not_ verified is on its
[Accessibility page](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-accessibility--docs),
in the same words.

**The documentation lives at
[kreobuddha.github.io/kreobuddha-ui](https://kreobuddha.github.io/kreobuddha-ui/)** — installation,
theming, the tokens, accessibility, and every component's generated prop table beside a live
example.

What exists and is verified: an ESM library build with an extracted stylesheet and external React,
TypeScript declarations, a semantic token layer with light and dark themes, strict type checking,
lint and format checks, component and accessibility tests, a published documentation site, an
example application composing the library, and a package proven to install and run in a separate
consumer application.

## Install

```bash
npm install @kreobuddha/ui
```

- Node.js `^20.19.0 || >=22.12.0`
- React `^19.0.0` as a peer dependency (install it yourself; the package does not bundle React).
  **React 18 is not supported**, deliberately: the library is built and tested against 19 and
  nothing here runs on 18, so a working install would be a coincidence rather than a promise.

Upgrading from an earlier version? [docs/MIGRATION.md](docs/MIGRATION.md) lists the edits each
upgrade requires. Only one release in the `0.x` line requires any: `0.19.0`.

## Usage

```tsx
import { Button } from '@kreobuddha/ui';
import '@kreobuddha/ui/styles.css';

<Button variant="filled" onClick={save}>
  Finish setup
</Button>;
```

## Components

Twenty components ship today. Each name links to its page on the documentation site, where the
prop table sits beside live, interactive examples:

**Actions** — [`Button`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-button--docs),
[`IconButton`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-iconbutton--docs)

**Forms** — [`TextField`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-textfield--docs),
[`Textarea`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-textarea--docs),
[`Select`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-select--docs),
[`Checkbox`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-checkbox--docs),
[`Radio`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-radio--docs),
[`Switch`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-switch--docs),
[`FieldGroup`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-fieldgroup--docs)

**Navigation and disclosure** — [`Tabs`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-tabs--docs),
[`Accordion`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-accordion--docs)

**Overlays** — [`Tooltip`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-tooltip--docs),
[`Toggletip`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-toggletip--docs),
[`Dialog`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-dialog--docs)

**Status and feedback** — [`Alert`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-alert--docs),
[`Toast`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-toast--docs),
[`Badge`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-badge--docs),
[`Spinner`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-spinner--docs),
[`Skeleton`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-skeleton--docs),
[`Progress`](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/components-progress--docs)

`Toast` is the one component here that is not import-and-render: it raises messages through
`useToast`, which needs a `ToastProvider` mounted above the tree and throws without one.

**The prop tables are generated from the TypeScript types**, so they cannot drift from the code the
way a hand-maintained table does. That is the reason they are not reproduced here: this file used to
carry about a hundred table rows copied by hand, and every one of them was a promise to remember
something at the moment a prop changed.

The cost is real and worth stating plainly: `README.md` is the npm landing page, so a reader who
arrives from npm and wants a prop table now needs one click to an external site. That is the trade
being made — a table that disagrees with the types is worse than a click.

Beyond the components, the site carries what this file cannot:
[Installation](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/installation--docs),
[Theming](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-theming--docs),
the [colour](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-colour-tokens--docs),
[typography](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-typography--docs),
[spacing](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-spacing-and-shape--docs)
and [motion](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-motion--docs) tokens
resolved live from the stylesheet rather than retyped,
[Accessibility](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-accessibility--docs) —
including what is _not_ verified — and
[Composition](https://kreobuddha.github.io/kreobuddha-ui/?path=/docs/foundations-composition--docs).

## Theming

Dark mode is an attribute on any ancestor, normally `<html>`:

```html
<html data-kreo-theme="dark"></html>
```

Light is the default and needs no attribute. The library never stores a theme preference and never
reads the system preference — that state belongs to the application.

Customisation happens through the semantic tokens, not through component classes. Every
`--kreo-*` custom property in the published stylesheet is public API under SemVer; CSS Module class
names are private implementation details.

**The stylesheet is unlayered, and load order decides ties.** No rule here sits in an `@layer`, so
a rule of yours with the same specificity wins by being loaded after `@kreobuddha/ui/styles.css`.
That is deliberate and fixed for the `1.x` line —
[ADR-0019](docs/adr/0019-the-stylesheet-is-unlayered.md) — because introducing layers later would
silently change which rules win. The supported way to change how the library looks is the tokens
above, which resolve where they are used and do not depend on order at all.

Three conventions are worth knowing before overriding anything:

- **A status has two colours, not one.** `--kreo-text-success` and its siblings are readable text
  at 4.5:1; `--kreo-icon-success` and its siblings are brighter marks for dots, icons and borders,
  which need only 3:1. Using one value for both is what turns an amber into a brown.
- **The dark theme runs at lower saturation than the light one.** At equal contrast a colour reads
  louder on a dark surface.
- **A tinted surface needs its own label colour.** `--kreo-surface-success-soft` and its siblings
  are the tints message components sit on; `--kreo-text-on-success-soft` and its siblings are the
  labels measured against those tints. The ordinary status text is tuned against the page and does
  not survive being placed on its own tint in the light theme — see
  [ADR-0007](docs/adr/0007-component-foundations.md).

`--kreo-shadow-overlay` is reserved for things that float — menus, dialogs, tooltips. Overlays keep
a border as well, because forced-colors mode paints no shadow at all and a panel relying on one
would lose its edge exactly where an edge matters most.

If you override the palette, keep the pairs contrastable: `npm run check:contrast` measures every
pairing the components put on screen, in both themes, and fails below the WCAG 2.2 target — 4.5:1
for text, 3:1 for control borders, marks and the focus ring.

## Fonts

**The font is bundled and no external request is made.** Importing `styles.css` is enough: Inter
ships inside the package, so the library renders as intended with no host setup, no CDN, and no
network dependency.

Inter ships as a variable font covering the whole 100–900 weight range, split into a Latin and a
Cyrillic file behind a `unicode-range`, so a Latin-only page never downloads the Cyrillic subset.
About 67 KB in total, none of it on the JavaScript path — and 48 KB of that is what a Latin page
actually fetches, within 140 bytes of what two static weights cost.

**No monospace family is bundled.** Numerals that must line up in columns use
`--kreo-numeric-tabular`, which switches Inter to its tabular figures — the actual requirement
behind reaching for a mono. Apply it alongside a type role, since `font-variant-numeric` is a
separate property from the `font` shorthand:

```css
font: var(--kreo-type-data);
font-variant-numeric: var(--kreo-numeric-tabular);
```

Inter is licensed under the SIL Open Font License 1.1; see [NOTICE](NOTICE) and the licence file
published beside it. The reasoning is in [ADR-0005](docs/adr/0005-visual-language.md).

## Package boundary

| Export         | Contents                                      |
| -------------- | --------------------------------------------- |
| `.`            | named React components and their public types |
| `./styles.css` | the complete supported stylesheet             |

The package is **ESM-only**. CommonJS consumers must use a dynamic `import()`, and Node 10 style
resolution is not supported.

Importing `@kreobuddha/ui/styles.css` from TypeScript requires that your project already declares
types for CSS side-effect imports — in a Vite project, `"types": ["vite/client"]` in `tsconfig.json`.
Without it, TypeScript 6 reports `TS2882` for the stylesheet import. This is a property of your
build setup, not of this package.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run lint:css
npm run format:check
npm test
npm run check:contrast
npm run build
npm run check:package
npm run check:consumer
npm run check:workbench
npm run check:visual
npm run storybook
```

`npm run check:consumer` packs the package, installs the tarball into `examples/react-vite` — an
independent application with its own lockfile and no alias back to `src` — and checks it there:
that the published declarations type-check, that the build works, that importing one component does
not pull in the others, that React is not bundled, that the fonts are real files rather than inlined
data, and that the package renders on a server with no DOM at all.

`npm run check:workbench` does the same for [`examples/workbench`](examples/workbench) — **Devkit
Console**, a settings and diagnostics interface composed entirely from this library — and then
drives it in a browser: the keyboard-only path from the header through the tabs to the save button,
the unsaved-changes dialog returning focus to the tab it interrupted, and a 375px viewport with no
horizontal overflow. `npm --prefix examples/workbench run dev` opens it to look at, once the check
has installed the package there.

`npm run check:visual` compares the protected visual states against committed baselines, over the
built Storybook. It runs as part of `npm run verify` and stands down on CI, because the baselines
are macOS and the runners are Ubuntu, where the same text does not render identically. Review the
diff when it fails, and use `npm run check:visual:update` to accept an intended change.

`npm run verify:fast` is the inner loop — format, lint, stylelint, types and the unit tests, a few
seconds. `npm run verify` is the full gate and what CI runs; use it before opening a pull request,
not after every edit.

`npm run storybook` opens Storybook. **Overview → Kit** is a single page showing everything the
library currently ships, in either theme — the quickest way to see the whole kit at once.

[CONTRIBUTING.md](CONTRIBUTING.md) describes how a change gets in and what it has to clear.
Note that components land one at a time as agreed slices, so an unsolicited pull request adding one
is likely to be declined — open an issue first.

## Security

Report a vulnerability privately rather than in a public issue; [SECURITY.md](SECURITY.md) explains
how and what is in scope.

## License

[MIT](LICENSE)
