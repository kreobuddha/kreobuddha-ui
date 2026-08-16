// Every public export, used the way a consumer would use it. This file is the reason the fixture
// exists: it resolves `@kreobuddha/ui` and `@kreobuddha/ui/styles.css` through the package's own
// `exports` map, against the emitted declarations, with no alias back to `src`.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Alert,
  Badge,
  Button,
  Checkbox,
  FieldGroup,
  IconButton,
  Select,
  Spinner,
  Switch,
  Tabs,
  TextField,
  Textarea,
} from '@kreobuddha/ui';
import type { ButtonProps, ButtonVariant } from '@kreobuddha/ui';

import '@kreobuddha/ui/styles.css';

// The imported types have to be usable, not merely present: a declaration file that resolves but
// describes nothing would still satisfy a value-only import.
const variants: ButtonVariant[] = ['filled', 'outlined', 'ghost'];

const CloseMark = (): React.ReactElement => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Action = (props: ButtonProps): React.ReactElement => <Button {...props} />;

export const App = (): React.ReactElement => (
  <main>
    <h1>Kreobuddha UI consumer fixture</h1>

    {variants.map((variant) => (
      <Action key={variant} variant={variant}>
        {variant}
      </Action>
    ))}

    <Button loading>Saving</Button>
    <IconButton label="Close" icon={<CloseMark />} variant="ghost" />

    <Badge tone="success" dot>
      Live
    </Badge>
    <Spinner label="Loading the fixture" />

    <Alert tone="danger" title="Save failed" live onDismiss={() => undefined}>
      The workspace was changed by someone else.
    </Alert>

    <TextField label="Email" hint="Work address." defaultValue="rustam@example.com" />
    <Textarea label="Notes" hint="Markdown is not interpreted." rows={3} />

    <Select label="Environment" placeholder="Choose one" defaultValue="">
      <option value="staging">Staging</option>
      <option value="production">Production</option>
    </Select>

    <FieldGroup legend="Notifications" hint="Both may be on.">
      <Checkbox label="Email" defaultChecked />
      <Switch label="Desktop" />
    </FieldGroup>

    <Tabs
      items={[
        { id: 'overview', label: 'Overview', content: 'What this workspace is.' },
        { id: 'members', label: 'Members', content: 'Who can reach it.' },
      ]}
    />
  </main>
);

// Guarded rather than assumed: this module is also imported by the server render, where there is
// no document at all. An unguarded `createRoot` here would make the SSR check fail for the wrong
// reason and hide the thing it is meant to catch.
const container = typeof document === 'undefined' ? null : document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
