import type { InputType } from 'storybook/internal/types';

/**
 * Documentation-only, like the rest of `src/docs`: not exported from `src/index.ts`, and
 * `tsconfig.build.json` excludes this directory, so nothing here reaches `dist`.
 *
 * Storybook picks a control from the prop's documented type, and two shapes this library uses a
 * lot have no control to pick. Both land on the same fallback — a JSON object editor — and both
 * are unusable in it:
 *
 * - `ReactNode` and `ReactElement`. The editor asks for JSON and the prop wants an element. On a
 *   trigger prop such as `Tooltip.children` it also *prints* the current element, which means the
 *   table shows `$$typeof: Symbol(react.transitional.element)` and the source of whatever
 *   component was passed.
 * - `T | undefined`. `exactOptionalPropertyTypes` is on, so an optional prop that a consumer may
 *   pass `undefined` to has to say so, and that makes it a union. `react-docgen` reports the type
 *   as `union` with no control, and a plain `number` becomes an object editor.
 *
 * The second one cannot be fixed in the type: dropping `| undefined` would change the public
 * contract. It is fixed here, where it belongs — in the documentation.
 *
 * These are fragments to spread into a story's `argTypes`. They are deliberately not a global
 * enhancer: an enhancer would have to run after Storybook's own control inference, and nothing
 * documents that ordering, so it would break silently on an upgrade and quietly take the prop
 * tables with it.
 */

/** A node that is rendered rather than typed — a trigger, an icon, a footer full of buttons. */
export const nodeControl: InputType = { control: false };

/** A node that is realistically a line of text, so the reader can edit it and see the result. */
export const textNodeControl: InputType = { control: 'text' };

/** An optional `string | undefined`. */
export const optionalText: InputType = { control: 'text' };

/** An optional `number | undefined`. */
export const optionalNumber: InputType = { control: 'number' };

/** An optional `boolean | undefined`. */
export const optionalBoolean: InputType = { control: 'boolean' };
