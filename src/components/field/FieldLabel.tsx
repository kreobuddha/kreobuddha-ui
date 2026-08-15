import type { ReactElement, ReactNode } from 'react';

import styles from './field.module.css';

/**
 * The label, and the two lines that may sit under a field. Internal: they exist so the three
 * fields render this identically, not so a consumer can assemble their own field.
 */

export interface FieldLabelProps {
  htmlFor: string;
  children: string;
  /** Renders the marker. The fact itself is carried by the control's native `required`. */
  required?: boolean | undefined;
  className?: string | undefined;
}

export const FieldLabel = ({
  htmlFor,
  children,
  required,
  className,
}: FieldLabelProps): ReactElement => (
  <label className={className ?? styles.label} htmlFor={htmlFor}>
    {children}
    {required ? (
      <span className={styles.required} aria-hidden="true">
        *
      </span>
    ) : null}
  </label>
);

export interface FieldMessagesProps {
  hint?: ReactNode | undefined;
  error?: ReactNode | undefined;
  hintId: string;
  errorId: string;
}

/** Rendered in the order they are described in, so what is read matches what is seen. */
export const FieldMessages = ({
  hint,
  error,
  hintId,
  errorId,
}: FieldMessagesProps): ReactElement => (
  <>
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
  </>
);
