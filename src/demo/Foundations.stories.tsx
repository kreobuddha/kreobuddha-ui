import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';

import styles from './foundations.module.css';

/**
 * Four decisions that every remaining component inherits. Each one is shown as working interface
 * in both themes, because that is the only way to judge it.
 *
 * Nothing here ships; the page goes away once the four choices are made and recorded in an ADR.
 */

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

interface PairProps {
  children: (dark: boolean) => ReactNode;
}

/** Renders the same specimen twice, once per theme. */
const Pair = ({ children }: PairProps): ReactElement => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    {[false, true].map((dark) => (
      <div key={String(dark)} className={styles.frame} data-kreo-theme={dark ? 'dark' : undefined}>
        <span className={styles.caption}>{dark ? 'dark' : 'light'}</span>
        {children(dark)}
      </div>
    ))}
  </div>
);

interface OptionProps {
  name: string;
  note: string;
  children: ReactNode;
}

const Option = ({ name, note, children }: OptionProps): ReactElement => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div>
      <div style={{ font: 'var(--kreo-type-heading)', color: 'var(--kreo-text-primary)' }}>
        {name}
      </div>
      <div style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)' }}>{note}</div>
    </div>
    {children}
  </section>
);

const Topic = ({ name, note, children }: OptionProps): ReactElement => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <div>
      <div style={{ font: 'var(--kreo-type-title)', color: 'var(--kreo-text-primary)' }}>
        {name}
      </div>
      <div
        style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)', maxWidth: 620 }}
      >
        {note}
      </div>
    </div>
    {children}
  </section>
);

/** One field in every state that matters, for a given anatomy. */
const FieldSet = ({ variant }: { variant: string }): ReactElement => (
  <>
    <div className={styles.stack}>
      <span className={styles.label}>Workspace name</span>
      <div className={cx(styles.field, variant)}>Acme Industries</div>
      <span className={styles.hint}>Cannot be changed after setup.</span>
    </div>
    <div className={styles.stack}>
      <span className={styles.label}>Invite email</span>
      <div className={cx(styles.field, variant, styles.focused)}>
        <span className={styles.placeholder}>name@example.com</span>
      </div>
      <span className={styles.hint}>Focused</span>
    </div>
    <div className={styles.stack}>
      <span className={styles.label}>Seats</span>
      <div className={cx(styles.field, variant, styles.invalid)}>500</div>
      <span className={styles.error}>Enter a number between 1 and 100.</span>
    </div>
  </>
);

const Controls = ({ secondary }: { secondary: string }): ReactElement => (
  <div className={styles.row}>
    <button type="button" className={cx(styles.control, styles.primary)}>
      Finish setup
    </button>
    <button type="button" className={cx(styles.control, secondary)}>
      Back
    </button>
    <button type="button" className={cx(styles.control, styles.tertiary)}>
      Skip
    </button>
  </div>
);

const Overlay = ({ treatment }: { treatment: string }): ReactElement => (
  <div className={styles.overlayHost}>
    <div className={styles.beneath}>
      Content that the panel floats above, so the edge is visible.
    </div>
    <div className={cx(styles.overlay, treatment)}>
      Rename workspace
      <div style={{ color: 'var(--kreo-text-muted)', fontSize: 12, marginTop: 4 }}>
        Duplicate · Move · Delete
      </div>
    </div>
  </div>
);

const Messages = ({ treatment }: { treatment: string }): ReactElement => (
  <div className={styles.stack}>
    {(
      [
        [styles.success, 'Changes saved'],
        [styles.warning, 'The invitation expires today'],
        [styles.danger, 'Could not reach the server'],
      ] as const
    ).map(([tone, text]) => (
      <div key={text} className={cx(styles.message, treatment, tone)}>
        <span className={styles.messageMark} />
        <span>
          {text}
          <span className={styles.messageBody}> — supporting detail sits on the body colour.</span>
        </span>
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Foundations/Decisions',
  parameters: { controls: { disable: true } },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FieldAnatomy: Story = {
  render: (): ReactElement => (
    <Topic
      name="1. Field anatomy"
      note="Decides Input, Textarea and Select, and the focus treatment every other form control inherits. Each column shows a resting field, a focused one with placeholder text, and an invalid one with its message."
    >
      {(
        [
          [
            'A — bordered on the card',
            'Closest to the shipping Button. The control is identified by its outline.',
            styles.fieldA,
          ],
          [
            'B — sunken fill',
            'The control is identified by its surface. This is the "fills for controls" direction chosen during the refresh.',
            styles.fieldB,
          ],
          [
            'C — bottom rule',
            'Quietest and most editorial. Weakest as an affordance: less of the control is drawn.',
            styles.fieldC,
          ],
        ] as const
      ).map(([name, note, variant]) => (
        <Option key={name} name={name} note={note}>
          <Pair>{() => <FieldSet variant={variant ?? ''} />}</Pair>
        </Option>
      ))}
    </Topic>
  ),
};

export const SecondaryControls: Story = {
  render: (): ReactElement => (
    <Topic
      name="2. Secondary control surfaces"
      note="An open contradiction: the refresh chose fills for controls, then gave the secondary button an accent outline instead. With only Button shipping the two never met, and fields force the question."
    >
      {(
        [
          [
            'A — accent outline',
            'What ships today. The secondary action carries the accent in border and label.',
            styles.secondaryOutline,
          ],
          [
            'B — neutral fill',
            'The secondary action is a surface, not an outline. Leaves the accent to the primary alone.',
            styles.secondaryFill,
          ],
          [
            'C — neutral fill with a hairline',
            'As B, but the edge survives on a surface that is already grey.',
            styles.secondaryFillBorder,
          ],
        ] as const
      ).map(([name, note, variant]) => (
        <Option key={name} name={name} note={note}>
          <Pair>{() => <Controls secondary={variant ?? ''} />}</Pair>
        </Option>
      ))}
    </Topic>
  ),
};

export const OverlaySurfaces: Story = {
  render: (): ReactElement => (
    <Topic
      name="3. Overlay surfaces"
      note="Decides Tooltip, Dialog, Menu, Popover and Toast. The shadow token was dropped in Phase 1 as premature and now has to exist — the question is whether it works alone, or whether a border still does the separating."
    >
      {(
        [
          [
            'A — border only',
            'Consistent with the flat, borders-carry-structure language. Weakest sense of floating.',
            styles.overlayBorder,
          ],
          [
            'B — shadow only',
            'Reads as floating immediately. Softer edge, and it disappears in forced-colors mode.',
            styles.overlayShadow,
          ],
          [
            'C — both',
            'The edge survives everywhere and the panel still lifts. Slightly heavier.',
            styles.overlayBoth,
          ],
        ] as const
      ).map(([name, note, variant]) => (
        <Option key={name} name={name} note={note}>
          <Pair>{() => <Overlay treatment={variant ?? ''} />}</Pair>
        </Option>
      ))}
    </Topic>
  ),
};

export const MessageSurfaces: Story = {
  render: (): ReactElement => (
    <Topic
      name="4. Message surfaces"
      note="Decides Alert, later Toast and inline form errors. This choice is not cosmetic: a tint costs a fifth colour per status, because the text tuned for white does not survive being placed on its own tint. The other two reuse what already ships."
    >
      {(
        [
          [
            'A — tinted background',
            'Needs --kreo-text-*-on-tint, four new public tokens, measured against the tint rather than against white.',
            styles.messageTint,
          ],
          [
            'B — bordered',
            'Reuses the shipping status colours unchanged. No new tokens.',
            styles.messageBorder,
          ],
          [
            'C — left rule',
            'Also reuses what ships. Quietest, and scans well in a vertical stack of messages.',
            styles.messageRule,
          ],
        ] as const
      ).map(([name, note, variant]) => (
        <Option key={name} name={name} note={note}>
          <Pair>{() => <Messages treatment={variant ?? ''} />}</Pair>
        </Option>
      ))}
    </Topic>
  ),
};
