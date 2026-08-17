import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import { useFieldParts } from '../field/useFieldParts.js';

import styles from './FieldGroup.module.css';

export interface FieldGroupProps extends ComponentPropsWithRef<'fieldset'> {
  /** What the whole group is asking. Becomes the `<legend>`. */
  legend: string;
  /** Guidance for the group as a whole. */
  hint?: ReactNode;
  /** What is wrong with the group as a whole — "choose at least one", not a fault of any one box. */
  error?: ReactNode;
  /** Lays the controls out side by side instead of stacked. */
  orientation?: 'vertical' | 'horizontal';
  /** The controls. */
  children?: ReactNode;
}

/**
 * The question a set of controls answers together, as a real `<fieldset>` and `<legend>`.
 *
 * Without it, a screen reader reaching a column of checkboxes or radios hears the options and never
 * the question. The legend is announced before the controls inside it, which is the whole reason
 * this component exists — and it is what makes `Radio` usable at all, since a radio deliberately
 * brings no question of its own.
 *
 * Where a message belongs is the decision this component forces, and the useful one: guidance and
 * faults about the *set* — "choose at least one" — go on the group, and a fault in one control stays
 * on that control. `aria-describedby` sits on the fieldset rather than on each child, so the
 * guidance is read once instead of once per option.
 *
 * `disabled` is the native fieldset behaviour, which disables every control inside it — inherited
 * rather than reimplemented per child.
 */
export const FieldGroup = ({
  legend,
  hint,
  error,
  orientation = 'vertical',
  className,
  children,
  disabled,
  ...rest
}: FieldGroupProps): ReactElement => {
  const { hintId, errorId, describedBy, invalid } = useFieldParts({ hint, error });

  return (
    // A real `<fieldset>` and `<legend>`, so the group is announced as a group and every control
    // inside it is heard in the context of the question. `aria-describedby` sits on the fieldset
    // rather than on each control: the guidance is about the set, and repeating it on every box
    // would have a screen reader read it once per option.
    //
    // `disabled` on a fieldset disables every control inside it, which is native behaviour worth
    // keeping rather than reimplementing per child.
    <fieldset
      {...rest}
      disabled={disabled}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      className={cx(styles.group, Boolean(disabled) && styles.disabled, className)}
    >
      <legend className={styles.legend}>{legend}</legend>

      <div className={cx(styles.controls, styles[orientation])}>{children}</div>

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
    </fieldset>
  );
};
