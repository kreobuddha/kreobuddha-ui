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
  /**
   * The padding around the text, matching `TextField`'s at the same name. Height comes from
   * `rows` and the type comes from `--kreo-type-body` at every size, so this is the one thing
   * left for `size` to say here.
   */
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
  /**
   * How many lines tall the field starts, which is what sets its height — `size` sets the padding
   * only. With `resize="none"` this is also its final height.
   */
  rows?: number;
}

/**
 * Text that runs to several lines — a description, a note, a pasted log.
 *
 * It is `TextField`'s counterpart and shares its whole field contract: the same required `label`, the
 * same hint, the same `error`-is-the-invalid-state rule, the same body type. Reach for it when the
 * answer has no reason to fit on one line, and for `TextField` when it does, since a one-line answer
 * in a three-line box invites a paragraph nobody wanted.
 *
 * Height comes from `rows` rather than from `size`, so a field can be as tall as the answer
 * deserves. `resize` decides whether the reader may drag it taller; horizontal dragging is never
 * offered, because it breaks the form's grid and a wider box is not easier to read.
 */
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
