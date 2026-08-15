import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { Alert } from '../components/Alert/Alert.js';
import { Badge } from '../components/Badge/Badge.js';
import { Checkbox } from '../components/Checkbox/Checkbox.js';
import { Button } from '../components/Button/Button.js';
import { FieldGroup } from '../components/FieldGroup/FieldGroup.js';
import { IconButton } from '../components/IconButton/IconButton.js';
import { Select } from '../components/Select/Select.js';
import { Spinner } from '../components/Spinner/Spinner.js';
import { Switch } from '../components/Switch/Switch.js';
import { Textarea } from '../components/Textarea/Textarea.js';
import { TextField } from '../components/TextField/TextField.js';

/**
 * A single page showing everything the library currently ships, so progress is visible in one
 * place instead of one story at a time. It grows as components land. Use the Theme control in
 * the toolbar to check both themes.
 */

const page: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-8)',
  maxWidth: 720,
};

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
};

const eyebrow: CSSProperties = {
  font: 'var(--kreo-type-label)',
  letterSpacing: 'var(--kreo-tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--kreo-text-subtle)',
};

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--kreo-space-3)',
  flexWrap: 'wrap',
};

const card: CSSProperties = {
  background: 'var(--kreo-surface-card)',
  border: '1px solid var(--kreo-border-default)',
  borderRadius: 'var(--kreo-radius-lg)',
  padding: 'var(--kreo-space-6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
};

interface SectionProps {
  title: string;
  children: ReactNode;
}

/** A stand-in mark, so the icon sections do not depend on an icon set the library does not ship. */
const Mark = (): ReactElement => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Section = ({ title, children }: SectionProps): ReactElement => (
  <section style={sectionStyle}>
    <span style={eyebrow}>{title}</span>
    <div style={card}>{children}</div>
  </section>
);

const PlusMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 7h10M8 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: 'Overview/Kit',
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Kit: Story = {
  render: (): ReactElement => (
    <div style={page}>
      <Section title="Type roles">
        <div style={{ font: 'var(--kreo-type-title)', color: 'var(--kreo-text-primary)' }}>
          Workspace settings
        </div>
        <div style={{ font: 'var(--kreo-type-heading)', color: 'var(--kreo-text-primary)' }}>
          Members and access
        </div>
        <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-body)', margin: 0 }}>
          Body copy sits at 14px with generous leading. Invitations go out when you finish setup.
        </p>
        <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-body)', margin: 0 }}>
          Съешь ещё этих мягких французских булок, да выпей чаю. One family covers both scripts, so
          mixed text keeps a single drawing.
        </p>
      </Section>

      <Section title="Tabular figures">
        <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)', margin: 0 }}>
          No monospace family is bundled. Columns line up because the text face carries tabular
          figures, which is the actual requirement behind &ldquo;use a mono for data&rdquo;.
        </p>
        <div
          style={{
            font: 'var(--kreo-type-data)',
            fontVariantNumeric: 'var(--kreo-numeric-tabular)',
            color: 'var(--kreo-text-body)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>1 108 ms · 3 sent</span>
          <span>9 411 ms · 7 sent</span>
          <span>Шаг 2 / 4 · 128 мс</span>
        </div>
      </Section>

      <Section title="Status colours">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-2)' }}>
          {(
            [
              ['--kreo-text-success', '--kreo-icon-success', 'Changes saved'],
              ['--kreo-text-warning', '--kreo-icon-warning', 'The invitation expires today'],
              ['--kreo-text-danger', '--kreo-icon-danger', 'Could not reach the server'],
              ['--kreo-text-info', '--kreo-icon-info', 'This workspace is read-only'],
            ] as const
          ).map(([text, mark, label]) => (
            <span
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--kreo-space-2)',
                font: 'var(--kreo-type-body)',
                color: `var(${text})`,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 'var(--kreo-radius-full)',
                  background: `var(${mark})`,
                  flex: 'none',
                }}
              />
              {label}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Button — variants">
        <div style={row}>
          <Button variant="filled">Finish setup</Button>
          <Button variant="outlined">Back</Button>
          <Button variant="ghost">Skip for now</Button>
        </div>
      </Section>

      <Section title="Button — sizes">
        <div style={row}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Button — icons and states">
        <div style={row}>
          <Button icon={<PlusMark />}>Add member</Button>
          <Button iconEnd={<ArrowMark />}>Continue</Button>
          <Button loading>Save changes</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Button — danger">
        <div style={row}>
          <Button danger>Delete workspace</Button>
          <Button danger variant="outlined">
            Delete workspace
          </Button>
          <Button danger variant="ghost">
            Delete workspace
          </Button>
        </div>
      </Section>

      <Section title="Badge — tones">
        <div style={row}>
          <Badge>draft</Badge>
          <Badge tone="accent">beta</Badge>
          <Badge tone="success">passing</Badge>
          <Badge tone="warning">deprecated</Badge>
          <Badge tone="danger">3 failed</Badge>
          <Badge tone="info">read-only</Badge>
        </div>
      </Section>

      <Section title="Badge — with a dot, and in context">
        <div style={row}>
          <Badge dot tone="success">
            passing
          </Badge>
          <Badge dot tone="warning">
            deprecated
          </Badge>
          <Badge dot tone="danger">
            3 failed
          </Badge>
        </div>
        <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-body)', margin: 0 }}>
          The endpoint{' '}
          <Badge tone="warning" dot>
            deprecated
          </Badge>{' '}
          still answers, but it is scheduled for removal.
        </p>
        <div style={row}>
          <Button variant="outlined">Invite member</Button>
          <Badge tone="accent">beta</Badge>
        </div>
      </Section>

      <Section title="IconButton — variants and sizes">
        <div style={row}>
          <IconButton label="Continue" icon={<Mark />} />
          <IconButton label="Continue" icon={<Mark />} variant="outlined" />
          <IconButton label="Continue" icon={<Mark />} variant="ghost" />
          <IconButton label="Delete" icon={<Mark />} danger />
          <IconButton label="Saving" icon={<Mark />} loading />
          <IconButton label="Unavailable" icon={<Mark />} disabled />
        </div>
        <div style={row}>
          <IconButton label="Continue" icon={<Mark />} size="xs" variant="ghost" />
          <IconButton label="Continue" icon={<Mark />} size="sm" variant="ghost" />
          <IconButton label="Continue" icon={<Mark />} size="md" variant="ghost" />
          <IconButton label="Continue" icon={<Mark />} size="lg" variant="ghost" />
        </div>
      </Section>

      <Section title="Spinner — sizes">
        <div style={row}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <Spinner size="md" label="Loading" />
        </div>
      </Section>

      <Section title="Alert — tones">
        <Alert tone="success">Changes saved.</Alert>
        <Alert tone="warning">The invitation expires today.</Alert>
        <Alert tone="danger" title="Could not reach the server">
          The workspace was changed by someone else.
        </Alert>
        <Alert tone="info" onDismiss={(): void => undefined}>
          This workspace is read-only.
        </Alert>
      </Section>

      <Section title="TextField — sizes and slots">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'flex-end' }}>
          <TextField label="Small" size="sm" placeholder="you@example.com" />
          <TextField label="Medium" placeholder="you@example.com" />
          <TextField label="Large" size="lg" placeholder="you@example.com" />
        </div>
        <div style={row}>
          <TextField label="Amount" prefix="$" suffix="USD" defaultValue="1200" />
          <TextField label="Unavailable" disabled defaultValue="you@example.com" />
          <TextField label="Read-only" readOnly defaultValue="you@example.com" />
        </div>
      </Section>

      <Section title="TextField — hint, error and required">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'flex-start' }}>
          <TextField label="Email" required hint="We only use this to send receipts." />
          <TextField
            label="Email"
            defaultValue="not-an-address"
            error="Enter an address such as name@example.com."
          />
        </div>
      </Section>

      <Section title="Textarea — rows and a fixed box">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'flex-start' }}>
          <Textarea label="Release notes" rows={3} placeholder="What changed?" />
          <Textarea
            label="Fixed at four rows"
            rows={4}
            resize="none"
            placeholder="Cannot be dragged"
          />
        </div>
        <Textarea
          fullWidth
          label="Summary"
          error="Describe the change in at least a sentence."
          defaultValue="tbd"
        />
      </Section>

      <Section title="Select — placeholder, groups and a chosen value">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'flex-start' }}>
          <Select label="Timezone" placeholder="Choose a timezone">
            <option value="utc">UTC</option>
            <option value="cet">Central European Time</option>
          </Select>
          <Select label="Region" defaultValue="eu">
            <optgroup label="Europe">
              <option value="eu">Frankfurt</option>
            </optgroup>
            <optgroup label="Americas">
              <option value="us">Oregon</option>
            </optgroup>
          </Select>
          <Select label="Locked" disabled defaultValue="utc">
            <option value="utc">UTC</option>
          </Select>
        </div>
      </Section>

      <Section title="Checkbox and Switch">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-8)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-3)' }}>
            <Checkbox label="Off" />
            <Checkbox label="On" defaultChecked />
            <Checkbox label="Some of these" indeterminate />
            <Checkbox label="Unavailable" disabled defaultChecked />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kreo-space-3)' }}>
            <Switch label="Off" />
            <Switch label="On" defaultChecked />
            <Switch label="Unavailable" disabled defaultChecked />
          </div>
        </div>
      </Section>

      <Section title="FieldGroup — a settings form with no wrapper of its own">
        <FieldGroup legend="Notify me about" hint="You can change any of this later.">
          <Checkbox label="Releases" defaultChecked />
          <Checkbox label="Incidents" />
        </FieldGroup>

        <FieldGroup legend="Workspace security" error="Turn on two-factor before inviting anyone.">
          <Switch label="Require two-factor authentication" />
        </FieldGroup>
      </Section>

      <Section title="A field and a button sit level">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'flex-end' }}>
          <TextField label="Workspace" placeholder="acme" />
          <Button>Create</Button>
        </div>
      </Section>

      <Section title="Button — long labels in a narrow column">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'flex-start' }}>
          <div style={{ width: 200 }}>
            <Button fullWidth>Continue to workspace configuration</Button>
          </div>
          <div style={{ width: 200 }}>
            <Button fullWidth textWrap>
              Continue to workspace configuration
            </Button>
          </div>
        </div>
      </Section>
    </div>
  ),
};
