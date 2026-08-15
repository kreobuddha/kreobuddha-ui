import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { Button } from '../Button/Button.js';
import { Badge } from './Badge.js';

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--kreo-space-3)',
  flexWrap: 'wrap',
};

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'admin',
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Six tones. The tone is a second signal, never the only one: every badge here would still say
 * what it means with the colour removed.
 */
export const Tones: Story = {
  render: (args) => (
    <div style={row}>
      <Badge {...args} tone="neutral">
        draft
      </Badge>
      <Badge {...args} tone="accent">
        beta
      </Badge>
      <Badge {...args} tone="success">
        passing
      </Badge>
      <Badge {...args} tone="warning">
        deprecated
      </Badge>
      <Badge {...args} tone="danger">
        3 failed
      </Badge>
      <Badge {...args} tone="info">
        read-only
      </Badge>
    </div>
  ),
};

/** The dot is decorative and hidden from assistive technology — it repeats what the label says. */
export const WithDot: Story = {
  render: (args) => (
    <div style={row}>
      <Badge {...args} dot tone="success">
        passing
      </Badge>
      <Badge {...args} dot tone="warning">
        deprecated
      </Badge>
      <Badge {...args} dot tone="danger">
        3 failed
      </Badge>
      <Badge {...args} dot tone="info">
        read-only
      </Badge>
    </div>
  ),
};

/**
 * A label wider than its container wraps rather than being clipped. Nothing here can offer hidden
 * text back — there is no tooltip and no interaction — so losing it is not an option.
 */
export const LongLabel: Story = {
  args: { children: 'awaiting security review', tone: 'warning', dot: true },
  render: (args) => (
    <div style={{ maxWidth: 120 }}>
      <Badge {...args} />
    </div>
  ),
};

/** In a line of text the badge keeps the line at its normal height. */
export const InText: Story = {
  render: (args) => (
    <p
      style={{
        font: 'var(--kreo-type-body)',
        color: 'var(--kreo-text-body)',
        maxWidth: 420,
        margin: 0,
      }}
    >
      The endpoint{' '}
      <Badge {...args} tone="warning" dot>
        deprecated
      </Badge>{' '}
      still answers, but it is scheduled for removal in the next major version.
    </p>
  ),
};

/** Beside a control, the badge sits on the same line without changing the control's height. */
export const WithButton: Story = {
  render: (args) => (
    <div style={row}>
      <Button variant="outlined">Invite member</Button>
      <Badge {...args} tone="accent">
        beta
      </Badge>
    </div>
  ),
};

/** On a card, the outline must stay visible: the surface is lighter than the page behind it. */
export const OnCard: Story = {
  render: (args) => (
    <div
      style={{
        background: 'var(--kreo-surface-card)',
        border: '1px solid var(--kreo-border-default)',
        borderRadius: 'var(--kreo-radius-lg)',
        padding: 'var(--kreo-space-6)',
        ...row,
      }}
    >
      <Badge {...args} tone="neutral">
        draft
      </Badge>
      <Badge {...args} tone="success" dot>
        passing
      </Badge>
      <Badge {...args} tone="danger" dot>
        3 failed
      </Badge>
    </div>
  ),
};
