// Exactly one component, deliberately, and actually mounted.
//
// `scripts/check-consumer.mjs` builds this entry through `vite.button-only.config.ts`, into its own
// output directory, and asserts that nothing belonging to the components it never imported appears
// anywhere in that output. That is what "the package is tree-shakeable" has to mean before anyone
// is allowed to claim it.
//
// It renders rather than merely exporting: an entry whose export nobody consumes is dead code, and
// Rollup drops it wholesale — which would leave an empty file passing the assertion for a reason
// that has nothing to do with the package.

import { createRoot } from 'react-dom/client';

import { Button } from '@kreobuddha/ui';

import '@kreobuddha/ui/styles.css';

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(<Button variant="filled">Only this</Button>);
}
