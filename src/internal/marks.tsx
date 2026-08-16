import type { ReactElement } from 'react';

/**
 * The marks the message components draw, and not an icon library.
 *
 * `ADR-0002` keeps an icon set out of the package, and that still holds: none of these is exported,
 * themeable or reusable by a consumer. They exist because a component must not convey its meaning
 * by colour alone, and a component cannot require an icon it has no way to supply. `Alert`'s own
 * `icon` prop replaces the tone mark entirely. See ADR-0009.
 *
 * They live here rather than beside `Alert` because `Toast` draws the same four tones, on the same
 * tinted surfaces, and ADR-0011 §8 keeps the two components sharing their colour and their marks
 * while each owns its own markup. Two components drawing different marks for `danger` would be
 * worse than either of them drawing none.
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

export const TONE_MARKS = {
  success: SuccessMark,
  warning: WarningMark,
  danger: DangerMark,
  info: InfoMark,
} as const;

/** The cross on a dismiss button. Smaller than the tone marks: it sits inside an `xs` control. */
export const CloseMark = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
