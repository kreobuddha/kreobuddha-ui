// The theme lives here rather than in the library, and that is the point.
//
// `@kreobuddha/ui` publishes one contract — `data-kreo-theme="dark"` on a host element — and
// deliberately stores nothing and reads no system preference. Someone has to do the other half:
// decide, remember, and set the attribute. In a real application that is the application, so in
// the workbench it is these fifteen lines rather than a prop on a provider.

export type Theme = 'light' | 'dark';

/** Shared with the inline script in `index.html`, which applies the choice before the first paint. */
const STORAGE_KEY = 'kreobuddha-ui-workbench-theme';

/**
 * Storage can throw rather than merely be empty — a browser configured to block it does exactly
 * that — so a failure to remember the choice must not take the interface down with it.
 */
export const readTheme = (): Theme => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const applyTheme = (theme: Theme): void => {
  // Removed rather than set to `light`: the light theme is the token defaults on `:root`, and an
  // attribute value the library does not define would suggest a selector that does not exist.
  if (theme === 'dark') {
    document.documentElement.dataset.kreoTheme = 'dark';
  } else {
    delete document.documentElement.dataset.kreoTheme;
  }

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* The choice still applies to this session; it simply will not survive a reload. */
  }
};
