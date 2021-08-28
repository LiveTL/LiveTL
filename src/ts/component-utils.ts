import { tick } from 'svelte';

const getRelativeRect = (element: HTMLElement, boundingElement: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const boundingRect = boundingElement.getBoundingClientRect();
  return {
    top: rect.top - boundingRect.top,
    right: boundingElement.clientWidth - (boundingRect.right - rect.right),
    bottom: boundingElement.clientHeight - (boundingRect.bottom - rect.bottom),
    left: rect.left - boundingRect.left,
  } 
}

export const getDropdownOffsetY = async(div: HTMLElement, boundingDiv: HTMLElement) => {
  await tick();

  const wrapper = div.querySelector('.dropdown-wrapper');
  const options = wrapper?.querySelector('.dropdown-options');
  if (!wrapper || !options) {
    console.error('Dropdown wrapper or options not found');
    return '';
  }

  const relativeRect = getRelativeRect(wrapper as HTMLElement, boundingDiv);
  if (relativeRect.bottom + options.clientHeight > boundingDiv.clientHeight) {
    return 'bottom-12';
  } else {
    return 'top-12';
  }
};
