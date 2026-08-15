import type { SvelteComponentTyped } from 'svelte';

type ClassValue = string | ((value: string) => string);

export interface ButtonProps {
  value?: boolean;
  outlined?: boolean;
  text?: boolean;
  block?: boolean;
  disabled?: boolean;
  icon?: string | null;
  small?: boolean;
  light?: boolean;
  dark?: boolean;
  flat?: boolean;
  iconClass?: string;
  color?: string;
  href?: string | null;
  fab?: boolean;
  type?: string;
  remove?: string;
  add?: string;
  replace?: Record<string, string>;
  classes?: ClassValue;
  basicClasses?: ClassValue;
  outlinedClasses?: ClassValue;
  textClasses?: ClassValue;
  iconClasses?: ClassValue;
  fabClasses?: ClassValue;
  smallClasses?: ClassValue;
  disabledClasses?: ClassValue;
  elevationClasses?: ClassValue;
  class?: string;
  [attribute: string]: unknown;
}

export default class Button extends SvelteComponentTyped<
  ButtonProps,
  { click: MouseEvent; mouseover: MouseEvent },
  { default: Record<string, never> }
> {}
