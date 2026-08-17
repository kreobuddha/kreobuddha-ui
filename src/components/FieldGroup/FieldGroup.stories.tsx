import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, within } from 'storybook/test';

import { nodeControl, textNodeControl } from '../../docs/storyControls.js';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { Switch } from '../Switch/Switch.js';

import { FieldGroup } from './FieldGroup.js';

const meta = {
  title: 'Components/FieldGroup',
  component: FieldGroup,
  args: {
    legend: 'Notify me about',
    children: (
      <>
        <Checkbox label="Releases" defaultChecked />
        <Checkbox label="Incidents" />
        <Checkbox label="Scheduled maintenance" />
      </>
    ),
  },
  // `children` is the group's fields, not something to type into a box.
  argTypes: {
    hint: textNodeControl,
    error: textNodeControl,
    children: nodeControl,
  },
} satisfies Meta<typeof FieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: 'You can change any of this later.' },
};

/** The error belongs to the set, not to any one box — so it is described once, on the group. */
export const Invalid: Story = {
  args: { error: 'Choose at least one.' },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group');

    await expect(group).toHaveAttribute('aria-invalid', 'true');

    // Described once, on the group, rather than repeated on every option.
    for (const box of canvas.getAllByRole('checkbox')) {
      await expect(box).not.toHaveAttribute('aria-describedby');
    }
  },
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
};

/** One `disabled` on the fieldset switches off everything inside it, natively. */
export const DisabledGroup: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }): Promise<void> => {
    for (const box of within(canvasElement).getAllByRole('checkbox')) {
      await expect(box).toBeDisabled();
    }
  },
};

export const WithSwitches: Story = {
  args: {
    legend: 'Workspace security',
    hint: 'Applies to everyone with access.',
    children: (
      <>
        <Switch label="Require two-factor authentication" defaultChecked />
        <Switch label="Allow personal access tokens" />
      </>
    ),
  },
};

/** A settings form, composed from the shipped pieces with no wrapper of its own. */
export const InASettingsForm: Story = {
  render: (): ReactElement => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-6)' }}>
      <FieldGroup legend="Notify me about" hint="You can change any of this later.">
        <Checkbox label="Releases" defaultChecked />
        <Checkbox label="Incidents" />
      </FieldGroup>

      <FieldGroup legend="Workspace security">
        <Switch label="Require two-factor authentication" defaultChecked />
      </FieldGroup>
    </form>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    await expect(within(canvasElement).getAllByRole('group')).toHaveLength(2);
  },
};
