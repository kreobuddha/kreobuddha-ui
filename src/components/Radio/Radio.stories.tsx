import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { textNodeControl } from '../../docs/storyControls.js';
import { FieldGroup } from '../FieldGroup/FieldGroup.js';
import { Radio } from './Radio.js';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  args: { label: 'Fibonacci', name: 'deck' },
  // `hint` and `error` are typed `ReactNode` so a field can carry a link, but they are a line of
  // text in almost every use. Inferred, they would arrive as JSON editors.
  argTypes: {
    label: textNodeControl,
    hint: textNodeControl,
    error: textNodeControl,
  },
} satisfies Meta<typeof Radio>;

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
  args: { hint: '1 · 2 · 3 · 5 · 8 · 13 · 21' },
};

/**
 * How a radio is meant to be used: `FieldGroup` asks the question and owns the layout, the
 * options answer it, and the shared `name` is what makes them exclusive.
 */
export const InAGroup: Story = {
  render: (): ReactElement => (
    <FieldGroup legend="Card deck" hint="Everyone in the room votes with this deck.">
      <Radio name="deck" value="fibonacci" label="Fibonacci" hint="1 · 2 · 3 · 5 · 8 · 13 · 21" />
      <Radio
        name="deck"
        value="modified"
        label="Modified Fibonacci"
        hint="0.5 · 1 · 2 · 3 · 5 · 8 · 13 · 20"
        defaultChecked
      />
      <Radio name="deck" value="powers" label="Powers of two" hint="1 · 2 · 4 · 8 · 16 · 32" />
    </FieldGroup>
  ),
};

/** Arrows move and select; the group is one tab stop, not three. */
export const KeyboardMovesThroughTheGroup: Story = {
  render: (): ReactElement => (
    <FieldGroup legend="Card deck">
      <Radio name="keys" value="fibonacci" label="Fibonacci" defaultChecked />
      <Radio name="keys" value="modified" label="Modified Fibonacci" />
      <Radio name="keys" value="powers" label="Powers of two" />
    </FieldGroup>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole<HTMLInputElement>('radio', { name: 'Fibonacci' });
    const second = canvas.getByRole<HTMLInputElement>('radio', { name: 'Modified Fibonacci' });

    await userEvent.tab();
    await expect(first).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');

    await expect(second).toHaveFocus();
    await expect(second.checked).toBe(true);
    await expect(first.checked).toBe(false);
  },
};

/** The fault belongs to the question, so the error sits on the group rather than on an option. */
export const InvalidGroup: Story = {
  render: (): ReactElement => (
    <FieldGroup legend="Card deck" error="Choose a deck before starting the round.">
      <Radio name="invalid-deck" value="fibonacci" label="Fibonacci" />
      <Radio name="invalid-deck" value="powers" label="Powers of two" />
    </FieldGroup>
  ),
};

export const Disabled: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <Radio {...args} disabled label="Unavailable, not chosen" />
      <Radio {...args} name="disabled-chosen" disabled defaultChecked label="Unavailable, chosen" />
    </div>
  ),
};

/** Clicking the words has to work: the control alone is an 18px target. */
export const LabelIsPartOfTheTarget: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole<HTMLInputElement>('radio');

    await userEvent.click(canvas.getByText('Fibonacci'));

    await expect(option.checked).toBe(true);
  },
};

/** A long label wraps under itself rather than under the control. */
export const LongLabel: Story = {
  args: {
    label: 'Modified Fibonacci, with a half-day card for work too small to argue about',
    hint: 'Best for teams that estimate in half-days.',
  },
  render: (args): ReactElement => (
    <div style={{ ...column, maxWidth: '280px' }}>
      <Radio {...args} />
    </div>
  ),
};

/** Controlled: the chosen value lives in the consumer's state, as it would in a real form. */
export const Controlled: Story = {
  render: (): ReactElement => {
    const [deck, setDeck] = useState('modified');

    return (
      <div style={column}>
        <FieldGroup legend="Card deck">
          {['fibonacci', 'modified', 'powers'].map((value) => (
            <Radio
              key={value}
              name="controlled-deck"
              value={value}
              label={value}
              checked={deck === value}
              onChange={(e): void => setDeck(e.target.value)}
            />
          ))}
        </FieldGroup>
        <p style={{ font: 'var(--kreo-type-body-sm)', color: 'var(--kreo-text-muted)' }}>
          Chosen: {deck}
        </p>
      </div>
    );
  },
};
