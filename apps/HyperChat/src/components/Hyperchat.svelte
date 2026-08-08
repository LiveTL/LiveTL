<script lang="ts">
  import '../stylesheets/scrollbar.css';
  import { onDestroy, onMount, afterUpdate, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { get } from 'svelte/store';
  import dark from 'smelte/src/dark';
  import WelcomeMessage from './WelcomeMessage.svelte';
  import Message from './Message.svelte';
  import PinnedMessage from './PinnedMessage.svelte';
  import ChatSummary from './ChatSummary.svelte';
  import RedirectBanner from './RedirectBanner.svelte';
  import PollResults from './PollResults.svelte';
  import PaidMessage from './PaidMessage.svelte';
  import MembershipItem from './MembershipItem.svelte';
  import ReportBanDialog from './ReportBanDialog.svelte';
  import SuperchatViewDialog from './SuperchatViewDialog.svelte';
  import StickyBar from './StickyBar.svelte';
  import {
    Theme,
    YoutubeEmojiRenderMode,
    chatUserActionsItems,
    ChatUserActions
  } from '../ts/chat-constants';
  import {
    buildDeletedObj,
    isAllEmoji,
    isChatMessage,
    isPrivileged,
    responseIsAction,
    useReconnect
  } from '../ts/chat-utils';
  import { handleReplyThreadResponse } from '../ts/chat-actions';
  import Button from 'smelte/src/components/Button';
  import {
    theme,
    showOnlyMemberChat,
    showProfileIcons,
    showUsernames,
    showTimestamps,
    showUserBadges,
    showChatSummary,
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
    ytDark
  } from '../ts/storage';
  import type { Chat } from '../ts/typings/chat';

  const welcome = { welcome: true, message: { messageId: 'welcome' } };
  type Welcome = typeof welcome;

  const params = new URLSearchParams(window.location.search);
  const paramsTabId = params.get('tabid');
  const paramsFrameId = params.get('frameid');
  const paramsIsReplay = params.get('isReplay');

  const CHAT_HISTORY_SIZE = 150;
  const TRUNCATE_SIZE = 20;
  let messageActions: Array<Chat.MessageAction | Welcome> = [];
  const messageKeys = new Set<string>();
  let poll: Ytc.ParsedPoll | null;
  let pinned: Ytc.ParsedPinned | null;
  let summary: Ytc.ParsedSummary | null;
  let redirect: Ytc.ParsedRedirect | null;
  // = {
  //   type: 'redirect',
  //   item: {
  //     message: [
  //       {
  //         type: 'text',
  //         text: 'Don\'t miss out! People are going to watch something from someone',
  //       },
  //     ],
  //     profileIcon: {
  //       src: 'https://picsum.photos/32',
  //       alt: 'Redirect profile photo',
  //     },
  //     action: {
  //       url: 'https://example.com/',
  //       text: [
  //         {
  //           type: 'text',
  //           text: 'Go Now',
  //         },
  //       ],
  //     },
  //   },
  //   showtime: 5000,
  // };
  $: hasBanner = Boolean(poll ?? pinned ?? redirect ?? (summary != null && $showChatSummary));
  let div: HTMLElement;
  let isAtBottom = true;
  let truncateInterval: number | undefined;
  const isReplay = paramsIsReplay;
  const smelteDark = dark();

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

  const messageBlockers = [memberOnlyBlocker, emojiSpamBlocker, duplicateKeyBlocker];

  const shouldShowMessage = (m: Chat.MessageAction): boolean => (
    !messageBlockers.some(blocker => blocker(m))
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

  const checkTruncateMessages = (): void => {
    const diff = messageActions.length - CHAT_HISTORY_SIZE;
    if (diff > TRUNCATE_SIZE) {
      const removed = messageActions.splice(0, diff);
      removed.forEach(m => messageKeys.delete(m.message.messageId));
    }
    messageActions = messageActions;
  };

  let piledMessages: Chat.MessagesAction[] = [];

  const newMessages = (
    messagesAction: Chat.MessagesAction, isInitial: boolean
  ) => {
    if (!isAtBottom) {
      piledMessages = [...piledMessages, messagesAction];
      return;
    }
    // On replays' initial data, only show messages with negative timestamp
    if (isInitial && isReplay) {
      messageActions.push(...filterTickers(messagesAction.messages).filter(
        (a) => a.message.timestamp.startsWith('-') && shouldShowMessage(a)
      ));
    } else {
      messageActions.push(...filterTickers(messagesAction.messages).filter(shouldShowMessage));
    }
    if (!isInitial) checkTruncateMessages();
  };

  $: if (isAtBottom && piledMessages.length > 0) {
    for (const messagesAction of piledMessages) {
      newMessages(messagesAction, false);
    }
    piledMessages = [];
  }

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


  const onBonk = (bonk: Ytc.ParsedBonk) => {
    messageActions.forEach((action) => {
      if (isWelcome(action)) return;
      if (action.message.author.id === bonk.authorId) {
        action.deleted = { replace: bonk.replacedMessage };
      }
    });
  };

  const LIVE_REPLY_BUFFER_LIMIT = 200;

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
      $liveReplyBuffer = combined.length > LIVE_REPLY_BUFFER_LIMIT
        ? combined.slice(combined.length - LIVE_REPLY_BUFFER_LIMIT)
        : combined;
    }
    return keep;
  };

  const onDelete = (deletion: Ytc.ParsedDeleted) => {
    const changed = messageActions.some((action) => {
      if (isWelcome(action)) return false;
      if (action.message.messageId === deletion.messageId) {
        action.deleted = buildDeletedObj(deletion, action.message.message);
        return true;
      }
      return false;
    });
    if (changed) messageActions = messageActions;
  };

  const onChatAction = (action: Chat.Actions, isInitial = false) => {
    switch (action.type) {
      case 'messages':
        newMessages(action, isInitial);
        break;
      case 'bonk':
        onBonk(action.bonk);
        break;
      case 'delete':
        onDelete(action.deletion);
        break;
      case 'poll':
        poll = action;
        break;
      case 'summary':
        summary = action;
        break;
      case 'redirect':
        redirect = action;
        break;
      case 'pin':
        pinned = action;
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
        messageKeys.clear();
        messageActions = [...action.messages].filter(shouldShowMessage);
        if (action.showWelcome) {
          messageActions = [...messageActions, welcome];
        }
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

  const updateTheme = (theme: Theme, ytDark = false) => {
    if (theme === Theme.YOUTUBE) {
      smelteDark.set(ytDark);
      return;
    }
    smelteDark.set(theme === Theme.DARK);
    if (theme === Theme.LIGHT) document.body.classList.add('bg-ytdark-50');
    else document.body.classList.remove('bg-ytdark-50');
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
        messageActions = [...messageActions, welcome];
        $selfChannel = response.selfChannel;
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

  // Doesn't work well with onMount, so onLoad will have to do
  // Update: use onMount because hc now mounts in content script
  const onLoad = (): (() => void) | undefined => {
    $lastOpenedVersion = __VERSION__;
    document.body.classList.add('overflow-hidden');

    if (paramsTabId == null || paramsFrameId == null || paramsTabId.length < 1 || paramsFrameId.length < 1) {
      console.error('No tabId or frameId found from params');
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

      if (!hasRun) {
        port.postMessage({
          type: 'getTheme'
        });
      }

      hasRun = true;

      return port;
    });

    return () => $port?.destroy?.();
  };

  onMount(onLoad);

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
    if (truncateInterval) window.clearInterval(truncateInterval);
  });

  $: updateTheme($theme, $ytDark);
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
  $: $enableStickySuperchatBar, hasBanner, topBarResized();

  const isMention = (msg: Ytc.ParsedMessage) => {
    return $selfChannelName &&
      msg.message
        .reduce((text, run) =>
          text + ((run.type === 'text' || run.type === 'link') ? run.text : run.alt), '')
        .includes(`@${$selfChannelName}`);
  };
</script>

<svelte:window on:resize={() => {
  scrollToBottom();
  topBarResized();
}} />

<div class={containerClass} style="font-size: 13px">
  <ReportBanDialog />
  <SuperchatViewDialog />
  {#if $enableStickySuperchatBar}
    <StickyBar />
  {/if}
  <div class="w-screen min-h-0 flex-1 flex justify-end flex-col relative">
    <div bind:this={div} on:scroll={checkAtBottom} class="content overflow-y-scroll">
      <div style="height: {topBarSize}px;" />
      {#each messageActions as action (action.message.messageId)}
        <div
          class="hover-highlight p-1.5 w-full block"
          class:flex = {!isWelcome(action)}
          class:mention = {$enableHighlightedMentions && isMessage(action) && isMention(action.message)}
          class:mention-light = {!$smelteDark}
          on:mouseover={() => { setHover(action); }}
          on:focus={() => { setHover(action); }}
          on:mouseout={() => { setHover(null); }}
          on:blur={() => { setHover(null); }}
        >
          {#if isWelcome(action)}
            <WelcomeMessage />
          {:else if isSuperchat(action)}
            <PaidMessage message={action.message} />
          {:else if isMembership(action)}
            <MembershipItem message={action.message} />
          {:else if isMessage(action)}
            <Message
              message={action.message}
              deleted={action.deleted}
            />
          {/if}
        </div>
      {/each}
    </div>
    {#if hasBanner}
      <div class="absolute top-0 w-full" bind:this={topBar}>
        {#if poll}
          <div class="mx-1.5 mt-1.5">
            <PollResults poll={poll} on:resize={topBarResized} />
          </div>
        {/if}
        {#if summary && $showChatSummary}
          <div class="mx-1.5 mt-1.5">
            <ChatSummary summary={summary} on:resize={topBarResized} />
          </div>
        {/if}
        {#if redirect}
          <div class="mx-1.5 mt-1.5">
            <RedirectBanner redirect={redirect} on:resize={topBarResized} />
          </div>
        {/if}
        {#if pinned}
          <div class="mx-1.5 mt-1.5">
            <PinnedMessage pinned={pinned} on:resize={topBarResized} />
          </div>
        {/if}
      </div>
    {/if}
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

<style>
  .hyperchat-root {
    font-family: var(--pure-material-font, "Roboto", "Segoe UI", BlinkMacSystemFont, system-ui, -apple-system, sans-serif);
  }

  .hover-highlight {
    background-color: transparent;
  }
  .hover-highlight:hover {
    background-color: #80808040;
  }
  .mention {
    background-color: #ffe60038;
  }
  .mention:hover {
    background-color: #fff48f3f;
  }
  .mention.mention-light {
    background-color: #ffe60085;
  }
  .mention.mention-light:hover {
    background-color: #bfb2408f;
  }
</style>
