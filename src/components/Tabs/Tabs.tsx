import { useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, KeyboardEvent, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import styles from './Tabs.module.css';

export type TabsActivation = 'automatic' | 'manual';

export interface TabItem {
  /** Stable identity for the tab. Becomes part of the generated element ids. */
  id: string;
  /** What the tab reads as. `ReactNode` so a count or a `Badge` can sit beside the word. */
  label: ReactNode;
  /** Rendered only while this tab is selected. */
  content: ReactNode;
  /**
   * Reported through `aria-disabled` rather than removed from the sequence: arrows still reach it,
   * so a keyboard user learns the tab exists and is told it is unavailable, instead of finding a
   * gap they cannot explain.
   */
  disabled?: boolean;
}

export interface TabsProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'defaultValue'> {
  /** The tabs, in the order they are read and arrowed through. */
  items: TabItem[];
  /** The selected tab's `id`. Pass it with `onChange` to control the selection. */
  value?: string;
  /** The initially selected tab when the selection is not controlled. */
  defaultValue?: string;
  /** Called with the newly selected tab's `id`. */
  onChange?: (id: string) => void;
  /**
   * `automatic` selects as the arrow moves, which is fewer keystrokes and what WAI-ARIA
   * recommends when panels are cheap. `manual` moves focus only, and Enter or Space selects —
   * for a panel expensive enough that arrowing past four of them would fire four requests.
   */
  activation?: TabsActivation;
}

/**
 * One panel visible at a time, for views that belong together and are not read together.
 *
 * There is no native element for this, so the WAI-ARIA tab pattern is implemented here in full: the
 * whole tab list is a single tab stop, arrows move within it, `Home` and `End` jump to the ends, and
 * only the selected panel is rendered. Because those semantics are ours rather than the platform's,
 * they are asserted with real key presses in a real engine by `npm run check:browser` rather than
 * trusted.
 *
 * `activation` is the decision a consumer has to make. `automatic` selects as the arrow moves, which
 * is fewer keystrokes and what WAI-ARIA recommends when panels are cheap; `manual` moves focus only
 * and waits for `Enter` or `Space` — for a panel expensive enough that arrowing past four of them
 * would fire four requests.
 *
 * A disabled tab is reported through `aria-disabled` rather than removed from the sequence, so a
 * keyboard user learns the tab exists and is told it is unavailable, instead of finding a gap they
 * cannot explain. This is a component for switching views, not for navigating routes — the library
 * owns no routing.
 */
export const Tabs = ({
  items,
  value,
  defaultValue,
  onChange,
  activation = 'automatic',
  className,
  ...rest
}: TabsProps): ReactElement => {
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const firstSelectable = items.find((item) => !item.disabled)?.id ?? items[0]?.id ?? '';
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? firstSelectable);

  const selected = value ?? uncontrolled;

  // Which tab `Tab` would land on. It follows the arrow keys so a keyboard user can walk the list
  // in `manual` mode, and falls back to the selected tab, which is where focus should return after
  // leaving and coming back.
  const [focused, setFocused] = useState<string | null>(null);
  const roving = focused ?? selected;

  const tabId = (id: string): string => `${base}-tab-${id}`;
  const panelId = (id: string): string => `${base}-panel-${id}`;

  const select = (id: string): void => {
    if (id === selected) return;

    if (value === undefined) setUncontrolled(id);
    onChange?.(id);
  };

  const moveTo = (index: number): void => {
    const item = items[index];
    if (!item) return;

    setFocused(item.id);
    listRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(tabId(item.id))}`)?.focus();

    // A disabled tab is never selected, in either mode — it can be reached and read, not opened.
    if (activation === 'automatic' && !item.disabled) select(item.id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const current = items.findIndex((item) => item.id === roving);
    if (current === -1) return;

    const keys: Record<string, number | undefined> = {
      ArrowRight: (current + 1) % items.length,
      ArrowLeft: (current - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };

    const next = keys[event.key];

    if (next !== undefined) {
      event.preventDefault();
      moveTo(next);
      return;
    }

    // In `manual` mode the arrows only moved focus, so something has to commit the choice.
    if (event.key === 'Enter' || event.key === ' ') {
      const item = items[current];

      if (item && !item.disabled) {
        event.preventDefault();
        select(item.id);
      }
    }
  };

  const active = items.find((item) => item.id === selected);

  return (
    <div {...rest} className={cx(styles.tabs, className)}>
      {/*
        No `aria-label` is required here. A tab list usually sits under a heading that already names
        it, and adding a label of our own would have a screen reader announce the same thing twice.
        Pass `aria-label` or `aria-labelledby` through when there is no such heading.
      */}
      <div
        ref={listRef}
        role="tablist"
        className={styles.list}
        onKeyDown={onKeyDown}
        onBlur={(event): void => {
          // Focus left the list entirely, so `Tab` should next land on the selected tab again.
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
        }}
      >
        {items.map((item) => {
          const isSelected = item.id === selected;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={tabId(item.id)}
              className={cx(styles.tab, isSelected && styles.selected)}
              aria-selected={isSelected}
              aria-controls={panelId(item.id)}
              aria-disabled={item.disabled || undefined}
              // Roving tabindex: one stop for the whole list, so `Tab` moves past it to the panel
              // rather than walking through every tab.
              tabIndex={item.id === roving ? 0 : -1}
              onClick={(): void => {
                setFocused(item.id);
                if (!item.disabled) select(item.id);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          role="tabpanel"
          id={panelId(active.id)}
          className={styles.panel}
          aria-labelledby={tabId(active.id)}
          // Reachable by `Tab` so a panel with no focusable content can still be scrolled by
          // keyboard, which is what WAI-ARIA asks for.
          tabIndex={0}
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
};
