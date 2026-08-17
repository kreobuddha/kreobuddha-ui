// The activity feed. Fixed timestamps as strings rather than dates: a clock would make every
// screenshot of this page different from the last one for no gain.

export type EventLevel = 'info' | 'warning' | 'danger' | 'success';

export interface ActivityEvent {
  id: string;
  time: string;
  source: string;
  message: string;
  level: EventLevel;
  /** Rendered with a `Spinner`, for the one entry that has not finished. */
  running?: boolean;
}

export const events: ActivityEvent[] = [
  {
    id: 'e-1',
    time: '09:41:02',
    source: 'index',
    message: 'Rebuilding the symbol index after a version change.',
    level: 'info',
    running: true,
  },
  {
    id: 'e-2',
    time: '09:40:55',
    source: 'workspace',
    message: 'Linked 3 local packages.',
    level: 'success',
  },
  {
    id: 'e-3',
    time: '09:40:51',
    source: 'format',
    message: 'Formatter resolved from the workspace, not the global install.',
    level: 'info',
  },
  {
    id: 'e-4',
    time: '09:38:14',
    source: 'cache',
    message: 'Evicted 240 MB of build artifacts older than 14 days.',
    level: 'warning',
  },
  {
    id: 'e-5',
    time: '09:37:02',
    source: 'daemon',
    message: 'Started on port 6008.',
    level: 'success',
  },
];
