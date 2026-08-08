import type { Chat } from './typings/chat';

export const getFrameInfoAsync = async (): Promise<Chat.UncheckedFrameInfo> => {
  return await new Promise(
    (resolve) =>
      chrome.runtime.sendMessage({ type: 'getFrameInfo' }, resolve)
  );
};

const youtubePlayerStylesSelector = [
  'link[name="www-player"]',
  'link[href*="www-player.css"]',
  'link[name="embed-ui"]',
  'link[href*="ytembeds"]'
].join(', ');
const youtubePlayerShellSelectors = ['#player', '#player-controls', '.player-unavailable', 'yt-live-chat-app', 'ytd-app', 'ytm-app'];

export const createPopup = (url: string): void => {
  chrome.runtime.sendMessage({ type: 'createPopup', url });
};

export const frameIsReplay = (): boolean => {
  try {
    return window.location.href.startsWith(
      `${(location.protocol + '//' + location.host)}/live_chat_replay`
    );
  } catch (e) {
    return false;
  }
};

/*
 * Type predicates
 */
export const isPaidMessageRenderer =
  (r: Ytc.Renderers): r is Ytc.PaidMessageRenderer =>
    'purchaseAmountText' in r && 'bodyBackgroundColor' in r;

export const isPaidStickerRenderer =
  (r: Ytc.Renderers): r is Ytc.PaidStickerRenderer =>
    'purchaseAmountText' in r && 'moneyChipBackgroundColor' in r;

export const isMembershipRenderer =
  (r: Ytc.Renderers): r is Ytc.MembershipRenderer => 'headerSubtext' in r;

/** Checks if frameInfo values are valid */
export const isValidFrameInfo = (f: Chat.UncheckedFrameInfo, port?: Chat.Port): f is Chat.FrameInfo => {
  const check = f.tabId != null && f.frameId != null;
  if (!check) {
    console.error('Invalid frame info', { port });
  }
  return check;
};

const actionTypes = new Set(['messages', 'bonk', 'delete', 'pin', 'unpin', 'summary', 'poll', 'redirect', 'playerProgress', 'forceUpdate', 'likeCounts']);
export const responseIsAction = (r: Chat.BackgroundResponse): r is Chat.Actions =>
  actionTypes.has(r.type);

export const isMembershipGiftPurchaseRenderer = (r: Ytc.Renderers): r is Ytc.MembershipGiftPurchaseRenderer =>
  'header' in r && 'liveChatSponsorshipsHeaderRenderer' in r.header;

const privilegedTypes = new Set(['member', 'moderator', 'owner']);
export const isPrivileged = (types: string[]): boolean =>
  types.some(privilegedTypes.has.bind(privilegedTypes));

export const isChatMessage = (a: Chat.MessageAction): boolean =>
  !a.message.superChat && !a.message.superSticker && !a.message.membership;

const OBSOLETE_MEMBER_EMOJI_PLACEHOLDER = '\u25A1';

export const textIsObsoleteMemberEmoji = (text: string): boolean => {
  const nonWhitespace = text.replace(/\s/g, '');
  return nonWhitespace.length > 0 &&
    [...nonWhitespace].every(char => char === OBSOLETE_MEMBER_EMOJI_PLACEHOLDER);
};

export const isAllEmoji = (a: Chat.MessageAction): boolean =>
  a.message.message.length !== 0 &&
  a.message.message.every(m => m.type === 'emoji' || (
    m.type === 'text' && (
      m.text.trim() === '' ||
      textIsObsoleteMemberEmoji(m.text)
    )
  ));

export const checkInjected = (error: string): boolean => {
  if (document.querySelector('#hc-buttons')) {
    console.error(error);
    return true;
  }
  return false;
};

type ReconnectingPort<T extends Chat.Port> =
  Partial<Pick<T, 'name' | 'disconnect' | 'postMessage' | 'onMessage' | 'onDisconnect'>> &
  { destroy: () => void };

export const stripYoutubePlayerStyles = (): void => {
  if (document.head == null) return;
  for (const link of Array.from(document.head.querySelectorAll<HTMLLinkElement>(youtubePlayerStylesSelector))) {
    link.remove();
  }
};

export const stripYoutubePlayerShell = (): void => {
  for (const selector of youtubePlayerShellSelectors) {
    document.querySelector(selector)?.remove();
  }
};

export const useReconnect = <T extends Chat.Port>(connect: () => Promise<T>): ReconnectingPort<T> => {
  let actualPort: T | null = null;

  const doConnect = async (): Promise<void> => {
    actualPort = await connect();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    actualPort.onDisconnect.addListener(doConnect);
  };
  void doConnect();

  return {
    get name() { return actualPort?.name; },
    disconnect(...args) { return actualPort?.disconnect(...args); },
    postMessage(...args) { return actualPort?.postMessage(...args); },
    get onMessage() { return actualPort?.onMessage; },
    get onDisconnect() { return actualPort?.onDisconnect; },
    destroy: () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      actualPort?.onDisconnect.removeListener(doConnect);
      actualPort?.disconnect();
    }
  };
};

export const buildDeletedObj = (
  deletion: Ytc.ParsedDeleted,
  originalRuns: Ytc.ParsedRun[]
): Chat.MessageDeletedObj => ({
  replace: deletion.pending ? originalRuns : deletion.replacedMessage,
  viewOriginalText: deletion.viewOriginalText,
  pending: deletion.pending
});
