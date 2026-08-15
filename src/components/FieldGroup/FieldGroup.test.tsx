import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Checkbox } from '../Checkbox/Checkbox.js';

import { FieldGroup } from './FieldGroup.js';

describe('FieldGroup', () => {
  it('announces itself as a group named by the legend', () => {
    render(
      <FieldGroup legend="Notify me about">
        <Checkbox label="Releases" />
      </FieldGroup>
    );

    expect(screen.getByRole('group', { name: 'Notify me about' })).toBeDefined();
  });

  it('describes the group rather than each control', () => {
    render(
      <FieldGroup legend="Notify me about" hint="You can change this later.">
        <Checkbox label="Releases" />
        <Checkbox label="Incidents" />
      </FieldGroup>
    );

    const group = screen.getByRole('group');
    const described = group.getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(described)?.textContent).toBe('You can change this later.');

    for (const box of screen.getAllByRole('checkbox')) {
      expect(box.getAttribute('aria-describedby')).toBeNull();
    }
  });

  it('marks the group invalid when an error is given', () => {
    render(
      <FieldGroup legend="Notify me about" error="Choose at least one.">
        <Checkbox label="Releases" />
      </FieldGroup>
    );

    expect(screen.getByRole('group').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Choose at least one.')).toBeDefined();
  });

  it('describes the error before the hint', () => {
    render(
      <FieldGroup legend="Notify me about" hint="Changeable later." error="Choose at least one.">
        <Checkbox label="Releases" />
      </FieldGroup>
    );

    const [firstId = '', secondId = ''] = (
      screen.getByRole('group').getAttribute('aria-describedby') ?? ''
    ).split(' ');

    expect(document.getElementById(firstId)?.textContent).toBe('Choose at least one.');
    expect(document.getElementById(secondId)?.textContent).toBe('Changeable later.');
  });

  it('disables every control inside it, which is the fieldset doing the work', async () => {
    const user = userEvent.setup();

    render(
      <FieldGroup legend="Notify me about" disabled>
        <Checkbox label="Releases" />
        <Checkbox label="Incidents" />
      </FieldGroup>
    );

    const boxes = screen.getAllByRole<HTMLInputElement>('checkbox');

    // `input.disabled` reflects the element's own attribute only. A control disabled by an
    // ancestor fieldset is matched by `:disabled`, which is what the browser and CSS both use.
    for (const box of boxes) {
      expect(box.matches(':disabled')).toBe(true);
    }

    await user.click(boxes[0]!);
    expect(boxes[0]?.checked).toBe(false);
  });

  it('leaves the controls independently operable when the group is not disabled', async () => {
    const user = userEvent.setup();

    render(
      <FieldGroup legend="Notify me about">
        <Checkbox label="Releases" />
        <Checkbox label="Incidents" />
      </FieldGroup>
    );

    await user.click(screen.getByRole('checkbox', { name: 'Releases' }));

    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Releases' }).checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Incidents' }).checked).toBe(
      false
    );
  });

  it('passes native props and className to the fieldset', () => {
    render(
      <FieldGroup legend="Notify me about" className="outer" name="notify" data-testid="group">
        <Checkbox label="Releases" />
      </FieldGroup>
    );

    const group = screen.getByTestId('group');

    expect(group.tagName).toBe('FIELDSET');
    expect(group.classList.contains('outer')).toBe(true);
  });
});
