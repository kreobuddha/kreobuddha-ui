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
  ['outlined label', '--kreo-surface-page', '--kreo-text-accent', TEXT],
  ['outlined label on card', '--kreo-surface-card', '--kreo-text-accent', TEXT],
  ['outlined label hovered', '--kreo-surface-hover', '--kreo-text-accent', TEXT],
  ['outlined border', '--kreo-surface-page', '--kreo-accent-500', NON_TEXT],
  ['ghost label', '--kreo-surface-page', '--kreo-text-primary', TEXT],
  ['danger label', '--kreo-surface-page', '--kreo-text-danger', TEXT],
  ['danger label on card', '--kreo-surface-card', '--kreo-text-danger', TEXT],
  ['body text', '--kreo-surface-page', '--kreo-text-body', TEXT],
  ['muted text', '--kreo-surface-page', '--kreo-text-muted', TEXT],
  ['subtle text', '--kreo-surface-page', '--kreo-text-subtle', TEXT],
  ['subtle text on card', '--kreo-surface-card', '--kreo-text-subtle', TEXT],
  ['success text', '--kreo-surface-page', '--kreo-text-success', TEXT],
  ['success text on card', '--kreo-surface-card', '--kreo-text-success', TEXT],
  ['warning text', '--kreo-surface-page', '--kreo-text-warning', TEXT],
  ['warning text on card', '--kreo-surface-card', '--kreo-text-warning', TEXT],
  ['info text', '--kreo-surface-page', '--kreo-text-info', TEXT],
  ['info text on card', '--kreo-surface-card', '--kreo-text-info', TEXT],
  // Message surfaces: the label and the body text both sit on the tint, so both are measured.
  ['success on tint', '--kreo-surface-success-soft', '--kreo-text-on-success-soft', TEXT],
  ['warning on tint', '--kreo-surface-warning-soft', '--kreo-text-on-warning-soft', TEXT],
  ['danger on tint', '--kreo-surface-danger-soft', '--kreo-text-on-danger-soft', TEXT],
  ['info on tint', '--kreo-surface-info-soft', '--kreo-text-on-info-soft', TEXT],
  ['body on success tint', '--kreo-surface-success-soft', '--kreo-text-body', TEXT],
  ['body on warning tint', '--kreo-surface-warning-soft', '--kreo-text-body', TEXT],
  ['body on danger tint', '--kreo-surface-danger-soft', '--kreo-text-body', TEXT],
  ['body on info tint', '--kreo-surface-info-soft', '--kreo-text-body', TEXT],
  // The dismiss button on a tinted alert: a ghost control on a surface no other control uses.
  ['dismiss on success tint', '--kreo-surface-success-soft', '--kreo-text-primary', TEXT],
  ['dismiss on warning tint', '--kreo-surface-warning-soft', '--kreo-text-primary', TEXT],
  ['dismiss on danger tint', '--kreo-surface-danger-soft', '--kreo-text-primary', TEXT],
  ['dismiss on info tint', '--kreo-surface-info-soft', '--kreo-text-primary', TEXT],
  // Field anatomy: the placeholder is the pair most often left unmeasured.
  ['placeholder', '--kreo-surface-card', '--kreo-text-subtle', TEXT],
  ['field border', '--kreo-surface-card', '--kreo-border-control', NON_TEXT],
  ['field value', '--kreo-surface-card', '--kreo-text-primary', TEXT],
  ['field label', '--kreo-surface-page', '--kreo-text-muted', TEXT],
  ['field hint', '--kreo-surface-page', '--kreo-text-muted', TEXT],
  ['field error', '--kreo-surface-page', '--kreo-text-danger', TEXT],
  ['field slot', '--kreo-surface-card', '--kreo-text-muted', TEXT],
  ['select chevron', '--kreo-surface-card', '--kreo-text-muted', NON_TEXT],
  // Checkbox and Switch: the box and the track are drawn, so their edges and marks are measured
  // like any other control boundary.
  // The checked box's mark is `--kreo-text-on-accent` on `--kreo-accent-500`, already measured
  // above as 'focus ring on filled'. The label is 'ghost label'. Neither is repeated here.
  ['checkbox box edge', '--kreo-surface-page', '--kreo-border-control', NON_TEXT],
  // Tabs: the rest label and the selected indicator. The selected label is '--kreo-text-accent' on
  // the page, already measured as 'outlined label'; the rest label is 'muted text'.
  ['tab disabled label', '--kreo-surface-page', '--kreo-text-subtle', TEXT],
  ['tab indicator', '--kreo-surface-page', '--kreo-accent-500', NON_TEXT],
  // Overlays. The tooltip's edge is not measured for the same reason as the tab rule: it is
  // `--kreo-border-default`, the decorative divider, and in normal mode the shadow does the
  // separating. In forced-colors the border becomes CanvasText, which the system guarantees.
  ['tooltip text', '--kreo-surface-raised', '--kreo-text-primary', TEXT],
  ['dialog title', '--kreo-surface-raised', '--kreo-text-primary', TEXT],
  ['dialog body', '--kreo-surface-raised', '--kreo-text-body', TEXT],
  ['dialog description', '--kreo-surface-raised', '--kreo-text-muted', TEXT],
  // The close button is a ghost control, and the overlay surface is one no other control sits on.
  ['dialog dismiss', '--kreo-surface-raised', '--kreo-text-primary', TEXT],
  // The rule under the tab list is not measured. It is `--kreo-border-default`, the decorative
  // divider token, which is deliberately below 3:1 — that is why `--kreo-border-control` exists
  // separately. Which tab is selected is carried by the indicator above and by the label colour,
  // both of which are measured, so the rule identifies nothing and 1.4.11 does not reach it.
  ['switch track off', '--kreo-surface-page', '--kreo-border-control', NON_TEXT],
  ['switch thumb off', '--kreo-surface-hover', '--kreo-text-muted', NON_TEXT],
  ['switch thumb on', '--kreo-accent-500', '--kreo-text-on-accent', NON_TEXT],
  ['field focus border', '--kreo-surface-card', '--kreo-border-focus', NON_TEXT],
  ['field invalid border', '--kreo-surface-card', '--kreo-border-danger', NON_TEXT],
  ['success mark', '--kreo-surface-page', '--kreo-icon-success', NON_TEXT],
  ['warning mark', '--kreo-surface-page', '--kreo-icon-warning', NON_TEXT],
  ['danger mark', '--kreo-surface-page', '--kreo-icon-danger', NON_TEXT],
  ['info mark', '--kreo-surface-page', '--kreo-icon-info', NON_TEXT],
  ['badge neutral label on card', '--kreo-surface-card', '--kreo-text-body', TEXT],
  ['badge accent outline on card', '--kreo-surface-card', '--kreo-accent-500', NON_TEXT],
  ['success mark on card', '--kreo-surface-card', '--kreo-icon-success', NON_TEXT],
  ['warning mark on card', '--kreo-surface-card', '--kreo-icon-warning', NON_TEXT],
  ['danger mark on card', '--kreo-surface-card', '--kreo-icon-danger', NON_TEXT],
  ['info mark on card', '--kreo-surface-card', '--kreo-icon-info', NON_TEXT],
  ['control border', '--kreo-surface-page', '--kreo-border-control', NON_TEXT],
  ['control border on card', '--kreo-surface-card', '--kreo-border-control', NON_TEXT],
  ['danger border', '--kreo-surface-page', '--kreo-border-danger', NON_TEXT],
  // `Skeleton` adds no pair. It is a fill with nothing on it: no text, and no boundary that
  // identifies a control or carries a state, which is what 1.4.11 measures. It is `aria-hidden`
  // and stands in for content that has not arrived, so a reader who cannot see it has lost
  // nothing — WCAG excludes purely decorative content by the same reasoning. In forced-colors,
  // where its fill is not painted at all, it draws a GrayText border the system guarantees.
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

/**
 * Reads the declarations of one CSS block into a plain map.
 *
 * The body is found by matching braces rather than by taking everything up to the next `}`.
 * The cheap version reads the same today, because the token blocks are flat — but the day one
 * gains a nested rule, `@media (prefers-contrast: more)` or CSS nesting, it would silently stop
 * at the inner brace and measure a truncated set of tokens. A check that quietly grades a
 * fraction of its input is worse than one that fails, so a nested block throws instead.
 */
const blockOf = (css, selector) => {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Block not found: ${selector}`);

  const open = css.indexOf('{', start);
  if (open === -1) throw new Error(`Block has no body: ${selector}`);

  let depth = 1;
  let end = open + 1;

  for (; end < css.length && depth > 0; end += 1) {
    if (css[end] === '{') depth += 1;
    else if (css[end] === '}') depth -= 1;
  }

  if (depth !== 0) throw new Error(`Unterminated block: ${selector}`);

  const body = css.slice(open + 1, end - 1);

  if (body.includes('{')) {
    throw new Error(
      `Nested block inside ${selector}. The token blocks are expected to be flat; ` +
        `teach this script how to read the nesting before adding it.`
    );
  }

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
