import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Button, Dialog, IconButton, Select, Tabs, useToast } from '@kreobuddha/ui';

import { ActivityPanel } from './panels/ActivityPanel';
import { DiagnosticsPanel } from './panels/DiagnosticsPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { defaultSettings, sameSettings, type Settings } from './fixtures/settings';
import { InfoMark } from './icons';
import { applyTheme, readTheme, type Theme } from './theme';

/**
 * The console.
 *
 * State that two panels or the shell both need lives here — the theme, the selected tab, and the
 * settings draft, which the tab guard has to read before it can let a tab change through. Anything
 * only one panel cares about stays inside that panel.
 */
export const App = (): ReactElement => {
  const { toast } = useToast();

  const [theme, setTheme] = useState<Theme>(readTheme);

  // The attribute is set on `<html>`, which is outside React's tree, so this is a real effect
  // rather than something that could be rendered.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const [saved, setSaved] = useState<Settings>(defaultSettings);
  const [draft, setDraft] = useState<Settings>(defaultSettings);

  const dirty = !sameSettings(draft, saved);

  const [tab, setTab] = useState('settings');

  // The tab a guarded change is waiting on. `null` means nothing is waiting, which is also what
  // closes the dialog — one piece of state rather than an `open` flag beside a target that could
  // disagree with it.
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const [aboutOpen, setAboutOpen] = useState(false);

  const requestTab = (id: string): void => {
    if (dirty) {
      setPendingTab(id);
      return;
    }

    setTab(id);
  };

  const save = (): void => {
    setSaved(draft);
    toast({ tone: 'success', title: 'Settings saved', children: 'They apply to this session.' });
  };

  const discard = (): void => {
    setDraft(saved);
    if (pendingTab !== null) setTab(pendingTab);
    setPendingTab(null);
  };

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-identity">
          <p className="shell-eyebrow">Kreobuddha UI workbench</p>
          <h1 className="shell-title">Devkit Console</h1>
        </div>

        <div className="shell-controls">
          {/*
            The theme control is the host's, not the library's. `@kreobuddha/ui` publishes the
            `data-kreo-theme` contract and stores nothing, so this select is what an application
            has to write for itself — see `src/theme.ts`.
          */}
          <Select
            label="Theme"
            size="sm"
            value={theme}
            onChange={(event): void => setTheme(event.target.value as Theme)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>

          <IconButton
            label="About Devkit Console"
            icon={<InfoMark />}
            variant="ghost"
            onClick={(): void => setAboutOpen(true)}
          />
        </div>
      </header>

      <main className="shell-main">
        <Tabs
          value={tab}
          onChange={requestTab}
          items={[
            {
              id: 'settings',
              label: 'Settings',
              content: (
                <SettingsPanel
                  draft={draft}
                  dirty={dirty}
                  onChange={(patch): void => setDraft((current) => ({ ...current, ...patch }))}
                  onSave={save}
                />
              ),
            },
            { id: 'diagnostics', label: 'Diagnostics', content: <DiagnosticsPanel /> },
            { id: 'activity', label: 'Activity', content: <ActivityPanel /> },
          ]}
        />
      </main>

      {/*
        `dismissOnBackdrop` is off here, and this is the case ADR-0010 says that prop exists for:
        the dialog is standing between a half-edited form and losing it, so a stray click beside
        the panel must not be the thing that answers the question.
      */}
      <Dialog
        open={pendingTab !== null}
        onClose={(): void => setPendingTab(null)}
        title="Unsaved changes"
        description="The settings on this tab have been edited and not saved."
        dismissOnBackdrop={false}
        footer={
          <>
            <Button variant="ghost" onClick={(): void => setPendingTab(null)}>
              Keep editing
            </Button>
            <Button danger onClick={discard}>
              Discard the changes
            </Button>
          </>
        }
      >
        Leaving the tab now throws the edits away.
      </Dialog>

      <Dialog
        open={aboutOpen}
        onClose={(): void => setAboutOpen(false)}
        title="About Devkit Console"
        description="A fictional local developer tool, built only to compose this library."
        size="sm"
        footer={
          <Button variant="outlined" onClick={(): void => setAboutOpen(false)}>
            Close
          </Button>
        }
      >
        Every value on every tab comes from a file in <code>src/fixtures/</code>. There is no server
        behind any of it, and nothing here is saved once the tab is closed.
      </Dialog>
    </div>
  );
};
