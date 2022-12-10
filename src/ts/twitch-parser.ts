import { AuthorType } from '../js/constants';

const badgesSelector = '.chat-badge';
const displayNameSelector = '.chat-author__display-name';

const liveChatLineSelector = '.chat-line__no-background';
const liveMessageProperty = 'chat-line-message-body';
const vodMessageSelector = '.video-chat__message';

const vodTimestampSelector = '.vod-message__header p';
const mentionFragmentClass = 'mention-fragment';
const textFragmentClass = 'text-fragment';
const emoteSelector = 'img.chat-line__message--emote';

const ffzBadgesSelector = '.ffz-badge';
const ffzMessageSelector = '.message';
const ffzMentionClass = 'chat-line__message-mention';

let messageCounter = 0;

export function isVod(): boolean {
  return window.location.pathname.includes('/videos/');
}

function currentTime(): string {
  const date = new Date();
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function elementIsAnchor(element: Element): element is HTMLAnchorElement {
  return element.tagName === 'A';
}

function getVodMesssageBody(message: Element): Element | undefined {
  const body = message.querySelector(vodMessageSelector);
  return body?.children[1];
}

function getLiveMessageBody(message: Element): HTMLElement | undefined {
  const chatLine = message.querySelector(liveChatLineSelector);
  if (chatLine == null) {
    const ffzMessage = message.querySelector<HTMLElement>(ffzMessageSelector);
    if (ffzMessage != null) return ffzMessage;
    return;
  }
  for (let i = 0; i < chatLine.children.length; i++) {
    const child = chatLine.children[i] as HTMLElement;
    if (child.dataset.testSelector === liveMessageProperty) {
      return child;
    }
  }

  // twitch removed the live message property but ffz hasn't
  // therefore above for loop won't work in vanilla twitch
  // default return here is compensated for checking that there are fragments
  return chatLine.children[chatLine.children.length - 1] as HTMLElement;
}

function parseMessageFragment(fragment: Element): Ytc.ParsedRun | undefined {
  const emote = fragment.querySelector<HTMLImageElement>(emoteSelector);
  if (emote != null) {
    return {
      type: 'emoji',
      src: emote.src,
      alt: emote.alt
    };
  }

  const classList = fragment.classList;
  if (
    classList.contains(textFragmentClass) ||
    classList.contains(mentionFragmentClass) ||
    classList.contains(ffzMentionClass)
  ) {
    return {
      type: 'text',
      text: fragment.textContent ?? ''
    };
  } else if (elementIsAnchor(fragment)) {
    return {
      type: 'link',
      text: fragment.textContent ?? fragment.href,
      url: fragment.href
    };
  }
}

function getType(type: string): Ltl.AuthorType {
  if (type === 'moderator') return AuthorType.moderator;
  if (type === 'verified') return AuthorType.verified;
  if (type === 'broadcaster') return AuthorType.owner;
  if (type === 'subscriber') return AuthorType.member;
  return 0;
}

function parseTypes(message: Element): Ltl.AuthorType {
  const badges = message.querySelectorAll<HTMLImageElement>(badgesSelector);
  const ffzBadges = message.querySelectorAll<HTMLElement>(ffzBadgesSelector);
  let types = 0;
  Array.from(badges).forEach((badge) => {
    // Doesn't work on other languages outside of English
    types |= getType(badge.alt.toLowerCase());
  });
  Array.from(ffzBadges).forEach((badge) => {
    types |= getType(badge.dataset.badge?.toLowerCase() ?? '');
  });
  return types;
}

export function parseMessageElement(message: Element): Ltl.Message | undefined {
  const author = message.querySelector(displayNameSelector)?.textContent ?? '';
  const timestamp = isVod() ? message.querySelector(vodTimestampSelector)?.textContent ?? '' : currentTime();

  const messageBody = isVod() ? getVodMesssageBody(message) : getLiveMessageBody(message);
  if (messageBody == null) return;
  // console.debug({ messageBody });

  const messageArray: Ytc.ParsedRun[] = [];
  let text = '';
  Array.from(messageBody.children).forEach((fragment) => {
    // console.debug({ fragment });
    const result = parseMessageFragment(fragment);
    if (result == null) return;
    if (result.type !== 'emoji') text += result.text;
    messageArray.push(result);
  });

  // messageArray may have no elements because messageBody isn't guaranteed
  // to be valid anymore
  if (messageArray.length === 0) return;

  const result = {
    author,
    timestamp,
    messageArray,
    authorId: author,
    messageId: `${messageCounter++}`,
    text,
    types: parseTypes(message)
  };
  return result;
}
