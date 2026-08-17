import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { nodeControl, textNodeControl } from '../../docs/storyControls.js';
import { Button } from '../Button/Button.js';
import { TextField } from '../TextField/TextField.js';

import { Dialog } from './Dialog.js';
import type { DialogProps } from './Dialog.js';

/**
 * `open` starts `false` for every story, and no story renders a dialog that is already showing.
 * `showModal()` puts the panel in the top layer, above the whole page — on the docs page, where
 * every story renders at once, a dialog opened on load covers the documentation it is meant to
 * illustrate, and one whose `onClose` goes nowhere cannot be dismissed at all.
 */
const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    open: false,
    onClose: (): void => undefined,
    title: 'Delete workspace',
    description: 'Everything in it goes with it, including the audit log.',
    children: 'This cannot be undone.',
  },
  // `footer` is a row of buttons; `description` and `children` are text in practice.
  argTypes: {
    description: textNodeControl,
    children: textNodeControl,
    footer: nodeControl,
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A dialog is only honest when a real trigger opens it, so focus has somewhere to return to.
 * Every story below is built from this, which owns the open state the component deliberately
 * does not.
 */
const Demo = ({
  trigger = 'Delete workspace',
  title = 'Delete workspace',
  ...args
}: Partial<DialogProps> & { trigger?: string }): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={(): void => setOpen(true)}>{trigger}</Button>
      <Dialog
        footer={
          <>
            <Button variant="outlined" onClick={(): void => setOpen(false)}>
              Keep it
            </Button>
            <Button danger onClick={(): void => setOpen(false)}>
              Delete
            </Button>
          </>
        }
        {...args}
        title={title}
        open={open}
        onClose={(): void => setOpen(false)}
      />
    </>
  );
};

/**
 * Opened by its `play` function rather than by an `open` arg, which is what keeps it out of the
 * way on the docs page: `play` runs in the canvas and for the visual baseline, and not there.
 */
export const Default: Story = {
  render: (args): ReactElement => <Demo {...args} />,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Delete workspace' }));
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeInTheDocument());
  },
};

/** Each size opens from its own trigger, because two modals cannot share a screen. */
export const Sizes: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)' }}>
      <Demo {...args} size="sm" title="Small" trigger="Small" />
      <Demo {...args} size="md" title="Medium" trigger="Medium" />
      <Demo {...args} size="lg" title="Large" trigger="Large" />
    </div>
  ),
};

export const WithoutDismissButton: Story = {
  args: { dismissible: false },
  render: (args): ReactElement => <Demo {...args} />,
};

/** Opening from a real trigger, and — the part nothing else checks — putting focus back on it. */
export const FocusReturnsToTheTrigger: Story = {
  render: (args): ReactElement => <Demo {...args} />,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete workspace' });

    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeInTheDocument());

    // The browser moves focus into the dialog; nothing here does it by hand.
    await expect(canvasElement.ownerDocument.activeElement).not.toBe(trigger);

    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());

    await expect(trigger).toHaveFocus();
  },
};

/*
 * Two behaviours are deliberately not asserted here, because this runner cannot exercise them.
 *
 * `userEvent` simulates events in JavaScript: it computes the tab order from the DOM and dispatches
 * synthetic keys. Neither the modal focus trap nor Escape is implemented that way — both belong to
 * the browser, which only reacts to real input. A simulated Tab walks straight out of a modal
 * dialog, and a simulated Escape produces a `keydown` and no `cancel`. Asserting against that would
 * be testing the simulation and calling it the platform.
 *
 * What covers them instead: `Dialog.test.tsx` dispatches a real `cancel` event and proves the
 * wiring from it to `onClose`, and `tests/browser/overlays.spec.ts` drives this very story with
 * real key presses in a real engine — Escape closes it and returns focus, six tabs never reach the
 * page behind, and a script cannot focus the trigger while the modal is open.
 */

/** A click beside the panel closes it. This is the default, and the thing the next story turns off. */
export const BackdropCloses: Story = {
  render: (args): ReactElement => <Demo {...args} />,
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Delete workspace' }));
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeInTheDocument());

    const dialog = canvas.getByRole('dialog');
    const box = dialog.getBoundingClientRect();

    // Near the top edge of the dialog element, which is backdrop rather than panel.
    await userEvent.pointer({
      target: dialog,
      coords: { clientX: box.left + box.width / 2, clientY: box.top + 4 },
      keys: '[MouseLeft]',
    });

    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

/**
 * A dialog holding anything typed should turn the backdrop off. A stray click beside a half-filled
 * form otherwise throws it away, and nothing warns first.
 */
export const FormKeepsItsBackdrop: Story = {
  render: (): ReactElement => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');

    return (
      <>
        <Button onClick={(): void => setOpen(true)}>Rename workspace</Button>
        <Dialog
          open={open}
          onClose={(): void => setOpen(false)}
          title="Rename workspace"
          dismissOnBackdrop={false}
          footer={
            <>
              <Button variant="outlined" onClick={(): void => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={(): void => setOpen(false)}>Rename</Button>
            </>
          }
        >
          <TextField
            fullWidth
            label="New name"
            value={name}
            onChange={(event): void => setName(event.target.value)}
          />
        </Dialog>
      </>
    );
  },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Rename workspace' }));
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeInTheDocument());

    await userEvent.type(canvas.getByRole('textbox'), 'Acme');

    const dialog = canvas.getByRole('dialog');
    const box = dialog.getBoundingClientRect();

    await userEvent.pointer({
      target: dialog,
      coords: { clientX: box.left + box.width / 2, clientY: box.top + 4 },
      keys: '[MouseLeft]',
    });

    // Still there, and so is what was typed.
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    await expect(canvas.getByRole('textbox')).toHaveValue('Acme');
  },
};

/** Only the body scrolls, so the heading and the actions never scroll away from the reader. */
export const LongContent: Story = {
  render: (args): ReactElement => <Demo {...args} />,
  args: {
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-3)' }}>
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index} style={{ margin: 0 }}>
            Paragraph {index + 1} of a body long enough that the panel has to scroll.
          </p>
        ))}
      </div>
    ),
    footer: <Button danger>Delete</Button>,
  },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Delete workspace' }));
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeInTheDocument());
  },
};
