params = parseParams();

let messageReceive = (m, sender, callback) => {
  if (typeof m.data == 'object') {
    switch (m.data.type) {
      case 'messageChunk':
        console.debug('Received message chunk:', m.data);
        m.data.messages.forEach(onNewMessage);
        break;
    }
  }
  callback();
  return true;
};

window.addEventListener('message', messageReceive);
chrome.runtime.onMessage.addListener(messageReceive);

runLiveTL();
