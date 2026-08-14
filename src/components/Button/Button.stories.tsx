import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button.js';

/** A local mark, not an icon set. Icons are `ReactNode`, so consumers bring their own. */
const PlusMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 7h10M8 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--kreo-space-3)',
  flexWrap: 'wrap',
};

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Continue',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One filled action per view; outlined is secondary and ghost is tertiary or inline. */
export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="filled">
        Finish setup
      </Button>
      <Button {...args} variant="outlined">
        Back
      </Button>
      <Button {...args} variant="ghost">
        Skip for now
      </Button>
    </div>
  ),
};

/** 32, 40 and 48px control heights. `md` is the default; `lg` suits full-width mobile actions. */
export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

/** Destructive confirmations only. */
export const Danger: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} danger>
        Delete workspace
      </Button>
      <Button {...args} danger variant="outlined">
        Delete workspace
      </Button>
      <Button {...args} danger variant="ghost">
        Delete workspace
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} icon={<PlusMark />}>
        Add member
      </Button>
      <Button {...args} iconEnd={<ArrowMark />}>
        Continue
      </Button>
    </div>
  ),
};

/**
 * A loading button keeps its label and stays in the tab order, so keyboard users do not lose
 * focus mid-action. It reports `aria-busy` and refuses activation.
 */
export const Loading: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} loading>
        Save changes
      </Button>
      <Button {...args} loading icon={<PlusMark />}>
        Add member
      </Button>
      <Button {...args} loading variant="outlined">
        Save changes
      </Button>
    </div>
  ),
};

/** Natively disabled: removed from the tab order and inert. */
export const Disabled: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} disabled>
        Filled
      </Button>
      <Button {...args} disabled variant="outlined">
        Outlined
      </Button>
      <Button {...args} disabled variant="ghost">
        Ghost
      </Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true, size: 'lg', children: 'Open workspace' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Button {...args} />
    </div>
  ),
};

/** Labels stay on one line, so a narrow container scrolls rather than wrapping the control. */
export const LongLabel: Story = {
  args: { children: 'Continue to workspace configuration' },
  render: (args) => (
    <div style={{ maxWidth: 240, overflowX: 'auto' }}>
      <Button {...args} />
    </div>
  ),
};

/** Tab reaches the button, Enter and Space activate it — all native behaviour, unmodified. */
export const KeyboardActivation: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
