let launch = () => chrome.tabs.create({ url: "https://kentonishi.github.io/LiveTL/about" });

chrome.runtime.onInstalled.addListener(launch);
chrome.browserAction.onClicked.addListener(launch);

chrome.runtime.onMessage.addListener((request, sender, callback) => {
    if (request.type == "window") {
        chrome.windows.create(request.data);
    } else if (request.type == "tab") {
        chrome.tabs.create(request.data);
    } else if (request.type == "redirect") {
        chrome.tabs.update(request.data);
    } else if (request.type = "get_war") {
        callback(chrome.runtime.getURL(request.url));
    }
});