import { useEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import { FieldMessages } from '../field/FieldLabel.js';
import { useFieldParts } from '../field/useFieldParts.js';

import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'size'> {
  /** The text beside the box. Required: an unlabelled checkbox asks a question nobody can hear. */
  label: ReactNode;
  /** Guidance shown under the label. Announced with the checkbox, not read as separate text. */
  hint?: ReactNode;
  /**
   * What is wrong. Its presence is what makes the checkbox invalid — a single required checkbox,
   * such as accepting terms, is exactly the case that needs somewhere to say so.
   */
  error?: ReactNode;
  /**
   * Neither checked nor unchecked: some of what this box stands for is selected. There is no HTML
   * attribute for it, only a DOM property, so a consumer cannot set it without a ref of their own.
   *
   * It is a visual and assistive state only. The box still submits as unchecked, because that is
   * what the platform does and inventing a third value would break every form that reads it.
   */
  indeterminate?: boolean;
  /** Class for the outer wrapper. Native props and `ref` go to the `<input>` itself. */
  className?: string;
}

export const Checkbox = ({
  label,
  hint,
  error,
  indeterminate = false,
  className,
  id,
  disabled,
  required,
  ref,
  ...rest
}: CheckboxProps): ReactElement => {
  const { controlId, hintId, errorId, describedBy, invalid } = useFieldParts({ id, hint, error });
  const inner = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  // The caller's ref still has to reach the same element, so both are attached.
  const attachRef = (node: HTMLInputElement | null): void => {
    inner.current = node;

    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
  };

  return (
    <div className={cx(styles.field, Boolean(disabled) && styles.disabled, className)}>
      <div className={styles.row}>
        <input
          {...rest}
          type="checkbox"
          ref={attachRef}
          id={controlId}
          className={cx(styles.control, Boolean(error) && styles.invalid)}
          disabled={disabled}
          required={required}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />

        <label className={styles.label} htmlFor={controlId}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      </div>

      <div className={styles.messages}>
        <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
      </div>
    </div>
  );
};
