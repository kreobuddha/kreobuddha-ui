import { useState } from 'react';
import type { ReactElement } from 'react';
import { Accordion, Alert, Badge, Button, Progress, Skeleton, Tooltip } from '@kreobuddha/ui';
import type { BadgeTone } from '@kreobuddha/ui';

import { checks, degraded, passingCount, type CheckStatus } from '../fixtures/checks';
import { ReloadMark } from '../icons';

const TONES: Record<CheckStatus, BadgeTone> = {
  passing: 'success',
  degraded: 'warning',
  failing: 'danger',
};

const progressLabel = `Checks passing — ${passingCount} of ${checks.length}`;

const LABELS: Record<CheckStatus, string> = {
  passing: 'Passing',
  degraded: 'Degraded',
  failing: 'Failing',
};

/**
 * The diagnostics view.
 *
 * The reload is a two-state control rather than a timer, and that is deliberate: a wall clock in
 * here would mean this page looks different in every screenshot and that a test would have to
 * wait on it. The placeholder state is entered and left by pressing a button, so both states are
 * reachable and reproducible.
 */
export const DiagnosticsPanel = (): ReactElement => {
  const [reloading, setReloading] = useState(false);

  return (
    <div className="panel">
      <div className="panel-actions">
        <Button
          variant="outlined"
          icon={<ReloadMark />}
          onClick={(): void => setReloading((value) => !value)}
        >
          {reloading ? 'Show the results' : 'Re-run the checks'}
        </Button>

        <span className="panel-note">
          The placeholder state is held by this button, not by a timer.
        </span>
      </div>

      {/*
        `Progress` takes its label as an accessible name and draws no text, which is right for a
        component that cannot know where the caption belongs. Here it belongs above the bar, so the
        host draws it — and the two strings are the same one, so what is read matches what is seen.
      */}
      <div className="progress-row">
        <span className="progress-caption">{progressLabel}</span>
        <Progress label={progressLabel} value={passingCount} max={checks.length} />
      </div>

      {degraded ? (
        <Alert tone="warning" title={`${degraded.name} is degraded`}>
          {degraded.detail}
        </Alert>
      ) : null}

      {reloading ? (
        <ul className="check-list" aria-label="Checks">
          {checks.map((check) => (
            <li key={check.id} className="check-row">
              <Skeleton style={{ width: '5rem' }} />
              <Skeleton style={{ width: '9rem' }} />
              <Skeleton style={{ width: '4rem' }} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="check-list" aria-label="Checks">
          {checks.map((check) => (
            <li key={check.id} className="check-row">
              <Badge tone={TONES[check.status]} dot>
                {LABELS[check.status]}
              </Badge>

              <span className="check-name">{check.name}</span>

              {/*
                The identifier is truncated by the column, so the tooltip is the only way to read
                the whole of it. It is on a focusable element rather than on the text: a tooltip
                that only a pointer can reach is a tooltip half the readers never see.
              */}
              <Tooltip content={check.identifier} placement="top">
                <button type="button" className="check-identifier">
                  {check.identifier}
                </button>
              </Tooltip>

              <span className="check-duration">{check.durationMs} ms</span>
            </li>
          ))}
        </ul>
      )}

      <Accordion
        exclusive
        items={checks.map((check) => ({
          id: check.id,
          label: (
            <span className="accordion-label">
              {check.name}
              <Badge tone={TONES[check.status]}>{LABELS[check.status]}</Badge>
            </span>
          ),
          content: check.detail,
        }))}
      />
    </div>
  );
};
