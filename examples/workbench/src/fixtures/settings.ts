// The settings the console edits. Local, deterministic, and saved to nothing.
//
// There is no fake backend and no mock-service layer behind any of this: a saved form updates the
// value it compares against, which is all "saved" can honestly mean here.

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface Settings {
  projectName: string;
  workspacePath: string;
  startupNotes: string;
  logLevel: LogLevel;
  telemetry: boolean;
  crashReports: boolean;
  autoReload: boolean;
}

export const LOG_LEVELS: { value: LogLevel; label: string }[] = [
  { value: 'error', label: 'Errors only' },
  { value: 'warn', label: 'Warnings and errors' },
  { value: 'info', label: 'Informational' },
  { value: 'debug', label: 'Debug' },
];

export const defaultSettings: Settings = {
  projectName: 'Atlas',
  workspacePath: '~/work/atlas',
  startupNotes: 'Run the migration before the first build of the day.',
  logLevel: 'info',
  telemetry: false,
  crashReports: true,
  autoReload: true,
};

/** Field-by-field rather than a serialised comparison, so a key added later cannot be missed. */
export const sameSettings = (a: Settings, b: Settings): boolean =>
  (Object.keys(a) as (keyof Settings)[]).every((key) => a[key] === b[key]);
