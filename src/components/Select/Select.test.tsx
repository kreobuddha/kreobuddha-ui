import { createRef, useState } from 'react';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Select } from './Select.js';

const options = (
  <>
    <option value="utc">UTC</option>
    <option value="cet">CET</option>
    <option value="pst">PST</option>
  </>
);

describe('Select', () => {
  it('associates the visible label with the control', () => {
    render(<Select label="Timezone">{options}</Select>);

    expect(screen.getByRole('combobox', { name: 'Timezone' })).toBeDefined();
  });

  it('gives each instance its own ids, so two fields on a page stay independent', () => {
    render(
      <>
        <Select label="First" hint="one">
          {options}
        </Select>
        <Select label="Second" hint="two">
          {options}
        </Select>
      </>
    );

    const [first, second] = screen.getAllByRole('combobox');

    expect(first?.id).not.toBe(second?.id);
  });

  it('points aria-describedby at the hint', () => {
    render(
      <Select label="Timezone" hint="Used for every timestamp.">
        {options}
      </Select>
    );

    const described = screen.getByRole('combobox').getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(described)?.textContent).toBe('Used for every timestamp.');
  });

  it('marks the field invalid when an error is given', () => {
    render(
      <Select label="Timezone" error="Choose one.">
        {options}
      </Select>
    );

    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Choose one.')).toBeDefined();
  });

  it('describes the error before the hint, so the problem is heard before the guidance', () => {
    render(
      <Select label="Timezone" hint="Used everywhere." error="Required.">
        {options}
      </Select>
    );

    const [firstId = '', secondId = ''] = (
      screen.getByRole('combobox').getAttribute('aria-describedby') ?? ''
    ).split(' ');

    expect(document.getElementById(firstId)?.textContent).toBe('Required.');
    expect(document.getElementById(secondId)?.textContent).toBe('Used everywhere.');
  });

  it('shows the placeholder until a choice is made, rather than claiming the first option', () => {
    render(
      <Select label="Timezone" placeholder="Choose a timezone">
        {options}
      </Select>
    );

    const control = screen.getByRole<HTMLSelectElement>('combobox');

    expect(control.value).toBe('');
    expect(screen.getByRole('option', { name: 'Choose a timezone' })).toBeDefined();
  });

  it('makes the placeholder option unselectable once a real choice exists', () => {
    render(
      <Select label="Timezone" placeholder="Choose a timezone">
        {options}
      </Select>
    );

    const placeholder = screen.getByRole<HTMLOptionElement>('option', {
      name: 'Choose a timezone',
    });

    expect(placeholder.disabled).toBe(true);
  });

  it('leaves the browser default alone when there is no placeholder', () => {
    render(<Select label="Timezone">{options}</Select>);

    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('utc');
  });

  it('lets an explicit defaultValue win over the placeholder', () => {
    render(
      <Select label="Timezone" placeholder="Choose a timezone" defaultValue="cet">
        {options}
      </Select>
    );

    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('cet');
  });

  it('changes an uncontrolled selection and reports it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select label="Timezone" placeholder="Choose a timezone" onChange={onChange}>
        {options}
      </Select>
    );

    const control = screen.getByRole<HTMLSelectElement>('combobox');
    await user.selectOptions(control, 'pst');

    expect(control.value).toBe('pst');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('honours a controlled value', async () => {
    const user = userEvent.setup();

    const Controlled = (): ReactElement => {
      const [value, setValue] = useState('utc');

      return (
        <Select label="Timezone" value={value} onChange={(e): void => setValue(e.target.value)}>
          {options}
        </Select>
      );
    };

    render(<Controlled />);
    const control = screen.getByRole<HTMLSelectElement>('combobox');
    await user.selectOptions(control, 'cet');

    expect(control.value).toBe('cet');
  });

  it('cannot be changed when disabled', () => {
    render(
      <Select label="Timezone" disabled>
        {options}
      </Select>
    );

    expect(screen.getByRole<HTMLSelectElement>('combobox').disabled).toBe(true);
  });

  it('reports required through the native attribute, not through the marker alone', () => {
    render(
      <Select label="Timezone" required placeholder="Choose a timezone">
        {options}
      </Select>
    );

    const control = screen.getByRole('combobox');

    expect(control.hasAttribute('required')).toBe(true);
    // The asterisk is decorative; the accessible name must not pick it up.
    expect(screen.getByRole('combobox', { name: 'Timezone' })).toBe(control);
  });

  it('renders option groups as given', () => {
    render(
      <Select label="Timezone">
        <optgroup label="Europe">
          <option value="cet">CET</option>
        </optgroup>
        <optgroup label="Americas">
          <option value="pst">PST</option>
        </optgroup>
      </Select>
    );

    expect(screen.getByRole('group', { name: 'Europe' })).toBeDefined();
    expect(screen.getByRole('group', { name: 'Americas' })).toBeDefined();
  });

  it('passes native props and the ref to the control, and className to the wrapper', () => {
    const ref = createRef<HTMLSelectElement>();

    render(
      <Select label="Timezone" ref={ref} className="outer" name="tz" data-testid="tz">
        {options}
      </Select>
    );

    const control = screen.getByTestId<HTMLSelectElement>('tz');

    expect(ref.current).toBe(control);
    expect(control.name).toBe('tz');
    expect(document.querySelector('.outer')?.contains(control)).toBe(true);
  });
});
