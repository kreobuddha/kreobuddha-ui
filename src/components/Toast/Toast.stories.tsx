import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { nodeControl, optionalNumber, optionalText } from '../../docs/storyControls.js';
import { Button } from '../Button/Button.js';
import { Dialog } from '../Dialog/Dialog.js';

import { ToastProvider, useToast } from './Toast.js';
import type { ToastOptions } from './Toast.js';

/**
 * A brief message that confirms something happened, then leaves on its own.
 *
 * `ToastProvider` owns the toasts and draws them in the corner of the viewport. It is a provider
 * rather than a component you place, because a toast is not raised by the thing that draws it — it
 * is raised in the callback where a save succeeded or failed, several levels below any place a
 * floating stack could sensibly be rendered. `useToast` reaches it from there, and throws when no
 * provider is above it rather than returning a silent no-op.
 *
 * **A toast confirms; it does not report.** It disappears, so nothing the reader has to act on or
 * come back to belongs here — that is `Alert`, which stays beside the thing it is about. ADR-0011
 * records what this deliberately does not do: no second region, no placement prop, no `assertive`
 * politeness, no global hotkey.
 *
 * Every story below wraps its own subtree in a `ToastProvider`, which is what a consumer does once
 * around their application. The region draws itself; there is no second component to place.
 */
const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  args: { children: null },
  // Every one of these is a scalar the reader should be able to type. Without this they arrive as
  // `union`, because `exactOptionalPropertyTypes` makes each `T | undefined`, and Storybook offers
  // a JSON object editor for a number of milliseconds.
  argTypes: {
    children: nodeControl,
    limit: optionalNumber,
    duration: optionalNumber,
    label: optionalText,
    className: optionalText,
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ToastProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A button that raises one toast, so a story can say what it raises and nothing else. */
const Raise = ({ label, ...options }: ToastOptions & { label: string }): ReactElement => {
  const { toast } = useToast();

  return (
    <Button variant="outlined" onClick={(): string => toast(options)}>
      {label}
    </Button>
  );
};

const Row = ({ children }: { children: ReactElement | ReactElement[] }): ReactElement => (
  <div style={{ display: 'flex', gap: 'var(--kreo-space-2)', flexWrap: 'wrap' }}>{children}</div>
);

/** The shape a consumer writes: a provider around the tree, and `useToast()` where it failed. */
export const Default: Story = {
  render: (args): ReactElement => (
    <ToastProvider {...args}>
      <Raise label="Save" tone="danger" title="Save failed" duration={0} dismissLabel="Dismiss">
        The workspace was changed by someone else.
      </Raise>
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(document.querySelector('[popover]')).toHaveTextContent('Save failed')
    );
  },
};

/**
 * The four tones, on the tinted surfaces `Alert` uses. `limit` is raised to four here so all of
 * them are on screen at once; three is the default because a stack taller than that stops being
 * glanceable.
 */
export const Tones: Story = {
  args: { limit: 4, duration: 0 },
  render: (args): ReactElement => (
    <ToastProvider {...args}>
      <Row>
        <Raise label="Success" tone="success" title="Workspace published">
          It is live at example.com.
        </Raise>
        <Raise label="Info" tone="info" title="Import started">
          You can keep working.
        </Raise>
        <Raise label="Warning" tone="warning" title="Two seats left">
          Adding a third will change the bill.
        </Raise>
        <Raise label="Danger" tone="danger" title="Save failed">
          The workspace was changed by someone else.
        </Raise>
      </Row>
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Success', 'Info', 'Warning', 'Danger']) {
      await userEvent.click(canvas.getByRole('button', { name }));
    }

    // The newest is nearest the corner, so `danger` — raised last — ends up at the bottom.
    await waitFor(() => expect(document.querySelectorAll('[popover] li')).toHaveLength(4));
  },
};

/**
 * Three on screen and the rest waiting. A toast that arrives while the stack is full is not
 * dropped: it appears as room is made, because a dropped toast is a message the application
 * believed it had delivered.
 */
export const Queued: Story = {
  args: { duration: 0 },
  render: (args): ReactElement => (
    <ToastProvider {...args}>
      <Raise label="Raise one" tone="info" title="Import started">
        One repository of five.
      </Raise>
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const raise = within(canvasElement).getByRole('button', { name: 'Raise one' });

    for (let i = 0; i < 5; i += 1) await userEvent.click(raise);

    // Five raised, three on screen. Dismissing one lets the next in.
    await waitFor(() => expect(document.querySelectorAll('[popover] li')).toHaveLength(3));

    const [first] = document.querySelectorAll<HTMLButtonElement>('[popover] li button');
    first?.click();

    await waitFor(() => expect(document.querySelectorAll('[popover] li')).toHaveLength(3));
  },
};

/**
 * The timer stops while the pointer is over the stack, and starts again where it stopped. Without
 * it, a reader slower than five seconds is chasing a message that is being taken away from them.
 */
export const PausesUnderThePointer: Story = {
  render: (args): ReactElement => (
    <ToastProvider {...args}>
      <Raise label="Save" tone="success" title="Workspace saved">
        Hover the toast and it stays; move away and the five seconds resume.
      </Raise>
    </ToastProvider>
  ),
};

/** A long message wraps at a readable width rather than running the width of the window. */
export const LongMessage: Story = {
  args: { duration: 0 },
  render: (args): ReactElement => (
    <ToastProvider {...args}>
      <Raise label="Save" tone="warning" title="Import finished with warnings">
        Four of the eleven repositories could not be read, because the token they were imported with
        has since been revoked. Nothing was lost; re-run the import once a new token is in place and
        the four will be picked up where they were left.
      </Raise>
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(document.querySelectorAll('[popover] li')).toHaveLength(1));
  },
};

/**
 * The limitation ADR-0011 §3 records, made visible: a toast raised while a modal `Dialog` is open
 * is painted above it and announced, but its dismiss button cannot be clicked. Everything outside
 * a modal dialog is blocked by it — the platform being consistent, not a defect.
 */
export const OverAModalDialog: Story = {
  args: { duration: 0 },
  render: (args): ReactElement => {
    const Demo = (): ReactElement => {
      const [open, setOpen] = useState(false);

      return (
        <ToastProvider {...args}>
          <Button variant="outlined" onClick={(): void => setOpen(true)}>
            Delete workspace
          </Button>

          <Dialog
            open={open}
            onClose={(): void => setOpen(false)}
            title="Delete workspace"
            footer={
              <Raise label="Delete" tone="danger" title="Delete failed">
                The workspace is not empty.
              </Raise>
            }
          >
            This cannot be undone.
          </Dialog>
        </ToastProvider>
      );
    };

    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Delete workspace' }));

    await waitFor(() => expect(canvas.getByRole('button', { name: 'Delete' })).toBeVisible());

    await userEvent.click(canvas.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(document.querySelectorAll('[popover] li')).toHaveLength(1));
  },
};
