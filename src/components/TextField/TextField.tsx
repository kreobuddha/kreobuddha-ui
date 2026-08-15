import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

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

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

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
  const generated = useId();
  const inputId = id ?? `${generated}-input`;
  const hintId = `${generated}-hint`;
  const errorId = `${generated}-error`;

  // The error comes first: a screen reader reads these in order, and hearing what is wrong before
  // hearing the guidance is the useful order. `undefined` rather than an empty string, which some
  // assistive technology treats as a reference to nothing rather than as no reference.
  const describedBy = cx(error ? errorId : undefined, hint ? hintId : undefined) || undefined;

  return (
    <div
      className={cx(styles.field, fullWidth && styles.fullWidth, className)}
      data-disabled={disabled || undefined}
    >
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {/* The marker is decorative; `required` on the input is what actually carries the fact. */}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      <div className={cx(styles.shell, styles[size], Boolean(error) && styles.invalid)}>
        {prefix ? <span className={styles.prefix}>{prefix}</span> : null}

        <input
          {...rest}
          id={inputId}
          className={styles.input}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />

        {suffix ? <span className={styles.suffix}>{suffix}</span> : null}
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
