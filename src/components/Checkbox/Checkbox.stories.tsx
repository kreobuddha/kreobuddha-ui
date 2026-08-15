import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Checkbox } from './Checkbox.js';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Send me release notes' },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-3)',
  maxWidth: '360px',
} as const;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const WithHint: Story = {
  args: { hint: 'About one email a month, and never anything else.' },
};

/** A single required checkbox — accepting terms — is exactly the case that needs an error. */
export const Invalid: Story = {
  args: {
    label: 'I accept the terms',
    required: true,
    error: 'You have to accept them to continue.',
  },
  play: async ({ canvasElement }): Promise<void> => {
    const box = within(canvasElement).getByRole('checkbox');

    await expect(box).toHaveAttribute('aria-invalid', 'true');
  },
};

export const Disabled: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <Checkbox {...args} disabled label="Unavailable, off" />
      <Checkbox {...args} disabled defaultChecked label="Unavailable, on" />
    </div>
  ),
};

/** "Some of these" — the state a tick would misreport as "all of these". */
export const Indeterminate: Story = {
  render: (): ReactElement => {
    const [picked, setPicked] = useState([true, false]);
    const all = picked.every(Boolean);
    const some = picked.some(Boolean);

    return (
      <div style={column}>
        <Checkbox
          label="Select all"
          checked={all}
          indeterminate={!all && some}
          onChange={(e): void => setPicked(picked.map(() => e.target.checked))}
        />
        <div style={{ paddingInlineStart: 'var(--kreo-space-6)', ...column }}>
          <Checkbox
            label="Releases"
            checked={picked[0]}
            onChange={(e): void => setPicked([e.target.checked, picked[1] ?? false])}
          />
          <Checkbox
            label="Incidents"
            checked={picked[1]}
            onChange={(e): void => setPicked([picked[0] ?? false, e.target.checked])}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole<HTMLInputElement>('checkbox', { name: 'Select all' });

    await expect(all.indeterminate).toBe(true);

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Incidents' }));

    await expect(all.indeterminate).toBe(false);
    await expect(all.checked).toBe(true);
  },
};

/** Clicking the words has to work: the box alone is a 18px target. */
export const LabelIsPartOfTheTarget: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole<HTMLInputElement>('checkbox');

    await userEvent.click(canvas.getByText('Send me release notes'));

    await expect(box.checked).toBe(true);
  },
};

/** A long label wraps under itself rather than under the box. */
export const LongLabel: Story = {
  args: {
    label:
      'Send me release notes, incident reports and anything else that changes how this workspace behaves',
    hint: 'You can turn this off at any time.',
  },
  render: (args): ReactElement => (
    <div style={{ ...column, maxWidth: '280px' }}>
      <Checkbox {...args} />
    </div>
  ),
};
