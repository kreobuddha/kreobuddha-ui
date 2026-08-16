import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';

import { Tooltip } from './Tooltip.js';

const Mark = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M5 8h6M8 5v6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    content: 'Copies the link to your clipboard',
    children: <Button variant="outlined">Copy link</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

const room = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '160px',
} as const;

export const Default: Story = {
  render: (args): ReactElement => (
    <div style={room}>
      <Tooltip {...args} />
    </div>
  ),
};

/** Focus opens it at once. A keyboard user has already committed; there is no passing focus. */
export const OpensOnFocus: Story = {
  render: (args): ReactElement => (
    <div style={room}>
      <Tooltip {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const tip = canvas.getByRole('tooltip', { hidden: true });

    await expect(tip).not.toHaveAttribute('data-open');

    canvas.getByRole('button').focus();

    // `waitFor` because opening is a React state update, not because the delay applies: focus
    // opens immediately, and the story above proves the delay is only on the hover path.
    await waitFor(() => expect(tip).toHaveAttribute('data-open'));

    // The popover API is what puts it in the top layer, above every stacking context on the page.
    await expect(tip.matches(':popover-open')).toBe(true);
  },
};

/** Hovering waits, so a pointer crossing a toolbar sets off nothing. */
export const WaitsOnHover: Story = {
  render: (args): ReactElement => (
    <div style={room}>
      <Tooltip {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const tip = canvas.getByRole('tooltip', { hidden: true });

    await userEvent.hover(canvas.getByRole('button'));
    await expect(tip).not.toHaveAttribute('data-open');

    await waitFor(() => expect(tip).toHaveAttribute('data-open'), { timeout: 2000 });
  },
};

/** Escape dismisses it without moving the reader off the control they were on. */
export const EscapeCloses: Story = {
  render: (args): ReactElement => (
    <div style={room}>
      <Tooltip {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');
    const tip = canvas.getByRole('tooltip', { hidden: true });

    trigger.focus();
    await waitFor(() => expect(tip).toHaveAttribute('data-open'));

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(tip).not.toHaveAttribute('data-open'));
    await expect(trigger).toHaveFocus();
  },
};

/** Placed by CSS anchor positioning — no measuring, no JavaScript, no scroll listener. */
export const Placements: Story = {
  render: (args): ReactElement => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--kreo-space-8)',
        padding: 'var(--kreo-space-8)',
        justifyItems: 'center',
      }}
    >
      <Tooltip {...args} placement="top" content="Above">
        <Button variant="outlined">Top</Button>
      </Tooltip>
      <Tooltip {...args} placement="bottom" content="Below">
        <Button variant="outlined">Bottom</Button>
      </Tooltip>
      <Tooltip {...args} placement="left" content="Before">
        <Button variant="outlined">Left</Button>
      </Tooltip>
      <Tooltip {...args} placement="right" content="After">
        <Button variant="outlined">Right</Button>
      </Tooltip>
    </div>
  ),
};

/** The pairing it is actually for: naming a mark that already has an accessible name. */
export const OnAnIconButton: Story = {
  args: { content: 'Add a member', children: <IconButton label="Add a member" icon={<Mark />} /> },
  render: (args): ReactElement => (
    <div style={room}>
      <Tooltip {...args} />
    </div>
  ),
};

/** The tooltip sits above the page's own stacking contexts, which is what the top layer is for. */
export const AboveAStackingContext: Story = {
  render: (args): ReactElement => (
    <div style={{ ...room, position: 'relative', isolation: 'isolate' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          background: 'var(--kreo-surface-sunken)',
          opacity: 0.6,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Tooltip {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    const tip = canvas.getByRole('tooltip', { hidden: true });

    canvas.getByRole('button').focus();
    await waitFor(() => expect(tip).toHaveAttribute('data-open'));

    // Nothing on the page can cover it: the top layer sits above every stacking context, so the
    // z-index 5 overlay behind this trigger does not matter.
    await expect(tip.matches(':popover-open')).toBe(true);
  },
};

/**
 * The tooltip sizes to its own text, not to the trigger. `position-area` puts it in a cell as wide
 * as the anchor, and a box with no intrinsic width fills that cell — a tooltip on a narrow button
 * would come out one word per line.
 */
export const LongContent: Story = {
  args: {
    content:
      'Copies a link that anyone with access to this workspace can open. It expires after thirty days.',
  },
  render: (args): ReactElement => (
    <div style={room}>
      <Tooltip {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');
    const tip = canvas.getByRole('tooltip', { hidden: true });

    trigger.focus();
    await waitFor(() => expect(tip).toHaveAttribute('data-open'));

    await expect(tip.getBoundingClientRect().width).toBeGreaterThan(
      trigger.getBoundingClientRect().width * 2
    );
  },
};
