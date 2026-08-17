import type { ComponentPropsWithRef, ReactElement } from 'react';

import { cx } from '../../internal/cx.js';

import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Diameter: 16px, 20px or 24px. */
  size?: SpinnerSize;
  /**
   * What the spinner is waiting for, announced by assistive technology.
   *
   * Without it the spinner is decorative and hidden from assistive technology entirely, which is
   * correct whenever something nearby already says that work is in progress — visible text, or a
   * container carrying `aria-busy`. Supplying a label is how you opt into being announced, so a
   * spinner never doubles up on an announcement that already exists.
   */
  label?: string;
}

/**
 * Work is happening, with no claim about how much is left.
 *
 * That is the entire difference from `Progress`: a spinner says only that something is under way, so
 * reach for it when there is no honest number to show — and for `Progress` when there is, since a bar
 * is worth its space only when the number is real.
 *
 * `label` is what decides whether it is announced, and leaving it out is a real choice rather than an
 * omission: unlabelled, the spinner is decorative and hidden from assistive technology, which is
 * correct whenever something nearby already says work is in progress — visible text, or a container
 * carrying `aria-busy`. Supplying a label is how you opt in, so a spinner never doubles an
 * announcement that already exists. `Button` uses the unlabelled form for exactly that reason.
 */
export const Spinner = ({ size = 'md', label, className, ...rest }: SpinnerProps): ReactElement => (
  <span
    {...rest}
    role={label ? 'status' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={cx(styles.spinner, styles[size], className)}
  />
);
