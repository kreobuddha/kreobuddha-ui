// Removes the copies of the token layer that the build makes of it.
//
// Every component stylesheet declares its dependency on the tokens with `@import '../../styles.css'`
// — the arrangement that keeps a `.css` specifier out of the emitted declarations. Vite inlines
// that import per CSS module rather than once for the output, so the published stylesheet carried
// the whole `:root` block twenty times: 40,220 bytes of the 79,085 the file weighed, for one
// consumer-visible byte of difference, which is none. Custom properties are resolved where they
// are used, so identical redeclarations change nothing except the size of the download.
//
// Only blocks that are the token layer are touched — a rule set that contains nothing but
// `--kreo-*` declarations — and only exact repeats of one already kept. Component rules keep
// every copy, because two identical component rules can sit either side of a third that competes
// with them, and dropping one would be a cascade change rather than a size fix.
//
// `check-css-artifacts.mjs` asserts the result, so a build change cannot quietly bring the copies
// back.

import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const STYLESHEET = 'dist/styles.css';

/** A block that declares `--kreo-*` properties and nothing else, at any nesting. */
const isTokenLayer = (block) => {
  const body = block.replace(/[^{]*\{/, '').replace(/\}\s*$/, '');
  const declarations = body
    .replace(/:root\s*\{|\}/g, '')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part !== '');

  return declarations.length > 0 && declarations.every((part) => part.startsWith('--kreo-'));
};

/** Splits a stylesheet into its top-level blocks, keeping every byte between them. */
const topLevelBlocks = (css) => {
  const blocks = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];

    if (character === '{') depth += 1;

    if (character === '}') {
      depth -= 1;

      if (depth === 0) {
        blocks.push(css.slice(start, index + 1));
        start = index + 1;
      }
    }
  }

  return { blocks, rest: css.slice(start) };
};

const original = await readFile(STYLESHEET, 'utf8');
const { blocks, rest } = topLevelBlocks(original);

const kept = [];
const seen = new Set();
let removed = 0;

for (const block of blocks) {
  const key = block.trim();

  if (isTokenLayer(key) && seen.has(key)) {
    removed += 1;
    continue;
  }

  seen.add(key);
  kept.push(block);
}

const deduped = `${kept.join('')}${rest}`;

await writeFile(STYLESHEET, deduped);

process.stdout.write(
  `\n${STYLESHEET}: removed ${removed} repeated token blocks — ` +
    `${original.length} → ${deduped.length} bytes\n`
);
