import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { FieldLabel, FieldMessages } from '../field/FieldLabel.js';
import { useFieldParts } from '../field/useFieldParts.js';

import styles from './Select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'size' | 'multiple'> {
  /** The field's visible label. Required: a field without one is unusable by anybody not looking at it. */
  label: string;
  /** Height and type scale, matching `Button` so a field and a button sit level side by side. */
  size?: SelectSize;
  /** Guidance shown under the field. Announced with the field, not read as separate text. */
  hint?: ReactNode;
  /**
   * What is wrong with the current value. Its presence is what makes the field invalid — there is
   * no separate `invalid` prop, because a field marked invalid without saying why is a dead end.
   */
  error?: ReactNode;
  /**
   * The text shown while nothing has been chosen. It becomes a disabled first option, so it is
   * visible until a choice is made and cannot be chosen afterwards — which is what lets native
   * `required` mean what it says. Leave it out when the first option is a real default.
   */
  placeholder?: string;
  /** Stretches to the width of its container instead of sizing to its widest option. */
  fullWidth?: boolean;
  /** Class for the outer wrapper. Native props and `ref` go to the `<select>` itself. */
  className?: string;
  /** The `<option>` and `<optgroup>` elements. */
  children?: ReactNode;
}

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

/** Drawn by the component rather than left to the platform, which paints a different arrow per OS. */
const Chevron = (): ReactElement => (
  <svg
    className={styles.chevron}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Select = ({
  label,
  size = 'md',
  hint,
  error,
  placeholder,
  fullWidth = false,
  className,
  id,
  disabled,
  required,
  children,
  defaultValue,
  value,
  ...rest
}: SelectProps): ReactElement => {
  const { controlId, hintId, errorId, describedBy, invalid } = useFieldParts({ id, hint, error });

  // With a placeholder the empty value has to be selected initially, or the browser falls back to
  // the first real option and the field silently claims a choice nobody made. Only defaulted when
  // the caller has said nothing, so a controlled `value` and an explicit `defaultValue` both win.
  const uncontrolledDefault =
    value === undefined && defaultValue === undefined && placeholder !== undefined
      ? ''
      : defaultValue;

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
        <select
          {...rest}
          id={controlId}
          className={styles.control}
          disabled={disabled}
          required={required}
          value={value}
          defaultValue={uncontrolledDefault}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        >
          {placeholder !== undefined ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>

        <Chevron />
      </div>

      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
};
