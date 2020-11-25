let launch = () => chrome.tabs.create({ url: "https://kentonishi.github.io/LiveTL/about" });

chrome.runtime.onInstalled.addListener(launch);
chrome.browserAction.onClicked.addListener(launch);