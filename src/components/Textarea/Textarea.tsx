import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import styles from './Textarea.module.css';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'vertical' | 'none';

export interface TextareaProps extends Omit<ComponentPropsWithRef<'textarea'>, 'prefix'> {
  /** The field's visible label. Required: a field without one is unusable by anybody not looking at it. */
  label: string;
  /** Type scale and padding, matching `TextField`. Height comes from `rows`. */
  size?: TextareaSize;
  /** Guidance shown under the field. Announced with the field, not read as separate text. */
  hint?: ReactNode;
  /**
   * What is wrong with the current value. Its presence is what makes the field invalid — there is
   * no separate `invalid` prop, because a field marked invalid without saying why is a dead end.
   */
  error?: ReactNode;
  /**
   * Whether the reader may drag the field taller. `'none'` pins it to exactly `rows` lines, which
   * is what a fixed layout needs. Horizontal dragging is never offered: it breaks the form's grid
   * and there is no reading benefit to a wider box.
   */
  resize?: TextareaResize;
  /** Stretches to the width of its container instead of sizing to the browser default. */
  fullWidth?: boolean;
  /** Class for the outer wrapper. Native props and `ref` go to the `<textarea>` itself. */
  className?: string;
}

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

export const Textarea = ({
  label,
  size = 'md',
  hint,
  error,
  resize = 'vertical',
  fullWidth = false,
  className,
  id,
  disabled,
  required,
  rows = 3,
  ...rest
}: TextareaProps): ReactElement => {
  const generated = useId();
  const fieldId = id ?? `${generated}-textarea`;
  const hintId = `${generated}-hint`;
  const errorId = `${generated}-error`;

  // The error comes first: a screen reader reads these in order, and hearing what is wrong before
  // hearing the guidance is the useful order.
  const describedBy = cx(error ? errorId : undefined, hint ? hintId : undefined) || undefined;

  return (
    <div
      className={cx(styles.field, fullWidth && styles.fullWidth, className)}
      data-disabled={disabled || undefined}
    >
      <label className={styles.label} htmlFor={fieldId}>
        {label}
        {/* The marker is decorative; `required` on the control is what carries the fact. */}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <div className={cx(styles.shell, styles[size], Boolean(error) && styles.invalid)}>
        <textarea
          {...rest}
          id={fieldId}
          rows={rows}
          className={cx(styles.control, styles[resize])}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>

      {error ? (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      ) : null}

      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
};
