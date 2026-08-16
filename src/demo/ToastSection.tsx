import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';
import { ToastProvider, useToast } from '../components/Toast/Toast.js';

/**
 * A toast only exists once something raises one, so the Kit carries the buttons that raise them
 * rather than a stack rendered flat. Extracted for the same reason as `DialogSection`: the Kit
 * story has no state of its own, and this section needs a provider around its own subtree.
 */
const Raisers = (): ReactElement => {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-2)', flexWrap: 'wrap' }}>
      <Button
        variant="outlined"
        onClick={(): string =>
          toast({
            tone: 'success',
            title: 'Workspace published',
            children: 'It is live at example.com.',
          })
        }
      >
        Raise a success
      </Button>

      <Button
        variant="outlined"
        onClick={(): string =>
          toast({
            tone: 'danger',
            title: 'Save failed',
            children: 'The workspace was changed by someone else.',
            duration: 0,
          })
        }
      >
        Raise a failure that stays
      </Button>
    </div>
  );
};

export const ToastSection = (): ReactElement => (
  <ToastProvider>
    <Raisers />
  </ToastProvider>
);
