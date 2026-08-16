/**
 * Every story renders inside the preview iframe, which is what carries the theme decorator — so
 * both Playwright projects address a story the same way, and the shape of that address lives here
 * rather than being copied into each of them.
 */
export const storyUrl = (id: string, theme: 'light' | 'dark' = 'light'): string =>
  `/iframe.html?id=${id}&globals=theme:${theme}&viewMode=story`;
