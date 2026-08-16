import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { storyUrl } from '../story-url.js';

/**
 * Everything `Accordion` claims is the platform's, so this is where the claim is checked.
 *
 * Two of the three assertions below cannot be made anywhere else. Enter and Space on a `<summary>`
 * are turned into an activation by the browser, which a dispatched key event does not carry — the
 * same reason `Escape` on a `<dialog>` needed this project. And exclusive opening is the `name`
 * attribute, which jsdom does not implement at all, so a jsdom test would pass whether or not the
 * component set it.
 */

const summary = (page: Page, label: string) =>
  page.locator('summary').filter({ hasText: label }).first();

const isOpen = (page: Page, label: string): Promise<boolean> =>
  summary(page, label).evaluate((node) => (node.parentElement as HTMLDetailsElement).open);

/**
 * `goto` resolves on load, and Storybook renders the story after that. A `Tab` pressed in the gap
 * lands on a page that is still showing "preparing story" and moves focus nowhere, which is a
 * flake that would eventually get this file disabled rather than fixed.
 */
const openStory = async (page: Page, id: string): Promise<void> => {
  await page.goto(storyUrl(id));
  await expect(summary(page, 'General')).toBeVisible();
};

test.describe('keyboard', () => {
  test('Enter opens the focused section, and Enter again closes it', async ({ page }) => {
    await openStory(page, 'components-accordion--default');

    await page.keyboard.press('Tab');
    await expect(summary(page, 'General')).toBeFocused();

    await page.keyboard.press('Enter');
    expect(await isOpen(page, 'General')).toBe(true);

    await page.keyboard.press('Enter');
    expect(await isOpen(page, 'General')).toBe(false);
  });

  test('Space opens it too', async ({ page }) => {
    await openStory(page, 'components-accordion--default');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');

    expect(await isOpen(page, 'General')).toBe(true);
  });

  test('each summary is one tab stop, and an open section does not add another', async ({
    page,
  }) => {
    await openStory(page, 'components-accordion--open-from-the-start');

    await page.keyboard.press('Tab');
    await expect(summary(page, 'General')).toBeFocused();

    // The open section's text is not focusable, so the next stop is the next heading rather than
    // something inside the panel.
    await page.keyboard.press('Tab');
    await expect(summary(page, 'Members')).toBeFocused();
  });
});

test.describe('exclusive', () => {
  test('opening one section closes the other, without a line of state', async ({ page }) => {
    await openStory(page, 'components-accordion--exclusive');

    // The story's own `play` opens Members, which is also the state this test starts from. Waiting
    // for it is what keeps this from racing the story rather than testing it.
    await expect.poll(() => isOpen(page, 'Members')).toBe(true);

    await summary(page, 'General').click();

    expect(await isOpen(page, 'General')).toBe(true);

    // The browser closed the other one. Nothing in the component did.
    expect(await isOpen(page, 'Members')).toBe(false);
  });

  test('and each section is a group named by its summary', async ({ page }) => {
    await openStory(page, 'components-accordion--default');

    // The accessibility tree as the browser builds it, rather than a name computed in the test
    // process — which is the whole reason this assertion is here and not in the jsdom tests.
    await expect(page.locator('#storybook-root')).toMatchAriaSnapshot(`
      - group: General
      - group: Members
      - group: Billing
    `);
  });
});
