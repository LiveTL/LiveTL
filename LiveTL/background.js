chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({ url: "https://kentonishi.github.io/LiveTL/about" });
});