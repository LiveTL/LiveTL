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
    item.style.cursor = 'pointer';
    item.style.color = 'inherit';
    item.querySelectorAll('dom-if, .subtitle-text, ytd-badge-supported-renderer').forEach(node => node.remove());
    const openSettings = () => {
      createPopup(chrome.runtime.getURL(`${isLiveTL ? 'hyperchat/' : ''}options.html${document.documentElement.hasAttribute('dark') ? '?dark' : ''}`));
    };
    item.addEventListener('click', openSettings);
    // Keep the native paper item for interaction, but use ordinary DOM for
    // our contents so YouTube's custom-element lifecycle cannot clear them.
    const label = item.querySelector('yt-formatted-string');
    if (label) {
      const text = document.createElement('span');
      text.className = label.className;
      text.textContent = 'HyperChat Settings';
      label.replaceWith(text);
    }
    const icon = item.querySelector('yt-icon');
    const nativeIcon = nativeItem.querySelector('yt-icon');
    if (icon && nativeIcon) {
      const holder = document.createElement('span');
      const style = getComputedStyle(nativeIcon);
      holder.style.cssText = `display: flex; width: ${style.width}; height: ${style.height}; margin: ${style.margin}; flex-shrink: 0; background-color: currentColor;`;
      holder.style.mask = `url("data:image/svg+xml,${encodeURIComponent(outline)}") center / contain no-repeat`;
      holder.setAttribute('aria-hidden', 'true');
      icon.replaceWith(holder);
    }
    menu.appendChild(item);
    return () => {
      item.removeEventListener('click', openSettings);
      item.remove();
    };
  });
</script>
