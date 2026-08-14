# Kreobuddha UI

An accessible, themeable React component library for developer tools, technical products, and
data-dense frontend applications.

## Status: early, unpublished

**One component ships today: `Button`.** The package is marked `private` and is not published to
npm. Everything else in [docs/ROADMAP.md](docs/ROADMAP.md) is a plan, not an available feature.

What exists and is verified: an ESM library build with an extracted stylesheet and external React,
TypeScript declarations, a semantic token layer with light and dark themes, strict type checking,
lint and format checks, component and accessibility tests, Storybook as the workbench, and a
package tarball proven to install in a separate consumer application.

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- React `^19.0.0` as a peer dependency

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
| `icon`      | `ReactNode`                         | —          |
| `iconEnd`   | `ReactNode`                         | —          |
| `type`      | `'button' \| 'submit' \| 'reset'`   | `'button'` |

It renders a native `<button>` and forwards `ref`, `className`, `style`, and every other native
button prop to it. Use one `filled` button per view for the primary action, `outlined` for
secondary, and `ghost` for tertiary or inline actions.

`type` defaults to `button` rather than the platform default of `submit`, so placing a button in a
form never submits it unintentionally.

A `loading` button keeps its label, stays in the tab order, reports `aria-busy`, and refuses
activation — including form submission. It is deliberately not natively `disabled`, because that
would drop it out of the tab order and take focus away from a keyboard user mid-action. Use
`disabled` when the action is genuinely unavailable rather than in flight.

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

## Fonts

**The fonts are bundled and no external request is made.** Importing `styles.css` is enough: IBM
Plex Sans and IBM Plex Mono ship inside the package, so the library renders as intended with no
host setup, no CDN, and no network dependency.

Only the four faces the type roles use are included — sans 400 and 600, mono 400 and 500 — each
split into a Latin and a Cyrillic file behind a `unicode-range`, so a Latin-only page never
downloads the Cyrillic subsets. Both families cover Cyrillic. That is about 123 KB of font data in
total, none of it on the JavaScript path.

The fonts are licensed under the SIL Open Font License 1.1; see [NOTICE](NOTICE) and the licence
files published beside them. The reasoning is in
[ADR-0003](docs/adr/0003-bundle-ibm-plex-and-replace-public-sans.md).

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
npm run format:check
npm test
npm run build
npm run check:package
npm run storybook
```

`npm run storybook` opens the workbench. **Overview → Kit** is a single page showing everything the
library currently ships, in either theme — the quickest way to see the whole kit at once.

## License

[MIT](LICENSE)
