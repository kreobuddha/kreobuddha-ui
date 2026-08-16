import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import { FieldLabel, FieldMessages } from '../field/FieldLabel.js';
import { useFieldParts } from '../field/useFieldParts.js';

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
  const { controlId, hintId, errorId, describedBy, invalid } = useFieldParts({ id, hint, error });

  return (
    <div
      className={cx(
        styles.field,
        fullWidth && styles.fullWidth,
        Boolean(disabled) && styles.disabled,
        className
      )}
    >
      <FieldLabel htmlFor={controlId} required={required}>
        {label}
      </FieldLabel>

      <div className={cx(styles.shell, styles[size], Boolean(error) && styles.invalid)}>
        <textarea
          {...rest}
          id={controlId}
          rows={rows}
          className={cx(styles.control, styles[resize])}
          disabled={disabled}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      </div>

      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
};
