import { derived, Readable } from 'svelte/store';
import { Message } from './types.js';

/**
 * Removes duplicate messages that come from mchad sync with ytc
 *
 * @param {Readable<Message>} source
 * @return {Readable<Message>}
 */
export function removeDuplicateMessages(source) {
  return new derived(source, $msg => {
    return $msg;
  });
}
