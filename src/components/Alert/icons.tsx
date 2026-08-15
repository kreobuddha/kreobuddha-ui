import type { ReactElement } from 'react';

/**
 * Four marks owned by `Alert`, not an icon library.
 *
 * `ADR-0002` keeps an icon set out of the package, and that still holds: these are not exported,
 * not themeable, and not reusable — they exist because `Alert` must not convey its meaning by
 * colour alone, and a component cannot require an icon it has no way to supply. A consumer's own
 * `icon` replaces them entirely. See ADR-0009.
 */

const attrs = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const SuccessMark = (): ReactElement => (
  <svg {...attrs} aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M5 8.2l2 2 4-4.4" />
  </svg>
);

const WarningMark = (): ReactElement => (
  <svg {...attrs} aria-hidden="true">
    <path d="M8 1.8L15 14H1z" />
    <path d="M8 6.2v3.4" />
    <path d="M8 11.8h.01" />
  </svg>
);

const DangerMark = (): ReactElement => (
  <svg {...attrs} aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 4.6v4" />
    <path d="M8 11h.01" />
  </svg>
);

const InfoMark = (): ReactElement => (
  <svg {...attrs} aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 7.4v4" />
    <path d="M8 5h.01" />
  </svg>
);

export const DEFAULT_MARKS = {
  success: SuccessMark,
  warning: WarningMark,
  danger: DangerMark,
  info: InfoMark,
} as const;
