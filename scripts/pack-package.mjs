// Produces the tarball that the consumer checks install, and hands the same one to both.
//
// Two checks now cross the package boundary — `check:consumer` and `check:workbench` — and each
// needs a packed package rather than a linked directory. Packing runs `prepack`, which is a full
// library build, so packing once per check would put two of them into every `npm run verify`.
//
// The tarball is therefore kept between runs and reused while it is newer than everything that can
// change what a build produces. That list is explicit below rather than implied: a freshness rule
// that silently misses an input is worse than no reuse at all, because it lets a check pass
// against code that is no longer there. Anything not listed — a change to a test, a document, a
// story — cannot reach the tarball's contents.
//
// `*.tgz` is git-ignored, so what is left behind is a build artifact in the same category as
// `dist/`.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

/** Everything the published artifact is built from. Ordered as it appears in the repository. */
const BUILD_INPUTS = [
  'package.json',
  'package-lock.json',
  'tsconfig.build.json',
  'vite.config.ts',
  'scripts/bundle-fonts.mjs',
  'src',
];

/** The most recent modification anywhere under a path, whether it is a file or a directory. */
const newestMtime = (path) => {
  const info = statSync(path);

  if (!info.isDirectory()) return info.mtimeMs;

  return readdirSync(path, { withFileTypes: true }).reduce(
    (newest, entry) => Math.max(newest, newestMtime(join(path, entry.name))),
    info.mtimeMs
  );
};

/**
 * Packs the package unless a current tarball is already sitting in the repository root.
 *
 * Returns its filename and whether this call is what produced it, so a caller can report which of
 * the two happened instead of leaving the reader to guess why one run took a minute longer.
 */
export const packPackage = () => {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const tarball = `kreobuddha-ui-${version}.tgz`;

  const newestInput = BUILD_INPUTS.filter((path) => existsSync(path)).reduce(
    (newest, path) => Math.max(newest, newestMtime(path)),
    0
  );

  if (existsSync(tarball) && statSync(tarball).mtimeMs > newestInput) {
    return { tarball, packed: false };
  }

  // Removed first: `npm pack` overwrites, but a failed pack would otherwise leave the previous
  // tarball in place looking like a successful one.
  rmSync(tarball, { force: true });

  execFileSync('npm', ['pack', '--silent'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (!existsSync(tarball)) {
    process.stderr.write(`npm pack did not produce ${tarball}\n`);
    process.exit(1);
  }

  return { tarball, packed: true };
};
