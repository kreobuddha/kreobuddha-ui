import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';

import { Toggletip } from './Toggletip.js';

// Visibility is carried by `data-open`, not by `:popover-open`: the popover API only adds the top
// layer, and jsdom does not implement it. What is asserted here is what a consumer's own jsdom
// tests can assert too.
const bubble = (): HTMLElement => screen.getByRole('status', { hidden: true });
const isOpen = (): boolean => bubble().hasAttribute('data-open');

const Mark = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" />
);

describe('Toggletip', () => {
  it('starts closed, with the trigger reporting it', () => {
    render(
      <Toggletip content="Seats are counted at the end of the month.">
        <Button>Why?</Button>
      </Toggletip>
    );

    expect(isOpen()).toBe(false);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
  });

  it('holds nothing until it is opened, so the live region has something to announce', async () => {
    const user = userEvent.setup();

    render(
      <Toggletip content="Seats are counted at the end of the month.">
        <Button>Why?</Button>
      </Toggletip>
    );

    // The whole reason the content is mounted on open rather than merely revealed: a live region
    // announces what changes inside it, and text that was there all along changes nothing.
    expect(bubble().textContent).toBe('');

    await user.click(screen.getByRole('button'));

    expect(bubble().textContent).toBe('Seats are counted at the end of the month.');
  });

  it('opens on click and closes on a second click', async () => {
    const user = userEvent.setup();

    render(
      <Toggletip content="Counted at the end of the month.">
        <Button>Why?</Button>
      </Toggletip>
    );

    const trigger = screen.getByRole('button');

    await user.click(trigger);
    expect(isOpen()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    await user.click(trigger);
    expect(isOpen()).toBe(false);
  });

  it('opens from the keyboard, because the trigger is a real button', async () => {
    const user = userEvent.setup();

    render(
      <Toggletip content="Counted at the end of the month.">
        <Button>Why?</Button>
      </Toggletip>
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(isOpen()).toBe(true);
  });

  it('closes on Escape and puts focus back on the trigger', async () => {
    const user = userEvent.setup();

    render(
      <Toggletip content="Counted at the end of the month.">
        <Button>Why?</Button>
      </Toggletip>
    );

    const trigger = screen.getByRole('button');

    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when a pointer goes down outside it', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Toggletip content="Counted at the end of the month.">
          <Button>Why?</Button>
        </Toggletip>
        <Button>Elsewhere</Button>
      </>
    );

    await user.click(screen.getByRole('button', { name: 'Why?' }));
    expect(isOpen()).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(isOpen()).toBe(false);
  });

  it('stays open when the pointer goes down inside the bubble', async () => {
    const user = userEvent.setup();

    render(
      <Toggletip content="Counted at the end of the month.">
        <Button>Why?</Button>
      </Toggletip>
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Counted at the end of the month.'));

    // Text worth reading is text worth selecting, and a bubble that closes under the pointer
    // cannot be read to the end.
    expect(isOpen()).toBe(true);
  });

  it('keeps the trigger working: its own handler and its own ref both survive', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    let clicks = 0;

    render(
      <Toggletip content="Counted at the end of the month.">
        <Button ref={ref} onClick={(): void => void (clicks += 1)}>
          Why?
        </Button>
      </Toggletip>
    );

    expect(ref.current).toBe(screen.getByRole('button'));

    await user.click(screen.getByRole('button'));

    expect(clicks).toBe(1);
    expect(isOpen()).toBe(true);
  });

  it('works with an icon-only trigger, which is what it usually is', async () => {
    const user = userEvent.setup();

    render(
      <Toggletip content="Counted at the end of the month.">
        <IconButton label="About seats" icon={<Mark />} variant="ghost" />
      </Toggletip>
    );

    await user.click(screen.getByRole('button', { name: 'About seats' }));

    expect(isOpen()).toBe(true);
  });
});
