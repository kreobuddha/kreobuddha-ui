/**
 * Whether the run is on macOS, for the two expectations that differ by WebKit build rather than by
 * engine.
 *
 * Playwright ships two WebKits: the macOS one, which is close to the engine a Safari user has, and
 * a Linux build that CI runs. They do not agree about returning focus to a dialog's trigger or
 * about putting buttons in the tab order — CI proved it by failing with "Expected to fail, but
 * passed" when those expectations were written against the engine name alone.
 *
 * `process` is declared here rather than pulled in with `@types/node`: the host platform is the
 * only thing these tests need from Node, and one line is a smaller commitment than a types package
 * this repository otherwise has no use for.
 */
declare const process: { readonly platform: string };

export const isMacOS = process.platform === 'darwin';
