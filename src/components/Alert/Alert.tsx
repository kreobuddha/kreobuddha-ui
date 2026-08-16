import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';
import { CloseMark, TONE_MARKS } from '../../internal/marks.js';

import { IconButton } from '../IconButton/IconButton.js';

import styles from './Alert.module.css';

export type AlertTone = 'success' | 'warning' | 'danger' | 'info';

export interface AlertProps extends ComponentPropsWithRef<'div'> {
  /** What kind of message this is. Never the meaning on its own — the wording has to carry it. */
  tone?: AlertTone;
  /** An optional heading above the message. */
  title?: string;
  /**
   * Replaces the mark the tone supplies. The built-in marks exist so the component can keep its
   * promise not to rely on colour alone; pass your own to match the rest of your interface.
   */
  icon?: ReactNode;
  /**
   * Announce the message when it appears.
   *
   * Off by default, which is right for a banner that is already on screen when the page loads —
   * announcing it would interrupt for no reason. Turn it on for a message that appears in
   * response to something, such as a failed save. A `danger` alert then interrupts
   * (`role="alert"`); the quieter tones wait for a pause (`role="status"`).
   */
  live?: boolean;
  /** Renders a close button. Without it the alert cannot be dismissed. */
  onDismiss?: () => void;
  /** The close button's accessible name. */
  dismissLabel?: string;
}

export const Alert = ({
  tone = 'info',
  title,
  icon,
  live = false,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  children,
  ...rest
}: AlertProps): ReactElement => {
  const Mark = TONE_MARKS[tone];

  return (
    <div
      {...rest}
      role={live ? (tone === 'danger' ? 'alert' : 'status') : undefined}
      className={cx(styles.alert, styles[tone], className)}
    >
      <span className={styles.mark} aria-hidden="true">
        {icon ?? <Mark />}
      </span>

      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.message}>{children}</div>
      </div>

      {onDismiss ? (
        <IconButton
          variant="ghost"
          size="xs"
          label={dismissLabel}
          icon={<CloseMark />}
          onClick={onDismiss}
          className={styles.dismiss}
        />
      ) : null}
    </div>
  );
};
