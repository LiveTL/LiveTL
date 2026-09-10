import type { SvelteComponentTyped } from 'svelte';

export interface IconButtonProps {
  icon: string;
  color?: string;
  filled?: boolean;
  noRound?: boolean;
  noPadding?: boolean;
  iconClass?: string;
  class?: string;
}

export default class IconButton extends SvelteComponentTyped<
  IconButtonProps,
  { click: MouseEvent },
  Record<string, never>
> {}
