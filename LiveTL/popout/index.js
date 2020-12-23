params = parseParams();

let messageReceive = (m) => {
  if (typeof m.data == 'object') {
    if (params.v != m.data.video) return;
    switch (m.data.type) {
      case 'messageChunk':
        console.debug('Received message chunk:', m.data);
        m.data.messages.forEach(onNewMessage);
        break;
    }
  }
};

window.addEventListener('message', messageReceive);
chrome.runtime.onMessage.addListener(messageReceive);

runLiveTL();
