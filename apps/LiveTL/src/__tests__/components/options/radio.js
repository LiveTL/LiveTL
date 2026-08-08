import { render, fireEvent } from '@testing-library/svelte';
import { get, writable } from 'svelte/store';
import Radio from '../../../components/common/RadioGroupStore.svelte';

describe('Radio', () => {
  // const name = 'Test option';
  const options = ['value1', 'value2'];
  const map = new Map([['value1', 'label 1'], ['value2', 'label 2']]);

  // it('shows the label', () => {
  //   const { getByText } = render(Radio, { name, options, store: writable(options[0]) });
  //   expect(getByText(name)).toBeInTheDocument();
  // });

  // it('shows the capitalized options', () => {
  //   const { getByText } = render(Radio, { name, options, store: writable(options[0]) });
  //   expect(getByText('Value 1')).toBeInTheDocument();
  //   expect(getByText('Value 2')).toBeInTheDocument();
  // });

  it('updates with the store', async () => {
    const store = writable(options[0]);
    const { getAllByRole } = render(Radio, { map, store });
    await store.set(options[1]);
    expect(getAllByRole('radio')[0]).toHaveAttribute('selected', 'false');
    expect(getAllByRole('radio')[1]).toHaveAttribute('selected', 'true');
  });

  it('updates the store', async () => {
    const store = writable(options[0]);
    const { getAllByRole } = render(Radio, { map, store });
    await fireEvent.click(getAllByRole('radio')[1]);
    expect(get(store)).toEqual(options[1]);
  });
});
