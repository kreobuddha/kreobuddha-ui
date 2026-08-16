// Looks inside the built stylesheets, which nothing else does.
//
// `publint` and `attw` check the package's shape and its types; neither opens a CSS file.
// `build-storybook` exits 0 whether or not the stylesheets it wrote can actually load. So a CSS
// defect can pass every gate this project has and still ship — which is exactly what happened:
// six component chunks carried an `@import` that survived the bundler, pointing at a path that
// resolves to nothing, and the stories using them failed to render.
//
// Run after both builds.

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const DIST = 'dist/styles.css';
const STORYBOOK_ASSETS = 'storybook-static/assets';

/** An `@import` that reached the build is one the bundler did not inline. */
const IMPORT = /@import\s[^;]+;/g;

const failures = [];

const check = (label, css) => {
  const found = css.match(IMPORT) ?? [];

  if (found.length > 0) {
    failures.push(
      `${label}: ${found.length} un-inlined @import — ${[...new Set(found)].join(' ')}`
    );
    return;
  }

  process.stdout.write(`  pass  ${label}\n`);
};

process.stdout.write('\nbuilt stylesheets\n');

check(DIST, await readFile(DIST, 'utf8'));

// The token layer has to survive into the published stylesheet. Removing an `@import` is one way
// to silence the check above while quietly shipping components with no tokens behind them.
const dist = await readFile(DIST, 'utf8');

if (!dist.includes('--kreo-accent-500:')) {
  failures.push(`${DIST}: the token layer is missing — components would render unstyled`);
} else {
  process.stdout.write(`  pass  ${DIST} carries the token layer\n`);
}

let assets = [];

try {
  assets = (await readdir(STORYBOOK_ASSETS)).filter((name) => name.endsWith('.css'));
} catch {
  process.stdout.write(`  skip  ${STORYBOOK_ASSETS} — not built\n`);
}

for (const name of assets) {
  check(join(STORYBOOK_ASSETS, name), await readFile(join(STORYBOOK_ASSETS, name), 'utf8'));
}

if (failures.length > 0) {
  process.stdout.write(`\n${failures.map((line) => `  FAIL  ${line}`).join('\n')}\n`);
  process.exit(1);
}

process.stdout.write('\nBuilt stylesheets are self-contained\n');
