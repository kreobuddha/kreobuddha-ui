import { useState } from 'react';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../Button/Button.js';

import { Dialog } from './Dialog.js';

/**
 * jsdom implements `<dialog>` well enough for semantics, `open`, `close()` and the `cancel` event.
 * It has no top layer and no real focus trap, so what those give — an inert page behind, tab
 * containment — is the browser's job and is checked in the story run, not here.
 */

describe('Dialog', () => {
  it('is absent from the accessibility tree while closed', () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="Delete workspace">
        This cannot be undone.
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('takes its accessible name from the required title', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Delete workspace">
        This cannot be undone.
      </Dialog>
    );

    expect(screen.getByRole('dialog', { name: 'Delete workspace' })).toBeDefined();
  });

  it('renders the title as a heading, not only as a label', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Delete workspace">
        Body.
      </Dialog>
    );

    expect(screen.getByRole('heading', { name: 'Delete workspace' })).toBeDefined();
  });

  it('describes the dialog with the description when there is one', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Delete workspace" description="Everything goes.">
        Body.
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    const described = dialog.getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(described)?.textContent).toBe('Everything goes.');
  });

  it('sets no aria-describedby without a description', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Delete workspace">
        Body.
      </Dialog>
    );

    expect(screen.getByRole('dialog').getAttribute('aria-describedby')).toBeNull();
  });

  it('reports a close from the close button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog open onClose={onClose} title="Delete workspace">
        Body.
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders no close button when dismissible is off', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Delete workspace" dismissible={false}>
        Body.
      </Dialog>
    );

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('reports a close when the element cancels, which is what Escape does', () => {
    const onClose = vi.fn();

    render(
      <Dialog open onClose={onClose} title="Delete workspace">
        Body.
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    dialog.dispatchEvent(new Event('cancel', { bubbles: true, cancelable: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reports a close from the backdrop', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog open onClose={onClose} title="Delete workspace">
        Body.
      </Dialog>
    );

    // The backdrop is the dialog element's own box outside the panel, so a click on it targets the
    // dialog itself.
    await user.click(screen.getByRole('dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores a backdrop click when dismissOnBackdrop is off', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog open onClose={onClose} title="Delete workspace" dismissOnBackdrop={false}>
        Body.
      </Dialog>
    );

    await user.click(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('never treats a click inside the panel as a backdrop click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog open onClose={onClose} title="Delete workspace">
        <p>Some body text nobody meant to dismiss with.</p>
      </Dialog>
    );

    await user.click(screen.getByText('Some body text nobody meant to dismiss with.'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders footer actions and keeps them operable', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();

    render(
      <Dialog
        open
        onClose={vi.fn()}
        title="Delete workspace"
        footer={<Button onClick={confirm}>Delete</Button>}
      >
        Body.
      </Dialog>
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('opens and closes as the consumer moves the prop', async () => {
    const user = userEvent.setup();

    const Controlled = (): ReactElement => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Button onClick={(): void => setOpen(true)}>Open</Button>
          <Dialog open={open} onClose={(): void => setOpen(false)} title="Delete workspace">
            Body.
          </Dialog>
        </>
      );
    };

    render(<Controlled />);

    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('dialog')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('gives two dialogs on a page their own ids', () => {
    render(
      <>
        <Dialog open onClose={vi.fn()} title="First" description="one">
          Body.
        </Dialog>
        <Dialog open onClose={vi.fn()} title="Second" description="two">
          Body.
        </Dialog>
      </>
    );

    const [first, second] = screen.getAllByRole('dialog');

    expect(first?.getAttribute('aria-labelledby')).not.toBe(
      second?.getAttribute('aria-labelledby')
    );
  });
});
