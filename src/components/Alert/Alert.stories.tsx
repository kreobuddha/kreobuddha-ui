import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { nodeControl, textNodeControl } from '../../docs/storyControls.js';
import { Alert } from './Alert.js';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: { children: 'The invitation expires today.' },
  argTypes: {
    children: textNodeControl,
    icon: nodeControl,
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Each tone brings its own mark, so the message never depends on colour alone. */
export const Tones: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-3)' }}>
      <Alert {...args} tone="success">
        Changes saved.
      </Alert>
      <Alert {...args} tone="warning">
        The invitation expires today.
      </Alert>
      <Alert {...args} tone="danger">
        Could not reach the server.
      </Alert>
      <Alert {...args} tone="info">
        This workspace is read-only.
      </Alert>
    </div>
  ),
};

export const WithTitle: Story = {
  args: {
    tone: 'danger',
    title: 'Save failed',
    children: 'The workspace was changed by someone else. Reload and try again.',
  },
};

/** A supplied icon replaces the tone mark entirely. */
export const OwnIcon: Story = {
  args: {
    tone: 'info',
    icon: <span aria-hidden="true">☾</span>,
    children: 'Scheduled maintenance starts at 02:00 UTC.',
  },
};

export const Dismissible: Story = {
  args: { tone: 'success', children: 'Changes saved.', onDismiss: fn() },
  play: async ({ args, canvasElement }) => {
    const close = within(canvasElement).getByRole('button', { name: 'Dismiss' });

    await userEvent.click(close);
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};

/** A message that appears in response to something announces itself; a banner does not. */
export const Live: Story = {
  args: { live: true, tone: 'danger', children: 'Could not save.' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toBeInTheDocument();
  },
};

export const LongMessage: Story = {
  args: {
    tone: 'warning',
    title: 'Seats exceeded',
    children:
      'This workspace has more members than its plan allows. Nobody has been removed, but new invitations will fail until a seat is freed or the plan is changed.',
  },
  render: (args): ReactElement => (
    <div style={{ maxWidth: 420 }}>
      <Alert {...args} />
    </div>
  ),
};
