import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /**
   * What the tooltip says.
   *
   * **It may only carry what the reader can do without.** A tooltip opens on hover and on focus,
   * which means it does not exist on a touchscreen — there is no hover there. Anything a reader
   * needs belongs in a label, a hint, or visible text. See ADR-0010.
   */
  content: ReactNode;
  /** The element the tooltip describes. Exactly one, and it must accept a `ref` and DOM props. */
  children: ReactElement;
  /** Which side to prefer. The browser flips it when there is no room. */
  placement?: TooltipPlacement;
  /** Class for the tooltip itself, not the trigger. */
  className?: string;
}

/**
 * A pointer crossing a row of buttons should not set off a chain of tooltips, so opening waits.
 * Closing does not: a tooltip that lingers after the pointer has left is in the way.
 */
const OPEN_DELAY_MS = 400;

interface TriggerProps {
  ref?: (node: HTMLElement | null) => void;
  style?: Record<string, string>;
  'aria-describedby'?: string;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const Tooltip = ({
  content,
  children,
  placement = 'top',
  className,
}: TooltipProps): ReactElement => {
  const raw = useId();

  // `useId` produces colons, which are not valid in a dashed-ident. The anchor name has to be one.
  const anchor = `--kreo-anchor-${raw.replace(/:/g, '')}`;
  const tooltipId = `${raw}-tooltip`;

  const tooltip = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);

  // Visibility is driven by `data-open` in CSS, and the popover API is used only to enter the top
  // layer. Doing it the other way round — letting `[popover]:not(:popover-open)` hide the element —
  // breaks twice: the call throws where the API is absent, which is every consumer running jsdom,
  // and where the attribute is merely inert the tooltip would be permanently visible instead of
  // permanently hidden. This way the worst case is a tooltip that is not in the top layer.
  useEffect(() => {
    const node = tooltip.current;
    if (!node || typeof node.showPopover !== 'function') return;

    if (open) node.showPopover();
    else if (node.matches(':popover-open')) node.hidePopover();
  }, [open]);

  useEffect(() => (): void => clearTimeout(timer.current), []);

  const show = (immediate: boolean): void => {
    clearTimeout(timer.current);

    if (immediate) {
      setOpen(true);
      return;
    }

    timer.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  };

  const hide = (): void => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  // `popover="manual"` neither light-dismisses nor closes on Escape, which is why this exists.
  // Escape has to close a tooltip without moving focus: the reader is still on the trigger.
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') hide();
    };

    document.addEventListener('keydown', onKeyDown);
    return (): void => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const trigger = cloneElement(children, {
    // The description has to sit on the element that takes focus, not on a wrapper around it.
    'aria-describedby': tooltipId,
    style: { ...(children.props as { style?: object }).style, anchorName: anchor },
    onPointerEnter: (): void => show(false),
    onPointerLeave: hide,
    // Focus opens immediately. A keyboard user has already committed to the control; the delay
    // exists to stop a passing pointer setting off a chain, and there is no passing focus.
    onFocus: (): void => show(true),
    onBlur: hide,
  } as TriggerProps);

  return (
    <>
      {trigger}

      <div
        ref={tooltip}
        id={tooltipId}
        role="tooltip"
        popover="manual"
        data-open={open || undefined}
        className={cx(styles.tooltip, styles[placement], className)}
        style={{ positionAnchor: anchor }}
      >
        {content}
      </div>
    </>
  );
};
