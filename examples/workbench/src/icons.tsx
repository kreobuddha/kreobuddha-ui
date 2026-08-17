// The few marks the shell needs. Drawn here rather than pulled from an icon package: the library
// takes icons as nodes on purpose, and a dependency added to draw three paths is a dependency that
// has to be reviewed and updated forever.
//
// All of them are `aria-hidden`; every button that carries one has a real accessible name.

import type { ReactElement } from 'react';

export const InfoMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 6.25v3.5M7 4.3v.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CloseMark = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ReloadMark = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M10 6a4 4 0 1 1-1.2-2.85M10 1.5V4H7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
