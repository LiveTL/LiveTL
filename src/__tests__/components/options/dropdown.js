import { render, fireEvent } from '@testing-library/svelte';
import { get, writable } from 'svelte/store';
import Dropdown from '../../../components/common/DropdownStore.svelte';

describe('Dropdown', () => {
  const items = [
    { text: 'test', value: 'testValue' },
    { text: 'test2', value: 'test2Value' }
  ];

  it('shows label', () => {
    const { getByText } = render(Dropdown, {
      name: 'Dropdown',
      items,
      store: writable(items[0].name)
    });
    const label = getByText('Dropdown');
    expect(label).toBeInTheDocument();
  });

  it('shows choices', async () => {
    const store = writable(items[0].value);
    const { getByText, getByDisplayValue } = render(Dropdown, { items, store });
    const button = getByDisplayValue(items[0].text);
    await fireEvent.click(button);
    items.forEach(item => expect(getByText(item.text)).toBeInTheDocument());
  });

  it('updates with the store', async () => {
    const store = writable(items[0].value);
    const { getByDisplayValue } = render(Dropdown, { items, store });
    await store.set(items[1].value);
    setTimeout(() => {
      expect(getByDisplayValue(items[1].value)).toBeInTheDocument();
    }, 1000);
  });

  it('updates the store', async () => {
    const store = writable(items[0].value);
    const { getByText, getByDisplayValue } = render(Dropdown, { items, store });
    await fireEvent.click(getByDisplayValue(items[0].text));
    await fireEvent.click(getByText(items[1].text));
    expect(get(store)).toEqual(items[1].value);
  });

  // it('is blue', async () => {
  //   const { getByText, getByDisplayValue } = render(Dropdown, {
  //     name: 'Dropdown',
  //     items,
  //     store: writable(items[0].value)
  //   });
  //   const button = getByDisplayValue(items[0].value);
  //   const label = getByText('Dropdown');
  //   await fireEvent.click(button);
  //   setTimeout(() => {
  //     expect(label).toHaveStyle({
  //       color: 'rgb(33, 150, 243)'
  //     });
  //   }, 3000);
  // });
});
