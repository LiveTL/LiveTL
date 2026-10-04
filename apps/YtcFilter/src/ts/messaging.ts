import sha1 from 'sha-1';

import {
  chatReportUserOptions,
  ChatUserActions,
  ChatReportUserOptions,
  replyThreadPanelTag,
  currentDomain,
} from '../ts/chat-constants';

import { parseChatResponse } from './chat-parser';
import type { Unsubscriber } from './queue';
import { ytcQueue } from './queue';
import type { Chat } from './typings/chat';

let interceptor: Chat.Interceptor = { clients: [] };

const isYtcInterceptor = (i: Chat.Interceptors, showError = false, ...debug: any[]): i is Chat.YtcInterceptor => {
  const check = i.source === 'ytc';
  if (!check && showError) console.error('Interceptor source is not YTC.', debug);
  return check;
};

interface YtCfg {
  data_: {
    INNERTUBE_API_KEY: string;
    INNERTUBE_CONTEXT: any;
  };
}

const getCookie = (name: string): string => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return (parts.pop() ?? '').split(';').shift() ?? '';
  return '';
};

const proxyFetch = async (...args: any[]): Promise<any> => {
  return await new Promise((resolve, reject) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const encoded = JSON.stringify({ id, args });
    let timeout = 0;
    const onFetchResponse = (e: Event): void => {
      const response = JSON.parse((e as CustomEvent).detail) as {
        id: string;
        response?: any;
        error?: string;
      };
      if (response.id !== id) return;
      window.clearTimeout(timeout);
      window.removeEventListener('proxyFetchResponse', onFetchResponse);
      if (response.error != null) {
        reject(new Error(response.error));
        return;
      }
      resolve(response.response);
    };
    timeout = window.setTimeout(() => {
      window.removeEventListener('proxyFetchResponse', onFetchResponse);
      reject(new Error('proxy fetch timed out'));
    }, 5000);
    window.addEventListener('proxyFetchResponse', onFetchResponse);
    window.dispatchEvent(
      new CustomEvent('proxyFetchRequest', {
        detail: encoded,
      }),
    );
  });
};

const buildInnertubeHeaders = (ytcfg: YtCfg) => {
  const time = Math.floor(Date.now() / 1000);
  const sapisid = getCookie('__Secure-3PAPISID') || getCookie('SAPISID');
  const auth = sapisid ? `SAPISIDHASH ${time}_${sha1(`${time} ${sapisid} ${currentDomain}`)}` : null;
  const authuser = (ytcfg as any)?.data_?.SESSION_INDEX;
  const visitorId = (ytcfg as any)?.data_?.VISITOR_DATA ?? ytcfg.data_.INNERTUBE_CONTEXT?.client?.visitorData;
  const clientName = (ytcfg as any)?.data_?.INNERTUBE_CLIENT_NAME;
  const clientVersion = (ytcfg as any)?.data_?.INNERTUBE_CLIENT_VERSION;
  const pageId = (ytcfg as any)?.data_?.DELEGATED_SESSION_ID;
  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      ...(authuser != null ? { 'X-Goog-AuthUser': String(authuser) } : {}),
      ...(visitorId != null ? { 'X-Goog-Visitor-Id': String(visitorId) } : {}),
      ...(clientName != null ? { 'X-Youtube-Client-Name': String(clientName) } : {}),
      ...(clientVersion != null ? { 'X-Youtube-Client-Version': String(clientVersion) } : {}),
      ...(pageId != null ? { 'X-Goog-PageId': String(pageId) } : {}),
      'X-Origin': currentDomain,
      ...(auth != null ? { Authorization: auth } : {}),
    },
    method: 'POST' as const,
    mode: 'same-origin' as const,
  };
};

/** Register a client to the interceptor. */
const registerClient = (port: Chat.Port, getInitialData = false): void => {
  if (interceptor.clients.some((client) => client.name === port.name)) {
    console.debug('Client already registered. Not registering', { interceptor, port });
    port.postMessage({
      type: 'registerClientResponse',
      success: false,
      failReason: 'Client already registered',
    });
    return;
  }

  // Assign pseudo-unique name
  port.name = `${Date.now()}${Math.random()}`;

  // Unregister client when port disconnects
  port.onDisconnect.addListener(() => {
    const i = interceptor.clients.findIndex((clientPort) => clientPort.name === port.name);
    if (i < 0) {
      console.error('Failed to unregister client', { port, interceptor });
      return;
    }
    interceptor.clients.splice(i, 1);
    console.debug('Unregister client successful', { port, interceptor });
  });

  // Add client to array
  interceptor.clients.push(port);
  console.debug('Register client successful', { port, interceptor });
  port.postMessage({
    type: 'registerClientResponse',
    success: true,
  });

  if (getInitialData) {
    const callback = (): void => {
      if (isYtcInterceptor(interceptor) && interceptor.queue.initialDataReady.get()) {
        const selfChannel = interceptor.queue.selfChannel.get();
        const videoInfo = interceptor.queue.videoInfo.get();
        if (!videoInfo) console.debug('Video info not ready', { port, interceptor });
        const payload: Chat.InitialData = {
          type: 'initialData',
          initialData: interceptor.queue.getInitialData(),
          selfChannel:
            selfChannel != null
              ? {
                  name: selfChannel.authorName?.simpleText ?? '',
                  channelId: selfChannel.authorExternalChannelId ?? '',
                }
              : null,
          videoInfo,
        };
        port.postMessage(payload);
        console.debug('Sent initial data', { port, interceptor, payload });
        unsubber();
      }
    };
    const unsubber = (interceptor as Chat.YtcInterceptor).queue.initialDataReady.subscribe(() =>
      setTimeout(callback, 0),
    );
    callback();
  }
};

/** Parses the given YTC json response, and adds it to the queue of the interceptor that sent it. */
export const processMessageChunk = (json: string): void => {
  if (!isYtcInterceptor(interceptor, true, 'processMessageChunk', json)) return;

  if (interceptor.clients.length < 1) {
    console.debug('No clients', { interceptor, json });
    return;
  }

  interceptor.queue.addJsonToQueue(json, false, interceptor);
};

/** Parses a sent message and adds a fake message entry. */
export const processSentMessage = (json: string): void => {
  if (!isYtcInterceptor(interceptor, true, 'processSentMessage', json)) return;

  const fakeJson: Ytc.SentChatItemAction = JSON.parse(json);
  const fakeChunk: Ytc.RawResponse = {
    continuationContents: {
      liveChatContinuation: {
        continuations: [
          {
            timedContinuationData: {
              timeoutMs: 0,
            },
          },
        ],
        actions: fakeJson.actions,
      },
    },
  };
  interceptor.queue.addJsonToQueue(JSON.stringify(fakeChunk), false, interceptor, true);
};

/** Parses and sets initial message data and metadata. */
export const setInitialData = (json: string, info: SimpleVideoInfo | null): void => {
  if (!isYtcInterceptor(interceptor, true, 'setInitialData', json)) return;

  interceptor.queue.addJsonToQueue(json, true, interceptor);

  const parsedJson = JSON.parse(json);

  const actionPanel = (parsedJson?.continuationContents?.liveChatContinuation || parsedJson?.contents?.liveChatRenderer)
    ?.actionPanel;

  const user = actionPanel?.liveChatMessageInputRenderer?.sendButton?.buttonRenderer?.serviceEndpoint
    ?.sendLiveChatMessageEndpoint?.actions[0]?.addLiveChatTextMessageFromTemplateAction?.template
    ?.liveChatTextMessageRenderer ?? {
    authorName: {
      simpleText: parsedJson?.continuationContents?.liveChatContinuation?.viewerName,
    },
  };

  interceptor.queue.selfChannel.set(user);
  interceptor.queue.videoInfo.set(info);
  interceptor.queue.initialDataReady.set(true);
};

/** Updates the player progress of the queue of the interceptor. */
export const updatePlayerProgress = (playerProgress: number): void => {
  if (!isYtcInterceptor(interceptor, true, 'updatePlayerProgress', playerProgress)) return;
  interceptor.queue.updatePlayerProgress(playerProgress, true);
};

/** Sets the theme of the interceptor, and sends the new theme to any currently registered clients. */
export const setTheme = (dark: boolean): void => {
  if (!isYtcInterceptor(interceptor, true, 'setTheme', dark)) return;

  interceptor.dark = dark;
  interceptor.clients.forEach((port) => port.postMessage({ type: 'themeUpdate', dark }));
  console.debug(`Set dark theme to ${dark.toString()}`);
};

/** Returns a message with the theme of the interceptor. */
const getTheme = (port: Chat.Port): void => {
  if (!isYtcInterceptor(interceptor, true, 'getTheme', port)) return;

  port.postMessage({ type: 'themeUpdate', dark: interceptor.dark });
};

const executeChatAction = async (
  message: Ytc.ParsedMessage,
  ytcfg: YtCfg,
  action: ChatUserActions,
  reportOption?: ChatReportUserOptions,
  actionOption?: string,
): Promise<void> => {
  let success = true;
  if (message.params == null) {
    success = false;
  }
  try {
    if (message.params == null) {
      throw new Error('Missing context menu params for message');
    }
    const apiKey = ytcfg.data_.INNERTUBE_API_KEY;
    const contextMenuUrl =
      `${currentDomain}/youtubei/v1/live_chat/get_item_context_menu?params=` +
      `${encodeURIComponent(message.params)}&pbj=1&key=${apiKey}&prettyPrint=false`;
    const baseContext = ytcfg.data_.INNERTUBE_CONTEXT;
    const heads = buildInnertubeHeaders(ytcfg);
    const cloneBaseContext = (): any => JSON.parse(JSON.stringify(baseContext));
    const buildContextMenuContext = (): any => {
      const context = cloneBaseContext();
      delete context.clickTracking;
      return context;
    };
    const contextMenuContext = buildContextMenuContext();
    const res = await proxyFetch(contextMenuUrl, {
      ...heads,
      body: JSON.stringify({ context: contextMenuContext }),
    });
    type EndpointProp =
      | 'moderateLiveChatEndpoint'
      | 'getReportFormEndpoint'
      | 'liveChatActionEndpoint'
      | 'manageLiveChatUserEndpoint';
    function getText(text: any): string {
      if (typeof text?.simpleText === 'string') return text.simpleText;
      if (Array.isArray(text?.runs)) {
        return text.runs
          .map((r: any) => r?.text)
          .filter(Boolean)
          .join('');
      }
      return '';
    }
    function walkObjects(root: any, visitor: (current: any) => void): void {
      const queue = [root];
      const visited = new Set<any>();
      while (queue.length > 0) {
        const current = queue.shift();
        if (current == null || typeof current !== 'object' || visited.has(current)) continue;
        visited.add(current);
        visitor(current);
        for (const value of Object.values(current)) {
          if (value != null && typeof value === 'object') {
            queue.push(value);
          }
        }
      }
    }
    function findServiceEndpoint(root: any, prop: EndpointProp): any | null {
      let found: any | null = null;
      walkObjects(root, (current) => {
        if (found != null) return;
        if (typeof current?.[prop]?.params === 'string') {
          found = current;
        }
      });
      return found;
    }
    function parseServiceEndpoint(serviceEndpoint: any, prop: EndpointProp): { params: string; context: any } {
      if (typeof serviceEndpoint?.[prop]?.params !== 'string') {
        throw new Error(`Missing service endpoint params for ${prop}`);
      }
      const {
        clickTrackingParams,
        [prop]: { params },
      } = serviceEndpoint;
      const clonedContext = cloneBaseContext();
      delete clonedContext.clickTracking;
      if (clickTrackingParams != null) {
        clonedContext.clickTracking = {
          clickTrackingParams,
        };
      }
      return {
        params,
        context: clonedContext,
      };
    }
    function findMenuEndpoint(
      root: any,
      iconType: string,
      prop: EndpointProp,
      labelMatches: Array<(label: string) => boolean> = [],
    ): any | null {
      const candidates: Array<{ iconType?: string; label: string; endpoint: any }> = [];
      walkObjects(root, (current) => {
        const menu = current?.menuServiceItemRenderer;
        if (menu == null) return;
        const endpoint = menu?.serviceEndpoint;
        if (typeof endpoint?.[prop]?.params === 'string') {
          candidates.push({
            iconType: menu?.icon?.iconType,
            label: getText(menu?.text),
            endpoint,
          });
        }
      });
      for (const c of candidates) {
        if (c.iconType === iconType) return c.endpoint;
      }
      for (const c of candidates) {
        const label = c.label.toLowerCase();
        if (labelMatches.some((matcher) => matcher(label))) {
          return c.endpoint;
        }
      }
      return null;
    }
    function findNestedOptionEndpoint(
      root: any,
      iconType: string,
      optionLabel: string | undefined,
      prop: EndpointProp,
    ): any | null {
      if (optionLabel == null) {
        throw new Error(`Missing option label for ${iconType}`);
      }
      let found: any | null = null;
      const normalizedOptionLabel = optionLabel.toLowerCase();
      walkObjects(root, (current) => {
        if (found != null) return;
        const menu = current?.menuServiceItemRenderer;
        if (menu?.icon?.iconType !== iconType) return;
        walkObjects(menu, (menuNode) => {
          if (found != null) return;
          const option = menuNode?.optionSelectableItemRenderer;
          const endpoint = option?.submitEndpoint;
          if (typeof endpoint?.[prop]?.params !== 'string') return;
          if (getText(option?.text).toLowerCase() === normalizedOptionLabel) {
            found = endpoint;
          }
        });
      });
      return found;
    }
    async function postEndpoint(serviceEndpoint: any, prop: EndpointProp, apiPath: string): Promise<any> {
      const { params, context } = parseServiceEndpoint(serviceEndpoint, prop);
      const actionResponse = await proxyFetch(
        `${currentDomain}/youtubei/v1/${apiPath}?key=${apiKey}&prettyPrint=false`,
        {
          ...heads,
          body: JSON.stringify({
            params,
            context,
          }),
        },
      );
      if (actionResponse?.error != null || actionResponse?.success === false) {
        throw new Error(`${apiPath} request failed`);
      }
      return actionResponse;
    }
    if (action === ChatUserActions.BLOCK) {
      const serviceEndpoint = findMenuEndpoint(res, 'BLOCK', 'moderateLiveChatEndpoint', [
        (label) => label.includes('block'),
      ]);
      if (serviceEndpoint == null) {
        throw new Error('Could not find block endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'moderateLiveChatEndpoint', 'live_chat/moderate');
    } else if (action === ChatUserActions.DELETE_MESSAGE) {
      const serviceEndpoint = findMenuEndpoint(res, 'DELETE', 'moderateLiveChatEndpoint', [
        (label) =>
          label.includes('remove') || label.includes('delete') || label.includes('retract') || label.includes('unsend'),
      ]);
      if (serviceEndpoint == null) {
        throw new Error('Could not find delete endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'moderateLiveChatEndpoint', 'live_chat/moderate');
    } else if (action === ChatUserActions.PIN_MESSAGE) {
      const serviceEndpoint = findMenuEndpoint(res, 'KEEP', 'liveChatActionEndpoint', [
        (label) => label.includes('pin'),
      ]);
      if (serviceEndpoint == null) {
        throw new Error('Could not find pin endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'liveChatActionEndpoint', 'live_chat/live_chat_action');
    } else if (action === ChatUserActions.TIMEOUT_USER) {
      const serviceEndpoint = findNestedOptionEndpoint(res, 'HOURGLASS', actionOption, 'moderateLiveChatEndpoint');
      if (serviceEndpoint == null) {
        throw new Error('Could not find timeout endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'moderateLiveChatEndpoint', 'live_chat/moderate');
    } else if (action === ChatUserActions.HIDE_USER) {
      const serviceEndpoint = findMenuEndpoint(res, 'REMOVE_CIRCLE', 'moderateLiveChatEndpoint', [
        (label) => label.includes('hide user'),
      ]);
      if (serviceEndpoint == null) {
        throw new Error('Could not find hide endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'moderateLiveChatEndpoint', 'live_chat/moderate');
    } else if (action === ChatUserActions.UNHIDE_USER) {
      const serviceEndpoint = findMenuEndpoint(res, 'ADD_CIRCLE', 'moderateLiveChatEndpoint', [
        (label) => label.includes('unhide user'),
      ]);
      if (serviceEndpoint == null) {
        throw new Error('Could not find unhide endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'moderateLiveChatEndpoint', 'live_chat/moderate');
    } else if (action === ChatUserActions.ADD_MODERATOR) {
      const serviceEndpoint = findNestedOptionEndpoint(
        res,
        'ADD_MODERATOR',
        actionOption,
        'manageLiveChatUserEndpoint',
      );
      if (serviceEndpoint == null) {
        throw new Error('Could not find add moderator endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'manageLiveChatUserEndpoint', 'live_chat/manage_user');
    } else if (action === ChatUserActions.REMOVE_MODERATOR) {
      const serviceEndpoint = findMenuEndpoint(res, 'REMOVE_MODERATOR', 'manageLiveChatUserEndpoint', [
        (label) => label.includes('remove') && label.includes('moderator'),
      ]);
      if (serviceEndpoint == null) {
        throw new Error('Could not find remove moderator endpoint in context menu');
      }
      await postEndpoint(serviceEndpoint, 'manageLiveChatUserEndpoint', 'live_chat/manage_user');
    } else if (action === ChatUserActions.REPORT_USER) {
      const serviceEndpoint =
        findMenuEndpoint(res, 'FLAG', 'getReportFormEndpoint', [(label) => label.includes('report')]) ??
        findServiceEndpoint(res, 'getReportFormEndpoint');
      if (serviceEndpoint == null) {
        throw new Error('Could not find report endpoint in context menu');
      }
      const { params, context } = parseServiceEndpoint(serviceEndpoint, 'getReportFormEndpoint');
      const modal = await proxyFetch(`${currentDomain}/youtubei/v1/flag/get_form?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context,
        }),
      });
      const options =
        modal?.actions?.[0]?.openPopupAction?.popup?.reportFormModalRenderer?.optionsSupportedRenderers?.optionsRenderer
          ?.items;
      if (!Array.isArray(options) || options.length < 1) {
        throw new Error('Report options are missing');
      }
      const reportIndex = chatReportUserOptions.findIndex((d) => d.value === reportOption);
      const index = reportIndex >= 0 && reportIndex < options.length ? reportIndex : 0;
      const submitEndpoint = options[index]?.optionSelectableItemRenderer?.submitEndpoint;
      const clickTrackingParams = submitEndpoint?.clickTrackingParams;
      const flagAction = submitEndpoint?.flagEndpoint?.flagAction;
      if (flagAction == null) {
        throw new Error('Report submit endpoint is missing');
      }
      if (clickTrackingParams != null) {
        context.clickTracking = {
          clickTrackingParams,
        };
      }
      const flagResponse = await proxyFetch(`${currentDomain}/youtubei/v1/flag/flag?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          action: flagAction,
          context,
        }),
      });
      if (flagResponse?.error != null || flagResponse?.success === false) {
        throw new Error('Report request failed');
      }
    } else {
      throw new Error(`Unknown chat action: ${action as string}`);
    }
  } catch (e) {
    console.debug('Error executing chat action', e);
    success = false;
  }

  interceptor.clients.forEach((clientPort) =>
    clientPort.postMessage({
      type: 'chatUserActionResponse',
      action: action,
      message,
      success,
    }),
  );
};

const fetchReplyThread = async (requestId: string, params: string, ytcfg: YtCfg, isReplay: boolean): Promise<void> => {
  let success = true;
  let replies: Ytc.ParsedMessage[] = [];
  let error: string | undefined;
  try {
    const baseContext = ytcfg.data_.INNERTUBE_CONTEXT;
    const heads = buildInnertubeHeaders(ytcfg);
    const panelRes = await proxyFetch(`${currentDomain}/youtubei/v1/get_panel?prettyPrint=false`, {
      ...heads,
      body: JSON.stringify({
        context: baseContext,
        panelId: replyThreadPanelTag,
        params,
      }),
    });
    const items: any[] =
      panelRes?.content?.engagementPanelSectionListRenderer?.content?.sectionListRenderer?.contents?.[0]
        ?.liveChatItemDisplayListRenderer?.items ?? [];
    // Reuse parseChatResponse so replies come out shaped identically to live chat messages.
    const fakeChunk = JSON.stringify({
      continuationContents: {
        liveChatContinuation: {
          continuations: [{ timedContinuationData: { timeoutMs: 0 } }],
          actions: items.map((item: any) => ({ addChatItemAction: { item } })),
        },
      },
    });
    const chunk = parseChatResponse(fakeChunk, isReplay);
    replies = (chunk?.messages ?? []) as Ytc.ParsedMessage[];
  } catch (e) {
    success = false;
    error = String(e);
  }

  interceptor.clients.forEach((clientPort) =>
    clientPort.postMessage({
      type: 'replyThreadResponse',
      requestId,
      success,
      replies,
      error,
    }),
  );
};

export const initInterceptor = (source: Chat.InterceptorSource, ytcfg: YtCfg, isReplay?: boolean): void => {
  if (source === 'ytc') {
    const queue = ytcQueue(isReplay);
    let queueUnsub: Unsubscriber | undefined;
    const ytcInterceptor: Chat.YtcInterceptor = {
      ...interceptor,
      source: 'ytc',
      dark: false,
      queue,
      queueUnsub,
    };
    ytcInterceptor.queueUnsub = queue.latestAction.subscribe((latestAction) => {
      if (!latestAction) return;
      interceptor.clients.forEach((port) => port.postMessage(latestAction));
    });
    interceptor = ytcInterceptor;
  } else {
    interceptor.source = source;
  }

  chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message: Chat.BackgroundMessage) => {
      switch (message.type) {
        case 'registerClient':
          registerClient(port, message.getInitialData);
          break;
        case 'getTheme':
          getTheme(port);
          break;
        case 'executeChatAction':
          executeChatAction(message.message, ytcfg, message.action, message.reportOption, message.actionOption).catch(
            console.error,
          );
          break;
        case 'fetchReplyThread':
          fetchReplyThread(message.requestId, message.params, ytcfg, isReplay ?? false).catch(console.error);
          break;
        case 'ping':
          port.postMessage({ type: 'ping' });
          break;
        default:
          console.error('Unknown message type', port, message);
          break;
      }
    });
  });
};
