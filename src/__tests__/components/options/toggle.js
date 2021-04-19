/* eslint-disable no-undef */
import '@testing-library/jest-dom/extend-expect';

import { render, fireEvent } from '@testing-library/svelte';

import { get, writable } from 'svelte/store';
import Toggle from '../../../components/options/Toggle.svelte';


describe('Toggle', () => {
  it('shows name', () => {
    const { getByText } = render(Toggle, {
      name: 'Toggle option', store: writable(true)
    });
    expect(getByText('Toggle option')).toBeInTheDocument();
  });

  it('changes when clicked', async () => {
    const { getByRole } = render(Toggle, { store: writable(true) });
    const button = getByRole('checkbox');
    await fireEvent.click(button);
    expect(button).toHaveAttribute('aria-checked', 'false');
  });

  it('updates store when clicked', async () => {
    const store = writable(true);
    const { getByRole } = render(Toggle, { store });
    await fireEvent.click(getByRole('checkbox'));
    expect(get(store)).toBeFalsy();
  });

  it('updates with the store', async () => {
    const store = writable(true);
    const { getByRole } = render(Toggle, { store });
    const button = getByRole('checkbox');
    await store.set(false);
    expect(button).toHaveAttribute('aria-checked', 'false');
  });
});