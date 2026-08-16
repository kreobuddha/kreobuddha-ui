import { useState } from 'react';
import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';
import { Dialog } from '../components/Dialog/Dialog.js';

/**
 * A dialog is only itself once something opens it, so the Kit carries a real trigger rather than a
 * panel rendered flat. Extracted because the Kit story itself has no state of its own.
 */
export const DialogSection = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outlined" onClick={(): void => setOpen(true)}>
        Open a dialog
      </Button>

      <Dialog
        open={open}
        onClose={(): void => setOpen(false)}
        title="Delete workspace"
        description="Everything in it goes with it, including the audit log."
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
      >
        This cannot be undone.
      </Dialog>
    </>
  );
};
