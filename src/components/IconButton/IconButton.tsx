import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from 'react';

import { Spinner } from '../Spinner/Spinner.js';

import styles from './IconButton.module.css';

export type IconButtonVariant = 'filled' | 'outlined' | 'ghost';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'type' | 'children'
> {
  /**
   * What the button does, as a screen reader will hear it — "Close", "Remove member".
   *
   * Required rather than optional, and checked by the compiler: an icon carries no text, so there
   * is nowhere else an accessible name could come from. It is also used as the hover tooltip,
   * because a symbol without a name is a guess for sighted users too.
   */
  label: string;
  /** The mark to draw. Hidden from assistive technology — `label` is what gets announced. */
  icon: ReactNode;
  /** filled = the single primary action in a view, outlined = secondary, ghost = tertiary. */
  variant?: IconButtonVariant;
  /** Square control: 24px, 32px, 40px or 48px. `xs` is for marks inside another control. */
  size?: IconButtonSize;
  /** Swaps the accent for the danger hue. For destructive confirmations only. */
  danger?: boolean;
  /**
   * Marks the action as in flight. The button stays focusable, reports `aria-busy`, keeps its
   * exact size, and shows a spinner in place of the icon until loading ends.
   */
  loading?: boolean;
  /** Defaults to `button` so a button inside a form never submits it by accident. */
  type?: 'button' | 'submit' | 'reset';
}

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

export const IconButton = ({
  label,
  icon,
  variant = 'filled',
  size = 'md',
  danger = false,
  loading = false,
  type = 'button',
  disabled = false,
  className,
  onClick,
  title,
  ...rest
}: IconButtonProps): ReactElement => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    // A loading button stays in the tab order, so it has to refuse activation itself —
    // including the form submission a click would otherwise trigger.
    if (loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };

  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      aria-label={label}
      title={title ?? label}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={cx(
        styles.iconButton,
        styles[variant],
        styles[size],
        danger && styles.danger,
        (disabled || loading) && styles.inactive,
        disabled && styles.dimmed,
        loading && styles.loading,
        className
      )}
    >
      <span className={cx(styles.mark, loading && styles.hidden)} aria-hidden="true">
        {icon}
      </span>
      {loading ? <Spinner size="sm" className={styles.spinner} /> : null}
    </button>
  );
};
