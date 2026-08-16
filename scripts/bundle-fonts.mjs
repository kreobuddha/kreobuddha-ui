// Puts the bundled fonts into the built package.
//
// Vite's library mode inlines every asset it resolves as a base64 data URI, with no opt-out, so
// `src/fonts.css` is kept out of the module graph and joined to the output here instead. That
// keeps both font files as real files — which is what lets `unicode-range` skip the Cyrillic
// subset on a Latin-only page — while consumers still link a single stylesheet.

import { cp, readFile, writeFile } from 'node:fs/promises';

const FACES = 'src/fonts.css';
const FONTS_FROM = 'src/assets/fonts';
const FONTS_TO = 'dist/assets/fonts';
const STYLESHEET = 'dist/styles.css';

await cp(FONTS_FROM, FONTS_TO, { recursive: true });

const [faces, styles] = await Promise.all([readFile(FACES, 'utf8'), readFile(STYLESHEET, 'utf8')]);

// @font-face has to precede the rules that use the families, and the built stylesheet no longer
// contains an @import for Vite to trip over.
await writeFile(STYLESHEET, `${faces}\n${styles}`);
