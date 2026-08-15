import type { ComponentPropsWithRef, ReactElement } from 'react';

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

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

export const Spinner = ({ size = 'md', label, className, ...rest }: SpinnerProps): ReactElement => (
  <span
    {...rest}
    role={label ? 'status' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={cx(styles.spinner, styles[size], className)}
  />
);
