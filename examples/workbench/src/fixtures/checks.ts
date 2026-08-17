// The diagnostics the console reports. Fixed values, so two screenshots of this page match.

export type CheckStatus = 'passing' | 'degraded' | 'failing';

export interface Check {
  id: string;
  name: string;
  /** Long enough to be truncated in the row, which is what the `Tooltip` there is for. */
  identifier: string;
  status: CheckStatus;
  /** Milliseconds. Rendered with tabular figures so the column lines up. */
  durationMs: number;
  detail: string;
}

export const checks: Check[] = [
  {
    id: 'toolchain',
    name: 'Toolchain',
    identifier: 'devkit.toolchain.node-and-package-manager',
    status: 'passing',
    durationMs: 34,
    detail: 'Node 22.14.0 and npm 10.9.2, both inside the range the workspace declares.',
  },
  {
    id: 'workspace',
    name: 'Workspace',
    identifier: 'devkit.workspace.manifest-and-lockfile-agree',
    status: 'passing',
    durationMs: 128,
    detail: 'Every dependency in the manifest resolves to the version the lockfile pins.',
  },
  {
    id: 'index',
    name: 'Source index',
    identifier: 'devkit.index.incremental-symbol-index',
    status: 'degraded',
    durationMs: 4820,
    detail:
      'The index was rebuilt from scratch because the previous one was written by an older ' +
      'version. Everything works; the first search after a restart is slower until it warms up.',
  },
  {
    id: 'formatter',
    name: 'Formatter',
    identifier: 'devkit.format.prettier-resolves-from-workspace',
    status: 'passing',
    durationMs: 96,
    detail: 'Resolved from the workspace rather than from a global install.',
  },
  {
    id: 'ports',
    name: 'Reserved ports',
    identifier: 'devkit.network.reserved-local-ports',
    status: 'passing',
    durationMs: 12,
    detail: 'Ports 6006 to 6008 are free for the preview servers.',
  },
  {
    id: 'cache',
    name: 'Build cache',
    identifier: 'devkit.cache.on-disk-build-artifacts',
    status: 'passing',
    durationMs: 205,
    detail: '1.2 GB on disk, under the 4 GB the workspace allows.',
  },
];

export const passingCount = checks.filter((check) => check.status === 'passing').length;

export const degraded = checks.find((check) => check.status === 'degraded');
