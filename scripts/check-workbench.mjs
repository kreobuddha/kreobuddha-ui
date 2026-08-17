// Builds the workbench against the packed package, and runs the browser checks over the result.
//
// `check:consumer` proves the package boundary works. This proves something the fixture
// deliberately does not: that the components compose into an interface a person can operate, and
// that the two claims made about that interface — a keyboard-only flow through it, and a 375px
// layout without horizontal overflow — are true rather than asserted in a document.
//
// Same rule as the fixture: the tarball, never `../../src` and never an alias. A workbench that
// resolved the library through the source tree would be a demonstration of the source tree.

import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { get } from 'node:http';
import { join } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

import { packPackage } from './pack-package.mjs';

const WORKBENCH = 'examples/workbench';
const INSTALLED = `${WORKBENCH}/node_modules/@kreobuddha/ui`;

const run = (command, args, cwd = '.') =>
  execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const step = (message) => process.stdout.write(`\n${message}\n`);

let failed = 0;

const assert = (claim, ok, detail = '') => {
  if (!ok) failed += 1;
  process.stdout.write(`  ${ok ? 'pass' : 'FAIL'}  ${claim}${detail ? ` — ${detail}` : ''}\n`);
};

/** Every file under a directory, so the whole source tree can be searched at once. */
const filesUnder = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });

/** Runs a step that owns its own output, and reports the failure rather than throwing at the top. */
const attempt = (claim, command, args, cwd = '.') => {
  try {
    run(command, args, cwd);
    assert(claim, true);
    return true;
  } catch (error) {
    assert(claim, false);
    process.stdout.write(`${error.stdout ?? ''}${error.stderr ?? ''}\n`);
    return false;
  }
};

// ---------------------------------------------------------------------------------------------

step('Packing the package');

const { tarball, packed } = packPackage();

assert(
  'a current tarball is available',
  existsSync(tarball),
  packed ? tarball : `${tarball}, reused`
);

if (!existsSync(tarball)) process.exit(1);

step('Installing it into the workbench');

run('npm', ['ci', '--silent'], WORKBENCH);
run('npm', ['install', '--no-save', '--silent', `../../${tarball}`], WORKBENCH);

assert('the tarball installed', existsSync(INSTALLED));

// ---------------------------------------------------------------------------------------------
// The boundary is only worth something while nothing reaches around it. A path back into `src`
// would still build, still look right, and prove nothing at all.
// ---------------------------------------------------------------------------------------------

step('Checking that nothing reaches back into the source tree');

const sources = [
  ...filesUnder(`${WORKBENCH}/src`),
  `${WORKBENCH}/vite.config.ts`,
  `${WORKBENCH}/tsconfig.json`,
];

// The two shapes that would do it: a relative path out of the example, and a bundler alias.
const reaching = sources.filter((path) =>
  /\.\.\/\.\.\/src|resolve\s*:\s*\{[^}]*alias/.test(readFileSync(path, 'utf8'))
);

assert(
  'the workbench resolves the library only through the package',
  reaching.length === 0,
  reaching.join(', ')
);

// ---------------------------------------------------------------------------------------------

step('Type-checking and building the workbench');

const built =
  attempt(
    'the workbench type-checks against the published declarations',
    'npm',
    ['run', '--silent', 'typecheck'],
    WORKBENCH
  ) && attempt('the workbench builds', 'npm', ['run', '--silent', 'build'], WORKBENCH);

assert('the build produced a page to serve', built && existsSync(`${WORKBENCH}/dist/index.html`));

if (failed > 0) {
  process.stdout.write(`\n${failed} workbench check(s) failed\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------
// The behaviour run, and the server it reads.
//
// The server is started here rather than as a `webServer` entry in `playwright.config.ts`, because
// Playwright starts every entry whichever project is selected: an entry there would make
// `check:visual` and `check:browser` wait on a build neither of them asked for. Here it is started
// after the build that produced the thing being served, which is the only order that makes sense.
// ---------------------------------------------------------------------------------------------

const PORT = 6008;
const WORKBENCH_URL = `http://localhost:${PORT}/index.html`;

/**
 * Whether anything at all is answering on the port.
 *
 * `node:http` rather than the global `fetch`, for the same reason every script here imports
 * `process`: the lint configuration gives these files no globals, and an imported module is
 * clearer about what it depends on than an environment declaration would be.
 */
const responds = () =>
  new Promise((resolve) => {
    const request = get(WORKBENCH_URL, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });

    request.on('error', () => resolve(false));
    request.setTimeout(1000, () => {
      request.destroy();
      resolve(false);
    });
  });

step('Serving the built workbench');

// Deliberately not reused. Whatever is already on the port is some other directory — this script
// is the only thing that serves the workbench — and a run against the wrong page passes for the
// wrong reason, which is a failure worth spending a clear error on.
if (await responds()) {
  assert('port 6008 is free for the workbench', false, `something else is serving ${PORT}`);
  process.stdout.write('\nStop it and run the check again.\n');
  process.exit(1);
}

const server = spawn('node', ['scripts/serve-static.mjs', `${WORKBENCH}/dist`, String(PORT)], {
  stdio: ['ignore', 'ignore', 'inherit'],
});

// Twenty tries at 100ms: a static server over `node:http` is listening almost immediately, and a
// fixed sleep long enough to be safe would be time added to every run.
let serving = false;

for (let attempt = 0; attempt < 20 && !serving; attempt += 1) {
  await delay(100);
  serving = await responds();
}

assert('the workbench is being served', serving, WORKBENCH_URL);

if (!serving) {
  server.kill();
  process.exit(1);
}

step('Running the workbench browser checks');

const result = spawnSync('npx', ['playwright', 'test', '--project=workbench'], {
  stdio: 'inherit',
  shell: false,
});

// A server this script started is a server this script has to take away, whatever the run decided.
server.kill();

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}

if (result.status !== 0) process.exit(result.status ?? 1);

process.stdout.write(
  '\nThe workbench builds against the packed package and behaves in a browser\n'
);
