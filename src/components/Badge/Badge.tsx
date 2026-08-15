import type { ComponentPropsWithRef, ReactElement } from 'react';

import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  /** Semantic colour. Colour never carries the meaning alone — the text does. */
  tone?: BadgeTone;
  /** Decorative status dot before the label. */
  dot?: boolean;
}

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

/**
 * A short, non-interactive label for a status or a category. It renders a plain `<span>` with no
 * ARIA role: it is text, and the text is what carries the meaning.
 */
export const Badge = ({
  tone = 'neutral',
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps): ReactElement => (
  <span {...rest} className={cx(styles.badge, styles[tone], className)}>
    {/* The dot repeats what the label already says, so it stays out of the accessibility tree. */}
    {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
    {children}
  </span>
);
