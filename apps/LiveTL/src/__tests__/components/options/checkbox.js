import { render, fireEvent } from '@testing-library/svelte';
import { get, writable } from 'svelte/store';
import Checkbox from '../../../components/common/CheckboxStore.svelte';

describe('Toggle', () => {
  it('shows name', () => {
    const { getByText } = render(Checkbox, {
      name: 'Toggle option', store: writable(true)
    });
    expect(getByText('Toggle option')).toBeInTheDocument();
  });

  it('updates store when clicked', async () => {
    const store = writable(true);
    const { getByRole } = render(Checkbox, { store });
    await fireEvent.click(getByRole('checkbox'));
    expect(get(store)).toBeFalsy();
  });

  // it('changes when clicked', async () => {
  //   const { getByRole } = render(Checkbox, { store: writable(true) });
  //   const button = getByRole('checkbox');
  //   await fireEvent.click(button);
  //   expect(button).toHaveAttribute('checked', 'false');
  // });

  // it('updates with the store', async () => {
  //   const store = writable(true);
  //   const { getByRole } = render(Checkbox, { store });
  //   const button = getByRole('checkbox');
  //   await store.set(false);
  //   expect(button).toHaveAttribute('checked', 'false');
  // });
});
