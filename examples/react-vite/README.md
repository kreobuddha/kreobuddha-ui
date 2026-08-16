# Consumer fixture

An independent React/Vite application that installs the **packed** package and uses it the way a
real consumer would. It is not a workspace member, it is never published, and it must never import
`../../src` or alias its way around the package exports — the whole point is to exercise the public
boundary that `exports`, the emitted declarations and the built stylesheet actually present.

Run it from the repository root:

```bash
npm run check:consumer
```

`scripts/check-consumer.mjs` drives everything: it packs the package, installs the tarball here,
type-checks, builds both entries, renders on the server, and asserts the properties
`docs/QUALITY.md` §7 asks for.

## Why `@kreobuddha/ui` is not in `package.json`

The dependency is installed by the script with `--no-save`, from a tarball whose filename carries
the current version. Listing it here would mean editing this manifest and its lockfile on every
release, which is churn that proves nothing. The lockfile in this directory pins React, Vite and
TypeScript — the environment — and the package under test arrives fresh on every run.

## The two entries

`src/main.tsx` imports every public export and the stylesheet, and is what the full build and the
server render use.

`src/button-only.tsx` imports exactly one component. Its build output is what proves that taking one
component does not drag the rest of the library in with it.
