// Measures the colour pairs the components actually rely on, in both themes, and fails the build
// when one drops below its WCAG target.
//
// This exists because the automated accessibility tests run in jsdom, which neither lays out nor
// paints, so axe cannot evaluate contrast there. Without this, contrast would be an unverified
// claim — which `docs/QUALITY.md` does not accept.

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const TOKENS = 'src/tokens/colors.css';

/** WCAG 2.2: 4.5 for normal text, 3 for large text and non-text UI such as borders. */
const TEXT = 4.5;
const NON_TEXT = 3;

/** Every pair a shipped component puts on screen. Add to this when a component adds a pairing. */
const PAIRS = [
  ['filled rest', '--kreo-accent-500', '--kreo-text-on-accent', TEXT],
  ['filled hover', '--kreo-accent-600', '--kreo-text-on-accent', TEXT],
  ['filled active', '--kreo-accent-700', '--kreo-text-on-accent', TEXT],
  ['filled danger rest', '--kreo-danger-500', '--kreo-text-on-danger', TEXT],
  ['filled danger hover', '--kreo-danger-600', '--kreo-text-on-danger', TEXT],
  ['outlined label', '--kreo-surface-page', '--kreo-text-primary', TEXT],
  ['outlined label on card', '--kreo-surface-card', '--kreo-text-primary', TEXT],
  ['outlined hovered label', '--kreo-surface-hover', '--kreo-text-primary', TEXT],
  ['danger label', '--kreo-surface-page', '--kreo-text-danger', TEXT],
  ['danger label on card', '--kreo-surface-card', '--kreo-text-danger', TEXT],
  ['body text', '--kreo-surface-page', '--kreo-text-body', TEXT],
  ['muted text', '--kreo-surface-page', '--kreo-text-muted', TEXT],
  ['subtle text', '--kreo-surface-page', '--kreo-text-subtle', TEXT],
  ['subtle text on card', '--kreo-surface-card', '--kreo-text-subtle', TEXT],
  ['control border', '--kreo-surface-page', '--kreo-border-control', NON_TEXT],
  ['control border on card', '--kreo-surface-card', '--kreo-border-control', NON_TEXT],
  ['danger border', '--kreo-surface-page', '--kreo-border-danger', NON_TEXT],
  ['focus ring', '--kreo-surface-page', '--kreo-border-focus', NON_TEXT],
  ['focus ring on filled', '--kreo-accent-500', '--kreo-text-on-accent', NON_TEXT],
];

const channel = (value) => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((d) => d + d).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(full.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Reads the declarations of one CSS block into a plain map. */
const blockOf = (css, selector) => {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Block not found: ${selector}`);
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  const map = new Map();
  for (const [, name, value] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    map.set(name, value.trim());
  }
  return map;
};

/** Follows `var(--x)` indirection until a literal colour is reached. */
const resolve = (map, name, seen = new Set()) => {
  if (seen.has(name)) throw new Error(`Circular token reference: ${name}`);
  seen.add(name);
  const value = map.get(name);
  if (value === undefined) throw new Error(`Unknown token: ${name}`);
  const reference = /^var\((--[a-z0-9-]+)\)$/.exec(value);
  return reference ? resolve(map, reference[1], seen) : value;
};

const css = await readFile(TOKENS, 'utf8');
const light = blockOf(css, ':root');
const dark = new Map([...light, ...blockOf(css, "[data-kreo-theme='dark']")]);

let failed = 0;

for (const [theme, tokens] of [
  ['light', light],
  ['dark', dark],
]) {
  process.stdout.write(`\n${theme}\n`);

  for (const [label, background, foreground, target] of PAIRS) {
    const ratio = contrast(resolve(tokens, background), resolve(tokens, foreground));
    const ok = ratio >= target;
    if (!ok) failed += 1;
    process.stdout.write(
      `  ${ok ? 'pass' : 'FAIL'}  ${ratio.toFixed(2).padStart(5)} : 1  (needs ${target})  ${label}\n`
    );
  }
}

if (failed > 0) {
  process.stdout.write(`\n${failed} pair(s) below target\n`);
  process.exit(1);
}

process.stdout.write('\nAll pairs meet their contrast target\n');
