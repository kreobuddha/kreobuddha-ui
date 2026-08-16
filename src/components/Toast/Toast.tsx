import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';
import { CloseMark, TONE_MARKS } from '../../internal/marks.js';

import { IconButton } from '../IconButton/IconButton.js';

import styles from './Toast.module.css';

export type ToastTone = 'success' | 'warning' | 'danger' | 'info';

export interface ToastOptions {
  /** What kind of message this is. Never the meaning on its own — the wording has to carry it. */
  tone?: ToastTone | undefined;
  /** An optional heading above the message. */
  title?: string | undefined;
  /** The message itself. */
  children?: ReactNode | undefined;
  /**
   * How long this toast stays, in milliseconds, overriding the provider's default.
   *
   * `0` keeps it until it is dismissed — for something the reader must not miss. The timer is
   * paused while a pointer is over the region or focus is inside it, so this is time spent
   * ignoring the toast rather than time spent reading it.
   */
  duration?: number | undefined;
  /** Replaces the mark the tone supplies, as on `Alert`. */
  icon?: ReactNode | undefined;
  /** The close button's accessible name. */
  dismissLabel?: string | undefined;
}

/** What `useToast()` returns. */
export interface ToastApi {
  /** Raises a toast and returns the id it was given. */
  toast: (options: ToastOptions) => string;
  /** Removes a toast before its timer runs out. Unknown ids are ignored. */
  dismiss: (id: string) => void;
}

export interface ToastProviderProps {
  /** The application, or whatever part of it raises toasts. */
  children: ReactNode;
  /** How many toasts are on screen at once. The rest wait their turn rather than being dropped. */
  limit?: number | undefined;
  /** The default lifetime in milliseconds. A single toast overrides it with its own `duration`. */
  duration?: number | undefined;
  /** The region's accessible name, for a reader navigating by landmark. */
  label?: string | undefined;
  /** Class for the region, not for a toast. */
  className?: string | undefined;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

const ToastContext = createContext<ToastApi | null>(null);

/**
 * Raises toasts from anywhere inside a `ToastProvider`.
 *
 * Throws outside one, rather than returning a no-op: a `toast()` call that silently never appears
 * is a bug that takes an afternoon to find, and the error names the thing that is missing.
 */
export const useToast = (): ToastApi => {
  const api = useContext(ToastContext);

  if (api === null) {
    throw new Error('useToast() must be called inside a <ToastProvider>.');
  }

  return api;
};

/**
 * Owns the toasts, and draws them in the corner of the viewport.
 *
 * The provider exists because a toast is not raised by the thing that draws it — it is raised in
 * the callback where a save failed, several levels below any place a floating stack could sensibly
 * be rendered. See ADR-0011, which also records what this deliberately does not do: there is no
 * second region, no placement prop, no `assertive` politeness and no global hotkey.
 */
export const ToastProvider = ({
  children,
  limit = 3,
  duration = 5000,
  label = 'Notifications',
  className,
}: ToastProviderProps): ReactElement => {
  const region = useRef<HTMLDivElement>(null);
  const prefix = useId();
  const counter = useRef(0);

  const [items, setItems] = useState<readonly ToastRecord[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  /**
   * Milliseconds left for each toast that is still on screen.
   *
   * A ref rather than state: it is written by the timer bookkeeping below on every pause and every
   * resume, and nothing on screen reads it, so putting it in state would re-render the whole
   * stack to store a number nobody displays.
   */
  const remaining = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string): void => {
    remaining.current.delete(id);
    setItems((was) => was.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions): string => {
      counter.current += 1;
      const id = `${prefix}-${counter.current}`;

      remaining.current.set(id, options.duration ?? duration);
      setItems((was) => [...was, { ...options, id }]);

      return id;
    },
    [prefix, duration]
  );

  const api = useMemo<ToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  // The oldest `limit` toasts are the ones on screen; the newest wait. Among those on screen the
  // newest is last in the DOM, which puts it nearest the corner the region is anchored to.
  const visible = items.slice(0, limit);

  // The effect below must restart when the set of visible toasts changes, and not on every render.
  // A joined list of ids is that set as a value the dependency array can compare.
  const shown = visible.map((item) => item.id).join(' ');
  const paused = hovered || focused;

  useEffect(() => {
    if (paused) return undefined;

    const ids = shown === '' ? [] : shown.split(' ');
    const startedAt = Date.now();
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const id of ids) {
      const left = remaining.current.get(id);

      // `0` is a toast that was asked to stay until it is dismissed, so it never gets a timer.
      if (left === undefined || left <= 0) continue;

      timers.push(setTimeout(() => dismiss(id), left));
    }

    return (): void => {
      const elapsed = Date.now() - startedAt;

      for (const timer of timers) clearTimeout(timer);

      // What has already been read is not read again. Without this, a pointer resting on the stack
      // and leaving would restart every timer from the top, and a toast could sit there forever.
      for (const id of ids) {
        const left = remaining.current.get(id);
        if (left === undefined || left <= 0) continue;

        remaining.current.set(id, Math.max(0, left - elapsed));
      }
    };
  }, [shown, paused, dismiss]);

  /** The ids that were on screen when the region last entered the top layer. */
  const raisedFor = useRef('');

  // The top layer, for the reason ADR-0011 §3 gives: a save can fail while a modal `Dialog` is
  // open, and a toast drawn under the dialog it is about is worse than no toast at all. As in
  // `Tooltip` and `Toggletip`, the call is guarded — where the API is missing the worst case is a
  // region outside the top layer rather than a region that never appears.
  //
  // It re-enters the layer as each toast arrives rather than merely staying in it, because the top
  // layer is ordered by when each element entered: a modal dialog opened after this region would
  // otherwise paint over the toast raised from inside it. Leaving and re-entering cannot make the
  // region disappear between announcements — the stylesheet draws it whether or not the popover is
  // showing, so the attribute buys the top layer and nothing else.
  useEffect(() => {
    const node = region.current;
    if (!node || typeof node.showPopover !== 'function') return;

    const before = raisedFor.current === '' ? [] : raisedFor.current.split(' ');
    const now = shown === '' ? [] : shown.split(' ');
    const arrived = now.some((id) => !before.includes(id));

    raisedFor.current = shown;

    if (node.matches(':popover-open')) {
      // Nothing new to raise above: a toast leaving is not a reason to disturb the layer.
      if (!arrived) return;

      node.hidePopover();
    }

    node.showPopover();
  }, [shown]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        ref={region}
        popover="manual"
        role="region"
        aria-label={label}
        // Politeness is not configurable. `assertive` interrupts whatever the reader is being told
        // at that moment, and nothing that arrives in a corner and leaves by itself has earned
        // that. The region is mounted from the start and empty when there is nothing to show,
        // because a live region announces what changes inside it.
        aria-live="polite"
        className={cx(styles.region, className)}
        onPointerEnter={(): void => setHovered(true)}
        onPointerLeave={(): void => setHovered(false)}
        onFocus={(): void => setFocused(true)}
        onBlur={(): void => setFocused(false)}
      >
        <ol className={styles.list}>
          {visible.map((item) => {
            const tone = item.tone ?? 'info';
            const Mark = TONE_MARKS[tone];

            return (
              <li key={item.id} className={cx(styles.toast, styles[tone])}>
                <span className={styles.mark} aria-hidden="true">
                  {item.icon ?? <Mark />}
                </span>

                <div className={styles.body}>
                  {item.title === undefined ? null : <p className={styles.title}>{item.title}</p>}
                  <div className={styles.message}>{item.children}</div>
                </div>

                <IconButton
                  variant="ghost"
                  size="xs"
                  label={item.dismissLabel ?? 'Dismiss'}
                  icon={<CloseMark />}
                  onClick={(): void => dismiss(item.id)}
                  className={styles.dismiss}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </ToastContext.Provider>
  );
};
