import { useEffect, useId, useRef } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import { IconButton } from '../IconButton/IconButton.js';

import styles from './Dialog.module.css';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps extends Omit<ComponentPropsWithRef<'dialog'>, 'title' | 'onClose'> {
  /** Whether the dialog is showing. The consumer owns this. */
  open: boolean;
  /** Called whenever the dialog asks to close — Escape, the close button, or the backdrop. */
  onClose: () => void;
  /**
   * The heading. Required: it becomes the dialog's accessible name through `aria-labelledby`, and
   * a dialog without a name leaves a screen reader announcing nothing but "dialog".
   */
  title: string;
  /** How wide the panel may grow. */
  size?: DialogSize;
  /** Supporting text under the heading, announced with the dialog through `aria-describedby`. */
  description?: ReactNode;
  /** Actions along the bottom of the panel. */
  footer?: ReactNode;
  /** Renders a close button in the heading row. */
  dismissible?: boolean;
  /** The close button's accessible name. */
  dismissLabel?: string;
  /**
   * Whether a click on the backdrop closes the dialog.
   *
   * On by default, because that is what people expect from a modal on the web. Turn it off for a
   * dialog holding anything typed: a stray click beside a half-filled form otherwise throws the
   * form away, and nothing warns first.
   */
  dismissOnBackdrop?: boolean;
}

const CloseMark = (): ReactElement => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const Dialog = ({
  open,
  onClose,
  title,
  size = 'md',
  description,
  footer,
  dismissible = true,
  dismissLabel = 'Close',
  dismissOnBackdrop = true,
  className,
  children,
  ...rest
}: DialogProps): ReactElement => {
  const base = useId();
  const titleId = `${base}-title`;
  const descriptionId = `${base}-description`;

  const dialog = useRef<HTMLDialogElement>(null);

  // `showModal()` is what gives the focus trap, the inert page behind, Escape, and the top layer.
  // None of that is reimplemented here — that is the whole point of ADR-0010. The `open` prop is
  // synchronised with it rather than rendered as the element's own `open` attribute, which would
  // show a non-modal dialog with none of those behaviours.
  //
  // Where the element's methods are missing — jsdom has neither, as of version 30 — the `open`
  // attribute is set directly instead. That is a consumer's own test environment, and a dialog
  // that silently never opens there would be invisible to every test they write about it. What is
  // lost in that fallback is exactly what jsdom has no notion of anyway: the top layer, the
  // backdrop, and the focus trap.
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;

    const native = typeof node.showModal === 'function' && typeof node.close === 'function';

    if (open) {
      if (!native) node.setAttribute('open', '');
      else if (!node.open) node.showModal();
      return;
    }

    if (!native) node.removeAttribute('open');
    else if (node.open) node.close();
  }, [open]);

  return (
    <dialog
      {...rest}
      ref={dialog}
      className={cx(styles.dialog, styles[size], className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // The element closes itself on Escape whatever we do, so the consumer has to hear about it
      // or their `open` would disagree with what is on screen.
      onCancel={(event): void => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event): void => {
        if (!dismissOnBackdrop) return;

        // The backdrop is the dialog element's own box outside the panel, so a click on it targets
        // the dialog itself. Anything inside the panel targets a descendant.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.heading}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>

          {dismissible ? (
            <IconButton
              variant="ghost"
              size="xs"
              label={dismissLabel}
              icon={<CloseMark />}
              onClick={onClose}
              className={styles.dismiss}
            />
          ) : null}
        </div>

        {description ? (
          <p className={styles.description} id={descriptionId}>
            {description}
          </p>
        ) : null}

        <div className={styles.body}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </dialog>
  );
};
