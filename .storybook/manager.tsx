// The manager is bundled separately from the preview, by esbuild with the classic JSX transform,
// so `React` has to be in scope here even though `src/` never imports it.
import React from 'react';
import { IconButton } from 'storybook/internal/components';
import { addons, types, useGlobals } from 'storybook/manager-api';
import type { ReactElement } from 'react';

const ADDON_ID = 'kreobuddha/theme';
const TOOL_ID = `${ADDON_ID}/tool`;

/**
 * The theme was a two-item dropdown, which costs a click to open and lets the reader land on the
 * value that was already selected. There are exactly two themes and no third is planned, so the
 * control that fits is a switch: one click, and it always changes something.
 *
 * The global itself still lives in `preview.tsx` — this only replaces the way it is set, so the
 * decorator, `ThemedDocsContainer` and the Playwright projects that read `globals` are untouched.
 */
const ThemeTool = (): ReactElement => {
  const [globals, updateGlobals] = useGlobals();
  const isDark = globals['theme'] === 'dark';

  return (
    <IconButton
      key={TOOL_ID}
      active={isDark}
      title={isDark ? 'Switch to the light theme' : 'Switch to the dark theme'}
      onClick={(): void => updateGlobals({ theme: isDark ? 'light' : 'dark' })}
    >
      {/* A half-filled circle: the same mark in both states, so the button does not appear to
          change identity when it is pressed. `active` carries which state it is in. */}
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 1a6 6 0 010 12z" fill="currentColor" />
      </svg>
      <span style={{ marginInlineStart: 6 }}>{isDark ? 'Dark' : 'Light'}</span>
    </IconButton>
  );
};

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Theme',
    // Everywhere except the settings pages, which render no preview to theme.
    match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
    render: ThemeTool,
  });
});
