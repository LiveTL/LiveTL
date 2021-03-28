/* eslint-disable no-undef */
import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

import { get, writable } from 'svelte/store';
import ListEdit from '../../../components/options/ListEdit.svelte';

describe('editable list', () => {
  const items = ['hello', 'there'];

  it('displays title', () => {
    const { getByText } = render(ListEdit, {
      name: 'title', store: writable(items)
    });
    expect(getByText('title')).toBeInTheDocument();
  });

  it('displays all options', () => {
    const { getByDisplayValue } = render(ListEdit, {
      name: '', store: writable(items)
    });
    expect(getByDisplayValue('hello')).toBeInTheDocument();
    expect(getByDisplayValue('there')).toBeInTheDocument();
  });

  it('adds new options', async () => {
    const { getByLabelText, getByDisplayValue } = render(ListEdit, {
      name: '', store: writable(items)
    });
    const addInput = getByLabelText('Add New');
    await userEvent.type(addInput, 'Hello there{enter}');
    await userEvent.type(addInput, 'General Kenobi{enter}');
    expect(getByDisplayValue('Hello there')).toBeInTheDocument();
    expect(getByDisplayValue('General Kenobi')).toBeInTheDocument();
  });

  it('saves the new options', async () => {
    const store = writable([]);
    const { getByLabelText } = render(ListEdit, { name: '', store });
    const addInput = getByLabelText('Add New');
    await userEvent.type(addInput, 'Hello there{enter}');
    await userEvent.type(addInput, 'General Kenobi{enter}');
    expect(get(store)).toEqual(['Hello there', 'General Kenobi']);
  });
});