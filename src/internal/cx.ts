/**
 * Joins class names, dropping the ones a condition turned off.
 *
 * Component classes are assembled conditionally — `cx(styles.button, danger && styles.danger,
 * className)` — and without the filter a `false` would be written into the attribute as the word.
 * The signature admits exactly what that pattern produces and nothing else: no objects, no arrays,
 * no `clsx` API surface. A component needing more than this is a component doing something the
 * others are not.
 *
 * Internal, and not exported from the package. It is shared because fourteen components had
 * assembled it identically, not because a consumer should reach for it.
 */
export const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');
