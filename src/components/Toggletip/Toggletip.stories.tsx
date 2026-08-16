import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';

import { Toggletip } from './Toggletip.js';

/** A question mark, so the stories do not depend on an icon set the library does not ship. */
const Mark = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M4.2 4.2a1.8 1.8 0 113 1.35c-.6.45-1.2.9-1.2 1.65M6 9.4v.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const meta = {
  title: 'Components/Toggletip',
  component: Toggletip,
  args: {
    content: 'Seats are counted at the end of the month, so removing someone today still bills.',
    children: <Button variant="outlined">Why is this billed?</Button>,
  },
  // Room on every side, so a bubble wider than its trigger is centred on it rather than pinned
  // against the edge of the viewport — which is what a tighter frame would show instead.
  decorators: [
    (Story): ReactElement => (
      <div
        style={{
          padding: 'var(--kreo-space-16)',
          paddingInlineStart: 'var(--kreo-space-24)',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toggletip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The usual shape: a labelled icon button beside the thing it explains. */
export const Default: Story = {
  render: (args): ReactElement => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--kreo-space-2)',
        font: 'var(--kreo-type-body)',
        color: 'var(--kreo-text-body)',
      }}
    >
      Seats in use
      <Toggletip {...args}>
        <IconButton label="About seats" icon={<Mark />} variant="ghost" size="xs" />
      </Toggletip>
    </span>
  ),
};

/** Open, which is the state worth photographing. */
export const Open: Story = {
  render: (args): ReactElement => (
    <Toggletip {...args} placement="bottom">
      <Button variant="outlined">Why is this billed?</Button>
    </Toggletip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));

    await waitFor(() =>
      expect(within(canvasElement).getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    );
  },
};

/** Which side to prefer. The browser flips it when there is no room. */
export const Placements: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-4)' }}>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Toggletip {...args} key={placement} placement={placement} content={`Opens ${placement}`}>
          <Button variant="outlined">{placement}</Button>
        </Toggletip>
      ))}
    </div>
  ),
};

/**
 * Unlike a tooltip's, this content may be worth reaching: the pointer can enter the bubble, so a
 * link inside it can be followed and the text can be selected.
 */
export const WithALink: Story = {
  args: {
    content: (
      <>
        Seats are counted at the end of the month.{' '}
        <a href="#billing" style={{ color: 'var(--kreo-text-link)' }}>
          How billing works
        </a>
      </>
    ),
  },
  render: (args): ReactElement => (
    <Toggletip {...args} placement="bottom">
      <Button variant="outlined">Why is this billed?</Button>
    </Toggletip>
  ),
};

/** A long explanation wraps at a readable width rather than running the width of the screen. */
export const LongContent: Story = {
  args: {
    content:
      'Seats are counted at the end of the month, so removing someone today still bills for ' +
      'this one. The count that matters is the highest number of people who had access at any ' +
      'point in the period, not the number on the last day.',
  },
  render: (args): ReactElement => (
    <Toggletip {...args} placement="bottom">
      <Button variant="outlined">Why is this billed?</Button>
    </Toggletip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));

    // Layout, so it belongs here: `max-width` on the bubble is what keeps a paragraph readable,
    // and nothing else in the repository would notice it going missing.
    const bubble = (): Element | null => document.querySelector('[role="status"][data-open]');

    const width = (): number => bubble()?.getBoundingClientRect().width ?? 0;

    /**
     * The cap is read from the element rather than written here as a number. The library ships no
     * box-sizing reset, so `max-width` is a cap on the content box: the drawn bubble is that plus
     * its own padding and border, and a hard-coded 22rem would fail for a reason that is not a
     * defect.
     */
    const cap = (): number => {
      const node = bubble();
      if (!node) return 0;

      const style = getComputedStyle(node);
      const sides = ['maxWidth', 'paddingInlineStart', 'paddingInlineEnd'] as const;

      return (
        sides.reduce((total, side) => total + parseFloat(style[side]), 0) +
        2 * parseFloat(style.borderInlineStartWidth)
      );
    };

    await waitFor(() => expect(width()).toBeGreaterThan(0));
    await waitFor(() => expect(width()).toBeLessThanOrEqual(cap()));
  },
};

/**
 * Opened by Enter or Space like any button, closed by Escape — and Escape puts focus back where
 * the reader left it.
 */
export const KeyboardFlow: Story = {
  render: (args): ReactElement => (
    <Toggletip {...args} placement="bottom">
      <Button variant="outlined">Why is this billed?</Button>
    </Toggletip>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button');

    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await expect(trigger).toHaveFocus();
  },
};
