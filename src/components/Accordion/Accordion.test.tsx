import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { Accordion } from './Accordion.js';
import type { AccordionItem } from './Accordion.js';

const items: AccordionItem[] = [
  { id: 'general', label: 'General', content: 'Where the workspace lives.' },
  { id: 'members', label: 'Members', content: 'Who can reach it.' },
  { id: 'billing', label: 'Billing', content: 'What it costs.' },
];

/** jsdom implements `<details>` toggling, so the platform behaviour can be observed here. */
const section = (name: string): HTMLDetailsElement =>
  screen.getByText(name).closest('details') as HTMLDetailsElement;

describe('semantics', () => {
  test('every section is a disclosure with its label in the summary', () => {
    render(<Accordion items={items} />);

    // One `group` per section — the role `<details>` maps to. The accessible name is not asserted
    // here: it comes from the `<summary>`, and the name computation used in jsdom does not follow
    // that relationship. The browser does, which is where `tests/browser/accordion.spec.ts` looks.
    expect(screen.getAllByRole('group')).toHaveLength(3);
    expect(screen.getByText('General').closest('summary')).not.toBeNull();
  });

  test('sections start closed, and content is present but not visible', () => {
    render(<Accordion items={items} />);

    expect(section('General').open).toBe(false);
    expect(screen.getByText('Where the workspace lives.')).toBeDefined();
  });

  test('defaultOpen opens a section on first render', () => {
    render(<Accordion items={[{ ...items[0]!, defaultOpen: true }, items[1]!]} />);

    expect(section('General').open).toBe(true);
    expect(section('Members').open).toBe(false);
  });
});

describe('opening', () => {
  test('a click on the summary opens the section', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.click(screen.getByText('Members'));

    expect(section('Members').open).toBe(true);
  });

  test('the summary is the tab stop', async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.tab();

    // The platform supplies the tab stop, and restyling the summary is how a component silently
    // takes it away. Enter and Space are not asserted here: the browser turns them into an
    // activation that a dispatched key event does not carry, so they live in
    // `tests/browser/accordion.spec.ts` with the real presses.
    expect(document.activeElement?.tagName).toBe('SUMMARY');
  });

  test('a re-render does not reopen a section the reader closed', async () => {
    const user = userEvent.setup();
    const open = [{ ...items[0]!, defaultOpen: true }, items[1]!];
    const { rerender } = render(<Accordion items={open} />);

    await user.click(screen.getByText('General'));
    expect(section('General').open).toBe(false);

    rerender(<Accordion items={open} />);

    // `defaultOpen` is an initial value, not a controlled one: the browser owns the state after
    // the first render, and a parent re-render must not take it back.
    expect(section('General').open).toBe(false);
  });
});

describe('exclusive', () => {
  test('groups the sections under one shared name', () => {
    render(<Accordion items={items} exclusive />);

    const names = screen.getAllByRole('group').map((node) => node.getAttribute('name'));

    expect(names.every((name) => name && name === names[0])).toBe(true);
  });

  test('two accordions on one page do not close each other', () => {
    render(
      <>
        <Accordion items={items} exclusive />
        <Accordion items={items} exclusive />
      </>
    );

    const names = new Set(screen.getAllByRole('group').map((node) => node.getAttribute('name')));

    expect(names.size).toBe(2);
  });

  test('without it the sections carry no name and open independently', () => {
    render(<Accordion items={items} />);

    expect(screen.getAllByRole('group').every((node) => !node.hasAttribute('name'))).toBe(true);
  });
});

describe('api', () => {
  test('passes className and native props through to the root element', () => {
    render(<Accordion items={items} className="custom" data-testid="probe" />);

    expect(screen.getByTestId('probe').classList.contains('custom')).toBe(true);
  });

  test('exposes the underlying element through ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Accordion items={items} ref={ref} data-testid="probe" />);

    expect(ref.current).toBe(screen.getByTestId('probe'));
  });
});
