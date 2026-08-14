import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';

import accents from './accents.module.css';
import palettes from './palettes.module.css';
import statuses from './statuses.module.css';

/**
 * Status colours, all shown under the chosen berry accent. The pairing that matters is the top
 * row: the accent button beside the destructive one. Berry sits at hue 313 and red at hue 4, so
 * the question is whether 51 degrees is enough separation to read them as different kinds of
 * action at a glance.
 *
 * Nothing here ships; the page goes away once a set is picked.
 */

interface StatusSet {
  key: string;
  name: string;
  className: string;
  note: string;
}

const SETS: StatusSet[] = [
  {
    key: 'a',
    name: 'A — standard',
    className: statuses.setA ?? '',
    note: 'Conventional signal colours. Strongest, most immediately legible, least subtle.',
  },
  {
    key: 'b',
    name: 'B — shifted warm',
    className: statuses.setB ?? '',
    note: 'Danger pushed towards orange to sit further from the accent; warning deepened so the two do not collide in turn.',
  },
  {
    key: 'c',
    name: 'C — muted',
    className: statuses.setC ?? '',
    note: 'Lower saturation throughout, closest to the calm editorial direction. Quieter alarms.',
  },
];

const cx = (...values: Array<string | undefined>): string => values.filter(Boolean).join(' ');

interface FrameProps {
  set: StatusSet;
  dark?: boolean;
}

const Frame = ({ set, dark = false }: FrameProps): ReactElement => (
  <div
    className={cx(palettes.palette, accents.berry, set.className, statuses.frame)}
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
