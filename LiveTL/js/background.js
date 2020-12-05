const launch = () => chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });

const changes = () => chrome.tabs.create({ url: 'https://github.com/KentoNishi/LiveTL/releases/latest' });

//var didUpdate = false;
//chrome.runtime.onInstalled.addListener(launch);

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
        chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });
    }else if(details.reason == "update"){
        //didUpdate = true;
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        chrome.browserAction.setIcon({
            path: "./icons/update.png"
        })
        chrome.browserAction.onClicked.addListener(changes);
    }
});


chrome.browserAction.onClicked.addListener(launch);



chrome.runtime.onMessage.addListener((request, sender, callback) => {
  switch (request.type) {
    case 'window':
      chrome.windows.create(request.data, callback);
      break;
    case 'tab':
      chrome.tabs.create(request.data);
      break;
    case 'redirect':
      chrome.tabs.update(request.data);
      break;
    case 'get_war':
      callback(chrome.runtime.getURL(request.url));
      break;
    case 'postMessageToWindow':
      chrome.tabs.sendMessage(request.id, callback);
      break;
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    return {
      responseHeaders: details.responseHeaders.filter(header => {
        return (header.name.toLowerCase() !== 'x-frame-options');
      })
    };
  }, {
  urls: ["<all_urls>"]
}, ["blocking", "responseHeaders"]);