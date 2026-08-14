# Kreobuddha UI

An accessible, themeable React component library for developer tools, technical products, and
data-dense frontend applications.

## Status: Phase 0 — package foundation only

**This library ships no components yet, and it is not published to npm.** The package is marked
`private`, and the only export is a build probe used to verify the toolchain.

What currently exists and is verified:

- ESM library build with an extracted stylesheet and external React;
- TypeScript declarations generated from the public entry point;
- strict type checking, lint, and format checks;
- component tests through Testing Library;
- Storybook as the component workbench;
- an inspectable package tarball proven to install in a separate consumer application.

What does not exist yet: design tokens, themes, density, and every component in the roadmap. See
[docs/ROADMAP.md](docs/ROADMAP.md).

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- React `^19.0.0` as a peer dependency

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run storybook
```

## Package boundary

The intended public surface is deliberately small:

| Export         | Contents                                      |
| -------------- | --------------------------------------------- |
| `.`            | named React components and their public types |
| `./styles.css` | the complete supported stylesheet             |

Internal source paths and CSS Module class names are not public API.

The package is **ESM-only**. CommonJS consumers must use a dynamic `import()`, and Node 10 style
resolution is not supported.

Importing `@kreobuddha/ui/styles.css` from TypeScript requires that your project already declares
types for CSS side-effect imports — in a Vite project, `"types": ["vite/client"]` in `tsconfig.json`.
Without it, TypeScript 6 reports `TS2882` for the stylesheet import. This is a property of your
build setup, not of this package.

## The build probe

`BuildProbe` is **not** a component of this library. It is a throwaway export that proves JSX
compilation, CSS Modules, CSS extraction, declaration emit, package exports, and consumer
installation all work. It is removed in Phase 1, when the first real component (`Button`) lands.

## License

[MIT](LICENSE)
