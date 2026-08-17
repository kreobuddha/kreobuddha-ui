import { useCallback, useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { DocsContainer } from '@storybook/addon-docs/blocks';
import type { DocsContainerProps } from '@storybook/addon-docs/blocks';

/**
 * The story decorator in `preview.tsx` wraps stories, and a documentation page is not a story:
 * its prose, its token tables and anything they render sit outside every decorator. Without this
 * the token pages would resolve the light theme whatever the toolbar says.
 *
 * There is no public way to read a global from a docs container, so the theme is tracked outside
 * React: seeded from the preview URL, which carries the selected globals when the iframe boots,
 * and kept current from the channel the docs context exposes for this kind of low-level watching.
 * It has to live outside the component because Storybook remounts the whole docs page when a
 * global changes, and component state seeded from the now-stale URL would be restored on top of
 * the change that caused the remount.
 */

const THEME_GLOBAL = 'theme';

/** Storybook's own event name for a globals change. */
const GLOBALS_UPDATED = 'globalsUpdated';

const themeFromUrl = (): string => {
  const globals = new URLSearchParams(window.location.search).get('globals');

  if (globals === null) {
    return 'light';
  }

  for (const entry of globals.split(';')) {
    const separator = entry.indexOf(':');

    if (entry.slice(0, separator) === THEME_GLOBAL) {
      return entry.slice(separator + 1);
    }
  }

  return 'light';
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

const getSnapshot = (): string => currentTheme;

export const ThemedDocsContainer = ({
  context,
  children,
}: DocsContainerProps & { children?: ReactNode }): ReactElement => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      subscribers.add(onStoreChange);

      const onGlobalsUpdated = (payload: unknown): void => {
        const next = themeFromPayload(payload);

        if (next !== undefined && next !== currentTheme) {
          currentTheme = next;

          for (const notify of subscribers) {
            notify();
          }
        }
      };

      context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);

      return () => {
        context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
        subscribers.delete(onStoreChange);
      };
    },
    [context]
  );

  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <DocsContainer context={context}>
      {/* Light needs no attribute at all, which is the contract these pages document. */}
      <div data-kreo-theme={theme === 'dark' ? 'dark' : undefined}>{children}</div>
    </DocsContainer>
  );
};
