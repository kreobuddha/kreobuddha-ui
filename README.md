# Kreobuddha UI

An accessible, themeable React component library for developer tools, technical products, and
data-dense frontend applications.

## Status: early, but published

**One component ships today: `Button`.** Everything else in [docs/ROADMAP.md](docs/ROADMAP.md) is a
plan, not an available feature. The package is published so it can be consumed normally; treat the
`0.x` line as a moving target and pin what you depend on.

What exists and is verified: an ESM library build with an extracted stylesheet and external React,
TypeScript declarations, a semantic token layer with light and dark themes, strict type checking,
lint and format checks, component and accessibility tests, Storybook as the workbench, and a
package proven to install and run in a separate consumer application.

## Install

```bash
npm install @kreobuddha/ui
```

- Node.js `^20.19.0 || >=22.12.0`
- React `^19.0.0` as a peer dependency (install it yourself; the package does not bundle React)

## Usage

```tsx
import { Button } from '@kreobuddha/ui';
import '@kreobuddha/ui/styles.css';

<Button variant="filled" onClick={save}>
  Finish setup
</Button>;
```

### `Button`

| Prop        | Type                                | Default    |
| ----------- | ----------------------------------- | ---------- |
| `variant`   | `'filled' \| 'outlined' \| 'ghost'` | `'filled'` |
| `size`      | `'sm' \| 'md' \| 'lg'`              | `'md'`     |
| `danger`    | `boolean`                           | `false`    |
| `loading`   | `boolean`                           | `false`    |
| `fullWidth` | `boolean`                           | `false`    |
| `textWrap`  | `boolean`                           | `false`    |
| `icon`      | `ReactNode`                         | —          |
| `iconEnd`   | `ReactNode`                         | —          |
| `type`      | `'button' \| 'submit' \| 'reset'`   | `'button'` |

It renders a native `<button>` and forwards `ref`, `className`, `style`, and every other native
button prop to it. Use one `filled` button per view for the primary action, `outlined` for
secondary, and `ghost` for tertiary or inline actions.

`type` defaults to `button` rather than the platform default of `submit`, so placing a button in a
form never submits it unintentionally.

A `loading` button stays in the tab order, reports `aria-busy`, and refuses activation — including
form submission. Its content fades while keeping its box and a spinner is laid over it, so **the
button's size never changes**. It is deliberately not natively `disabled`: that would drop it out
of the tab order and take focus away from a keyboard user mid-action. It is also not dimmed the way
a disabled button is, which is what tells "in flight" apart from "unavailable". Use `disabled` when
the action is genuinely unavailable.

A label longer than the available width is truncated with an ellipsis; the full text stays in the
DOM, so the accessible name is unaffected, and it is offered as the browser's native tooltip while
the label is clipped. Note that a native tooltip is not reachable by keyboard or touch — a properly
accessible `Tooltip` component is a later phase. Set `textWrap` to let the label run onto several
lines and grow the button instead, in which case nothing is hidden and no tooltip appears.

Icons are `ReactNode` and are hidden from assistive technology, so the label remains the accessible
name. The library bundles no icon set.

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

Two conventions are worth knowing before overriding anything:

- **A status has two colours, not one.** `--kreo-text-success` and its siblings are readable text
  at 4.5:1; `--kreo-icon-success` and its siblings are brighter marks for dots, icons and borders,
  which need only 3:1. Using one value for both is what turns an amber into a brown.
- **The dark theme runs at lower saturation than the light one.** At equal contrast a colour reads
  louder on a dark surface.

If you override the palette, keep the pairs contrastable: `npm run check:contrast` measures every
pairing the components put on screen, in both themes, and fails below the WCAG 2.2 target — 4.5:1
for text, 3:1 for control borders, marks and the focus ring.

## Fonts

**The font is bundled and no external request is made.** Importing `styles.css` is enough: Inter
ships inside the package, so the library renders as intended with no host setup, no CDN, and no
network dependency.

Only the two weights the type roles use are included — 400 and 600 — each split into a Latin and a
Cyrillic file behind a `unicode-range`, so a Latin-only page never downloads the Cyrillic subset.
About 64 KB in total, none of it on the JavaScript path.

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
npm run storybook
```

`npm run storybook` opens the workbench. **Overview → Kit** is a single page showing everything the
library currently ships, in either theme — the quickest way to see the whole kit at once.

## License

[MIT](LICENSE)
