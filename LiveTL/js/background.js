let launch = () => chrome.tabs.create({ url: "https://kentonishi.github.io/LiveTL/about" });

chrome.runtime.onInstalled.addListener(launch);
chrome.browserAction.onClicked.addListener(launch);

chrome.runtime.onMessage.addListener((request, sender, callback) => {
    switch(request.type) {
        case 'window':
            chrome.windows.create(request.data);
            break;
        case 'tab':
            chrome.tabs.create(request.data);
            break;
        case 'redirect':
            chrome.tabs.update(request.data);
            break;
        case 'get_war': // Is this supposed to set the request type or...?
            callback(chrome.runtime.getURL(request.url));
            break;
    }
});