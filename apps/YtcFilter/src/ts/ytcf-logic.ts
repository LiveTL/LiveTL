import { get } from 'svelte/store';
import { currentFilterPreset, chatFilterPresets, defaultFilterPresetId, currentStorageVersion, initialSetupDone, forceReload, showProfileIcons, showTimestamps } from './storage';
import { stringifyRuns, download, convertDurationObjectToMs } from './ytcf-utils';
import { getRandomString } from './chat-utils';
import parseRegex from 'regex-parser';
import { isLangMatch, parseTranslation } from './tl-tag-detect';
import { YTCF_MESSAGEDUMPINFOS_KEY, isLiveTL } from './chat-constants';
import sanitize from 'sanitize-filename';
import type { Chat } from './typings/chat';

const browserObject = chrome;

export function shouldFilterMessage(action: Chat.MessageAction): boolean {
  const filters = get(currentFilterPreset).filters;
  const msg = action.message;
  for (const filter of filters) {
    if (filter.enabled) {
      let numSatisfied = 0;
      let numValidFilters = filter.conditions.length;
      for (const condition of filter.conditions) {
        if (condition.type === 'boolean') {
          if ((
            condition.property === 'superchat' && Boolean(msg.superChat) !== condition.invert
          ) || (
            condition.property === 'membershipItem' && Boolean(msg.membership) !== condition.invert
          ) || (
            msg.author.types.includes(condition.property) !== condition.invert
          )) {
            numSatisfied++;
          }
          continue;
        }
        let compStr = '';
        switch (condition.property) {
          case 'message':
            compStr = stringifyRuns(msg.message, true);
            break;
          case 'authorName':
            compStr = msg.author.name;
            break;
          case 'authorChannelId':
            compStr = msg.author.id;
            break;
        }
        if (condition.value === '') continue;
        if (condition.type === 'tltag') {
          const parsed = parseTranslation(stringifyRuns(msg.message, true));
          if (!parsed) break;
          const result = isLangMatch(parsed.lang, condition.value);
          if (result === condition.invert) {
            break;
          }
        } else if (condition.type !== 'regex') {
          const s1 = condition.caseSensitive ? compStr : compStr.toLowerCase();
          const s2 = condition.caseSensitive ? condition.value : condition.value.toLowerCase();
          const result = condition.type === 'equals' ? s1 === s2 : s1[condition.type](s2);
          if (!s2) {
            numValidFilters--;
          } else if (result === condition.invert) {
            break;
          }
        } else {
          if (!condition.value) {
            numValidFilters--;
          } else {
            // try {
            //   const regex = parseRegex(condition.value);
            //   const result = regex.test(compStr);
            //   if (result === condition.invert) {
            //     break;
            //   }
            // } catch (e) {
            //   console.error(e);
            //   break;
            // }
            const { result, error } = testRegex(condition.value, compStr);
            if (error || result === condition.invert) {
              break;
            }
          }
        }
        numSatisfied++;
      }
      if (numSatisfied > 0 && numSatisfied === numValidFilters) {
        return true;
      }
    }
  }
  return false;
}

export const testRegex = (expression: string, value: string): { result: boolean; error: Error | false; } => {
  try {
    const regex = parseRegex(expression);
    return {
      result: regex.test(value),
      error: false
    };
  } catch (e) {
    console.error(e);
    return {
      result: false,
      error: e as Error
    };
  }
}

export const isValidRegex = (expression: string): boolean => {
  try {
    parseRegex(expression);
    return true;
  } catch (e) {
    return false;
  }
}

export function shouldActivatePreset(preset: YtcF.FilterPreset, info: SimpleVideoInfo): boolean {
  for (const trigger of preset.triggers) {
    let compStr = '';
    switch (trigger.property) {
      case 'channelId':
        compStr = info.channel.channelId;
        break;
      case 'channelName':
        compStr = info.channel.name;
        break;
      case 'channelHandle':
        compStr = info.channel.handle ?? '';
        break;
      case 'videoId':
        compStr = info.video.videoId;
        break;
      case 'videoTitle':
        compStr = info.video.title;
        break;
    }
    if (trigger.value === '') continue;
    if (trigger.type !== 'regex') {
      const s1 = trigger.caseSensitive ? compStr : compStr.toLowerCase();
      const s2 = trigger.caseSensitive ? trigger.value : trigger.value.toLowerCase();
      const result = s1[trigger.type](s2);
      if (result) return true;
    } else {
      // try {
      //   const regex = parseRegex(trigger.value);
      //   const result = regex.test(compStr);
      //   if (result) return true;
      // } catch (e) {
      //   console.error(e);
      // }
      const { result } = testRegex(trigger.value, compStr);
      if (result) return true;
    }
  }
  return false;
}

export function getAutoActivatedPreset(presets: YtcF.FilterPreset[], info: SimpleVideoInfo): YtcF.FilterPreset | null {
  for (const preset of presets) {
    if (shouldActivatePreset(preset, info)) {
      return preset;
    }
  }
  return null;
}

export const getV2Storage = async (): Promise<any> => {
  return await new Promise((resolve, reject) => {
    try {
      browserObject.storage.local.get('@@vwe-persistence', (s) =>
        resolve(s['@@vwe-persistence'] || null)
      );
    } catch (e) {
      reject(e);
    }
  });
};

const parseHtmlString = (html: string): Ytc.ParsedRun[] => {
  const doc = document.implementation.createHTMLDocument('');
  const elem = doc.createElement('div');
  elem.innerHTML = html;
  const runs: Ytc.ParsedRun[] = Array.from(elem.childNodes).map((child) => {
    return (child as HTMLElement).tagName === 'img'
      ? {
          type: 'emoji',
          src: (child as HTMLImageElement).src,
          alt: (child as HTMLImageElement).alt
        }
      : (
          child as HTMLElement).tagName === 'a'
          ? {
              type: 'link',
              url: (child as HTMLAnchorElement).href,
              text: (child as HTMLAnchorElement).innerText
            }
          : {
              type: 'text',
              text: child.textContent ?? ''
            };
  });
  elem.remove();
  return runs;
};

export const getParsedV2Data = async (importedData: object | null = null): Promise<{
  presets: YtcF.FilterPreset[];
  archives: YtcF.MessageDumpExportItem[];
  defaultPreset: string | null;
}> => {
  const data = importedData ?? (await getV2Storage());
  const presets: YtcF.FilterPreset[] = [];
  const archives: YtcF.MessageDumpExportItem[] = [];
  if (!data) {
    return {
      presets,
      archives,
      defaultPreset: null
    };
  }
  const profiles = data.global.profiles;
  for (const key of Object.keys(profiles)) {
    const profile = profiles[key];
    let autoActivate: {
      channelId: string;
      channelName: string;
      profileKey: string;
    } | null = null;
    for (const channelId of Object.keys(data.global.defaultPerChannel)) {
      if (data.global.defaultPerChannel[channelId].profileKey === key) {
        autoActivate = data.global.defaultPerChannel[channelId];
        break;
      }
    }
    presets.push({
      id: key,
      activation: autoActivate ? 'auto' : 'manual',
      nickname: profile.name,
      triggers: autoActivate
        ? [{
            caseSensitive: false,
            property: 'channelId',
            type: 'includes',
            value: autoActivate.channelId
          }, {
            caseSensitive: false,
            property: 'channelName',
            type: 'includes',
            value: autoActivate.channelName
          }, {
            caseSensitive: false,
            property: 'channelHandle',
            type: 'includes',
            value: autoActivate.channelId
          }]
        : [],
      filters: profile.filters.map((f: any) => {
        switch (f.type) {
          case 'msgIncludes': {
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                caseSensitive: true,
                invert: false,
                property: 'message',
                type: 'includes',
                value: f.value
              }],
              id: getRandomString(),
              enabled: true
            };
          }
          case 'author': {
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                caseSensitive: false,
                invert: false,
                property: 'authorName',
                type: 'includes',
                value: f.value
              }],
              id: getRandomString(),
              enabled: true
            };
          }
          case 'isMember': {
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                type: 'boolean',
                property: 'member',
                invert: false
              }],
              id: getRandomString(),
              enabled: true
            };
          }
          case 'isModerator': {
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                type: 'boolean',
                property: 'moderator',
                invert: false
              }],
              id: getRandomString(),
              enabled: true
            };
          }
          case 'isOwner': {
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                type: 'boolean',
                property: 'owner',
                invert: false
              }],
              id: getRandomString(),
              enabled: true
            };
          }
          case 'isVerified': {
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                type: 'boolean',
                property: 'verified',
                invert: false
              }],
              id: getRandomString(),
              enabled: true
            };
          }
          case 'isSuperchat': {
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                type: 'boolean',
                property: 'superchat',
                invert: false
              }],
              id: getRandomString(),
              enabled: true
            };
          }
          default: { // case 'regex'
            return {
              type: 'basic',
              // nickname: `${UNNAMED_FILTER} ${i + 1}`,
              conditions: [{
                type: 'regex',
                property: 'message',
                invert: false,
                value: f.value,
                caseSensitive: true
              }],
              id: getRandomString(),
              enabled: true
            };
          }
        }
      })
    });
  }
  const archiveKeys = Object.keys(data.videoSettings);
  for (const key of archiveKeys) {
    const messageList = data.videoSettings[key].feeds.default.messages;
    const parsedMessageActions: Chat.MessageAction[] = [];
    for (const message of messageList) {
      const parsedRuns: Ytc.ParsedRun[] = parseHtmlString(message.html);
      parsedMessageActions.push({
        message: {
          author: {
            id: getRandomString(),
            name: message.author,
            profileIcon: {
              alt: message.author,
              src: 'https://www.youtube.com/s/desktop/339bae71/img/favicon_48x48.png'
            },
            types: ['moderator', 'owner', 'verified', 'member'].filter(item => message[item]),
            customBadge: {
              alt: message.author,
              src: message.badgeUrl
            }
          },
          message: parsedRuns,
          messageId: message.id,
          showtime: 0,
          timestamp: message.timestamp
        }
      });
    }
    archives.push({
      continuation: [],
      info: {
        channel: {
          channelId: data.videoSettings[key].channelId,
          name: data.videoSettings[key].channelName,
          handle: data.videoSettings[key].channelId
        },
        video: {
          videoId: data.videoSettings[key].id,
          title: data.videoSettings[key].name
        }
      },
      key: getRandomString(),
      lastEdited: new Date(data.videoSettings[key].lastViewed).getTime(),
      nickname: '',
      presetId: '',
      size: messageList.length,
      actions: parsedMessageActions
    });
  }
  // if presets contains one with id "staff", move it to the front
  const staffPreset = presets.find(p => p.id === 'staff');
  if (staffPreset) {
    presets.splice(presets.indexOf(staffPreset), 1);
    presets.unshift(staffPreset);
  }
  return {
    presets,
    archives,
    defaultPreset: data.global.globalDefault
  };
};

const MESSAGE_ACTION_PREFIX = 'ytcf.savedMessageActions.';
const keyGen = (key: string, dataType: 'actions' | 'info' = 'actions'): string => dataType === 'info' ? `${YTCF_MESSAGEDUMPINFOS_KEY}.${key}` : `${MESSAGE_ACTION_PREFIX}${dataType}.${key}`;

export const clearV2Storage = async (): Promise<void> => {
  return await browserObject.storage.local.remove('@@vwe-persistence');
};

export const migrateV2toV3 = async (
  what: { presetsAndFilters: boolean, archives: boolean },
  importedData: object | null = null
): Promise<void> => {
  const { presets, archives, defaultPreset } = await getParsedV2Data(importedData);
  await clearV2Storage();
  if (what.presetsAndFilters) {
    await chatFilterPresets.ready();
    await chatFilterPresets.set(presets);
    await defaultFilterPresetId.set(defaultPreset ?? '');
  }
  if (what.archives) {
    const messageDumpInfosData: { [key: string]: YtcF.MessageDumpInfoItem } = {};
    await Promise.all(archives.map(async archive => {
      const actions = archive.actions;
      delete (archive as any).actions;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      messageDumpInfosData[archive.key] = archive;
      // const actionsStore = stores.addSyncStore(keyGen(archive.key, 'actions'), actions, false);
      // await actionsStore.ready();
      // // eslint-disable-next-line @typescript-eslint/no-floating-promises
      // await actionsStore.set(actions);
      await browserObject.storage.local.set({
        [keyGen(archive.key, 'actions')]: actions
      });
    }));
    // browserObject.storage.local.set({
    //   [YTCF_MESSAGEDUMPINFOS_KEY]: messageDumpInfosData
    // });
    Object.keys(messageDumpInfosData).forEach(key => {
      browserObject.storage.local.set({
        [keyGen(key, 'info')]: messageDumpInfosData[key]
      });
    });
  }
  await showProfileIcons.set(false);
  await showTimestamps.set(true);
  await currentStorageVersion.set('v3');
};

export const getSavedMessageDump = async (
  key: string
): Promise<YtcF.MessageDumpActionsItem | undefined> => {
  const k = keyGen(key, 'actions');
  // const s = stores.addSyncStore(k, undefined as YtcF.MessageDumpActionsItem | undefined, false);
  // await s.ready();
  // return await s.get();
  return (await browserObject.storage.local.get(k))[k];
};

export const getSavedMessageDumpInfo = async (
  key: string
): Promise<YtcF.MessageDumpInfoItem> => {
  const storageKey = keyGen(key, 'info');
  const data = (await browserObject.storage.local.get(storageKey))[storageKey];
  return data || {
    continuation: [],
    info: {
      channel: {
        channelId: '',
        name: '',
        handle: ''
      },
      video: {
        videoId: '',
        title: ''
      }
    },
    key,
    lastEdited: new Date().getTime(),
    nickname: '',
    presetId: '',
    size: 0
  };
};

export const getSavedMessageDumpExportItem = async (
  key: string
): Promise<YtcF.MessageDump> => {
  const info = await getSavedMessageDumpInfo(key);
  const emptyItem = {
    version: '3',
    dumps: []
  };
  if (!(info as any)) {
    return emptyItem;
  }
  const k2 = keyGen(key, 'actions');
  // const s2 = stores.addSyncStore(k2, undefined as YtcF.MessageDumpActionsItem | undefined, false);
  // await s2.ready();
  // const actions = await s2.get();
  const actions = (await browserObject.storage.local.get(k2))[k2];
  if (!actions) {
    return emptyItem;
  }
  return {
    ...emptyItem,
    dumps: [{
      ...info,
      actions
    }]
  };
};

export const saveMessageDumpInfo = async (
  key: string,
  info: YtcF.MessageDumpInfoItem
): Promise<void> => {
  const storageKey = keyGen(key, 'info');
  await browserObject.storage.local.set({
    [storageKey]: info
  });
};

export const getSavedMessageDumpActions = async (
  key: string
): Promise<YtcF.MessageDumpActionsItem | undefined> => {
  const k = keyGen(key, 'actions');
  // const s = stores.addSyncStore(k, undefined as YtcF.MessageDumpActionsItem | undefined, false);
  // await s.ready();
  return (await browserObject.storage.local.get(k))[k];
  // return await s.get();
};

export const saveMessageActions = async (
  key: string,
  continuation: string | null,
  info: SimpleVideoInfo | undefined | null,
  actions: Chat.MessageAction[],
  presetId: string
): Promise<void> => {
  const lastObj = await getSavedMessageDumpInfo(key);
  const obj: YtcF.MessageDumpInfoItem = {
    continuation: (
      continuation === null ||
      lastObj.continuation?.includes(continuation)
        ? lastObj.continuation
        : [...(lastObj.continuation as any || []), continuation]
    ),
    info: mergeVideoInfoObjs(lastObj?.info, info),
    key,
    presetId,
    lastEdited: Date.now(),
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
    nickname: lastObj.nickname || '',
    size: actions.length
  };
  await saveMessageDumpInfo(key, obj);
  // const actionsStore = stores.addSyncStore(keyGen(key, 'actions'), actions, false);
  // await actionsStore.ready();
  // // eslint-disable-next-line @typescript-eslint/no-floating-promises
  // await actionsStore.set(actions);
  await browserObject.storage.local.set({
    [keyGen(key, 'actions')]: actions
  });
};

export const mergeVideoInfoObjs = (
  lastObj: SimpleVideoInfo | null | undefined,
  newObj: SimpleVideoInfo | null | undefined
): SimpleVideoInfo => {
  return {
    channel: {
      channelId: newObj?.channel?.channelId ?? lastObj?.channel?.channelId ?? '',
      name: newObj?.channel?.name ?? lastObj?.channel?.name ?? '',
      handle: newObj?.channel?.handle ?? lastObj?.channel?.handle ?? ''
    },
    video: {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/prefer-nullish-coalescing
      videoId: newObj?.video.videoId || lastObj?.video.videoId || '',
      title: newObj?.video.title ?? lastObj?.video.title ?? ''
    }
  };
};

export const deleteSavedMessageActions = async (key: string): Promise<void> => {
  await browserObject.storage.local.remove(keyGen(key, 'info'));
};

export const findSavedMessageActionKey = async (
  continuation: string | null,
  info: SimpleVideoInfo | null,
  autoClearDurationObject: YtcF.AutoClearDurationObject
): Promise<string | null> => {
  // return await new Promise((resolve) => {
  //   chrome.storage.local.get(null, (s) => {
  //     const keys = Object.keys(s).filter(filterMessageDumpInfoKeyNames);
  //     for (const key of keys) {
  //       const dump = s[key] as YtcF.MessageDumpInfoItem;
  //       if ((continuation !== null && dump.continuation.includes(continuation)) ||
  //         (info !== null && dump.info?.video?.videoId === info.video.videoId)) {
  //         resolve(key);
  //         return;
  //       }
  //     }
  //     resolve(null);
  //   });
  // });
  const allInfoDumps = await getAllMessageDumpInfoItems();
  let returnValue = null;
  for (const dump of allInfoDumps) {
    if (
      autoClearDurationObject.enabled &&
      dump.lastEdited < Date.now() - convertDurationObjectToMs(autoClearDurationObject)
    ) {
      await deleteSavedMessageActions(dump.key);
    } else if ((continuation != null && continuation && dump.continuation.includes(continuation)) ||
      (info?.video != null && dump.info?.video?.videoId === info.video.videoId && info.video.videoId)) {
      // return dump.key;
      returnValue = dump.key;
    }
  }
  // return null;
  return returnValue;
};

export const getAllMessageDumpInfoItems = async (): Promise<YtcF.MessageDumpInfoItem[]> => {
  const data = await chrome.storage.local.get(null);
  return Object.keys(data).filter(s => s.startsWith(YTCF_MESSAGEDUMPINFOS_KEY)).map((key) => data[key]);
};

const getTitle = (obj: YtcF.MessageDumpExportItem | undefined): string => {
  // // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  // return ((obj?.info?.video?.title) ?? '') || obj?.info?.channel?.name ||
  //   // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  //   obj?.info?.video?.videoId || obj?.info?.channel?.channelId ||
  //   (obj?.lastEdited !== undefined ? new Date(obj?.lastEdited) : new Date()).toISOString();
  // cut title to 100 characters
  const title = (obj?.info?.video?.title || '').slice(0, 100);
  const channelName = obj?.info?.channel?.name;
  const videoId = obj?.info?.video?.videoId;
  const channelId = obj?.info?.channel?.channelId;
  const lastEdited = obj?.lastEdited !== undefined ? new Date(obj?.lastEdited) : new Date();
  // const result = (title ? title : '') + (channelName ? ` - ${channelName}` : (channelId ? ` - ${channelId}` : '')) + (videoId ? ` - ${videoId}` : '');
  let result = title;
  if (videoId) {
    result += `${result ? ' - ' : ''}${videoId}`;
  }
  if (channelName) {
    result += `${result ? ' _ ' : ''}${channelName}`;
  }
  if (channelId) {
    result += `${result ? ' - ' : ''}${channelId}`;
  }
  if (!result) {
    return lastEdited.toISOString();
  }
  return sanitize(result);
};

export const downloadAsJson = async (item: YtcF.MessageDumpInfoItem): Promise<void> => {
  const obj = (await getSavedMessageDumpExportItem(item.key)).dumps;
  const title = getTitle(obj[0]);
  download(JSON.stringify(obj, null, 2), `${title}.json`);
};

export const downloadV2Data = async (): Promise<void> => {
  const data = await getV2Storage();
  download(JSON.stringify(data, null, 2), 'ytcf-v2-data.json');
};

export const downloadAsTxt = async (item: YtcF.MessageDumpInfoItem): Promise<void> => {
  const obj = (await getSavedMessageDumpExportItem(item.key)).dumps[0];
  const title = getTitle(obj);
  const str = obj?.actions.map(action => {
    const msg = action.message;
    const author = msg.author.name;
    const message = stringifyRuns(msg.message);
    return `[${msg.timestamp}] ${author}: ${message}`;
  }).join('\n') ?? '';
  const a = document.createElement('a');
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(str)}`;
  a.download = `${title}.txt`;
  a.click();
};

export const readFromJson = async (): Promise<any> => {
  return await new Promise((resolve) => {
    const element = document.createElement('input');
    element.type = 'file';
    element.accept = '.json';
    element.style.display = 'none';
    element.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        });
        reader.readAsText(file);
      }
      element.remove();
    });
    document.body.appendChild(element);
    element.click();
  });
};

export const redirectIfInitialSetup = async (): Promise<boolean> => {
  await initialSetupDone.ready();
  await currentStorageVersion.ready();
  if (!get(initialSetupDone)) {
    await currentStorageVersion.set('v2');
    const query = window.location.search;
    const params = new URLSearchParams(query);
    params.set('referrer', window.location.href);
    window.location.href = chrome.runtime.getURL(`${(isLiveTL ? 'ytcfilter' : '')}/setup.html?${params.toString()}`);
    return true;
  } else {
    await currentStorageVersion.set('v3');
  }
  return false;
};

export const detectForceReload = async (): Promise<void> => {
  await forceReload.ready();
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  forceReload.subscribe(async (v) => {
    if (v) {
      await forceReload.set(false);
      window.location.reload();
    }
  });
};

export const forceReloadAll = async (): Promise<void> => {
  await forceReload.ready();
  await forceReload.set(true);
};

export const exportSettingsAsJson = async (): Promise<void> => {
  const data = await browserObject.storage.local.get(null);
  download(JSON.stringify(data, null, 2), 'ytcf-data.json');
};

export const importSettingsFromJson = async (data: any): Promise<void> => {
  if (!('ytcf.currentStorageVersion' in data)) {
    if (!('global' in data)) {
      throw new Error('Invalid storage JSON dump.');
    }
    await migrateV2toV3({ archives: true, presetsAndFilters: true }, data);
    return;
  }
  await browserObject.storage.local.set(data);
};

export const importJsonDump = async (): Promise<string | undefined> => {
  const obj = await readFromJson();
  if (obj) {
    const item = obj[0];
    // newMessages({
    //   type: 'messages',
    //   messages: (obj as any).actions
    // }, false, true);
    const itemClone = JSON.parse(JSON.stringify(item));
    delete itemClone.actions;
    await saveMessageDumpInfo(item.key, itemClone);
    await saveMessageActions(
      item.key,
      item.continuation,
      item.info,
      item.actions,
      item.presetId
    );
    return item.key;
  }
};
