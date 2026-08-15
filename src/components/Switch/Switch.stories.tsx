import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Switch } from './Switch.js';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Dark theme' },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-3)',
  maxWidth: '360px',
} as const;

export const Default: Story = {};

export const On: Story = {
  args: { defaultChecked: true },
};

export const WithHint: Story = {
  args: { hint: 'Follows the system setting until you change it here.' },
};

export const Invalid: Story = {
  args: { label: 'Two-factor authentication', error: 'Turn this on before inviting anyone.' },
};

export const Disabled: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <Switch {...args} disabled label="Unavailable, off" />
      <Switch {...args} disabled defaultChecked label="Unavailable, on" />
    </div>
  ),
};

/** The role is what makes it a switch: "on" and "off" rather than "checked". */
export const AnnouncesAsASwitch: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('switch')).toBeInTheDocument();
    await expect(canvas.queryByRole('checkbox')).toBeNull();
  },
};

/** The thumb's position is the state, so it has to move — and it does, from either input. */
export const ThumbMoves: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole<HTMLInputElement>('switch');

    await userEvent.click(canvas.getByText('Dark theme'));
    await expect(control.checked).toBe(true);

    control.focus();
    await userEvent.keyboard(' ');
    await expect(control.checked).toBe(false);
  },
};

export const LongLabel: Story = {
  args: {
    label: 'Require two-factor authentication for everyone in this workspace',
    hint: 'Members without it will be asked to set it up at their next sign-in.',
  },
  render: (args): ReactElement => (
    <div style={{ ...column, maxWidth: '280px' }}>
      <Switch {...args} />
    </div>
  ),
};
