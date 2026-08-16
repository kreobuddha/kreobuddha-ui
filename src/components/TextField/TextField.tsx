import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import { FieldLabel, FieldMessages } from '../field/FieldLabel.js';
import { useFieldParts } from '../field/useFieldParts.js';

import styles from './TextField.module.css';

export type TextFieldSize = 'sm' | 'md' | 'lg';

// `size` is a native input attribute meaning a width in characters, and `prefix` is a native RDFa
// attribute typed as `string`. Both are replaced here rather than shadowed: leaving either in place
// would give the prop two incompatible meanings, and the RDFa one is not what anybody reaches for.
export interface TextFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'size' | 'prefix'> {
  /** The field's visible label. Required: a field without one is unusable by anybody not looking at it. */
  label: string;
  /** Height and type scale, matching `Button` so a field and a button sit level side by side. */
  size?: TextFieldSize;
  /** Guidance shown under the field. Announced with the field, not read as separate text. */
  hint?: ReactNode;
  /**
   * What is wrong with the current value. Its presence is what makes the field invalid — there is
   * no separate `invalid` prop, because a field marked invalid without saying why is a dead end.
   */
  error?: ReactNode;
  /** Content inside the border, before the input. */
  prefix?: ReactNode;
  /** Content inside the border, after the input. */
  suffix?: ReactNode;
  /** Stretches to the width of its container instead of sizing to the control scale. */
  fullWidth?: boolean;
  /** Class for the outer wrapper. Native props and `ref` go to the `<input>` itself. */
  className?: string;
}

export const TextField = ({
  label,
  size = 'md',
  hint,
  error,
  prefix,
  suffix,
  fullWidth = false,
  className,
  id,
  disabled,
  required,
  ...rest
}: TextFieldProps): ReactElement => {
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
        {prefix ? <span className={styles.prefix}>{prefix}</span> : null}

        <input
          {...rest}
          id={controlId}
          className={styles.input}
          disabled={disabled}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />

        {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
      </div>

      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
};
