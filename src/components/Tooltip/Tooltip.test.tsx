import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Button } from '../Button/Button.js';

import { Tooltip } from './Tooltip.js';

// Visibility is carried by `data-open`, not by `:popover-open`: the popover API only adds the top
// layer, and jsdom does not implement it. What is asserted here is what a consumer's own jsdom
// tests can assert too.
const isOpen = (): boolean =>
  screen.getByRole('tooltip', { hidden: true }).hasAttribute('data-open');

describe('Tooltip', () => {
  it('describes the trigger, and does so on the element that takes focus', () => {
    render(
      <Tooltip content="Copies the link to your clipboard">
        <Button>Copy link</Button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button');
    const tip = screen.getByRole('tooltip', { hidden: true });

    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);
    expect(tip.textContent).toBe('Copies the link to your clipboard');
  });

  it('starts closed', () => {
    render(
      <Tooltip content="Hidden until asked for">
        <Button>Copy link</Button>
      </Tooltip>
    );

    expect(isOpen()).toBe(false);
  });

  it('opens immediately on focus, because there is no such thing as a passing focus', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Copies the link">
        <Button>Copy link</Button>
      </Tooltip>
    );

    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('button'));
    expect(isOpen()).toBe(true);
  });

  it('closes on blur', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Tooltip content="Copies the link">
          <Button>Copy link</Button>
        </Tooltip>
        <Button>Elsewhere</Button>
      </>
    );

    await user.tab();
    expect(isOpen()).toBe(true);

    await user.tab();
    expect(isOpen()).toBe(false);
  });

  it('waits before opening on hover, so a passing pointer sets off nothing', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Copies the link">
        <Button>Copy link</Button>
      </Tooltip>
    );

    await user.hover(screen.getByRole('button'));

    expect(isOpen()).toBe(false);
    await waitFor(() => expect(isOpen()).toBe(true), { timeout: 2000 });
  });

  it('closes on pointer leave without waiting', async () => {
    const user = userEvent.setup();
    const trigger = (): HTMLElement => screen.getByRole('button');

    render(
      <Tooltip content="Copies the link">
        <Button>Copy link</Button>
      </Tooltip>
    );

    await user.hover(trigger());
    await waitFor(() => expect(isOpen()).toBe(true), { timeout: 2000 });

    await user.unhover(trigger());
    expect(isOpen()).toBe(false);
  });

  it('closes on Escape and leaves focus where it was', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Copies the link">
        <Button>Copy link</Button>
      </Tooltip>
    );

    await user.tab();
    expect(isOpen()).toBe(true);

    await user.keyboard('{Escape}');

    expect(isOpen()).toBe(false);
    // The reader is still on the control; dismissing the description must not move them off it.
    expect(document.activeElement).toBe(screen.getByRole('button'));
  });

  it('keeps the trigger usable', async () => {
    const user = userEvent.setup();
    let clicked = 0;

    render(
      <Tooltip content="Copies the link">
        <Button onClick={(): void => void (clicked += 1)}>Copy link</Button>
      </Tooltip>
    );

    await user.click(screen.getByRole('button'));

    expect(clicked).toBe(1);
  });

  it('preserves a style the trigger already had', () => {
    render(
      <Tooltip content="Copies the link">
        <Button style={{ marginTop: '4px' }}>Copy link</Button>
      </Tooltip>
    );

    expect(screen.getByRole('button').style.marginTop).toBe('4px');
  });

  it('gives two tooltips on a page their own ids', () => {
    render(
      <>
        <Tooltip content="One">
          <Button>First</Button>
        </Tooltip>
        <Tooltip content="Two">
          <Button>Second</Button>
        </Tooltip>
      </>
    );

    const [first, second] = screen.getAllByRole('tooltip', { hidden: true });

    expect(first?.id).not.toBe(second?.id);
  });
});
