const isReplay = window.location.href.startsWith(
  'https://www.youtube.com/live_chat_replay'
);
  
const formatTimestamp = (timestamp) => {
  return (new Date(parseInt(timestamp) / 1000)).toLocaleTimeString(navigator.language,
    { hour: '2-digit', minute: '2-digit' });
};
  
const getMillis = (timestamp, usec) => {
  let secs = Array.from(timestamp.split(':'), t => parseInt(t)).reverse();
  secs = secs[0] + (secs[1] ? secs[1] * 60 : 0) + (secs[2] ? secs[2] * 60 * 60 : 0);
  secs *= 1000;
  secs += usec % 1000;
  secs /= 1000;
  return secs;
};
  
const colorConversionTable = {
  4280191205: 'blue',
  4278248959: 'lightblue',
  4280150454: 'turquoise',
  4294953512: 'yellow',
  4294278144: 'orange',
  4293467747: 'pink',
  4293271831: 'red'
};

export const parseChatResponse = response =>{
  const messages = [];
  if (!response.continuationContents) {
    console.debug('Response was invalid', response);
    return;
  }
  (
    response.continuationContents.liveChatContinuation.actions || []
  ).forEach((action) => {
    try {
      let currentElement = action.addChatItemAction;
      if (action.replayChatItemAction != null) {
        const thisAction = action.replayChatItemAction.actions[0];
        currentElement = thisAction.addChatItemAction;
      }
      currentElement = (currentElement || {}).item;
      if (!currentElement) {
        return;
      }
      const messageItem = currentElement.liveChatTextMessageRenderer ||
            currentElement.liveChatPaidMessageRenderer ||
            currentElement.liveChatPaidStickerRenderer;
      if (!messageItem) {
        return;
      }
      if (!messageItem.authorName) {
        return;
      }
      messageItem.authorBadges = messageItem.authorBadges || [];
      const authorTypes = [];
      messageItem.authorBadges.forEach((badge) =>
        authorTypes.push(badge.liveChatAuthorBadgeRenderer.tooltip.toLowerCase())
      );
      const runs = [];
      if (messageItem.message) {
        messageItem.message.runs.forEach((run) => {
          if (run.text) {
            runs.push({
              type: 'text',
              text: decodeURIComponent(escape(unescape(encodeURIComponent(
                run.text
              ))))
            });
          } else if (run.emoji) {
            runs.push({
              type: 'emote',
              src: run.emoji.image.thumbnails[0].url
            });
          }
        });
      }
      const timestampUsec = parseInt(messageItem.timestampUsec);
      const timestampText = (messageItem.timestampText || {}).simpleText;
      const date = new Date();
      const item = {
        author: {
          name: messageItem.authorName.simpleText,
          id: messageItem.authorExternalChannelId,
          types: authorTypes
        },
        message: runs,
        timestamp: isReplay
          ? timestampText
          : formatTimestamp(timestampUsec),
        showtime: isReplay ? getMillis(timestampText, timestampUsec)
          : date.getTime() - Math.round(timestampUsec / 1000)
      };
      if (currentElement.liveChatPaidMessageRenderer) {
        item.superchat = {
          amount: messageItem.purchaseAmountText.simpleText,
          color: colorConversionTable[messageItem.bodyBackgroundColor]
        };
      }
      messages.push(item);
    } catch (e) {
      console.debug('Error while parsing message.', { e });
    }
  });
  const chunk = {
    type: 'messageChunk',
    messages: messages,
    isReplay
  };
  return chunk;
};