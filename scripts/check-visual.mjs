// Runs the visual comparison locally, and stands down on CI.
//
// The baselines in `tests/visual/__screenshots__/darwin` are macOS; the runners are Ubuntu, where
// the same text does not render identically. `docs/QUALITY.md` §6 asks for a single fixed baseline
// environment, and this is what honouring that costs: the comparison cannot be a CI gate until a
// Linux baseline set exists beside the macOS one.
//
// That leaves one real risk, and it is not the platform — it is that a check nobody is obliged to
// run is a check that quietly stops being run. So the comparison joins `npm run verify`, and this
// wrapper is what keeps that from breaking CI: locally it runs, on CI it says why it did not.
//
// Deliberately exits 0 on CI rather than being left out of the chain. A developer and CI then run
// the same command and read the same list of stages, which is one fewer thing to remember about
// which check belongs where.

import { spawnSync } from 'node:child_process';
import process from 'node:process';

if (process.env['CI']) {
  process.stdout.write(
    'check:visual — skipped on CI.\n' +
      'The baselines are macOS and this runner is not, so a comparison here would fail on font\n' +
      'rendering rather than on the change under review. Run it locally before merging anything\n' +
      'that touches a token or a component stylesheet. See docs/QUALITY.md §6.\n'
  );
  process.exit(0);
}

// `npx` rather than a bare binary name: this has to work from `npm run verify` and from a shell.
//
// `--project=visual` is not optional. The configuration also defines a `browser` project for
// behaviour, and without the filter this wrapper would pull that in too — and drag it into the CI
// skip above, where it does belong and where nothing about it is platform-dependent.
const result = spawnSync(
  'npx',
  ['playwright', 'test', '--project=visual', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    shell: false,
  }
);

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status ?? 1);
