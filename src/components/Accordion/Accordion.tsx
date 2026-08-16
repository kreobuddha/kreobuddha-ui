import { useId } from 'react';
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

import styles from './Accordion.module.css';

export interface AccordionItem {
  /** Stable identity for the section. Used as the React key, not rendered. */
  id: string;
  /** The heading that opens the section. `ReactNode`, so a count or a `Badge` can sit beside it. */
  label: ReactNode;
  /** Rendered inside the section. It stays in the DOM while the section is closed. */
  content: ReactNode;
  /**
   * Open on first render. Under `exclusive` the browser opens only the first section marked this
   * way and leaves the rest closed, which is the platform's rule rather than this component's.
   */
  defaultOpen?: boolean;
}

export interface AccordionProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The sections, in the order they are read. */
  items: AccordionItem[];
  /**
   * Only one section open at a time.
   *
   * Done by the browser through the `name` attribute shared by the sections — no state, no
   * effect, no click handler. Where `name` is not implemented the sections simply open
   * independently, which is a weaker version of the same component rather than a broken one.
   */
  exclusive?: boolean;
}

/**
 * Sections that open and close, built on `<details>` and `<summary>`.
 *
 * The platform already supplies all of it: the disclosure button, Enter and Space, the
 * expanded/collapsed announcement, and — with `name` — the exclusive behaviour. That is the line
 * ADR-0010 drew for overlays, continued here. Nothing in this file manages open state, and there
 * is deliberately no height animation: a `<details>` cannot be animated without taking its state
 * back from the browser, which is the whole thing worth having.
 */
export const Accordion = ({
  items,
  exclusive = false,
  className,
  ...rest
}: AccordionProps): ReactElement => {
  // One group name per rendered accordion, so two on the same page do not close each other.
  const group = useId();

  return (
    <div {...rest} className={cx(styles.accordion, className)}>
      {items.map((item) => (
        <details
          key={item.id}
          className={styles.section}
          name={exclusive ? group : undefined}
          open={item.defaultOpen}
        >
          <summary className={styles.summary}>
            <span className={styles.label}>{item.label}</span>
            <Chevron />
          </summary>

          <div className={styles.content}>{item.content}</div>
        </details>
      ))}
    </div>
  );
};

/** Drawn rather than left to the platform, whose marker differs per engine and cannot be styled. */
const Chevron = (): ReactElement => (
  <svg
    className={styles.chevron}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
