import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider, useToast } from './Toast.js';
import type { ToastOptions } from './Toast.js';

/**
 * This component is the first in the library with behaviour under time, so the whole file runs on
 * fake timers and drives the DOM with `fireEvent` rather than `user-event`. `user-event` waits on
 * real timers between its steps, and a file that has to hand it a bridge to the fake clock for
 * every click is a file whose failures are about the bridge. The keystrokes and the real pointer
 * live in `tests/browser/toast.spec.ts`, where they are real.
 */

/**
 * `hidden: true` throughout, as in `Toggletip`'s tests and for the same reason: jsdom applies the
 * UA rule that hides a popover that was never shown, and it implements no `showPopover()` for the
 * component to call. In a real engine the region is open from the first render — which is what
 * `tests/browser/toast.spec.ts` checks, and what nothing here could.
 */
const region = (): HTMLElement => screen.getByRole('region', { hidden: true });

const messages = (): string[] =>
  screen.queryAllByRole('listitem', { hidden: true }).map((item) => item.textContent ?? '');

/** Raises one toast per click, so a test can raise as many as it needs from the same button. */
const Raise = ({ label, options }: { label: string; options: ToastOptions }): ReactElement => {
  const { toast } = useToast();

  return <button onClick={(): string => toast(options)}>{label}</button>;
};

const click = (name: string): void => {
  fireEvent.click(screen.getByRole('button', { name, hidden: true }));
};

const advance = (ms: number): void => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ToastProvider', () => {
  it('renders the live region from the start, empty, so it has something to announce', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved' }} />
      </ToastProvider>
    );

    // A live region announces what changes inside it. One mounted together with its first message
    // announces nothing, which is the whole reason this is asserted before anything is raised.
    expect(region().getAttribute('aria-live')).toBe('polite');
    expect(messages()).toEqual([]);

    // The name is asserted as the attribute rather than through the accessible-name query: the
    // region is a popover that jsdom considers hidden, and the name computation returns nothing
    // for it. The real accessible name is checked against a browser's own accessibility tree in
    // `tests/browser/toast.spec.ts`.
    expect(region().getAttribute('aria-label')).toBe('Notifications');
  });

  it('takes the region’s name from the provider', () => {
    render(
      <ToastProvider label="Messages">
        <Raise label="Save" options={{ children: 'Saved' }} />
      </ToastProvider>
    );

    expect(region().getAttribute('aria-label')).toBe('Messages');
  });

  it('shows what was raised, with its heading', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ title: 'Save failed', children: 'Try again.' }} />
      </ToastProvider>
    );

    click('Save');

    expect(messages()).toEqual(['Save failedTry again.']);
  });

  it('is polite and never assertive, whatever the tone', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ tone: 'danger', children: 'Save failed' }} />
      </ToastProvider>
    );

    click('Save');

    expect(region().getAttribute('aria-live')).toBe('polite');
    expect(screen.queryByRole('alert', { hidden: true })).toBeNull();
  });

  it('takes the toast away after five seconds', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved' }} />
      </ToastProvider>
    );

    click('Save');
    expect(messages()).toHaveLength(1);

    advance(4999);
    expect(messages()).toHaveLength(1);

    advance(1);
    expect(messages()).toEqual([]);
  });

  it('lets one toast set its own lifetime', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved', duration: 1000 }} />
      </ToastProvider>
    );

    click('Save');
    advance(1000);

    expect(messages()).toEqual([]);
  });

  it('keeps a toast with duration 0 until something dismisses it', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved', duration: 0 }} />
      </ToastProvider>
    );

    click('Save');
    advance(60_000);

    expect(messages()).toEqual(['Saved']);
  });

  it('takes its default lifetime from the provider', () => {
    render(
      <ToastProvider duration={2000}>
        <Raise label="Save" options={{ children: 'Saved' }} />
      </ToastProvider>
    );

    click('Save');

    advance(1999);
    expect(messages()).toHaveLength(1);

    advance(1);
    expect(messages()).toEqual([]);
  });

  it('shows three at once and queues the rest rather than dropping them', () => {
    render(
      <ToastProvider>
        <Raise label="First" options={{ children: 'First', duration: 1000 }} />
        <Raise label="Rest" options={{ children: 'Rest', duration: 0 }} />
      </ToastProvider>
    );

    click('First');
    click('Rest');
    click('Rest');
    click('Rest');

    // Three on screen, the fourth waiting. A dropped toast is a message the application believed
    // it had delivered.
    expect(messages()).toEqual(['First', 'Rest', 'Rest']);

    advance(1000);

    expect(messages()).toEqual(['Rest', 'Rest', 'Rest']);
  });

  it('takes the limit from the provider', () => {
    render(
      <ToastProvider limit={1}>
        <Raise label="Save" options={{ children: 'Saved', duration: 0 }} />
      </ToastProvider>
    );

    click('Save');
    click('Save');

    expect(messages()).toHaveLength(1);
  });

  it('starts the queued toast’s timer when it appears, not when it was raised', () => {
    render(
      <ToastProvider limit={1}>
        <Raise label="Save" options={{ children: 'Saved', duration: 1000 }} />
      </ToastProvider>
    );

    click('Save');
    click('Save');

    advance(1000);

    // The second one is only now on screen. Had its timer been running while it waited, it would
    // have been taken away before anybody could have read it.
    expect(messages()).toHaveLength(1);

    advance(999);
    expect(messages()).toHaveLength(1);

    advance(1);
    expect(messages()).toEqual([]);
  });

  it('has a close button on every toast', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved', duration: 0 }} />
      </ToastProvider>
    );

    click('Save');
    click('Dismiss');

    expect(messages()).toEqual([]);
  });

  it('names the close button whatever the caller named it', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved', dismissLabel: 'Close message' }} />
      </ToastProvider>
    );

    click('Save');

    expect(screen.getByRole('button', { name: 'Close message', hidden: true })).toBeTruthy();
  });

  it('dismisses by id, and ignores an id it does not know', () => {
    const Raiser = (): ReactElement => {
      const { toast, dismiss } = useToast();
      let id = '';

      return (
        <>
          <button onClick={(): void => void (id = toast({ children: 'Saved', duration: 0 }))}>
            Save
          </button>
          <button onClick={(): void => dismiss(id)}>Take it back</button>
          <button onClick={(): void => dismiss('nothing')}>Dismiss a stranger</button>
        </>
      );
    };

    render(
      <ToastProvider>
        <Raiser />
      </ToastProvider>
    );

    click('Save');
    click('Dismiss a stranger');
    expect(messages()).toHaveLength(1);

    click('Take it back');
    expect(messages()).toEqual([]);
  });

  it('pauses the timer while a pointer is over the region, and resumes where it stopped', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved' }} />
      </ToastProvider>
    );

    click('Save');

    advance(3000);
    fireEvent.pointerEnter(region());

    // Long enough that an unpaused timer would have run out several times over.
    advance(20_000);
    expect(messages()).toHaveLength(1);

    fireEvent.pointerLeave(region());

    // Two of the five seconds are left — not five. Resuming from the top would let a toast under a
    // resting pointer stay on screen forever.
    advance(1999);
    expect(messages()).toHaveLength(1);

    advance(1);
    expect(messages()).toEqual([]);
  });

  it('pauses the timer while focus is inside the region', () => {
    render(
      <ToastProvider>
        <Raise label="Save" options={{ children: 'Saved' }} />
      </ToastProvider>
    );

    click('Save');

    // Tabbing towards the close button of a toast that is being taken away is the accessibility
    // trap this rule exists to prevent.
    fireEvent.focus(screen.getByRole('button', { name: 'Dismiss', hidden: true }));

    advance(20_000);
    expect(messages()).toHaveLength(1);

    fireEvent.blur(screen.getByRole('button', { name: 'Dismiss', hidden: true }));

    advance(5000);
    expect(messages()).toEqual([]);
  });
});

describe('useToast', () => {
  it('throws outside a provider, naming the thing that is missing', () => {
    // React logs the error it re-throws; the test asserts on the throw, not on the console.
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const Bare = (): ReactElement => {
      useToast();
      return <p>never rendered</p>;
    };

    // A no-op would be worse: a `toast()` call that silently never appears is a bug that takes an
    // afternoon to find.
    expect(() => render(<Bare />)).toThrow(/ToastProvider/);

    logged.mockRestore();
  });
});
