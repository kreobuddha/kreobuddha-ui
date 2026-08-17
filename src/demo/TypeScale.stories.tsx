import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { Alert } from '../components/Alert/Alert.js';
import { Badge } from '../components/Badge/Badge.js';
import { Button } from '../components/Button/Button.js';
import { Checkbox } from '../components/Checkbox/Checkbox.js';
import { TextField } from '../components/TextField/TextField.js';

/**
 * A decision aid, not a shipped page. It exists to answer two open questions about the type
 * system before `1.0.0` fixes them, and it should be deleted once they are answered.
 *
 * Nothing here edits `src/tokens/typography.css`. Each proposal is applied by redeclaring tokens
 * on a wrapper, so the real components inside re-render under the proposed values.
 *
 * The composite roles have to be redeclared alongside the raw tokens, and that is not belt and
 * braces. A `var()` nested inside a custom property is substituted where that property is
 * *declared*, not where it is used: `--kreo-type-body` is declared at `:root`, so its computed
 * value already carries `0.875rem` and no override further down the tree can reach it. Overriding
 * `--kreo-text-14` alone moves `Button` — whose stylesheet uses the raw token in a real property —
 * and leaves every `--kreo-type-body` paragraph at 14px, which would make this page show a change
 * nobody proposed. Redeclaring the roles on the same wrapper resolves their `var()`s against the
 * wrapper's values instead.
 *
 * Use the Theme control in the toolbar: every panel below is drawn from tokens, so both themes
 * are worth looking at before deciding.
 */
const meta = {
  title: 'Overview/Type scale',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const page: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-8)',
};

const columns: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 'var(--kreo-space-6)',
  alignItems: 'start',
};

const panel: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
  padding: 'var(--kreo-space-5)',
  border: 'var(--kreo-border-w) solid var(--kreo-border-default)',
  borderRadius: 'var(--kreo-radius-lg)',
  background: 'var(--kreo-surface-card)',
};

const eyebrow: CSSProperties = {
  font: 'var(--kreo-type-label)',
  letterSpacing: 'var(--kreo-tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--kreo-text-muted)',
};

const note: CSSProperties = {
  font: 'var(--kreo-type-body)',
  color: 'var(--kreo-text-muted)',
  margin: 0,
};

/**
 * Body at 16px. The raw token moves the stylesheets that use it directly; the three roles built on
 * it are redeclared here so their `var()`s resolve against this wrapper rather than against
 * `:root`, where they were substituted with the shipped value.
 */
const bodyAt16: CSSProperties = {
  ['--kreo-text-14' as string]: '1rem',
  ['--kreo-type-body' as string]:
    'var(--kreo-weight-regular) 1rem / var(--kreo-leading-relaxed) var(--kreo-font-sans)',
  ['--kreo-type-button' as string]: 'var(--kreo-weight-medium) 1rem / 1 var(--kreo-font-sans)',
  ['--kreo-type-data' as string]: 'var(--kreo-weight-regular) 1rem / 1.4 var(--kreo-font-sans)',
};

/** Thin 300, regular 500, bold 700, with every role that names a weight redeclared to match. */
const proposedWeights: CSSProperties = {
  ['--kreo-weight-regular' as string]: '300',
  ['--kreo-weight-medium' as string]: '500',
  ['--kreo-weight-semibold' as string]: '700',
  ['--kreo-type-display' as string]:
    '700 var(--kreo-text-36) / var(--kreo-leading-tight) var(--kreo-font-sans)',
  ['--kreo-type-title' as string]:
    '700 var(--kreo-text-24) / var(--kreo-leading-snug) var(--kreo-font-sans)',
  ['--kreo-type-heading' as string]:
    '700 var(--kreo-text-18) / var(--kreo-leading-snug) var(--kreo-font-sans)',
  ['--kreo-type-body' as string]:
    '300 var(--kreo-text-14) / var(--kreo-leading-relaxed) var(--kreo-font-sans)',
  ['--kreo-type-body-lg' as string]:
    '300 var(--kreo-text-16) / var(--kreo-leading-relaxed) var(--kreo-font-sans)',
  ['--kreo-type-label' as string]: '500 var(--kreo-text-11) / 1.2 var(--kreo-font-sans)',
  ['--kreo-type-button' as string]: '500 var(--kreo-text-14) / 1 var(--kreo-font-sans)',
  ['--kreo-type-data' as string]: '300 var(--kreo-text-14) / 1.4 var(--kreo-font-sans)',
};

const Panel = ({
  label,
  caption,
  style,
  children,
}: {
  label: string;
  caption?: string;
  style?: CSSProperties;
  children: ReactNode;
}): ReactElement => (
  <div style={{ ...panel, ...style }}>
    <span style={eyebrow}>{label}</span>
    {caption === undefined ? null : <p style={note}>{caption}</p>}
    {children}
  </div>
);

/** The realistic block, rendered from real components so the effect is not judged on prose alone. */
const Sample = (): ReactElement => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-4)' }}>
    <div style={{ font: 'var(--kreo-type-title)', color: 'var(--kreo-text-primary)' }}>
      Workspace settings
    </div>
    <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-body)', margin: 0 }}>
      Everyone with access can invite others. Removing someone takes effect at once, and the seat is
      counted until the end of the month.
    </p>
    <TextField label="Workspace name" hint="Shown to everyone you invite." defaultValue="Acme" />
    <Checkbox label="Notify me about incidents" defaultChecked />
    <Alert tone="warning">Two invitations are still pending.</Alert>
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
      <Button>Save changes</Button>
      <Button variant="outlined">Cancel</Button>
      <Badge tone="accent">Beta</Badge>
    </div>
  </div>
);

/**
 * The whole question, in one screen: eleven sizes against four.
 *
 * The right-hand column is the proposal — 12 for small text, captions and hints, 16 for body,
 * 24 and 36 above it. The left is what ships today, with each size annotated by how much of the
 * library actually reaches for it.
 */
export const SizeScale: Story = {
  render: (): ReactElement => {
    const current: Array<[string, string, string]> = [
      ['--kreo-text-11', '11px', 'used by --kreo-type-label'],
      ['--kreo-text-12', '12px', 'used directly, 3 times'],
      ['--kreo-text-13', '13px', 'used directly, 5 times'],
      ['--kreo-text-14', '14px', 'body default — 3 composite roles'],
      ['--kreo-text-16', '16px', 'used by --kreo-type-body-lg'],
      ['--kreo-text-18', '18px', 'used by --kreo-type-heading'],
      ['--kreo-text-20', '20px', 'nothing uses it'],
      ['--kreo-text-24', '24px', 'used by --kreo-type-title'],
      ['--kreo-text-30', '30px', 'nothing uses it'],
      ['--kreo-text-36', '36px', 'used by --kreo-type-display'],
      ['--kreo-text-48', '48px', 'nothing uses it'],
    ];

    const proposed: Array<[string, string, string]> = [
      ['12px', '0.75rem', 'small text, captions, hints'],
      ['16px', '1rem', 'body'],
      ['24px', '1.5rem', 'titles'],
      ['36px', '2.25rem', 'display'],
    ];

    return (
      <div style={page}>
        <p style={note}>
          Counts are of direct references outside <code>src/tokens/</code>. Three sizes are
          referenced by nothing at all — removing those is uncontroversial and does not need this
          comparison.
        </p>

        <div style={columns}>
          <Panel label="Today — 11 sizes" caption="Every size the package exports.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-3)' }}>
              {current.map(([token, size, usage]) => (
                <div key={token} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: size, color: 'var(--kreo-text-primary)' }}>
                    Handgloves 0123
                  </span>
                  <span style={{ font: 'var(--kreo-type-label)', color: 'var(--kreo-text-muted)' }}>
                    {token} · {size} · {usage}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="Proposed — 4 sizes" caption="12 / 16 / 24 / 36.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-3)' }}>
              {proposed.map(([name, size, role]) => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: size, color: 'var(--kreo-text-primary)' }}>
                    Handgloves 0123
                  </span>
                  <span style={{ font: 'var(--kreo-type-label)', color: 'var(--kreo-text-muted)' }}>
                    {name} · {role}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    );
  },
};

/**
 * The decision that costs something: body at 14px, as today, or at 16px as the proposal has it.
 *
 * Both panels render the same components, and the right one is the proposal applied.
 *
 * Measured rather than assumed: the paragraph, the button label and the field text all move from
 * 14px to 16px, and the field label stays at 11px because it is built on `--kreo-text-11` and this
 * proposal does not touch it. **Control heights do not move** — `Button` and `TextField` set theirs
 * explicitly, 40px at `md` in both columns, so a larger body size fills more of the same box rather
 * than growing it. That is the opposite of what a type-scale change usually costs, and it is the
 * main reason this one is cheap.
 */
export const BodySize: Story = {
  render: (): ReactElement => (
    <div style={page}>
      <p style={note}>
        Nothing here is a mock-up — both columns are the shipped components. The only difference is
        the value of one token.
      </p>

      <div style={columns}>
        <Panel label="Body 14px — today" caption="--kreo-text-14 at 0.875rem.">
          <Sample />
        </Panel>

        <Panel
          label="Body 16px — proposed"
          caption="--kreo-text-14 and the three roles built on it, at 1rem."
          style={bodyAt16}
        >
          <Sample />
        </Panel>
      </div>
    </div>
  ),
};

/**
 * The paired decision, shown the same way: thin 300, regular 500, bold 700 against the shipped
 * 400 / 500 / 600.
 *
 * Inter is bundled as a variable font over the whole 100–900 range, so every value here is real
 * rather than synthesised. What to look for is the small text under 300 — a weight that reads
 * comfortably at 24px can go thin and pale at 12px, and the dark theme is where it goes first.
 * `npm run check:contrast` measures colour, not stroke, so it cannot answer this one.
 */
export const Weights: Story = {
  render: (): ReactElement => (
    <div style={page}>
      <div style={columns}>
        <Panel label="Today — 400 / 500 / 600" caption="regular, medium, semibold.">
          <Sample />
        </Panel>

        <Panel
          label="Proposed — 300 / 500 / 700"
          caption="thin, regular, bold."
          style={proposedWeights}
        >
          <Sample />
        </Panel>
      </div>

      <Panel label="Small text under each weight" caption="Where 300 is decided.">
        <div style={columns}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-2)' }}>
            {[300, 400, 500, 600, 700].map((weight) => (
              <span
                key={weight}
                style={{
                  fontSize: 'var(--kreo-text-12)',
                  fontWeight: weight,
                  color: 'var(--kreo-text-body)',
                }}
              >
                {weight} · Shown to everyone you invite. Handgloves 0123
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-2)' }}>
            {[300, 400, 500, 600, 700].map((weight) => (
              <span
                key={weight}
                style={{
                  fontSize: 'var(--kreo-text-24)',
                  fontWeight: weight,
                  color: 'var(--kreo-text-primary)',
                }}
              >
                {weight} · Handgloves
              </span>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  ),
};
