// Compares the built package's public surface against a committed snapshot.
//
// Exports, exported type names, package subpaths and `--kreo-*` custom properties are versioned
// contracts (`docs/RELEASES.md`), and until now nothing checked them. `publint` and `attw` read
// the package's shape, not its contents; `check-css-artifacts.mjs` reads the stylesheet for
// un-inlined imports, not for which properties it defines. So a rename could reach a release the
// same way two `dist/demo/*.d.ts` files did: correctly built, and unread.
//
// This check does not read prop types. It answers "did the public surface change", not "is the
// change right" — the second question is a review, and this makes sure the review happens.
//
// Run after `npm run build`. `--update` rewrites the snapshot, which belongs in the same pull
// request as the change it records.

import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const TYPES = 'dist/index.d.ts';
const STYLES = 'dist/styles.css';
const MANIFEST = 'package.json';
const SNAPSHOT = 'scripts/public-api.snapshot.json';

const update = process.argv.includes('--update');

/** `export { A, B }` and `export type { C }`, whatever the formatter did to the line breaks. */
const EXPORTS = /export\s+(type\s+)?\{([^}]*)\}/g;
/** A declaration, not a reference: `--kreo-accent-500:` rather than `var(--kreo-accent-500)`. */
const TOKEN = /(--kreo-[a-z0-9-]+)\s*:/g;

const read = async (path) => {
  try {
    return await readFile(path, 'utf8');
  } catch {
    process.stdout.write(`\n  FAIL  ${path} is missing — run \`npm run build\` first\n`);
    process.exit(1);
  }
};

const collectExports = (declarations) => {
  const values = new Set();
  const types = new Set();

  for (const [, isType, body] of declarations.matchAll(EXPORTS)) {
    for (const name of body.split(',')) {
      const trimmed = name.trim();

      if (trimmed === '') continue;

      // `A as B` is published as `B`; the local name is not part of the contract.
      const exported = trimmed.split(/\s+as\s+/).at(-1);

      (isType ? types : values).add(exported);
    }
  }

  return { values: [...values].sort(), types: [...types].sort() };
};

const collectTokens = (css) =>
  [...new Set([...css.matchAll(TOKEN)].map(([, name]) => name))].sort();

const manifest = JSON.parse(await read(MANIFEST));

const current = {
  ...collectExports(await read(TYPES)),
  subpaths: Object.keys(manifest.exports).sort(),
  tokens: collectTokens(await read(STYLES)),
};

if (update) {
  await writeFile(SNAPSHOT, `${JSON.stringify(current, null, 2)}\n`);
  process.stdout.write(`\nSnapshot updated: ${SNAPSHOT}\n`);
  process.exit(0);
}

const snapshot = JSON.parse(await read(SNAPSHOT));

const differences = [];

process.stdout.write('\npublic API\n');

for (const kind of ['values', 'types', 'subpaths', 'tokens']) {
  const before = new Set(snapshot[kind] ?? []);
  const after = new Set(current[kind]);

  const added = [...after].filter((name) => !before.has(name));
  const removed = [...before].filter((name) => !after.has(name));

  if (added.length === 0 && removed.length === 0) {
    process.stdout.write(`  pass  ${kind} — ${after.size} unchanged\n`);
    continue;
  }

  for (const name of removed) differences.push(`${kind}: removed ${name}`);
  for (const name of added) differences.push(`${kind}: added ${name}`);
}

if (differences.length > 0) {
  process.stdout.write(
    `\n${differences.map((line) => `  FAIL  ${line}`).join('\n')}\n\n` +
      'A removal or a rename is a major version; an addition is a minor one. If the change is\n' +
      'intended, record it — `node scripts/check-public-api.mjs --update` — in this pull request,\n' +
      'and describe it in CHANGELOG.md.\n'
  );
  process.exit(1);
}

process.stdout.write('\nThe public surface matches the snapshot\n');
