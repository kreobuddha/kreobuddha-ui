import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { nodeControl, textNodeControl } from '../../docs/storyControls.js';
import { Select } from './Select.js';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Timezone',
    children: (
      <>
        <option value="utc">UTC</option>
        <option value="cet">Central European Time</option>
        <option value="pst">Pacific Standard Time</option>
      </>
    ),
  },
  // `children` is the list of `<option>` elements, not something to type into a box.
  argTypes: {
    label: textNodeControl,
    hint: textNodeControl,
    error: textNodeControl,
    children: nodeControl,
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
  maxWidth: '320px',
} as const;

export const Default: Story = {
  args: { placeholder: 'Choose a timezone' },
};

/** Heights match `Button` and `TextField`. The type is `--kreo-type-body` in all three. */
export const Sizes: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <Select {...args} size="sm" label="Small" />
      <Select {...args} size="md" label="Medium" />
      <Select {...args} size="lg" label="Large" />
    </div>
  ),
};

/** Without a placeholder the first option is the value, which is right when it is a real default. */
export const NoPlaceholder: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('combobox');

    await expect(control).toHaveValue('utc');
  },
};

/** The placeholder is a disabled first option, so nothing is claimed until a choice is made. */
export const Placeholder: Story = {
  args: { placeholder: 'Choose a timezone' },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('combobox');

    await expect(control).toHaveValue('');

    await userEvent.selectOptions(control, 'cet');
    await expect(control).toHaveValue('cet');
  },
};

export const WithHint: Story = {
  args: { placeholder: 'Choose a timezone', hint: 'Used for every timestamp you see.' },
};

/** The error is what makes the field invalid; there is no separate flag to forget to set. */
export const Invalid: Story = {
  args: {
    placeholder: 'Choose a timezone',
    error: 'Pick a timezone before continuing.',
    hint: 'Used for every timestamp you see.',
  },
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('combobox');

    await expect(control).toHaveAttribute('aria-invalid', 'true');

    const described = (control.getAttribute('aria-describedby') ?? '').split(' ');
    const first = canvasElement.ownerDocument.getElementById(described[0] ?? '');

    await expect(first).toHaveTextContent('Pick a timezone before continuing.');
  },
};

export const Required: Story = {
  args: { required: true, placeholder: 'Choose a timezone' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'utc' },
};

export const OptionGroups: Story = {
  args: {
    placeholder: 'Choose a timezone',
    children: (
      <>
        <optgroup label="Europe">
          <option value="cet">Central European Time</option>
          <option value="msk">Moscow Standard Time</option>
        </optgroup>
        <optgroup label="Americas">
          <option value="pst">Pacific Standard Time</option>
          <option value="est">Eastern Standard Time</option>
        </optgroup>
      </>
    ),
  },
};

/** Focus is drawn inside the box, so gaining it must not move anything. */
export const Focus: Story = {
  args: { placeholder: 'Choose a timezone' },
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('combobox');
    const shell = control.parentElement as HTMLElement;
    const before = shell.getBoundingClientRect();

    control.focus();
    await expect(control).toHaveFocus();

    const after = shell.getBoundingClientRect();

    await expect(after.width).toBeCloseTo(before.width, 1);
    await expect(after.height).toBeCloseTo(before.height, 1);
  },
};

/** A long option label is clipped by the control rather than allowed to widen the field. */
export const LongOption: Story = {
  args: {
    fullWidth: true,
    placeholder: 'Choose a timezone',
    children: (
      <>
        <option value="long">
          Coordinated Universal Time, as observed at the Royal Observatory, Greenwich
        </option>
        <option value="utc">UTC</option>
      </>
    ),
  },
  render: (args): ReactElement => (
    <div style={{ width: '240px' }}>
      <Select {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('combobox');

    await expect(control.getBoundingClientRect().width).toBeLessThanOrEqual(240);
  },
};

/**
 * The chosen option must be readable in full. A `<select>` cannot be scrolled, so anything clipped
 * is simply lost — unlike a text input, where the reader can scroll to the rest.
 */
export const ChosenOptionIsNotClipped: Story = {
  args: { placeholder: 'Choose a timezone' },
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('combobox');

    await userEvent.selectOptions(control, 'cet');

    // No overflow, and the chevron still has its own room rather than sitting on the label.
    await expect(control.scrollWidth).toBeLessThanOrEqual(control.clientWidth);
    await expect(parseFloat(getComputedStyle(control).paddingInlineEnd)).toBeGreaterThan(
      parseFloat(getComputedStyle(control).paddingInlineStart)
    );
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true, placeholder: 'Choose a timezone' },
  render: (args): ReactElement => (
    <div style={{ width: '480px' }}>
      <Select {...args} />
    </div>
  ),
};
