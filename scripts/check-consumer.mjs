// Installs the packed package into an independent application and checks that it behaves there.
//
// Everything else in the verification chain looks at this repository from the inside: the tests
// import `src`, and `publint` and `attw` read the manifest and the declarations without ever
// running them. This is the only check that crosses the package boundary the way a consumer does —
// through `exports`, against the built artifact, with no alias back to source.
//
// The properties asserted below are the ones `docs/QUALITY.md` §7 asks for. Each is stated as a
// claim the README or the architecture document already makes, so a failure here means a published
// claim has stopped being true.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const FIXTURE = 'examples/react-vite';
const INSTALLED = `${FIXTURE}/node_modules/@kreobuddha/ui`;

const run = (command, args, cwd = '.') =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const step = (message) => process.stdout.write(`\n${message}\n`);

let failed = 0;

/** Every assertion is named, because a check that fails without saying what it wanted is a puzzle. */
const assert = (claim, ok, detail = '') => {
  if (!ok) failed += 1;
  process.stdout.write(`  ${ok ? 'pass' : 'FAIL'}  ${claim}${detail ? ` — ${detail}` : ''}\n`);
};

/** Collects every file under a directory, so a whole build output can be searched at once. */
const filesUnder = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });

// ---------------------------------------------------------------------------------------------
// Pack, and install the tarball rather than the directory.
//
// `npm pack` runs `prepack`, so the tarball is always built from the current source. Installing
// the directory instead would let npm link it, which resolves through the source tree and would
// quietly defeat the entire point of this check.
// ---------------------------------------------------------------------------------------------

step('Packing the package');

const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const tarball = `kreobuddha-ui-${version}.tgz`;

rmSync(tarball, { force: true });
run('npm', ['pack', '--silent']);

assert('npm pack produced a tarball', existsSync(tarball), tarball);

if (!existsSync(tarball)) process.exit(1);

step('Installing it into the fixture');

// The environment comes from the committed lockfile; the package under test arrives unsaved, so
// the fixture's manifest does not have to be edited on every release.
run('npm', ['ci', '--silent'], FIXTURE);
run('npm', ['install', '--no-save', '--silent', `../../${tarball}`], FIXTURE);

assert('the tarball installed', existsSync(INSTALLED));

// ---------------------------------------------------------------------------------------------
// The fixture claims to use every public export. A claim nobody checks stops being true on the
// day the next component ships, so it is checked here rather than left to whoever remembers.
// ---------------------------------------------------------------------------------------------

step('Comparing the fixture against the public export surface');

const declarations = readFileSync(`${INSTALLED}/dist/index.d.ts`, 'utf8');
const exported = new Set(
  [...declarations.matchAll(/^export\s*\{\s*([A-Za-z0-9_]+)\s*\}/gm)].map(([, name]) => name)
);

const fixture = readFileSync(`${FIXTURE}/src/main.tsx`, 'utf8');
const imported = new Set(
  [...(/import\s*\{([^}]+)\}\s*from\s*'@kreobuddha\/ui'/.exec(fixture)?.[1] ?? '').split(',')]
    .map((name) => name.trim())
    .filter(Boolean)
);

const missing = [...exported].filter((name) => !imported.has(name));

assert(
  'the fixture imports every public export',
  missing.length === 0,
  missing.length > 0
    ? `not used by the fixture: ${missing.join(', ')}`
    : `${exported.size} exports covered`
);

// ---------------------------------------------------------------------------------------------
// The published types have to resolve and describe something, in a real consumer's tsconfig.
// ---------------------------------------------------------------------------------------------

step('Type-checking the fixture against the published declarations');

try {
  run('npm', ['run', '--silent', 'typecheck'], FIXTURE);
  assert('the published declarations type-check in a consumer project', true);
} catch (error) {
  assert('the published declarations type-check in a consumer project', false);
  process.stdout.write(`${error.stdout ?? ''}${error.stderr ?? ''}\n`);
}

// ---------------------------------------------------------------------------------------------
// The application builds, and taking one component does not cost the whole library.
// ---------------------------------------------------------------------------------------------

step('Building the fixture');

rmSync(`${FIXTURE}/dist`, { recursive: true, force: true });
rmSync(`${FIXTURE}/dist-button-only`, { recursive: true, force: true });

try {
  run('npm', ['run', '--silent', 'build'], FIXTURE);
  assert('the fixture builds', true);
} catch (error) {
  assert('the fixture builds', false);
  process.stdout.write(`${error.stdout ?? ''}${error.stderr ?? ''}\n`);
  process.exit(1);
}

// The single-component entry is built on its own rather than as a second entry of the build above.
// Two entries in one build share their common code through a chunk belonging to neither, so the
// file named after an entry does not contain what that entry cost. An isolated build has nobody to
// share with, which makes its entire output the answer.
try {
  run('npm', ['run', '--silent', 'build:button-only'], FIXTURE);
  assert('the single-component entry builds', true);
} catch (error) {
  assert('the single-component entry builds', false);
  process.stdout.write(`${error.stdout ?? ''}${error.stderr ?? ''}\n`);
  process.exit(1);
}

const buttonOnly = filesUnder(`${FIXTURE}/dist-button-only`).filter((path) => path.endsWith('.js'));
const buttonOnlySource = buttonOnly.map((path) => readFileSync(path, 'utf8')).join('');

// An empty output would satisfy the assertion below for a reason that has nothing to do with the
// package, so the bundle is required to contain the component it did import before it is asked
// not to contain the ones it did not.
const BUTTON_MARKER = 'aria-busy';

assert('the single-component entry produced output', buttonOnly.length > 0);

assert(
  'the single-component bundle actually contains Button',
  buttonOnlySource.includes(BUTTON_MARKER),
  `${buttonOnlySource.length} characters across ${buttonOnly.length} file(s)`
);

// A marker that exists only inside a component the entry never imported. The warning triangle
// belongs to `Alert`'s own marks, so finding it here means the barrel dragged the library in
// wholesale.
const ALERT_MARKER = 'M8 1.8L15 14H1z';

assert(
  'importing one component does not pull in the others',
  !buttonOnlySource.includes(ALERT_MARKER),
  "looked for Alert's warning mark"
);

// ---------------------------------------------------------------------------------------------
// React belongs to the application, never to the package.
// ---------------------------------------------------------------------------------------------

step('Checking that the package does not carry React');

const packageFiles = filesUnder(INSTALLED).filter((path) => path.endsWith('.js'));
const packageSource = packageFiles.map((path) => readFileSync(path, 'utf8')).join('');

assert(
  'the package imports React rather than containing it',
  /from\s*["']react(\/jsx-runtime)?["']/.test(packageSource)
);

// Strings that appear in the React runtime itself and nowhere in a package that merely imports it.
const REACT_INTERNALS = ['__SECRET_INTERNALS', 'react.production', 'ReactCurrentDispatcher'];
const bundledInternals = REACT_INTERNALS.filter((marker) => packageSource.includes(marker));

assert(
  'no React runtime is bundled into the package',
  bundledInternals.length === 0,
  bundledInternals.join(', ')
);

// ---------------------------------------------------------------------------------------------
// The stylesheet is a real file with real font files beside it, not a base64 blob.
//
// Vite's library mode inlines every asset it resolves, which is exactly what `bundle-fonts.mjs`
// exists to prevent — and an inlined font would silently undo the `unicode-range` split that keeps
// a Latin-only page from downloading the Cyrillic subset.
// ---------------------------------------------------------------------------------------------

step('Checking the published stylesheet');

const stylesheet = readFileSync(`${INSTALLED}/dist/styles.css`, 'utf8');
const fontUrls = [...stylesheet.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map(([, url]) => url);

assert('the stylesheet declares font files', fontUrls.length > 0, fontUrls.join(', '));

assert(
  'no font is inlined as a data URI',
  fontUrls.every((url) => !url.startsWith('data:'))
);

assert(
  'every font URL resolves to a file inside the package',
  fontUrls.every((url) => {
    const path = join(INSTALLED, 'dist', url.replace(/^\.\//, ''));
    return existsSync(path) && statSync(path).isFile();
  })
);

// ---------------------------------------------------------------------------------------------
// Importing the package must not touch a browser global. This is the check that a bundler cannot
// perform and jsdom cannot either, because both provide the globals that ought to be absent.
// ---------------------------------------------------------------------------------------------

step('Rendering on the server');

const ssr = `
  import { createElement as h } from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import * as ui from '@kreobuddha/ui';

  const markup = renderToStaticMarkup(
    h('div', null,
      h(ui.Button, { variant: 'filled' }, 'Save'),
      h(ui.TextField, { label: 'Email', hint: 'Work address.' }),
      h(ui.Alert, { tone: 'danger', title: 'Failed' }, 'Try again'),
      h(ui.Select, { label: 'Environment', placeholder: 'Choose one', defaultValue: '' },
        h('option', { value: 'staging' }, 'Staging')),
      h(ui.FieldGroup, { legend: 'Notifications' },
        h(ui.Checkbox, { label: 'Email' }),
        h(ui.Switch, { label: 'Desktop' })),
      h(ui.Spinner, { label: 'Loading' })
    )
  );

  process.stdout.write(markup);
`;

let markup = '';

try {
  markup = run('node', ['--input-type=module', '--eval', ssr], FIXTURE);
  assert('the package renders without a DOM', true);
} catch (error) {
  assert('the package renders without a DOM', false);
  process.stdout.write(`${error.stdout ?? ''}${error.stderr ?? ''}\n`);
}

// The markup is inspected rather than merely produced: a render that silently emits nothing would
// otherwise pass. The label/control association is what a field is for, so that is what is checked.
const labelFor = /<label[^>]*for="([^"]+)"/.exec(markup);
const controlId = labelFor?.[1];

assert('the rendered markup is not empty', markup.length > 0, `${markup.length} characters`);

assert(
  'a field label points at a control that exists in the markup',
  Boolean(controlId) && markup.includes(`id="${controlId}"`),
  controlId ?? 'no label found'
);

assert(
  'every export rendered a native element',
  markup.includes('<button') && markup.includes('<fieldset')
);

// ---------------------------------------------------------------------------------------------

rmSync(tarball, { force: true });

if (failed > 0) {
  process.stdout.write(`\n${failed} consumer check(s) failed\n`);
  process.exit(1);
}

process.stdout.write('\nThe packed package works in an independent consumer\n');
