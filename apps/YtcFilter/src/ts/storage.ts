import { webExtStores } from '@livetl/svelte-webext-stores';
import { derived, readable, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { getClient, AvailableLanguages } from 'iframe-translator';
import type { IframeTranslatorClient, AvailableLanguageCodes } from 'iframe-translator';
import { ChatReportUserOptions, Theme, TimeUnit, YoutubeEmojiRenderMode, isLiveTL } from './chat-constants';
import { formatAuthorName } from './component-utils';
import { createLiveTLTranslatorClient, shouldUseLiveTLTranslatorBridge } from './ltl-translation';
import type { Chat } from './typings/chat';

const INITIAL_PRESET_ID = 'initial-preset-id'; // all other ids will be random

export const stores = webExtStores();

export const hcEnabled = stores.addSyncStore('ytcf.enabled', true);
export const translateTargetLanguage = stores.addSyncStore('ytcf.translateTargetLanguage', '' as '' | AvailableLanguageCodes);
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
export const theme = stores.addSyncStore('ytcf.theme', Theme.YOUTUBE);
export const showProfileIcons = stores.addSyncStore('ytcf.messages.showProfileIcons', false);
export const showUsernames = stores.addSyncStore('ytcf.messages.showUsernames', true);
export const showTimestamps = stores.addSyncStore('ytcf.messages.showTimestamps', false);
export const showUserBadges = stores.addSyncStore('ytcf.messages.showUserBadges', true);
export const showChatSummary = stores.addSyncStore('ytcf.messages.showChatSummary', true);
export const lastClosedVersion = stores.addSyncStore('ytcf.lastClosedVersion', '');
export const showOnlyMemberChat = stores.addSyncStore('ytcf.showOnlyMemberChat', false);
export const emojiRenderMode = stores.addSyncStore('ytcf.emojiRenderMode', YoutubeEmojiRenderMode.SHOW_ALL);
export const autoLiveChat = stores.addSyncStore('ytcf.autoLiveChat', false);
export const useSystemEmojis = stores.addSyncStore('ytcf.useSystemEmojis', false);
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
export const ytDark = writable(false);
export const activeReplyThreadId = writable<string | null>(null);
export const liveReplyBuffer = writable<Ytc.ParsedMessage[]>([]);
export const liveLikeCounts = writable(new Map<string, number>());
export const isDark = derived([theme, ytDark], ([$theme, $ytDark]) => {
  return $theme === Theme.DARK || (
    $theme === Theme.YOUTUBE && (
      window.location.search.includes('dark') ||
      (
        (
          !window.location.hostname.includes('youtube') ||
          window.location.href.includes('/embed/ytcfilter_embed')
        ) &&
        (
          (
            !(window as any).useYtTheme &&
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
          ) || $ytDark
        )
      )
    )
  );
});
export const currentProgress = writable(null as null | number);
export const enableStickySuperchatBar = stores.addSyncStore('ytcf.enableStickySuperchatBar', false);
export const enableHighlightedMentions = stores.addSyncStore('ytcf.enableHighlightedMentions', false);
export const showSuperchatReplyIndicators = stores.addSyncStore('ytcf.showSuperchatReplyIndicators', true);
export const lastOpenedVersion = stores.addSyncStore('ytcf.lastOpenedVersion', '');
export const chatFilterPresets = stores.addSyncStore('ytcf.chatFilterPresets', [{
  filters: [
    {
      "conditions": [
        {
          "caseSensitive": false,
          "invert": false,
          "needsClear": true,
          "property": "message",
          "type": "tltag",
          "value": "en"
        }
      ],
      "enabled": true,
      "id": "IqhLrwTVEL",
      "type": "basic"
    },
    {
      "conditions": [
        {
          "caseSensitive": false,
          "invert": false,
          "property": "moderator",
          "type": "boolean"
        }
      ],
      "enabled": true,
      "id": "berdVtyXHw",
      "type": "basic"
    },
    {
      "conditions": [
        {
          "caseSensitive": false,
          "invert": false,
          "property": "owner",
          "type": "boolean"
        }
      ],
      "enabled": true,
      "id": "qUYNRyhzQy",
      "type": "basic"
    },
    {
      "conditions": [
        {
          "caseSensitive": false,
          "invert": false,
          "property": "verified",
          "type": "boolean"
        }
      ],
      "enabled": true,
      "id": "gEljlegSPX",
      "type": "basic"
    }
  ],
  nickname: 'Example Preset',
  id: INITIAL_PRESET_ID,
  triggers: [],
  activation: 'manual'
}] as YtcF.FilterPreset[], true);
export const defaultFilterPresetId = stores.addSyncStore('ytcf.defaultFilterPresetId', INITIAL_PRESET_ID, false);
export const videoInfo = writable(undefined as undefined | null | SimpleVideoInfo);
export const overrideFilterPresetId = writable(null as null | string);
export const currentFilterPreset = derived(
  [chatFilterPresets, defaultFilterPresetId, overrideFilterPresetId],
  ([$chatFilterPresets, $defaultFilterPresetId, $overrideFilterPresetId]) => {
    if ($overrideFilterPresetId != null) {
      const result = $chatFilterPresets.find(preset => preset.id === $overrideFilterPresetId);
      if (result) {
        return result;
      }
    }
    return $chatFilterPresets.find(preset => preset.id === $defaultFilterPresetId) ?? $chatFilterPresets[0];
  }
);
export const dataTheme = derived(isDark, ($isDark) => isLiveTL || $isDark ? 'dark' : 'light');
type MaybePromise<T> = T | Promise<T>;
export const confirmDialog = writable(null as null | {
  title: string;
  message: string;
  action: {
    text: string;
    callback: () => MaybePromise<void>;
  };
});
export const errorDialog = writable(null as null | {
  title: string;
  message: string;
  action: {
    text: string;
    callback: () => MaybePromise<void>;
  };
});
export const inputDialog = writable(null as null | {
  title: string;
  message?: string;
  prompts: Array<{
    originalValue: string;
    label: string;
    hideLabel?: boolean;
    large?: boolean;
  }>;
  action: {
    text: string;
    callback: (values: string[]) => MaybePromise<void>;
    cancelled?: () => void;
    noAction?: boolean;
  };
  component?: any;
});
export const popoutDims = stores.addSyncStore('ytcf.popoutDims', {
  width: 1200,
  height: 800
});
export const currentEditingPreset = writable(null as any as YtcF.FilterPreset);
export const exportMode = writable(null as null | string);
export const embedHeight = stores.addSyncStore('ytcf.embedHeight', null as null | number, false);
export const currentStorageVersion = stores.addSyncStore('ytcf.currentStorageVersion', 'v3' as 'v2' | 'v3', false);
export const initialSetupDone = stores.addSyncStore('ytcf.initialSetupDone', false);
export const forceReload = stores.addSyncStore('ytcf.forceReload', false);

export const getPresetById = async (id: string): Promise<YtcF.FilterPreset | null> => {
  await chatFilterPresets.ready();
  const presets = await chatFilterPresets.get();
  return presets.find(preset => preset.id === id) ?? null;
};
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const bytesUsed = stores.addSyncStore('ytcf.bytes.used', 0);
export const filterInBackground = stores.addSyncStore('ytcf.startFilteringInBackground', true);
export const autoOpenFilterPanel = stores.addSyncStore('ytcf.autoOpenFilterPanel', false);
export const autoClear = stores.addSyncStore('ytcf.autoClear', {
  unit: TimeUnit.WEEKS,
  duration: 2,
  enabled: true
} as YtcF.AutoClearDurationObject);
