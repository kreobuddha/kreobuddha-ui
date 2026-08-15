import { useId } from 'react';
import type { ReactNode } from 'react';

/**
 * The wiring every field in this library repeats: generated ids, the `aria-describedby` list, and
 * the invalid flag that follows from an error being present.
 *
 * This exists because `TextField`, `Textarea` and `Select` are three components doing it
 * identically, which is the point `ARCHITECTURE.md` names as the moment to extract rather than the
 * moment to anticipate. It is internal and unexported from the package: the shared thing is the
 * behaviour, not a public component, and a `Field` wrapper would put a layout box between a
 * consumer and their own control for no gain.
 */

// `| undefined` is spelled out because `exactOptionalPropertyTypes` is on: a caller spreading a
// value that may be undefined is exactly how these are used, and the alternative is a conditional
// spread at every call site.
export interface FieldPartsInput {
  /** A caller-supplied id for the control, when they have one. */
  id?: string | undefined;
  hint?: ReactNode | undefined;
  error?: ReactNode | undefined;
}

export interface FieldParts {
  /** The control's id, and the target of the label's `htmlFor`. */
  controlId: string;
  hintId: string;
  errorId: string;
  /** `undefined` rather than an empty string, which some assistive technology treats as a
   *  reference to nothing rather than as no reference at all. */
  describedBy: string | undefined;
  /** `true` only when an error is present, so the two can never disagree. */
  invalid: true | undefined;
}

export const useFieldParts = ({ id, hint, error }: FieldPartsInput): FieldParts => {
  const generated = useId();

  const hintId = `${generated}-hint`;
  const errorId = `${generated}-error`;

  // The error comes first: a screen reader reads these in order, and hearing what is wrong before
  // hearing the guidance is the useful order.
  const ids = [error ? errorId : undefined, hint ? hintId : undefined].filter(Boolean);

  return {
    controlId: id ?? `${generated}-control`,
    hintId,
    errorId,
    describedBy: ids.length > 0 ? ids.join(' ') : undefined,
    invalid: error ? true : undefined,
  };
};
