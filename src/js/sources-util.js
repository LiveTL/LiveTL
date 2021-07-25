import { derived, Readable } from 'svelte/store';
import { Message } from './types.js';

/**
 * Removes duplicate messages that come from mchad sync with ytc
 *
 * @param {Readable<Message>} source
 * @return {Readable<Message>}
 */
export function removeDuplicateMessages(source) {
  let lastText = '';
  return derived(source, $msg => {
    if ($msg == null || $msg.text.trim() == lastText.trim()) return;
    lastText = $msg.text;
    return $msg;
  });
}
