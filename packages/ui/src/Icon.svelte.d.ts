import type { SvelteComponentTyped } from 'svelte';

export interface IconProps {
  block?: boolean;
  small?: boolean;
  xs?: boolean;
  class?: string;
  style?: string;
}

export default class Icon extends SvelteComponentTyped<
  IconProps,
  { click: MouseEvent },
  { default: Record<string, never> }
> {}
