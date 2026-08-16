import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Badge } from '../Badge/Badge.js';

import { Accordion } from './Accordion.js';

const items = [
  {
    id: 'general',
    label: 'General',
    content: 'The workspace name, its slug, and the region its data lives in.',
  },
  {
    id: 'members',
    label: 'Members',
    content: 'Who can reach the workspace, and what each of them may change.',
  },
  {
    id: 'billing',
    label: 'Billing',
    content: 'The plan, the seats in use, and where the invoices are sent.',
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  args: { items },
  decorators: [
    (Story): ReactElement => (
      <div style={{ inlineSize: 420, maxInlineSize: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Sections open independently: three questions a reader may want answered at once. */
export const Default: Story = {};

/** `defaultOpen` decides the first render, and the browser owns the state from then on. */
export const OpenFromTheStart: Story = {
  args: { items: [{ ...items[0]!, defaultOpen: true }, items[1]!, items[2]!] },
};

/**
 * `exclusive` gives the sections one shared `name`, and the browser closes the open one when
 * another opens. No state, no effect, no click handler — see the component's doc comment.
 */
export const Exclusive: Story = {
  args: { exclusive: true, items: [{ ...items[0]!, defaultOpen: true }, items[1]!, items[2]!] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opened = (label: string): boolean =>
      canvas.getByText(label).closest('details')?.open ?? false;

    await expect(opened('General')).toBe(true);

    await userEvent.click(canvas.getByText('Members'));

    await waitFor(() => expect(opened('Members')).toBe(true));

    // The platform's doing, not ours. Where `name` is unimplemented this assertion is what would
    // fail, which is the point of asserting it in a real browser rather than in jsdom.
    await waitFor(() => expect(opened('General')).toBe(false));
  },
};

/** A label is a `ReactNode`, so a count can sit beside the word. */
export const RichLabels: Story = {
  args: {
    items: [
      {
        id: 'members',
        label: (
          <>
            Members <Badge tone="neutral">12</Badge>
          </>
        ),
        content: 'Who can reach the workspace.',
      },
      {
        id: 'invitations',
        label: (
          <>
            Invitations <Badge tone="warning">2 expiring</Badge>
          </>
        ),
        content: 'Sent, and not yet accepted.',
      },
    ],
  },
};

/** A long heading wraps and a long body reflows; neither is clipped and nothing overflows. */
export const LongContent: Story = {
  args: {
    items: [
      {
        id: 'long',
        label: 'What happens to the data in this workspace when the trial ends',
        content:
          'Everything stays readable for thirty days. After that the workspace is archived: ' +
          'the contents are kept but nothing can be changed, and any integration still pointing ' +
          'at it starts receiving a redirect instead of the data it asked for.',
        defaultOpen: true,
      },
      ...items,
    ],
  },
  decorators: [
    (Story: () => ReactElement): ReactElement => (
      <div style={{ inlineSize: 220 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Each summary is a real disclosure button: one tab stop per section, opened by Enter or Space,
 * and announced as expanded or collapsed. All of it is the platform's.
 *
 * There is deliberately no `play` here. This runner walks the tab order with a focusable-element
 * list that does not include `<summary>`, and it dispatches key events rather than pressing keys,
 * which is not what the browser turns into an activation — so an assertion here would report on
 * the runner rather than on the component. `tests/browser/accordion.spec.ts` presses Tab, Enter
 * and Space for real instead.
 */
export const KeyboardFlow: Story = {};
