const launch = () => chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });

const changes = () => chrome.tabs.create({ url: 'https://github.com/KentoNishi/LiveTL/releases/latest' });

//var didUpdate = false;
//chrome.runtime.onInstalled.addListener(launch);

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    console.log("This is a first install!");
    chrome.tabs.create({ url: 'https://kentonishi.github.io/LiveTL/about' });
  } else if (details.reason == "update") {
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
    case 'get_war':
      callback(chrome.runtime.getURL(request.url));
      break;
  }
});

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    return {
      responseHeaders: details.responseHeaders.filter(header => {
        let lower = header.name.toLowerCase();
        return (lower !== 'x-frame-options' && lower !== 'content-security-policy');
      })
    };
  }, {
  urls: ["<all_urls>"]
}, ["blocking", "responseHeaders"]);


/**
 * The following code is from https://github.com/ThomazPom/Moz-Ext-Ignore-X-Frame-Options/blob/master/background.js under no
 * license. Credit for this part of code goes to ThomazPom
 */
if (/Firefox/.exec(navigator.userAgent)) {
  var defaultRgx =  ["<all_urls>", "*://*/*","https://*.w3schools.com/*", "*"].join('\n')
  var theRegex = null;
  var headersdo = {
      "content-security-policy":(x=>{return false}),
      "x-frame-options":(x=>{return false})
    }
  
  function updateRegexpes()
  {
    browser.storage.local.get(null, function(res) {
      var  regstr = (res.regstr_allowed || defaultRgx);
      browser.webRequest.onHeadersReceived.removeListener(setHeader)
      if(!res.is_disabled)
      {
        theRegex = new RegExp(
          regstr.split("\n").map(
            x=>x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Sanitize regex
              .replace(/(^<all_urls>|\\\*)/g,"(.*?)")  // Allow wildcards
              .replace(/^(.*)$/g,"^$1$")).join("|")  // User multi match
          )
        browser.webRequest.onHeadersReceived.addListener(
          setHeader,
          {urls :["<all_urls>"], types:["sub_frame","object"]},
          ["blocking", "responseHeaders"]
        );
      }
    });
  }
  
  function setHeader(e) {
    return new Promise((resolve, reject)=>
    {
      (e.tabId == -1
        ?new Promise(resolve=>resolve({url:e.originUrl}))
        :browser.webNavigation.getFrame({tabId:e.tabId,frameId:e.parentFrameId})
      ).then(parentFrame=>{
        if(parentFrame.url.match(theRegex))
        {
          e.responseHeaders=e.responseHeaders.filter(x=>(headersdo[x.name.toLowerCase()]||Array)())
        }
          resolve({responseHeaders: e.responseHeaders});
      })
    })
  }
  updateRegexpes();
  var portFromCS;
  function connected(p) {
    portFromCS = p;
    portFromCS.onMessage.addListener(function(m) {
        browser.storage.local.set(m,updateRegexpes);
    });
  }
  browser.runtime.onConnect.addListener(connected);
}

/**
 * End snippet by ThomazPom
 */
