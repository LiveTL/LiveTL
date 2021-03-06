/* eslint-disable no-undef */
import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/svelte';
// eslint-disable-next-line no-unused-vars
import userEvent from '@testing-library/user-event';

// eslint-disable-next-line no-unused-vars
import { get, writable } from 'svelte/store';
import Slider from '../../../components/options/Slider.svelte';

describe('slider', () => {
  it('displays title', () => {
    const { getByText } = render(Slider, {
      name: 'title', store: writable(0)
    });
    expect(getByText(/title/)).toBeInTheDocument();
  });
});
