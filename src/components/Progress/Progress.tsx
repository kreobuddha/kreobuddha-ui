import type { ComponentPropsWithRef, ReactElement } from 'react';

import { cx } from '../../internal/cx.js';

import styles from './Progress.module.css';

export interface ProgressProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'> {
  /**
   * What is progressing, as a screen reader will hear it — "Uploading files".
   *
   * Required rather than optional, and checked by the compiler: `role="progressbar"` has no
   * content of its own, so there is nowhere else an accessible name could come from.
   */
  label: string;
  /**
   * How far along, between `0` and `max`. Out-of-range numbers are clamped.
   *
   * **Leave it out for the indeterminate state** — work that is under way with no way to say how
   * much is left. That state reports no `aria-valuenow` at all, which is what stops a screen reader
   * announcing a percentage nobody measured.
   *
   * `| undefined` is spelled out because the project compiles with `exactOptionalPropertyTypes`:
   * without it, `value={known ? done : undefined}` — the natural way to write "indeterminate until
   * the number arrives" — would not type-check for a consumer with the same setting.
   */
  value?: number | undefined;
  /** The value that counts as complete. Defaults to 100, so `value` reads as a percentage. */
  max?: number;
}

/**
 * A bar for work whose extent is known, and for work whose extent is not.
 *
 * **This is a `div` with `role="progressbar"`, not a native `<progress>`, by Rustam's decision.**
 * The project's usual rule is platform semantics before ARIA, so the departure is written down
 * rather than left implicit. What it buys: one styling model instead of three vendor pseudo-element
 * sets (`::-webkit-progress-bar`, `::-webkit-progress-value`, `::-moz-progress-bar`), which is what
 * a native element would have cost to reach the same bar in every engine. What it costs: the
 * semantics are ours to get right and to keep right, so every attribute is asserted in
 * `Progress.test.tsx` rather than inherited from the element.
 *
 * It is not a `Spinner`. A spinner says only that something is happening; this says how much of it
 * has happened, and is worth its space only when that number is real.
 */
export const Progress = ({
  label,
  value,
  max = 100,
  className,
  ...rest
}: ProgressProps): ReactElement => {
  // A `max` of zero or below has no meaning the component could act on, and dividing by it would
  // put `Infinity` into a width. It falls back to the default rather than throwing: a broken
  // number here is a mis-typed prop, not a reason to take down the page around it.
  const ceiling = Number.isFinite(max) && max > 0 ? max : 100;

  const determinate = value !== undefined && Number.isFinite(value);
  const current = determinate ? Math.min(Math.max(value, 0), ceiling) : undefined;

  return (
    <div
      {...rest}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={ceiling}
      // Omitted entirely when indeterminate — React drops an `undefined` attribute — which is how
      // the role says "in progress, extent unknown" rather than "0%".
      aria-valuenow={current}
      className={cx(styles.track, determinate ? undefined : styles.indeterminate, className)}
    >
      {/* Descendants of `progressbar` are presentational, so this bar is drawn, not announced. */}
      <span
        className={styles.indicator}
        style={current === undefined ? undefined : { inlineSize: `${(current / ceiling) * 100}%` }}
      />
    </div>
  );
};
