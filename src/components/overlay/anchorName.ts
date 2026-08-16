/**
 * A CSS anchor name for one rendered overlay, derived from a `useId`.
 *
 * `useId` produces colons, which are not valid in a dashed-ident, so they have to go. This is two
 * lines and lives here anyway: the anchor name has to be generated identically by the element that
 * declares `anchor-name` and the one that reads `position-anchor`, and two components now do it.
 */
export const anchorName = (id: string): string => `--kreo-anchor-${id.replace(/:/g, '')}`;
