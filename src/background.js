browser.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  switch (request.type) {
    case 'get_war': {
      callback(chrome.runtime.getURL(request.url));
      break;
    }
    case 'message': {
      console.debug('Broadcasting message', request.data);
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, request.data);
        });
      });
      break;
    }
    case 'window': {
      (window.browser || window.chrome).windows.create({
        url: request.url,
        type: 'popup',
        height: 300,
        width: 600
      });
    }
  }
});
