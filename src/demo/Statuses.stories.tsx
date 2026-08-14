import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';

import accents from './accents.module.css';
import palettes from './palettes.module.css';
import statuses from './statuses.module.css';

/**
 * Status colours, all shown under the chosen berry accent.
 *
 * Each status now carries two values: a readable text colour, and a brighter indicator colour for
 * the dot, which only needs 3:1 rather than 4.5:1. That split is what lets the warning stay amber
 * instead of collapsing into brown.
 *
 * Every lightness was solved for a contrast target rather than chosen by eye, so all four hues
 * carry equal weight and the sets differ only in saturation.
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
    name: 'A — subtle (48% saturation)',
    className: statuses.setA ?? '',
    note: 'The quietest of the three, but no longer dusty: the lightness was solved for contrast rather than guessed.',
  },
  {
    key: 'b',
    name: 'B — balanced (64%)',
    className: statuses.setB ?? '',
    note: 'A clear step brighter. Signals read as signals without shouting.',
  },
  {
    key: 'c',
    name: 'C — vivid (82%)',
    className: statuses.setC ?? '',
    note: 'Full-strength signal colours. Unmissable, and furthest from the calm direction.',
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
