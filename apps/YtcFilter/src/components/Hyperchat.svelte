<script lang="ts">
  // @ts-expect-error vite inline css import
  import inline1 from '../stylesheets/scrollbar.css?inline';
  // @ts-expect-error vite inline css import
  import inline2 from '../stylesheets/ui.css?inline';
  // @ts-expect-error vite inline css import
  import inline3 from '../stylesheets/line.css?inline';
  import { onDestroy, onMount, afterUpdate, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import dark from 'smelte/src/dark';
  import WelcomeMessage from './YtcFilterWelcome.svelte';
  import Message from './Message.svelte';
  import PaidMessage from './PaidMessage.svelte';
  import MembershipItem from './MembershipItem.svelte';
  import ReportBanDialog from './ReportBanDialog.svelte';
  import SuperchatViewDialog from './SuperchatViewDialog.svelte';
  import StickyBar from './StickyBar.svelte';
  import {
    // paramsTabId,
    // paramsFrameId,
    // paramsIsReplay,
    Theme,
    YoutubeEmojiRenderMode,
    chatUserActionsItems,
    ChatUserActions,
    isLiveTL
  } from '../ts/chat-constants';
  import '../ts/resize-tracker';
  import {
    buildDeletedObj,
    isAllEmoji,
    isChatMessage,
    isPrivileged,
    responseIsAction,
    useReconnect,
    createPopup,
    getRandomString
  } from '../ts/chat-utils';
  import Button from 'smelte/src/components/Button';
  import {
    theme,
    showOnlyMemberChat,
    showProfileIcons,
    showUsernames,
    showTimestamps,
    showUserBadges,
    // showChatSummary,
    refreshScroll,
    emojiRenderMode,
    useSystemEmojis,
    hoveredItem,
    port,
    selfChannel,
    alertDialog,
    stickySuperchats,
    activeReplyThreadId,
    liveReplyBuffer,
    liveLikeCounts,
    currentProgress,
    enableStickySuperchatBar,
    lastOpenedVersion,
    selfChannelName,
    enableHighlightedMentions,
    currentFilterPreset,
    chatFilterPresets,
    dataTheme,
    videoInfo,
    overrideFilterPresetId,
    ytDark,
    initialSetupDone,
    defaultFilterPresetId,
    autoClear
  } from '../ts/storage';
  import { shouldFilterMessage, saveMessageActions, findSavedMessageActionKey, getSavedMessageDumpActions, getSavedMessageDumpInfo, getAutoActivatedPreset, downloadAsJson, downloadAsTxt, redirectIfInitialSetup, importJsonDump, mergeVideoInfoObjs } from '../ts/ytcf-logic';
  import { handleReplyThreadResponse } from '../ts/chat-actions';
  import { exioButton, exioDropdown, exioIcon } from 'exio/svelte';
  import FullFrame from './FullFrame.svelte';
  import YtcFilterConfirmation from './YtcFilterConfirmation.svelte';
  import { get, writable } from 'svelte/store';
  import html2canvas from 'html2canvas';
  import type { Chat } from '../ts/typings/chat';

  const welcome = { welcome: true, message: { messageId: 'welcome' } };
  type Welcome = typeof welcome;

  const params = new URLSearchParams(window.location.search);
  const paramsTabId = params.get('tabid');
  const paramsFrameId = params.get('frameid');
  const paramsIsReplay = params.get('isReplay');
  const paramsContinuation = params.get('continuation');
  const paramsArchiveKey = params.get('archiveKey');
  const paramsYtDark = params.get('ytDark');
  let embedded = false;
  try {
    embedded = window.self !== window.top;
  } catch (e) {
    embedded = true;
  }

  // const CHAT_HISTORY_SIZE = 150;
  // const TRUNCATE_SIZE = 20;
  let messageActions: Array<Chat.MessageAction | Welcome> = [];
  let overrideActions: Array<Chat.MessageAction | Welcome> = [];
  const messageKeys = new Set<string>();
  let poll: Ytc.ParsedPoll | null;
  let pinned: Ytc.ParsedPinned | null;
  let summary: Ytc.ParsedSummary | null;
  let redirect: Ytc.ParsedRedirect | null;
  // $: hasBanner = poll ?? pinned ?? redirect ?? (summary && $showChatSummary);
  let div: HTMLElement;
  let isAtBottom = true;
  // let truncateInterval: number | undefined;
  const isReplay = paramsIsReplay;
  const smelteDark = dark();
  const initialized = writable(false);
  let messageStorageInitDone = false;

  type MessageBlocker = (a: Chat.MessageAction) => boolean;

  const memberOnlyBlocker: MessageBlocker = (a) => (
    $showOnlyMemberChat && isChatMessage(a) && !isPrivileged(a.message.author.types)
  );

  const emojiSpamBlocker: MessageBlocker = (a) => (
    isChatMessage(a) &&
    $emojiRenderMode !== YoutubeEmojiRenderMode.SHOW_ALL &&
    isAllEmoji(a)
  );

  const duplicateKeyBlocker: MessageBlocker = (a) => {
    const result = messageKeys.has(a.message.messageId);
    messageKeys.add(a.message.messageId);
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const messageBlockers = [memberOnlyBlocker, emojiSpamBlocker];

  const shouldShowMessage = (m: Chat.MessageAction, _forceDisplay = false): boolean => (
    // ((!messageBlockers.some(blocker => blocker(m)) || forceDisplay) && )
    // do not flip the order of the conditions above
    // this gives the duplicateKeyBlocker a chance to add the key
    !duplicateKeyBlocker(m)
  );

  const isWelcome = (m: Chat.MessageAction | Welcome): m is Welcome =>
    'welcome' in m;

  const checkAtBottom = () => {
    isAtBottom =
      Math.ceil(div.clientHeight + div.scrollTop) >= div.scrollHeight - 2;
  };

  const scrollToBottom = () => {
    if (div == null) return;
    div.scrollTop = div.scrollHeight;
  };

  // const checkTruncateMessages = (): void => {
  //   const diff = messageActions.length - CHAT_HISTORY_SIZE;
  //   if (diff > TRUNCATE_SIZE) {
  //     const removed = messageActions.splice(0, diff);
  //     removed.forEach(m => messageKeys.delete(m.message.messageId));
  //   }
  //   messageActions = messageActions;
  // };

  let isReadyToStartFiltering = false;
  const readyToStartFiltering = async () => {
    if (isReadyToStartFiltering) return true;
    await Promise.all([
      chatFilterPresets.ready(),
      defaultFilterPresetId.ready(),
      new Promise(resolve => {
        const interval = setInterval(() => {
          if ($initialized) {
            clearInterval(interval);
            resolve(null);
          }
        }, 10);
      }),
      new Promise(resolve => {
        const interval = setInterval(() => {
          if ($videoInfo !== undefined) {
            clearInterval(interval);
            resolve(null);
          }
        }, 10);
      })
    ]);
    await tick();
    isReadyToStartFiltering = true;
    await tick();
    return true;
  };

  const applyYtcf = async (items: Chat.MessageAction[], forceDisplay = false) => {
    const newItems = [];
    for (const a of items) {
      if (
        (forceDisplay || (await readyToStartFiltering() && shouldFilterMessage(a))) &&
        shouldShowMessage(a, forceDisplay)
      ) {
        newItems.push(a);
      }
    }
    return newItems;
  };

  const newMessages = async (
    messagesAction: Chat.MessagesAction, isInitial: boolean, forceDisplay = false
  ) => {
    // On replays' initial data, only show messages with negative timestamp
    if (isInitial && isReplay) {
      messageActions = [...messageActions, ...(await applyYtcf(filterTickers(messagesAction.messages).filter(
        (a) => a.message.timestamp.startsWith('-')
      ), forceDisplay))];
    } else {
      const applied = (await applyYtcf(filterTickers(messagesAction.messages), forceDisplay));
      messageActions = [...messageActions, ...applied];
    }
    // if (!isInitial) checkTruncateMessages();
  };

  $: if (isAtBottom && overrideActions.length > 0) {
    overrideActions = [];
  }
  const setOverride = () => (overrideActions = messageActions);
  $: if (!isAtBottom) setOverride();

  const onBonk = (bonk: Ytc.ParsedBonk) => {
    const f = (action: typeof messageActions[number]) => {
      if (isWelcome(action)) return;
      if (action.message.author.id === bonk.authorId) {
        action.deleted = { replace: bonk.replacedMessage };
      }
    };
    messageActions.forEach(f);
    overrideActions.forEach(f);
  };

  const filterTickers = (items: Chat.MessageAction[]): Chat.MessageAction[] => {
    const keep: Chat.MessageAction[] = [];
    const discard: Ytc.ParsedTicker[] = [];
    const newLiveReplies: Ytc.ParsedMessage[] = [];
    const trackedThreadId = $activeReplyThreadId;
    items.forEach(item => {
      if ('tickerDuration' in item.message) {
        if (!$stickySuperchats.some(sc => sc.messageId === item.message.messageId)) {
          discard.push(item.message);
        }
      } else {
        keep.push(item);
        if (trackedThreadId && item.message.replyToSuperchat?.threadId === trackedThreadId) {
          newLiveReplies.push(item.message);
        }
      }
    });
    if ($enableStickySuperchatBar && discard.length) {
      $stickySuperchats = [
        ...discard,
        ...$stickySuperchats
      ];
    }
    if (newLiveReplies.length > 0) {
      const combined = [...$liveReplyBuffer, ...newLiveReplies];
      $liveReplyBuffer = combined.length > 200
        ? combined.slice(combined.length - 200)
        : combined;
    }
    return keep;
  };

  const stickyLikeKeys = (sticky: Ytc.ParsedTicker[]): Set<string> => {
    const keys = new Set<string>();
    sticky.forEach(sc => {
      if (sc.likeCountEntityKey) keys.add(sc.likeCountEntityKey);
    });
    return keys;
  };

  const pruneLikeCounts = (sticky: Ytc.ParsedTicker[]) => {
    const current = get(liveLikeCounts);
    if (current.size === 0) return;
    const keep = stickyLikeKeys(sticky);
    let mutated = false;
    const next = new Map(current);
    next.forEach((_, k) => {
      if (!keep.has(k)) {
        next.delete(k);
        mutated = true;
      }
    });
    if (mutated) liveLikeCounts.set(next);
  };

  $: pruneLikeCounts($stickySuperchats);

  const onDelete = (deletion: Ytc.ParsedDeleted) => {
    const f = (action: typeof messageActions[number]) => {
      if (isWelcome(action)) return false;
      if (action.message.messageId === deletion.messageId) {
        action.deleted = buildDeletedObj(deletion, action.message.message);
        return true;
      }
      return false;
    };
    const changed = messageActions.some(f);
    const overrideChanged = overrideActions.some(f);
    if (changed) messageActions = messageActions;
    if (overrideChanged) overrideActions = overrideActions;
  };

  const onChatAction = (action: Chat.Actions, isInitial = false) => {
    if (paramsArchiveKey) return;
    switch (action.type) {
      case 'messages':
        newMessages(action, isInitial);
        break;
      case 'bonk':
        onBonk(action.bonk);
        if (overrideActions.length > 0) {
          setOverride();
        }
        break;
      case 'delete':
        onDelete(action.deletion);
        if (overrideActions.length > 0) {
          setOverride();
        }
        break;
      case 'summary':
        summary = action;
        break;
      case 'redirect':
        redirect = action;
        break;
      case 'poll':
        poll = action;
        break;
      case 'pin':
        pinned = action;
        newMessages({
          type: 'messages',
          messages: [{
            message: action.item.contents
          }]
        }, false, false);
        break;
      case 'unpin':
        if (action.targetActionId) {
          if (action.targetActionId === pinned?.actionId) {
            pinned = null;
          }
          if (action.targetActionId === summary?.actionId) {
            summary = null;
          }
          if (action.targetActionId === poll?.actionId) {
            poll = null;
          }
          if (action.targetActionId === redirect?.actionId) {
            redirect = null;
          }
        } else {
          pinned = null;
        }
        break;
      case 'playerProgress':
        $currentProgress = action.playerProgress;
        break;
      case 'forceUpdate':
        // messageKeys.clear();
        // messageActions = [...action.messages].filter(shouldShowMessage);
        // if (action.showWelcome) {
        //   messageActions = [...messageActions]; //, welcome];
        // }
        newMessages({ type: 'messages', messages: action.messages }, false);
        break;
      case 'likeCounts': {
        const knownKeys = stickyLikeKeys($stickySuperchats);
        if (knownKeys.size === 0) break;
        let next: Map<string, number> | null = null;
        for (const [key, count] of Object.entries(action.counts)) {
          if (knownKeys.has(key) && $liveLikeCounts.get(key) !== count) {
            if (!next) next = new Map($liveLikeCounts);
            next.set(key, count);
          }
        }
        if (next) $liveLikeCounts = next;
        break;
      }
    }
  };

  const updateTheme = (theme: Theme, dataTheme: string, ytDark = false) => {
    if (theme === Theme.YOUTUBE) {
      smelteDark.set(ytDark);
      return;
    }
    smelteDark.set(dataTheme === 'dark');
  };

  const loadArchive = async (key: string) => {
    archiveEmbedFrame = '';
    await tick();
    if (!key) return;
    const data = await getSavedMessageDumpActions(key);
    if (!data) return;
    const paramsClone = new URLSearchParams();
    paramsClone.set('archiveKey', key);
    paramsClone.set('ytDark', $ytDark.toString());
    paramsClone.set('tabid', paramsTabId!);
    paramsClone.set('frameid', paramsFrameId!);
    archiveEmbedFrame = 'https://www.youtube.com/embed/ytcfilter_embed?' + paramsClone.toString();
  };

  const onPortMessage = (response: Chat.BackgroundResponse) => {
    if (responseIsAction(response)) {
      onChatAction(response);
      return;
    }
    switch (response.type) {
      case 'initialData':
        response.initialData.forEach((action) => {
          onChatAction(action, true);
        });
        $selfChannel = response.selfChannel;
        if (!paramsArchiveKey) $videoInfo = mergeVideoInfoObjs($videoInfo, response.videoInfo);
        $initialized = true;
        break;
      case 'themeUpdate':
        $ytDark = response.dark;
        break;
      case 'chatUserActionResponse':
        if (response.success && response.action === ChatUserActions.DELETE_MESSAGE) {
          onDelete({
            messageId: response.message.messageId,
            replacedMessage: [],
            pending: true
          });
          break;
        }
        $alertDialog = {
          title: response.success ? 'Success!' : 'Error',
          message: chatUserActionsItems.find(v => v.value === response.action)
            ?.messages[response.success ? 'success' : 'error'] ?? '',
          color: response.success ? 'primary' : 'error'
        };
        if (response.success) {
          messageActions = messageActions.filter(
            (a) => {
              if (isWelcome(a)) return true;
              const r = a.message.author.id !== response.message.author.id;
              if (!r) {
                messageKeys.delete(a.message.messageId);
              }
              return r;
            }
          );
        }
        break;
      case 'registerClientResponse':
        break;
      case 'ping':
        break;
      case 'replyThreadResponse':
        handleReplyThreadResponse(response);
        break;
      default:
        console.error('Unknown payload type', { port, response });
        break;
    }
  };

  $: document.title = $videoInfo?.video?.title ? $videoInfo.video.title : 'YtcFilter';

  const postMessageListener = (event: any) => {
    if (event.data.type === 'loadArchiveRequest') {
      loadArchive(event.data.key);
    }
  };

  const styleElem = document.createElement('style');

  // Doesn't work well with onMount, so onLoad will have to do
  // Update: use onMount because hc now mounts in content script
  const onLoad = (): (() => void) | undefined => {
    document.head.appendChild(styleElem);
    styleElem.innerHTML = `
      ${inline1}
      ${inline2}
      ${inline3}
    `;
    window.addEventListener('message', postMessageListener);
    $lastOpenedVersion = __VERSION__;
    document.body.classList.add('overflow-hidden');

    if (paramsTabId == null || paramsFrameId == null || paramsTabId.length < 1 || paramsFrameId.length < 1) {
      console.error('No tabId or frameId found from params');
      if (paramsArchiveKey) $initialized = true;
      return;
    }

    const frameInfo = {
      tabId: parseInt(paramsTabId),
      frameId: parseInt(paramsFrameId)
    };

    let hasRun = false;
    $port = useReconnect(() => {
      const port = chrome.runtime.connect({
        name: JSON.stringify(frameInfo)
      }) as Chat.Port;

      port.onMessage.addListener(onPortMessage);

      port.postMessage({
        type: 'registerClient',
        getInitialData: true
      });
      if (paramsArchiveKey) $initialized = true;
      else {
        if (!hasRun) {
          port.postMessage({
            type: 'getTheme'
          });
        }
      }
      hasRun = true;

      return port;
    });

    return () => $port?.destroy?.();
  };

  const onRefresh = () => {
    if (isAtBottom) {
      scrollToBottom();
    }
    tick().then(checkAtBottom);
  };

  $: if ($refreshScroll) {
    onRefresh();
    $refreshScroll = false;
  }

  afterUpdate(onRefresh);

  onDestroy(() => {
    $port?.disconnect();
    window.removeEventListener('message', postMessageListener);
    styleElem.remove();
    // if (truncateInterval) window.clearInterval(truncateInterval);
  });

  $: updateTheme($theme, $dataTheme, $ytDark);
  // Scroll to bottom when any of these settings change
  $: ((..._a: any[]) => { scrollToBottom(); })(
    $showProfileIcons, $showUsernames, $showTimestamps, $showUserBadges
  );

  const containerClass = 'hyperchat-root h-screen w-screen text-black dark:text-white bg-white bg-ytbg-light dark:bg-ytbg-dark flex flex-col justify-between max-w-none';

  const isSuperchat = (action: Chat.MessageAction) => (action.message.superChat ?? action.message.superSticker);
  const isMembership = (action: Chat.MessageAction) => (action.message.membership ?? action.message.membershipGiftPurchase);
  const isMessage = (action: Chat.MessageAction | Welcome): action is Chat.MessageAction =>
    (!isWelcome(action) && !isSuperchat(action) && !isMembership(action));

  $: $useSystemEmojis, onRefresh();

  const setHover = (action: Chat.MessageAction | Welcome | null) => {
    if (action == null) $hoveredItem = null;
    else if (!('welcome' in action)) $hoveredItem = action.message.messageId;
  };

  const clearStickySuperchats = () => {
    $stickySuperchats = [];
  };
  $: if (!$enableStickySuperchatBar) clearStickySuperchats();

  let topBarSize = 0;
  let topBar: HTMLDivElement | undefined;
  const topBarResized = () => {
    setTimeout(() => {
      if (topBar) {
        topBarSize = topBar.clientHeight;
      }
    }, 350);
  };
  $: $enableStickySuperchatBar, topBarResized(); // hasBanner

  const isMention = (msg: Ytc.ParsedMessage) => {
    return $selfChannelName &&
      msg.message
        .reduce((text, run) =>
          text + ((run.type === 'text' || run.type === 'link') ? run.text : run.alt), '')
        .includes(`@${$selfChannelName}`);
  };
  const executeExport = (e: any) => {
    const el = (e.target as HTMLSelectElement);
    switch (el.value) {
      case 'screenshot':
        exportScreenshot();
        break;
      case 'textfile':
        exportTextFile();
        break;
      case 'jsondump':
        exportJsonDump();
        break;
    }
    el.value = 'export';
  };

  const sortMessagesByShowtime = () => {
    messageActions = messageActions.sort((a, b) => {
      if (isWelcome(a)) return -1;
      if (isWelcome(b)) return 1;
      return a.message.showtime - b.message.showtime;
    });
  };

  const executeActions = (e: any) => {
    const el = (e.target as HTMLSelectElement);
    switch (el.value) {
      case 'sort':
        sortMessagesByShowtime();
        break;
      case 'clear':
        clearMessages();
        break;
    }
    el.value = 'actions';
  };

  let archiveEmbedFrame = '';

  const executeImport = async (e: any) => {
    const el = (e.target as HTMLSelectElement);
    const val = el.value;
    el.value = 'import';
    switch (val) {
      case 'jsondump': {
        const key = await importJsonDump();
        if (key) loadArchive(key);
        break;
      }
      case 'savedarchive': {
        const paramsClone = new URLSearchParams(params.toString());
        paramsClone.set('isArchiveLoadSelection', 'true');
        // createPopup
        const url = (chrome.runtime.getURL(
          (isLiveTL ? 'hyperchat/options.html' : 'options.html') + '?' + paramsClone.toString()
        ));
        if (embedded) createPopup(url);
        else {
          archiveEmbedFrame = url;
        }
        break;
      }
    }
  };

  let screenshotElement: HTMLDivElement | undefined;
  let hiddenElement: HTMLDivElement | undefined;
  const exportScreenshot = async () => {
    const clonedNode = screenshotElement?.cloneNode(true) as HTMLDivElement;
    clonedNode.id = 'screenshot-element';
    clonedNode.dataset.theme = $dataTheme;
    hiddenElement?.appendChild(clonedNode);
    let style = document.querySelector('#shift-screenshot')!;
    if (!style) {
      style = document.createElement('style');
      style.id = 'shift-screenshot';
      document.head.appendChild(style);
    }
    const bottomNode = document.createElement('div');
    clonedNode.appendChild(bottomNode);
    bottomNode.id = 'screenshot-bottom';
    const hrefNode = document.createElement('div');
    hrefNode.style.textDecoration = 'underline';
    bottomNode.style.transform = 'skew(-7.5deg)';
    hrefNode.innerText = 'https://livetl.app/ytcfilter';
    const spanNode = document.createElement('span');
    spanNode.innerHTML = 'Filtered with YtcFilter. ';
    spanNode.style.whiteSpace = 'pre';
    bottomNode.appendChild(spanNode);
    bottomNode.appendChild(hrefNode);
    style.innerHTML = `
      #screenshot-element {
        color: black;
      }
      #screenshot-element[data-theme="dark"] {
        color: white;
      }
      #screenshot-element img {
        transform: translateY(35%);
      }
      #screenshot-element .hide-while-screenshotting {
        display: none;
      }
      #screenshot-element > * {
        transform: translateY(-5px);
      }
      #screenshot-element {
        padding-bottom: 20px;
      }
      #screenshot-element::before {
        background-color: transparent; /* rgba(128, 128, 128, 0.1); */
        width: 100vw;
        height: 20px;
        bottom: 0px;
        content: '';
        position: absolute;
      }
      #screenshot-bottom {
        width: 100vw;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        bottom: 7px;
        font-weight: bold;
        z-index: 100;
      }
    `;
    html2canvas(clonedNode, {
      useCORS: true,
      backgroundColor: $dataTheme === 'dark' ? '#0f0f0f' : 'white',
      width: screenshotElement?.clientWidth,
      scale: 2,
      allowTaint: true
    }).then((canvas: HTMLCanvasElement) => {
      const downloadName = `chat-${new Date().toISOString()}.png`;
      const a = document.createElement('a');
      a.download = downloadName;

      // Prefer a Blob URL: YouTube CSP / modern Chromium can block `data:` navigation/downloads.
      const toBlobP = async () => await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('canvas.toBlob returned null'));
        }, 'image/png');
      });

      void toBlobP().then((blob) => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.click();
        // Give the browser a moment to start the download before revoking.
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }).catch(() => {
        // Fallback: keep the old path for browsers that don't support toBlob() here.
        a.href = canvas.toDataURL('image/png');
        a.click();
      });
      style.innerHTML = '';
      clonedNode.remove();
    }).catch((err: any) => {
      console.error(err);
      style.innerHTML = '';
      clonedNode.remove();
    });
  };
  const exportTextFile = async () => {
    downloadAsTxt(await getSavedMessageDumpInfo(key));
  };
  const exportJsonDump = async () => {
    downloadAsJson(await getSavedMessageDumpInfo(key));
  };
  $: showWelcome = $initialized && (messageActions.length === 0 && !paramsArchiveKey);

  const clearMessages = () => {
    // $confirmDialog = {
    //   action: {
    //     callback: () => {
    //       messageKeys.clear();
    //       messageActions = [];
    //     },
    //     text: 'Clear'
    //   },
    //   message: UNDONE_MSG,
    //   title: 'Clear Messages?'
    // };
    // scrollToBottom();
    messageKeys.clear();
    messageActions = [];
  };
  let key = '';
  const initMessageStorage = async () => {
    let tempKey = paramsArchiveKey;
    if (!tempKey) {
      tempKey = await findSavedMessageActionKey(paramsContinuation, $videoInfo, $autoClear);
    }
    if (!tempKey) {
      tempKey = getRandomString();
    }
    const newMsgs = await getSavedMessageDumpActions(tempKey);
    if (newMsgs?.length) {
      newMessages({
        type: 'messages',
        messages: newMsgs
      }, false, true);
    }
    key = tempKey;
    const info = await getSavedMessageDumpInfo(key);
    const cachedPreset = info?.presetId;
    if (!$overrideFilterPresetId && cachedPreset) {
      $overrideFilterPresetId = cachedPreset;
    }
    if (paramsArchiveKey && info?.info) $videoInfo = mergeVideoInfoObjs(info?.info, $videoInfo);
    messageStorageInitDone = true;
  };
  $: if ($initialized) {
    initMessageStorage();
  }
  $: if (key && $initialSetupDone && messageStorageInitDone) {
    saveMessageActions(
      key,
      paramsContinuation,
      $videoInfo,
      messageActions.filter(item => !isWelcome(item)) as Chat.MessageAction[],
      $currentFilterPreset.id
    );
  }
  let isPopout = false;
  onMount(async () => {
    if (await redirectIfInitialSetup()) return;
    try {
      if (window.parent === window) {
        isPopout = true;
      } else {
        isAtBottom = window.innerHeight === 0;
        window.addEventListener('resize', () => {
          if (window.innerHeight === 0) isAtBottom = true;
        });
      }
    } catch (e) {
    }
    if (paramsYtDark) {
      $ytDark = paramsYtDark === 'true';
    }
    onLoad();
    toggleTopBar();
    (window as any).toggleTopBar = toggleTopBar;
  });
  const openSettings = () => createPopup(chrome.runtime.getURL((isLiveTL ? 'ytcfilter' : '') + '/options.html'));

  const presetChangedManually = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const presetId = target.value;
    $overrideFilterPresetId = presetId;
  };

  const overwriteOverride = () => {
    if ($videoInfo) {
      const result = getAutoActivatedPreset($chatFilterPresets, $videoInfo);
      if (result) {
        $overrideFilterPresetId = result.id;
      }
    }
  };

  const deleteMessageClientSide = (obj: CustomEvent) => {
    messageActions = messageActions.filter(item => isWelcome(item) || item.message.messageId !== obj.detail);
    messageKeys.delete(obj.detail);
    setOverride();
  };

  $: if ($initialized && $videoInfo) {
    overwriteOverride();
  }
  let topBarHeight = 0;

  const closeArchive = () => {
    window.parent.postMessage({
      type: 'archiveViewCloseRequest'
    }, '*');
  };

  let topBarVisible = true;
  const toggleTopBar = () => {
    const elem = window.parent.document.querySelector('.ytcf-button-wrapper')!;
    if (!elem) return;
    const iframe = window.parent.document.querySelector('.ytcf-iframe')!;
    if (!iframe || (topBarVisible && iframe.style.display !== 'block')) return;
    // elem.style.display = topBarVisible ? 'none' : 'flex';
    if (topBarVisible) elem.style.setProperty('display', 'none', 'important');
    else elem.style.removeProperty('display');
    topBarVisible = !topBarVisible;
  };
</script>

<YtcFilterConfirmation />

<svelte:window on:resize={() => {
  scrollToBottom();
  topBarResized();
}} />

<div bind:this={hiddenElement} style="opacity: 0; position: absolute; z-index: -1;" />

<FullFrame bind:src={archiveEmbedFrame} />

<div style="display: grid; grid-template-rows: auto auto 1fr;" class="h-screen w-screen bg-ytbg-light dark:bg-ytbg-dark text-black dark:text-white">
  <div data-theme={$dataTheme} class="w-screen top-button-wrapper" bind:clientHeight={topBarHeight} style="height: 26px;">
    <div style="display: flex; justify-content: flex-start;">
      <!-- <span class="tiny-text">
        Preset:
      </span> -->
      {#if !paramsArchiveKey}
        <select use:exioDropdown value={
          $currentFilterPreset?.id
        } on:change={presetChangedManually} class="preset-selector">
          {#each $chatFilterPresets as preset}
            <option value={preset.id}>{preset.nickname}</option>
          {/each}
        </select>
      {:else}
        <button use:exioButton on:click={closeArchive} class="whitespace-nowrap">
          <div use:exioIcon class="shifted-icon inline-block" style="color: inherit;">
            arrow_back
          </div>
          Back
        </button>
      {/if}
    </div>
    <div style="display: flex; justify-content: flex-end;">
      {#if !paramsArchiveKey && !embedded}
        <select use:exioDropdown on:change={executeImport} style="width: 64px;">
          <option selected disabled value="import">Open</option>
          <option value="savedarchive">Archive</option>
          <option value="jsondump">JSON</option>
        </select>
      {/if}
      <select use:exioDropdown on:change={executeExport} disabled={showWelcome} style="width: 64px;">
        <option selected disabled value="export">Save</option>
        <option value="screenshot">PNG</option>
        <option value="textfile">TXT</option>
        <option value="jsondump">JSON</option>
      </select>
      <select use:exioDropdown style="width: 74px;" on:change={executeActions}>
        <option selected disabled value="actions">Actions</option>
        <option value="sort">Sort Time</option>
        <option value="clear">Clear All</option>
      </select>
      <!-- <button use:exioButton on:click={clearMessages} class="whitespace-nowrap" disabled={showWelcome}>
        Clear
        <div use:exioIcon class="shifted-icon inline-block" style="color: inherit;">
          close
        </div>
      </button> -->
      {#if isPopout}
        <button use:exioButton on:click={openSettings} class="inline-flex gap-1 items-center">
          Settings
          <div use:exioIcon class="inline-block" style="color: inherit;">
            settings
          </div>
        </button>
      {:else if !paramsArchiveKey}
        <button use:exioButton on:click={toggleTopBar} class="inline-flex gap-1 items-center">
          Menu
          <div use:exioIcon class="inline-block" style="color: inherit;">
            unfold_{topBarVisible ? 'less' : 'more'}_double
          </div>
        </button>
        <!-- <button use:exioButton on:click={toggleTopBar} class="inline-flex gap-1 items-center">
          <div use:exioIcon class="inline-block text-error-500 dark:text-error-200">
            close
          </div>
        </button> -->
      {/if}
    </div>
  </div>
  <div class="line" />
  <div class="{containerClass} container" style="font-size: 13px; height: calc(100vh - 27px);">
    <ReportBanDialog />
    <SuperchatViewDialog />
    {#if $enableStickySuperchatBar}
      <StickyBar />
    {/if}
    <div class="min-h-0 flex justify-end flex-col relative">
      <div bind:this={div} on:scroll={checkAtBottom} class="content overflow-y-scroll" style="height: calc(100vh - {topBarHeight}px);">
        <div style="height: {topBarSize}px;" />
        <div bind:this={screenshotElement} class="h-full">
          {#if showWelcome}
            <div class="w-full flex justify-center items-center h-full">
              <WelcomeMessage />
            </div>
          {/if}
          {#each (overrideActions.length ? overrideActions : messageActions)  as action (action.message.messageId)}
            <div
              class="hover-highlight p-1.5 w-full block"
              class:flex = {!isWelcome(action)}
              class:mention = {$enableHighlightedMentions && isMessage(action) && isMention(action.message)}
              class:mention-light = {!$smelteDark}
              on:mouseover={() => setHover(action)}
              on:focus={() => setHover(action)}
              on:mouseout={() => setHover(null)}
              on:blur={() => setHover(null)}
            >
              {#if isWelcome(action)}
                <WelcomeMessage />
              {:else if isSuperchat(action)}
                <PaidMessage message={action.message} deleted={action.deleted} on:clientSideDelete={deleteMessageClientSide} />
              {:else if isMembership(action)}
                <MembershipItem message={action.message} deleted={action.deleted} on:clientSideDelete={deleteMessageClientSide} />
              {:else if isMessage(action)}
                <Message
                  message={action.message}
                  deleted={action.deleted}
                  on:clientSideDelete={deleteMessageClientSide}
                  miniDropdown={Boolean(paramsArchiveKey)}
                />
              {/if}
            </div>
          {/each}
        </div>
      </div>
      <!-- {#if pinned}
        <div class="absolute top-0 w-full" bind:this={topBar}>
          <div class="mx-1.5 mt-1.5">
            <PinnedMessage pinned={pinned} on:resize={topBarResized} />
          </div>
        </div>
      {/if} -->
      {#if !isAtBottom}
        <div
          class="absolute left-1/2 transform -translate-x-1/2 bottom-0 pb-1"
          transition:fade={{ duration: 150 }}
        >
          <Button icon="arrow_downward" on:click={scrollToBottom} small />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .hyperchat-root {
    font-family: var(--pure-material-font, "Roboto", "Segoe UI", BlinkMacSystemFont, system-ui, -apple-system, sans-serif);
  }

  .hover-highlight {
    background-color: transparent;
  }
  :not(.screenshot-element) .hover-highlight:hover {
    background-color: #80808040;
  }
  .mention {
    background-color: #ffe60038;
  }
  :not(.screenshot-element) .mention:hover {
    background-color: #fff48f3f;
  }
  .mention.mention-light {
    background-color: #ffe60085;
  }
  :not(.screenshot-element) .mention.mention-light:hover {
    background-color: #bfb2408f;
  }
  :global(.mode-dark) .container {
    background-color: #0f0f0f !important;
  }
  .top-button-wrapper button, .top-button-wrapper select {
    cursor: default;
    padding: 2px 5px;
    background-color: white;
  }
  :global(.mode-dark) .top-button-wrapper button, :global(.mode-dark) .top-button-wrapper select {
    background-color: #0f0f0f;
  }
  .top-button-wrapper {
    font-size: 12px;
    width: 100%;
    display: grid;
    align-content: space-between;
    justify-content: space-between;
    grid-template-columns: minmax(0, 1fr) auto;
  }
  :global(.mode-dark) .top-button-wrapper {
    background-color: #0f0f0f;
  }
  .tiny-text {
    display: flex;
    align-items: center;
    padding: 2px 5px;
    cursor: default;
    user-select: none;
    transform: translateY(0.25px);
  }
  .preset-selector {
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
</style>
