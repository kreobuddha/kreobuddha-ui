import type { ReactElement } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  FieldGroup,
  IconButton,
  Select,
  Switch,
  TextField,
  Textarea,
  Toggletip,
} from '@kreobuddha/ui';

import { LOG_LEVELS, type Settings } from '../fixtures/settings';
import { InfoMark } from '../icons';

export interface SettingsPanelProps {
  /** What the fields show. The draft is owned above, because the tab guard has to read it too. */
  draft: Settings;
  /** Whether the draft differs from what was last saved. */
  dirty: boolean;
  /** Every field reports itself the same way, which keeps the handlers below to one line each. */
  onChange: (patch: Partial<Settings>) => void;
  onSave: () => void;
}

/**
 * The settings form.
 *
 * It is a real `<form>`: Save is a submit button, so Enter in a text field saves, which is what a
 * keyboard user expects and what a collection of buttons in a `<div>` silently fails to do.
 */
export const SettingsPanel = ({
  draft,
  dirty,
  onChange,
  onSave,
}: SettingsPanelProps): ReactElement => (
  <form
    className="panel"
    onSubmit={(event): void => {
      event.preventDefault();
      onSave();
    }}
  >
    <FieldGroup legend="Workspace" hint="Where the console looks, and what it says while it works.">
      <TextField
        label="Project name"
        value={draft.projectName}
        onChange={(event): void => onChange({ projectName: event.target.value })}
        fullWidth
      />

      <TextField
        label="Workspace path"
        hint="Relative paths are resolved against your home directory."
        value={draft.workspacePath}
        onChange={(event): void => onChange({ workspacePath: event.target.value })}
        fullWidth
      />

      <Textarea
        label="Startup notes"
        hint="Shown in this console when the daemon starts. Markdown is not interpreted."
        rows={3}
        value={draft.startupNotes}
        onChange={(event): void => onChange({ startupNotes: event.target.value })}
        fullWidth
      />

      <div className="field-with-help">
        <Select
          label="Log level"
          value={draft.logLevel}
          onChange={(event): void =>
            onChange({ logLevel: event.target.value as Settings['logLevel'] })
          }
          fullWidth
        >
          {LOG_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </Select>

        {/*
          A `Toggletip` rather than a `Tooltip`: this is an explanation the reader opens when they
          want it, and its content is longer than a label. A tooltip would show it on hover, to
          people who did not ask, and hide it from anyone on a touch screen.
        */}
        <Toggletip
          content="Debug keeps every request body on disk for seven days. On a shared machine that is a lot of somebody else's data."
          placement="bottom"
        >
          <IconButton
            label="Why the log level matters"
            icon={<InfoMark />}
            variant="ghost"
            size="sm"
          />
        </Toggletip>
      </div>
    </FieldGroup>

    <FieldGroup
      legend="Privacy and behaviour"
      hint="Nothing here leaves your machine in this demo."
    >
      <Checkbox
        label="Send anonymous usage data"
        hint="Counts of commands run. No paths, no file contents."
        checked={draft.telemetry}
        onChange={(event): void => onChange({ telemetry: event.target.checked })}
      />

      <Checkbox
        label="Send crash reports"
        checked={draft.crashReports}
        onChange={(event): void => onChange({ crashReports: event.target.checked })}
      />

      <Switch
        label="Reload the workspace when files change"
        hint="Off means the reload is yours to trigger."
        checked={draft.autoReload}
        onChange={(event): void => onChange({ autoReload: event.target.checked })}
      />
    </FieldGroup>

    <div className="panel-actions">
      <Button type="submit">Save settings</Button>

      {dirty ? (
        <Badge tone="warning" dot>
          Unsaved changes
        </Badge>
      ) : (
        <span className="panel-note">Everything here is saved.</span>
      )}
    </div>
  </form>
);
