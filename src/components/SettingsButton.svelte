<script lang="ts">
  import { createPopup } from '../ts/chat-utils';
  import { isLiveTL } from '../ts/chat-constants';
  import outline from '../assets/outline.svg?raw';
  import { onMount } from 'svelte';

  export let menu: HTMLElement;
  export let nativeItem: HTMLElement;

  onMount(() => {
    // Clone the native paper item, not its service renderer: the latter owns
    // YouTube's command. Custom-element lifecycle supplies native pressed/focus
    // and keyboard behavior; cloneNode does not copy the original listeners.
    const item = nativeItem.cloneNode(true) as HTMLElement;
    item.id = 'hc-settings';
    item.removeAttribute('disabled');
    item.removeAttribute('aria-disabled');
    item.removeAttribute('aria-selected');
    item.removeAttribute('aria-labelledby');
    item.setAttribute('aria-label', 'HyperChat Settings');
    item.tabIndex = 0;
    item.querySelectorAll('dom-if, .subtitle-text, ytd-badge-supported-renderer').forEach(node => node.remove());
    const openSettings = () => {
      createPopup(chrome.runtime.getURL(`${isLiveTL ? 'hyperchat/' : ''}options.html${document.documentElement.hasAttribute('dark') ? '?dark' : ''}`));
    };
    item.addEventListener('click', openSettings);
    menu.appendChild(item);
    // Let YouTube initialize the cloned custom elements before changing their
    // contents; initialization otherwise clears the label and icon.
    const frame = requestAnimationFrame(() => {
      const label = item.querySelector('yt-formatted-string');
      if (label) {
        label.textContent = 'HyperChat Settings';
        label.removeAttribute('is-empty');
      }
      const icon = item.querySelector('yt-icon');
      if (icon) {
        icon.removeAttribute('icon');
        icon.removeAttribute('hidden');
        const template = document.createElement('template');
        template.innerHTML = outline;
        const svg = template.content.querySelector('svg');
        if (svg) svg.style.fill = 'currentColor';
        icon.replaceChildren(template.content);
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      item.removeEventListener('click', openSettings);
      item.remove();
    };
  });
</script>
