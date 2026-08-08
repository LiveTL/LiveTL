import { webExtStores } from '@livetl/svelte-webext-stores';
import { derived, readable, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { getClient, AvailableLanguages } from 'iframe-translator';
import type { IframeTranslatorClient, AvailableLanguageCodes } from 'iframe-translator';
import { ChatReportUserOptions, Theme, YoutubeEmojiRenderMode } from './chat-constants';
import { formatAuthorName } from './component-utils';
import { createLiveTLTranslatorClient, shouldUseLiveTLTranslatorBridge } from './ltl-translation';
import type { Chat } from './typings/chat';

export const stores = webExtStores();

export const hcEnabled = stores.addSyncStore('hc.enabled', true);
export const translateTargetLanguage = stores.addSyncStore('hc.translateTargetLanguage', '' as '' | AvailableLanguageCodes);
export const translatorClient = readable(null as (null | IframeTranslatorClient), (set) => {
  let client: IframeTranslatorClient | null = null;
  const destroyIf = (): void => {
    if (client !== null) {
      client.destroy();
      client = null;
    }
    set(null);
  };
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const unsub = translateTargetLanguage.subscribe(async ($translateTargetLanguage) => {
    if (!$translateTargetLanguage) {
      destroyIf();
      return;
    }
    if (client) return;
    client = shouldUseLiveTLTranslatorBridge()
      ? createLiveTLTranslatorClient()
      : await getClient();
    set(client);
  });
  translateTargetLanguage.ready().then(() => {
    // migrate from old language value to new language code
    const oldString = translateTargetLanguage.getCurrent() as string;
    if (!(oldString in AvailableLanguages)) {
      const newKey = (
        Object.keys(AvailableLanguages) as AvailableLanguageCodes[]
      ).find(key => AvailableLanguages[key] === oldString);
      translateTargetLanguage.set(newKey ?? '').catch(console.error);
    }
  }).catch(console.error);
  return () => {
    unsub();
    destroyIf();
  };
});
export const refreshScroll = writable(false);
export const theme = stores.addSyncStore('hc.theme', Theme.YOUTUBE);
export const showProfileIcons = stores.addSyncStore('hc.messages.showProfileIcons', false);
export const showUsernames = stores.addSyncStore('hc.messages.showUsernames', true);
export const showTimestamps = stores.addSyncStore('hc.messages.showTimestamps', false);
export const showUserBadges = stores.addSyncStore('hc.messages.showUserBadges', true);
export const showChatSummary = stores.addSyncStore('hc.messages.showChatSummary', true);
export const lastClosedVersion = stores.addSyncStore('hc.lastClosedVersion', '');
export const showOnlyMemberChat = stores.addSyncStore('hc.showOnlyMemberChat', false);
export const emojiRenderMode = stores.addSyncStore('hc.emojiRenderMode', YoutubeEmojiRenderMode.SHOW_ALL);
export const autoLiveChat = stores.addSyncStore('hc.autoLiveChat', false);
export const useSystemEmojis = stores.addSyncStore('hc.useSystemEmojis', false);
export const hoveredItem = writable(null as null | Chat.MessageAction['message']['messageId']);
export const focusedSuperchat = writable(null as null | Ytc.ParsedTimedItem);
export const port = writable(null as null | Chat.Port);
export const selfChannel = writable(null as null | SimpleUserInfo);
export const selfChannelId = derived(selfChannel, ($selfChannel) => $selfChannel?.channelId);
export const selfChannelName = derived(selfChannel, ($selfChannel) => formatAuthorName($selfChannel?.name ?? ''));
export const reportDialog = writable(null as null | {
  callback: (selection: ChatReportUserOptions) => void;
  optionStore: Writable<null | ChatReportUserOptions>;
});
export const alertDialog = writable(null as null | {
  title: string;
  message: string;
  color: string;
});
export const stickySuperchats = writable([] as Ytc.ParsedTicker[]);
export const activeReplyThreadId = writable<string | null>(null);
export const liveReplyBuffer = writable<Ytc.ParsedMessage[]>([]);
export const liveLikeCounts = writable(new Map<string, number>());
export const isDark = derived(theme, ($theme) => {
  return $theme === Theme.DARK || (
    $theme === Theme.YOUTUBE && window.location.search.includes('dark')
  );
});
export const ytDark = writable(false);
export const currentProgress = writable(null as null | number);
export const enableStickySuperchatBar = stores.addSyncStore('hc.enableStickySuperchatBar', true);
export const enableHighlightedMentions = stores.addSyncStore('hc.enableHighlightedMentions', true);
export const showSuperchatReplyIndicators = stores.addSyncStore('hc.showSuperchatReplyIndicators', true);
export const lastOpenedVersion = stores.addSyncStore('hc.lastOpenedVersion', '');
export const bytesUsed = stores.addSyncStore('hc.bytes.used', 0);
