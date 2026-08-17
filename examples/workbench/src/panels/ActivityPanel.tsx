import { useState } from 'react';
import type { ReactElement } from 'react';
import { Badge, Button, IconButton, Spinner } from '@kreobuddha/ui';
import type { BadgeTone } from '@kreobuddha/ui';

import { events, type EventLevel } from '../fixtures/events';
import { CloseMark } from '../icons';

const TONES: Record<EventLevel, BadgeTone> = {
  info: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

/** The event feed. Dismissing an entry removes it here and nowhere else. */
export const ActivityPanel = (): ReactElement => {
  const [hidden, setHidden] = useState<string[]>([]);

  const visible = events.filter((event) => !hidden.includes(event.id));

  return (
    <div className="panel">
      <div className="panel-actions">
        <span className="panel-note">
          {visible.length} of {events.length} entries shown.
        </span>

        {hidden.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={(): void => setHidden([])}>
            Show the dismissed entries
          </Button>
        ) : null}
      </div>

      <ul className="event-list" aria-label="Recent activity">
        {visible.map((event) => (
          <li key={event.id} className="event-row">
            <span className="event-time">{event.time}</span>

            <Badge tone={TONES[event.level]}>{event.source}</Badge>

            <span className="event-message">{event.message}</span>

            {/* The only moving thing on the page, and it names what it is waiting for. */}
            {event.running ? (
              <Spinner size="sm" label={`${event.source} is still running`} />
            ) : null}

            <IconButton
              label={`Dismiss the ${event.time} entry`}
              icon={<CloseMark />}
              variant="ghost"
              size="sm"
              onClick={(): void => setHidden((ids) => [...ids, event.id])}
            />
          </li>
        ))}
      </ul>

      {visible.length === 0 ? <p className="panel-note">Nothing left in the feed.</p> : null}
    </div>
  );
};
