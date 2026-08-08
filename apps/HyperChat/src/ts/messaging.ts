import type { Unsubscriber } from './queue';
import { ytcQueue } from './queue';
import { chatReportUserOptions, ChatUserActions, ChatReportUserOptions, replyThreadPanelTag, currentDomain } from '../ts/chat-constants';
import { parseChatResponse } from './chat-parser';
import type { Chat } from './typings/chat';
import sha1 from 'sha-1';

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
    window.dispatchEvent(new CustomEvent('proxyFetchRequest', {
      detail: encoded
    }));
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
      ...(auth != null ? { Authorization: auth } : {})
    },
    method: 'POST' as const,
    mode: 'same-origin' as const
  };
};

/** Register a client to the interceptor. */
const registerClient = (
  port: Chat.Port,
  getInitialData = false
): void => {
  if (interceptor.clients.some((client) => client.name === port.name)) {
    console.debug(
      'Client already registered. Not registering',
      { interceptor, port }
    );
    port.postMessage(
      {
        type: 'registerClientResponse',
        success: false,
        failReason: 'Client already registered'
      }
    );
    return;
  }

  // Assign pseudo-unique name
  port.name = `${Date.now()}${Math.random()}`;

  // Unregister client when port disconnects
  port.onDisconnect.addListener(() => {
    const i = interceptor.clients.findIndex(
      (clientPort) => clientPort.name === port.name
    );
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
  port.postMessage(
    {
      type: 'registerClientResponse',
      success: true
    }
  );

  if (getInitialData && isYtcInterceptor(interceptor)) {
    const selfChannel = interceptor.queue.selfChannel.get();
    const payload: Chat.InitialData = {
      type: 'initialData',
      initialData: interceptor.queue.getInitialData(),
      selfChannel: selfChannel != null
        ? {
            name: selfChannel.authorName?.simpleText ?? '',
            channelId: selfChannel.authorExternalChannelId ?? ''
          }
        : null
    };
    port.postMessage(payload);
    console.debug('Sent initial data', { port, interceptor, payload });
  }
};

/**
 * Parses the given YTC json response, and adds it to the queue of the
 * interceptor that sent it.
 */
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
        continuations: [{
          timedContinuationData: {
            timeoutMs: 0
          }
        }],
        actions: fakeJson.actions
      }
    }
  };
  interceptor.queue.addJsonToQueue(JSON.stringify(
    fakeChunk
  ), false, interceptor, true);
};

/** Parses and sets initial message data and metadata. */
export const setInitialData = (json: string): void => {
  if (!isYtcInterceptor(interceptor, true, 'setInitialData', json)) return;

  interceptor.queue.addJsonToQueue(json, true, interceptor);

  const parsedJson = JSON.parse(json);

  const actionPanel = (parsedJson?.continuationContents?.liveChatContinuation ||
    parsedJson?.contents?.liveChatRenderer)
    ?.actionPanel;

  const user = actionPanel?.liveChatMessageInputRenderer
    ?.sendButton?.buttonRenderer?.serviceEndpoint
    ?.sendLiveChatMessageEndpoint?.actions[0]
    ?.addLiveChatTextMessageFromTemplateAction?.template
    ?.liveChatTextMessageRenderer ?? {
    authorName: {
      simpleText: parsedJson?.continuationContents?.liveChatContinuation?.viewerName
    }
  };

  interceptor.queue.selfChannel.set(user);
};

/** Updates the player progress of the queue of the interceptor. */
export const updatePlayerProgress = (playerProgress: number): void => {
  if (!isYtcInterceptor(interceptor, true, 'updatePlayerProgress', playerProgress)) return;
  interceptor.queue.updatePlayerProgress(playerProgress, true);
};

/**
 * Sets the theme of the interceptor, and sends the new theme to any currently
 * registered clients.
 */
export const setTheme = (dark: boolean): void => {
  if (!isYtcInterceptor(interceptor, true, 'setTheme', dark)) return;

  interceptor.dark = dark;
  interceptor.clients.forEach(
    (port) => port.postMessage({ type: 'themeUpdate', dark })
  );
  console.debug(`Set dark theme to ${dark.toString()}`);
};

/** Returns a message with the theme of the interceptor. */
const getTheme = (port: Chat.Port): void => {
  if (!isYtcInterceptor(interceptor, true, 'getTheme', port)) return;

  port.postMessage({ type: 'themeUpdate', dark: interceptor.dark });
};

// TODO: Figure this out when doing MV3 for LTL
const sendLtlMessage = (message: Chat.LtlMessage): void => {
  interceptor.clients.forEach(
    (clientPort) => clientPort.postMessage({ type: 'ltlMessage', message })
  );
};

const executeChatAction = async (
  message: Ytc.ParsedMessage,
  ytcfg: YtCfg,
  action: ChatUserActions,
  reportOption?: ChatReportUserOptions
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
    const contextMenuUrl = `${currentDomain}/youtubei/v1/live_chat/get_item_context_menu?params=` +
      `${encodeURIComponent(message.params)}&pbj=1&key=${apiKey}&prettyPrint=false`;
    const baseContext = ytcfg.data_.INNERTUBE_CONTEXT;
    const heads = buildInnertubeHeaders(ytcfg);
    const contextMenuContext = JSON.parse(JSON.stringify(baseContext));
    const res = await proxyFetch(contextMenuUrl, {
      ...heads,
      body: JSON.stringify({ context: contextMenuContext })
    });
    function findServiceEndpoint(root: any, prop: string): any | null {
      const queue = [root];
      const visited = new Set<any>();
      while (queue.length > 0) {
        const current = queue.shift();
        if (current == null || typeof current !== 'object' || visited.has(current)) continue;
        visited.add(current);
        if (typeof current?.[prop]?.params === 'string') {
          return current;
        }
        for (const value of Object.values(current)) {
          if (value != null && typeof value === 'object') {
            queue.push(value);
          }
        }
      }
      return null;
    }
    function parseServiceEndpoint(serviceEndpoint: any, prop: string): { params: string, context: any } {
      if (typeof serviceEndpoint?.[prop]?.params !== 'string') {
        throw new Error(`Missing service endpoint params for ${prop}`);
      }
      const { clickTrackingParams, [prop]: { params } } = serviceEndpoint;
      const clonedContext = JSON.parse(JSON.stringify(baseContext));
      if (clickTrackingParams != null) {
        clonedContext.clickTracking = {
          clickTrackingParams
        };
      }
      return {
        params,
        context: clonedContext
      };
    }
    function findDeleteMessageEndpoint(root: any): any | null {
      const queue = [root];
      const visited = new Set<any>();
      const candidates: Array<{ iconType?: string, label?: string, endpoint: any }> = [];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current == null || typeof current !== 'object' || visited.has(current)) continue;
        visited.add(current);
        const menu = current?.menuServiceItemRenderer;
        const iconType = menu?.icon?.iconType;
        const endpoint = menu?.serviceEndpoint;
        const label = (
          Array.isArray(menu?.text?.runs)
            ? menu.text.runs.map((r: any) => r?.text).filter(Boolean).join('')
            : menu?.text?.simpleText
        ) as string | undefined;
        // Prefer stable identifiers (DELETE icon + moderate endpoint) over localized label text.
        if (typeof endpoint?.moderateLiveChatEndpoint?.params === 'string') {
          candidates.push({ iconType, label, endpoint });
        }
        for (const value of Object.values(current)) {
          if (value != null && typeof value === 'object') {
            queue.push(value);
          }
        }
      }
      for (const c of candidates) {
        if (c.iconType === 'DELETE') return c.endpoint;
      }
      for (const c of candidates) {
        const l = (c.label ?? '').toLowerCase();
        if (l.includes('remove') || l.includes('delete') || l.includes('retract') || l.includes('unsend')) {
          return c.endpoint;
        }
      }
      if (candidates.length === 1) return candidates[0].endpoint;
      return null;
    }
    if (action === ChatUserActions.BLOCK) {
      const serviceEndpoint = findServiceEndpoint(res, 'moderateLiveChatEndpoint');
      if (serviceEndpoint == null) {
        throw new Error('Could not find moderate endpoint in context menu');
      }
      const { params, context } = parseServiceEndpoint(serviceEndpoint, 'moderateLiveChatEndpoint');
      const moderationResponse = await proxyFetch(`${currentDomain}/youtubei/v1/live_chat/moderate?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context
        })
      });
      if (moderationResponse?.error != null || moderationResponse?.success === false) {
        throw new Error('Moderation request failed');
      }
    } else if (action === ChatUserActions.DELETE_MESSAGE) {
      const serviceEndpoint = findDeleteMessageEndpoint(res);
      if (serviceEndpoint == null) {
        throw new Error('Could not find delete endpoint in context menu');
      }
      const { params, context } = parseServiceEndpoint(serviceEndpoint, 'moderateLiveChatEndpoint');
      const moderationResponse = await proxyFetch(`${currentDomain}/youtubei/v1/live_chat/moderate?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context
        })
      });
      if (moderationResponse?.error != null || moderationResponse?.success === false) {
        throw new Error('Moderation request failed');
      }
    } else if (action === ChatUserActions.REPORT_USER) {
      const serviceEndpoint = findServiceEndpoint(res, 'getReportFormEndpoint');
      if (serviceEndpoint == null) {
        throw new Error('Could not find report endpoint in context menu');
      }
      const { params, context } = parseServiceEndpoint(serviceEndpoint, 'getReportFormEndpoint');
      const modal = await proxyFetch(`${currentDomain}/youtubei/v1/flag/get_form?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          params,
          context
        })
      });
      const options = modal?.actions?.[0]
        ?.openPopupAction?.popup?.reportFormModalRenderer
        ?.optionsSupportedRenderers?.optionsRenderer?.items;
      if (!Array.isArray(options) || options.length < 1) {
        throw new Error('Report options are missing');
      }
      const reportIndex = chatReportUserOptions.findIndex(d => d.value === reportOption);
      const index = reportIndex >= 0 && reportIndex < options.length ? reportIndex : 0;
      const submitEndpoint = options[index]?.optionSelectableItemRenderer?.submitEndpoint;
      const clickTrackingParams = submitEndpoint?.clickTrackingParams;
      const flagAction = submitEndpoint?.flagEndpoint?.flagAction;
      if (flagAction == null) {
        throw new Error('Report submit endpoint is missing');
      }
      if (clickTrackingParams != null) {
        context.clickTracking = {
          clickTrackingParams
        };
      }
      const flagResponse = await proxyFetch(`${currentDomain}/youtubei/v1/flag/flag?key=${apiKey}&prettyPrint=false`, {
        ...heads,
        body: JSON.stringify({
          action: flagAction,
          context
        })
      });
      if (flagResponse?.error != null || flagResponse?.success === false) {
        throw new Error('Report request failed');
      }
    }
  } catch (e) {
    console.debug('Error executing chat action', e);
    success = false;
  }

  interceptor.clients.forEach(
    (clientPort) => clientPort.postMessage({
      type: 'chatUserActionResponse',
      action: action,
      message,
      success
    })
  );
};

const fetchReplyThread = async (
  requestId: string,
  params: string,
  ytcfg: YtCfg,
  isReplay: boolean
): Promise<void> => {
  let success = true;
  let replies: Ytc.ParsedMessage[] = [];
  let error: string | undefined;
  try {
    const baseContext = ytcfg.data_.INNERTUBE_CONTEXT;
    const heads = buildInnertubeHeaders(ytcfg);
    const panelRes = await proxyFetch(
      `${currentDomain}/youtubei/v1/get_panel?prettyPrint=false`,
      {
        ...heads,
        body: JSON.stringify({
          context: baseContext,
          panelId: replyThreadPanelTag,
          params
        })
      }
    );
    const items: any[] = panelRes?.content?.engagementPanelSectionListRenderer
      ?.content?.sectionListRenderer?.contents?.[0]
      ?.liveChatItemDisplayListRenderer?.items ?? [];
    // Reuse parseChatResponse so replies come out shaped identically to live chat messages.
    const fakeChunk = JSON.stringify({
      continuationContents: {
        liveChatContinuation: {
          continuations: [{ timedContinuationData: { timeoutMs: 0 } }],
          actions: items.map((item: any) => ({ addChatItemAction: { item } }))
        }
      }
    });
    const chunk = parseChatResponse(fakeChunk, isReplay);
    replies = (chunk?.messages ?? []) as Ytc.ParsedMessage[];
  } catch (e) {
    success = false;
    error = String(e);
  }

  interceptor.clients.forEach(
    (clientPort) => clientPort.postMessage({
      type: 'replyThreadResponse',
      requestId,
      success,
      replies,
      error
    })
  );
};

export const initInterceptor = (
  source: Chat.InterceptorSource,
  ytcfg: YtCfg,
  isReplay?: boolean
): void => {
  if (source === 'ytc') {
    const queue = ytcQueue(isReplay);
    let queueUnsub: Unsubscriber | undefined;
    const ytcInterceptor: Chat.YtcInterceptor = {
      ...interceptor,
      source: 'ytc',
      dark: false,
      queue,
      queueUnsub
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
        case 'sendLtlMessage':
          sendLtlMessage(message.message);
          break;
        case 'executeChatAction':
          executeChatAction(message.message, ytcfg, message.action, message.reportOption).catch(console.error);
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
