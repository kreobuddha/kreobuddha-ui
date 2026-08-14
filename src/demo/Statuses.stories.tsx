import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';

import accents from './accents.module.css';
import palettes from './palettes.module.css';
import statuses from './statuses.module.css';

/**
 * Set B was chosen; only the green is still open. The light green is fixed and identical in every
 * column — hue moved off cyan, chroma raised so it survives being dark enough to read. What varies
 * is the dark-theme green, which was as bright as every other status and looked neon for it.
 *
 * Nothing here ships; the page goes away once a level is picked.
 */

interface StatusSet {
  key: string;
  name: string;
  className: string;
  note: string;
}

const SETS: StatusSet[] = [
  {
    key: 'g1',
    name: 'Green 1 — calm (5.2:1)',
    className: statuses.g1 ?? '',
    note: 'The quietest green that still passes comfortably. Closest in weight to the body text around it.',
  },
  {
    key: 'g2',
    name: 'Green 2 — medium (5.8:1)',
    className: statuses.g2 ?? '',
    note: 'A step up. Reads as a signal without lighting up the panel.',
  },
  {
    key: 'g3',
    name: 'Green 3 — as it was (7.0:1)',
    className: statuses.g3 ?? '',
    note: 'The level every other status uses, kept here for reference — this is the one that read as neon.',
  },
];

const cx = (...values: Array<string | undefined>): string => values.filter(Boolean).join(' ');

interface FrameProps {
  set: StatusSet;
  dark?: boolean;
}

const Frame = ({ set, dark = false }: FrameProps): ReactElement => (
  <div
    className={cx(palettes.palette, accents.berry, statuses.base, set.className, statuses.frame)}
    data-kreo-theme={dark ? 'dark' : undefined}
  >
    <div className={statuses.row}>
      <Button size="sm">Publish</Button>
      <Button size="sm" variant="outlined">
        Preview
      </Button>
      <Button size="sm" danger>
        Delete
      </Button>
    </div>

    <div className={statuses.lines}>
      <span className={cx(statuses.line, statuses.success)}>
        <span className={statuses.dot} />
        Changes saved
      </span>
      <span className={cx(statuses.line, statuses.warning)}>
        <span className={statuses.dot} />
        The invitation expires today
      </span>
      <span className={cx(statuses.line, statuses.danger)}>
        <span className={statuses.dot} />
        Could not reach the server
      </span>
      <span className={cx(statuses.line, statuses.info)}>
        <span className={statuses.dot} />
        This workspace is read-only
      </span>
    </div>

    <div className={statuses.caption}>{dark ? 'dark' : 'light'}</div>
  </div>
);

const meta = {
  title: 'Overview/Statuses',
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  render: (): ReactElement => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {SETS.map((set) => (
        <section key={set.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ font: 'var(--kreo-type-heading)', color: 'var(--kreo-text-primary)' }}>
              {set.name}
            </div>
            <div style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)' }}>
              {set.note}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Frame set={set} />
            <Frame set={set} dark />
          </div>
        </section>
      ))}
    </div>
  ),
};
