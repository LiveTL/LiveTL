import { tick } from 'svelte';

export const getDropdownOffsetY = async(div: HTMLElement, windowInnerHeight: number) => {
  await tick();

  const wrapper = div.querySelector('.dropdown-wrapper');
  const options = wrapper?.querySelector('.dropdown-options');
  if (!wrapper || !options) {
    console.error('Dropdown wrapper or options not found');
    return '';
  }

  const wrapperRect = wrapper.getBoundingClientRect();
  const optionsHeight = options.clientHeight;
  if (wrapperRect.bottom + optionsHeight + 20 > windowInnerHeight) {
    return 'bottom-12';
  } else {
    return 'top-12';
  }
};
