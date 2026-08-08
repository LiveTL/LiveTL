import { writable } from 'svelte/store';
import { ChatReportUserOptions, ChatUserActions } from './chat-constants';
import { reportDialog } from './storage';
import type { Chat } from './typings/chat';

export function useBanHammer(
  message: Ytc.ParsedMessage,
  action: ChatUserActions,
  port: Chat.Port | null
): void {
  if (action === ChatUserActions.BLOCK || action === ChatUserActions.DELETE_MESSAGE) {
    port?.postMessage({
      type: 'executeChatAction',
      message,
      action
    });
  } else if (action === ChatUserActions.REPORT_USER) {
    const store = writable(null as null | ChatReportUserOptions);
    reportDialog.set({
      callback: (selection) => {
        port?.postMessage({
          type: 'executeChatAction',
          message,
          action,
          reportOption: selection
        });
      },
      optionStore: store
    });
  }
}

interface ReplyThreadResolver {
  resolve: (replies: Ytc.ParsedMessage[]) => void;
  reject: (err: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

const REPLY_THREAD_TIMEOUT_MS = 10000;
const pendingReplyThreadRequests = new Map<string, ReplyThreadResolver>();

export function fetchReplyThread(
  params: string,
  port: Chat.Port | null
): Promise<Ytc.ParsedMessage[]> {
  if (!port) return Promise.reject(new Error('No port'));
  const requestId = `rt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return new Promise<Ytc.ParsedMessage[]>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const pending = pendingReplyThreadRequests.get(requestId);
      if (!pending) return;
      pendingReplyThreadRequests.delete(requestId);
      pending.reject(new Error('Reply thread fetch timed out'));
    }, REPLY_THREAD_TIMEOUT_MS);
    pendingReplyThreadRequests.set(requestId, { resolve, reject, timeoutId });
    port.postMessage({
      type: 'fetchReplyThread',
      requestId,
      params
    });
  });
}

export function handleReplyThreadResponse(response: Chat.replyThreadResponse): void {
  const pending = pendingReplyThreadRequests.get(response.requestId);
  if (!pending) return;
  pendingReplyThreadRequests.delete(response.requestId);
  clearTimeout(pending.timeoutId);
  if (response.success) {
    pending.resolve(response.replies);
  } else {
    pending.reject(new Error(response.error ?? 'Failed to fetch reply thread'));
  }
}
