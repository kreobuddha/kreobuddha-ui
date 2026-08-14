import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'filled' | 'outlined' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'type'> {
  /** filled = the single primary action in a view, outlined = secondary, ghost = tertiary. */
  variant?: ButtonVariant;
  /** Control height: 32px, 40px or 48px. `lg` is intended for full-width mobile actions. */
  size?: ButtonSize;
  /** Swaps the accent for the danger hue. For destructive confirmations only. */
  danger?: boolean;
  /**
   * Marks the action as in flight. The button stays focusable and keeps its label, reports
   * `aria-busy`, and ignores activation until loading ends.
   */
  loading?: boolean;
  fullWidth?: boolean;
  /** Decorative element before the label. Replaced by the loading indicator while loading. */
  icon?: ReactNode;
  /** Decorative element after the label. */
  iconEnd?: ReactNode;
  /** Defaults to `button` so a button inside a form never submits it by accident. */
  type?: 'button' | 'submit' | 'reset';
}

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

export const Button = ({
  variant = 'filled',
  size = 'md',
  danger = false,
  loading = false,
  fullWidth = false,
  icon,
  iconEnd,
  type = 'button',
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps): ReactElement => {
  const inactive = disabled || loading;

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
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        danger && styles.danger,
        fullWidth && styles.fullWidth,
        inactive && styles.inactive,
        className
      )}
    >
      {loading ? (
        <span className={styles.indicator} aria-hidden="true">
          ···
        </span>
      ) : icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {iconEnd ? (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
    </button>
  );
};
