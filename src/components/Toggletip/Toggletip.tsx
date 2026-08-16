import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';

import { cx } from '../../internal/cx.js';
import { anchorName } from '../overlay/anchorName.js';

import styles from './Toggletip.module.css';

export type ToggletipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface ToggletipProps {
  /**
   * What the toggletip says. Unlike a tooltip's, this may carry something the reader needs: it is
   * opened deliberately, and it is reachable by keyboard and by touch.
   */
  content: ReactNode;
  /**
   * The control that opens it. Exactly one element, and it must accept a `ref` and DOM props.
   *
   * It has to be a button — something that is already operable by keyboard and announced as a
   * control. `aria-expanded` is added to it, and focus returns to it when the toggletip closes.
   */
  children: ReactElement;
  /** Which side to prefer. The browser flips it when there is no room. */
  placement?: ToggletipPlacement;
  /** Class for the bubble, not the trigger. */
  className?: string;
}

interface TriggerProps {
  ref?: Ref<HTMLElement>;
  style?: Record<string, string>;
  'aria-expanded'?: boolean;
  onClick?: (event: { defaultPrevented: boolean }) => void;
}

/**
 * A bubble of extra information, opened by clicking a button.
 *
 * It exists because `Tooltip` cannot carry anything that matters. A tooltip opens on hover and on
 * focus, and there is no hover on a touchscreen — ADR-0010 accepted that as a property of the
 * pattern rather than a defect, which leaves everything a reader actually needs without a home.
 * This is that home: the same top layer and the same CSS anchor positioning, opened on purpose.
 *
 * The content sits in a `role="status"` region and is mounted only while open, because a live
 * region announces what changes inside it — content that was always there, merely revealed, is
 * announced by nothing.
 */
export const Toggletip = ({
  content,
  children,
  placement = 'top',
  className,
}: ToggletipProps): ReactElement => {
  const raw = useId();
  const anchor = anchorName(raw);
  const bubbleId = `${raw}-toggletip`;

  const bubble = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // Visibility is driven by `data-open` in CSS, and the popover API is used only to enter the top
  // layer — the same arrangement as `Tooltip`, for the same reason: the call throws where the API
  // is absent, and where the attribute is merely inert the bubble would be permanently visible
  // instead of permanently hidden. This way the worst case is a bubble outside the top layer.
  useEffect(() => {
    const node = bubble.current;
    if (!node || typeof node.showPopover !== 'function') return;

    if (open) node.showPopover();
    else if (node.matches(':popover-open')) node.hidePopover();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;

      setOpen(false);

      // Back to the control that opened it. Closing without this leaves a keyboard user's focus
      // nowhere they can see, which is worse than the bubble staying open.
      trigger.current?.focus();
    };

    // Pointer down rather than click: the reader has already decided to go elsewhere, and waiting
    // for the release leaves the bubble covering the thing they are aiming at.
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;

      if (bubble.current?.contains(target) || trigger.current?.contains(target)) return;

      setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return (): void => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const childRef = (children.props as { ref?: Ref<HTMLElement> }).ref;

  const control = cloneElement(children, {
    ref: (node: HTMLElement | null): void => {
      trigger.current = node;

      // The consumer's own ref still has to work; a component that quietly eats it is a component
      // that cannot be measured, focused or scrolled to by the application around it.
      if (typeof childRef === 'function') childRef(node);
      else if (childRef) (childRef as { current: HTMLElement | null }).current = node;
    },
    style: { ...(children.props as { style?: object }).style, anchorName: anchor },
    'aria-expanded': open,
    onClick: (event: { defaultPrevented: boolean }): void => {
      (children.props as { onClick?: (event: unknown) => void }).onClick?.(event);

      if (!event.defaultPrevented) setOpen((was) => !was);
    },
  } as TriggerProps);

  return (
    <>
      {control}

      <div
        ref={bubble}
        id={bubbleId}
        role="status"
        popover="manual"
        data-open={open || undefined}
        className={cx(styles.bubble, styles[placement], className)}
        style={{ positionAnchor: anchor }}
      >
        {open ? content : null}
      </div>
    </>
  );
};
