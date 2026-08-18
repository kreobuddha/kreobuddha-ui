import { useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { DocsContainer } from '@storybook/addon-docs/blocks';
import type { DocsContainerProps } from '@storybook/addon-docs/blocks';
import { themes } from 'storybook/theming';

import { isDarkTheme, subscribeToTheme } from './theme';

/**
 * Storybook draws a documentation page's own chrome — prose, tables, code blocks — from its theme
 * rather than from `--kreo-*`, and it defaults to the light one. Without this the page stayed
 * white whatever the toolbar said: the `--kreo-*` values did switch, and so did any story on the
 * page, but the page around them did not, and the control looked broken on exactly the pages that
 * document theming.
 *
 * The `--kreo-*` side of the switch is not done here. It is an attribute on the preview document,
 * set outside React by `./theme`, because anything React owns disappears for the frame in which
 * Storybook rebuilds the page.
 */
export const ThemedDocsContainer = ({
  context,
  children,
}: DocsContainerProps & { children?: ReactNode }): ReactElement => {
  const isDark = useSyncExternalStore(subscribeToTheme, isDarkTheme, isDarkTheme);

  return (
    <DocsContainer context={context} theme={isDark ? themes.dark : themes.light}>
      {children}
    </DocsContainer>
  );
};
