import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import { FieldMessages } from '../field/FieldLabel.js';
import { useFieldParts } from '../field/useFieldParts.js';

import styles from './Radio.module.css';

export interface RadioProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'size'> {
  /** The text beside the control. Required: an unlabelled option asks a question nobody can hear. */
  label: ReactNode;
  /**
   * The group this option belongs to. Required, unlike the native attribute: a radio without a
   * name belongs to no group, so it can be turned on and never off again. Every option offering
   * the same choice carries the same name, and that is what makes them exclusive.
   */
  name: string;
  /** Guidance shown under the label. Announced with the option, not read as separate text. */
  hint?: ReactNode;
  /**
   * What is wrong with this option. Most of the time the fault belongs to the choice rather than
   * to one of its options — put it on the surrounding `FieldGroup` instead, where it is announced
   * once for the question rather than once per option.
   */
  error?: ReactNode;
  /** Class for the outer wrapper. Native props and `ref` go to the `<input>` itself. */
  className?: string;
}

/**
 * One option in a choice where exactly one answer is possible.
 *
 * It is a real `<input type="radio">`, so the platform owns the parts that are easy to
 * reimplement badly: arrow keys move through the group and select as they go, `Tab` treats the
 * whole group as one stop, and the chosen option is what the form submits. That behaviour comes
 * from the shared `name` — options with the same name are one group, and grouping is the reason
 * `name` is required here.
 *
 * **A radio never brings its own question.** It renders no legend and no fieldset: wrap the
 * options in `FieldGroup` for that, which announces the question, lays them out and carries the
 * error for the group as a whole. A lone radio is a control that cannot be unset, which is
 * almost never what an interface means — reach for `Checkbox` or `Switch` there.
 */
export const Radio = ({
  label,
  name,
  hint,
  error,
  className,
  id,
  disabled,
  required,
  ...rest
}: RadioProps): ReactElement => {
  const { controlId, hintId, errorId, describedBy, invalid } = useFieldParts({ id, hint, error });

  return (
    <div className={cx(styles.field, Boolean(disabled) && styles.disabled, className)}>
      <div className={styles.row}>
        <input
          {...rest}
          type="radio"
          name={name}
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
