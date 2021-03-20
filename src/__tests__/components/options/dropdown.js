/* eslint-disable no-undef */
import '@testing-library/jest-dom/extend-expect';

import { render, fireEvent } from '@testing-library/svelte';

import { get, writable } from 'svelte/store';
import Dropdown from '../../../components/options/Dropdown.svelte';


describe('Dropdown', () => {
  const items = [
    { name: 'test', value: 'testValue' },
    { name: 'test2', value: 'test2Value' }
  ];

  it('is blue', async () => {
    const { getByText, getByDisplayValue } = render(Dropdown, {
      name: 'Dropdown',
      items,
      store: writable('test')
    });
    const button = getByDisplayValue('test');
    const label = getByText('Dropdown');
    await fireEvent.click(button);
    setTimeout(() => {
      expect(label).toHaveStyle({
        color: 'rgb(33, 150, 243)'
      });
    }, 3000);
  });
});