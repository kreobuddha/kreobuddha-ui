import { useEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, MouseEvent, ReactElement, ReactNode } from 'react';

import { Spinner } from '../Spinner/Spinner.js';

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
   * Marks the action as in flight. The button stays focusable, reports `aria-busy`, keeps its
   * exact size, and shows a spinner in place of its content until loading ends.
   */
  loading?: boolean;
  fullWidth?: boolean;
  /**
   * Lets a long label wrap onto several lines and the button grow past its minimum height.
   * By default the label stays on one line, truncates with an ellipsis, and exposes the full
   * text as the browser's own tooltip.
   */
  textWrap?: boolean;
  /** Decorative element before the label. */
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
  textWrap = false,
  icon,
  iconEnd,
  type = 'button',
  disabled = false,
  className,
  children,
  onClick,
  title,
  ...rest
}: ButtonProps): ReactElement => {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [overflowTitle, setOverflowTitle] = useState<string | undefined>(undefined);

  // A truncated label hides text from sighted users, so the full string is offered as the
  // browser's own tooltip — but only while it is actually clipped, otherwise every button would
  // sprout a redundant one.
  useEffect(() => {
    const node = labelRef.current;

    if (!node || textWrap) {
      setOverflowTitle(undefined);
      return;
    }

    const measure = (): void => {
      const clipped = node.scrollWidth > node.clientWidth;
      setOverflowTitle(clipped ? (node.textContent ?? undefined) : undefined);
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [textWrap, children]);

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
      title={title ?? overflowTitle}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        danger && styles.danger,
        fullWidth && styles.fullWidth,
        textWrap && styles.textWrap,
        (disabled || loading) && styles.inactive,
        disabled && styles.dimmed,
        loading && styles.loading,
        className
      )}
    >
      <span className={styles.content}>
        {icon ? (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className={styles.label} ref={labelRef}>
          {children}
        </span>
        {iconEnd ? (
          <span className={styles.icon} aria-hidden="true">
            {iconEnd}
          </span>
        ) : null}
      </span>
      {loading ? <Spinner size="sm" className={styles.spinner} /> : null}
    </button>
  );
};
