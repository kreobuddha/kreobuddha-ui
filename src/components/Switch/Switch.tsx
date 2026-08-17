import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import { FieldMessages } from '../field/FieldLabel.js';
import { useFieldParts } from '../field/useFieldParts.js';

import styles from './Switch.module.css';

export interface SwitchProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'size'> {
  /** The text beside the switch. Required: an unlabelled switch says nothing about what it turns on. */
  label: ReactNode;
  /** Guidance shown under the label. Announced with the switch, not read as separate text. */
  hint?: ReactNode;
  /** What is wrong. Its presence is what makes the switch invalid. */
  error?: ReactNode;
  /** Class for the outer wrapper. Native props and `ref` go to the `<input>` itself. */
  className?: string;
}

/**
 * A setting that takes effect when it is flipped, rather than when a form is submitted.
 *
 * That timing is the only thing separating it from `Checkbox`, and it is a promise to the reader: if
 * flipping the switch does nothing until a Save button is pressed, this is the wrong component and a
 * checkbox is the right one.
 *
 * Underneath it is an `<input type="checkbox">` carrying `role="switch"`, so what is announced
 * becomes "on" and "off" rather than "checked", while the native keyboard handling and form
 * participation stay. There is deliberately no `required`: a switch is always in one of its two
 * states, so demanding one of them is a rule about the value, not about the control.
 */
export const Switch = ({
  label,
  hint,
  error,
  className,
  id,
  disabled,
  ...rest
}: SwitchProps): ReactElement => {
  const { controlId, hintId, errorId, describedBy, invalid } = useFieldParts({ id, hint, error });

  return (
    <div className={cx(styles.field, Boolean(disabled) && styles.disabled, className)}>
      <div className={styles.row}>
        {/*
          A checkbox underneath, with `role="switch"` over it. The role changes what is announced —
          "on" and "off" rather than "checked" — while the element keeps native keyboard handling
          and form participation. There is no `required`: a switch is always in one of its two
          states, so demanding one of them is a rule about the value, not about the control.
        */}
        <input
          {...rest}
          type="checkbox"
          role="switch"
          id={controlId}
          className={cx(styles.control, Boolean(error) && styles.invalid)}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />

        <label className={styles.label} htmlFor={controlId}>
          {label}
        </label>
      </div>

      <div className={styles.messages}>
        <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
      </div>
    </div>
  );
};
