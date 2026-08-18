import { addons } from 'storybook/preview-api';

/**
 * The selected theme, tracked outside React and written straight onto the preview document.
 *
 * Storybook rebuilds a documentation page from scratch on every globals change — measured, not
 * assumed: the `<h1>` and the `sbdocs-wrapper` are different nodes after a toggle, and that happens
 * with Storybook's own container as well as with ours, so it is not something this repository can
 * switch off. What it *can* stop is the flash that rebuild used to show. The colour used to be
 * painted by a React element, so for the frame where React had torn the page down and not yet put
 * it back there was nothing painting it and the reader saw white.
 *
 * Painting from `<html>` instead means the surface is never owned by React: the attribute is set
 * here, synchronously, as the globals change arrives, and survives the rebuild that follows. The
 * rebuild still costs its milliseconds, but it is invisible — the page is already the right colour
 * before it starts and stays that way throughout.
 *
 * `globals` in the URL stays the source of truth for the initial value, which is what the Playwright
 * projects and any shared link rely on.
 */

const THEME_GLOBAL = 'theme';

/** Storybook's own event name for a globals change. */
const GLOBALS_UPDATED = 'globalsUpdated';

const DARK = 'dark';
const LIGHT = 'light';

const themeFromUrl = (): string => {
  const globals = new URLSearchParams(window.location.search).get('globals');

  if (globals === null) {
    return LIGHT;
  }

  for (const entry of globals.split(';')) {
    const separator = entry.indexOf(':');

    if (entry.slice(0, separator) === THEME_GLOBAL) {
      return entry.slice(separator + 1);
    }
  }

  return LIGHT;
};

const themeFromPayload = (payload: unknown): string | undefined => {
  if (typeof payload !== 'object' || payload === null || !('globals' in payload)) {
    return undefined;
  }

  const globals = payload.globals;

  if (typeof globals !== 'object' || globals === null || !(THEME_GLOBAL in globals)) {
    return undefined;
  }

  const theme = globals[THEME_GLOBAL];

  return typeof theme === 'string' ? theme : undefined;
};

let currentTheme = themeFromUrl();

const subscribers = new Set<() => void>();

/**
 * Dark is an attribute on an ancestor and light is the absence of one — the contract the theming
 * page documents. `<html>` is simply the highest ancestor available, so a consumer setting it on
 * their own wrapper sees the same behaviour.
 */
const paint = (): void => {
  if (currentTheme === DARK) {
    document.documentElement.setAttribute('data-kreo-theme', DARK);
  } else {
    document.documentElement.removeAttribute('data-kreo-theme');
  }
};

paint();

addons.getChannel().on(GLOBALS_UPDATED, (payload: unknown) => {
  const next = themeFromPayload(payload);

  if (next === undefined || next === currentTheme) {
    return;
  }

  currentTheme = next;
  paint();

  for (const notify of subscribers) {
    notify();
  }
});

/** For `useSyncExternalStore`, where a component needs the value rather than the paint. */
export const subscribeToTheme = (onStoreChange: () => void): (() => void) => {
  subscribers.add(onStoreChange);

  return () => {
    subscribers.delete(onStoreChange);
  };
};

export const getTheme = (): string => currentTheme;

export const isDarkTheme = (): boolean => currentTheme === DARK;
