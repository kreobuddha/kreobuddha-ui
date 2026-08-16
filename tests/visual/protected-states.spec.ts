import { expect, test } from '@playwright/test';

/**
 * Visual checks protect intentional states, not every possible prop combination —
 * `docs/QUALITY.md` §6. The list below is therefore curated rather than generated from the story
 * index: a snapshot per story would be a few hundred baselines, most of them re-photographing the
 * same pixels, and a baseline nobody reads is a baseline nobody reviews.
 *
 * What earns a place here is a state where the tokens do the work and nothing else would catch a
 * change: the whole kit in both themes, the focus ring, the invalid treatment, and the two shapes
 * that layout can break — long content and a full-width control.
 */

/** Every story renders inside the preview iframe, which is what carries the theme decorator. */
const storyUrl = (id: string, theme: 'light' | 'dark'): string =>
  `/iframe.html?id=${id}&globals=theme:${theme}&viewMode=story`;

const PROTECTED = [
  // The sweep: everything the library ships, on one page. A token change shows up here first.
  { id: 'overview-kit--kit', name: 'kit' },

  // Focus is drawn as an inset ring in the accent colour, and filled controls override it with
  // their own label colour. Nothing but a screenshot checks that it is visible on both.
  { id: 'components-button--variants', name: 'button-variants' },
  { id: 'components-button--danger', name: 'button-danger' },
  { id: 'components-textfield--focus', name: 'textfield-focus' },
  { id: 'components-select--focus', name: 'select-focus' },

  // Invalid is a border colour plus a message. Both come from tokens.
  { id: 'components-textfield--invalid', name: 'textfield-invalid' },
  { id: 'components-fieldgroup--invalid', name: 'fieldgroup-invalid' },

  // The tinted message surfaces, which are the pairing the contrast script works hardest on.
  { id: 'components-alert--tones', name: 'alert-tones' },
  { id: 'components-badge--tones', name: 'badge-tones' },

  // Layout that can break: a label longer than its box, a message that has to wrap, and a control
  // told to fill its container.
  { id: 'components-button--long-label', name: 'button-long-label' },
  { id: 'components-alert--long-message', name: 'alert-long-message' },
  { id: 'components-button--text-wrap', name: 'button-text-wrap' },
  { id: 'components-textfield--full-width', name: 'textfield-full-width' },

  // The disabled and loading treatments are deliberately different from each other, and that
  // difference is entirely visual.
  { id: 'components-button--loading', name: 'button-loading' },
  { id: 'components-button--disabled', name: 'button-disabled' },

  // Sizes are token geometry, and a control whose height drifts off the scale is invisible to
  // every other check in the repository.
  { id: 'components-button--sizes', name: 'button-sizes' },
  { id: 'components-iconbutton--sizes', name: 'iconbutton-sizes' },
  { id: 'components-spinner--sizes', name: 'spinner-sizes' },

  // `Tabs` is the first component whose selected state is carried by a moving indicator rather
  // than by a fill, and the first that has to survive more tabs than fit.
  { id: 'components-tabs--default', name: 'tabs-default' },
  { id: 'components-tabs--disabled-tab', name: 'tabs-disabled-tab' },
  { id: 'components-tabs--many-tabs', name: 'tabs-many-tabs' },
] as const;

for (const theme of ['light', 'dark'] as const) {
  test.describe(theme, () => {
    for (const { id, name } of PROTECTED) {
      test(name, async ({ page }) => {
        await page.goto(storyUrl(id, theme));

        // The story root, not the viewport: the preview body is a fixed-height box, and
        // photographing it would crop anything taller and add empty space below anything shorter.
        const story = page.locator('#storybook-root');
        await expect(story).toBeVisible();

        // Inter is loaded with `font-display: swap`, so a screenshot taken before the file arrives
        // is a screenshot of the fallback family — which differs from run to run depending on
        // whether the font was cached.
        await page.evaluate(() => document.fonts.ready);

        // Storybook runs a story's `play` function after mount. Several of the stories above use
        // one to put a control into the state being photographed — focus, most of all — so the
        // screenshot has to wait for the page to stop changing.
        await page.waitForLoadState('networkidle');

        await expect(story).toHaveScreenshot(`${theme}-${name}.png`);
      });
    }
  });
}
