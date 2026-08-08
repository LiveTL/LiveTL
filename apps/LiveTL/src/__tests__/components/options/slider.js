import { render } from '@testing-library/svelte';
// import userEvent from '@testing-library/user-event';
import { writable } from 'svelte/store';
import Slider from '../../../components/common/SliderStore.svelte';

describe('slider', () => {
  it('displays title', () => {
    const { getByText } = render(Slider, {
      name: 'title', store: writable(0)
    });
    expect(getByText(/title/)).toBeInTheDocument();
  });
});
