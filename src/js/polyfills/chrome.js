// chrome api polyfill, injected into both
// the background script as well as
// all windows (including subframes)

// native js interface injected in all windows and subframes
// window.nativeJavascriptInterface = {
//   sendToBackground: data => {}, // native android method, accessible via js 
//   sendToForeground: data => {}, // native android method, accessible via js 
// };

// send a message to the background script
function sendToBackground(data, randomMessageID) {
  window.nativeJavascriptInterface.sendToBackground(JSON.stringify({
    type: 'sendToBackground',
    data,
    randomMessageID,
    sender: {
      frameId: window.location.href,
      tab: {
        id: window.location.href
      }
    }
  }));
}
  
// send a message to all content scripts
function sendToForeground(data, randomMessageID) {
  window.nativeJavascriptInterface.sendToForeground(JSON.stringify({
    type: 'sendToForeground',
    data,
    randomMessageID,
    sender: {
      frameId: window.location.href,
      tab: {
        id: window.location.href
      }
    }
  }));
}
  
let polyfillStorage = {
  awaitingCallbacks: {}, // store callbacks that are waiting for a response
  onConnectCallbacks: [], // store callbacks that are waiting for a connection
  onMessageCallbacks: [], // store callbacks that are waiting for a message event
  portOnMessageCallbacks: {
    // 'portID': [] // store callbacks that are waiting for a message event on a specific port
  }
};
  
// chrome api polyfill injected in all windows and subframes
window.chrome = {
  runtime: {
    id: 'livetl_android',
    getURL: path => `file://android_asset/${path}`, // replacement for chrome-extension urls
    getManifest: () => 'manifest string here', // can also do a request to an asset
    sendMessage(data, callback=null) { // send message to background polyfill
      const randomMessageID = Date.now(); // generate some sort of id to identify the message
      if (callback) {
        polyfillStorage.awaitingCallbacks[randomMessageID] = callback; // store callback
      }
      sendToBackground(data, randomMessageID); // send message to bgscript, callback called on reply
    },
    onMessage: {
      addListener: callback => { // only ever used in background script
        polyfillStorage.onMessageCallbacks.push(callback);
      }
    },
    onConnect: {
      addListener: callback => { // only ever used in background script
        polyfillStorage.onConnectCallbacks.push(callback);
      }
    },
    connect() {
      // connect is done from the content script only
      const portID = Date.now(); // generate a random port id
      window.chrome.runtime.sendMessage({
        event: 'connectPort',
        portID
      }); // establish port
      const port = {
        postMessage: data => {
          window.chrome.runtime.sendMessage({
            event: 'postMessage',
            data,
            portID: portID
          });
        },
        onMessage: {
          addListener: callback => {
            const portCallbacks = polyfillStorage.portOnMessageCallbacks[portID];
            polyfillStorage.portOnMessageCallbacks[portID] = portCallbacks || [];
            polyfillStorage.portOnMessageCallbacks[portID].push(callback);
          }
        },
        onDisconnect: {
          // eslint-disable-next-line no-unused-vars
          addListener: callback => { } // can't really detect disconnect so just ignore
        }
      }; // fake port that postMessages to the bgscript
      return port; 
    },
    onInstalled: {
      // eslint-disable-next-line no-unused-vars
      addListener: callback => { }
    }
  },
  webRequest: {
    onHeadersReceived: {
      // eslint-disable-next-line no-unused-vars
      addListener: callback => { }
    }
  }
};
  
window.addEventListener('message', event => { // on post message receive
  try {
    const data = event.data; // parse json
    if (data.type == 'sendToForeground') {
      // { 
      //   'type': 'sendToForeground',
      //   'data': {},
      //   'randomMessageID': 'random string',
      //   'sender': {
      //     'frameId': 'frame id',
      //     'tabId': {
      //       'id':'tab id'
      //     }
      //   }
      // }
  
      // if message is from the background script
      // that means that this script is a content script
      if (!(data.randomMessageID in polyfillStorage.awaitingCallbacks)) {
        // this message was not meant for this window
        // this happens because jsinterface can only run methods on the topmost window
        // meaning the message should be passed to all subframes recursively
        document.querySelectorAll('iframe').forEach(iframe => {
          iframe.contentWindow.postMessage(data, '*');
        });
        return;
      } else if (data.randomMessageID in polyfillStorage.awaitingCallbacks) {
        // if the callback exists in the awaitingCallbacks object, that means
        // this was the window that requested the data.
        // pass the data to the callback.
        polyfillStorage.awaitingCallbacks[data.randomMessageID](data.data);
        delete polyfillStorage.awaitingCallbacks[data.randomMessageID];
        return;
      } else if (data.data && data.data.event == 'postMessage') {
        // a message has been sent from the background script to the content script
        // using an active port. pass the data to listners of this port
        polyfillStorage.portOnMessageCallbacks[
          data.data.portID
        ].onMessage.forEach(callback => callback(data.data.data));
        return;
      }
    } else if (data.type == 'sendToBackground') {
      // { 
      //   'type': 'sendToBackground',
      //   'data': {},
      //   'randomMessageID': 'random string',
      //   'sender': {
      //     'frameId': 'frame id',
      //     'tabId': {
      //       'id':'tab id'
      //     }
      //   }
      // }
  
      // if message is from the content script
      // that means that this script is a background script
      if (data.data.event == 'connectPort') {
        // a client wants to establish a connection
        // run all listeners waiting for a connection
        // and pass it a fake port
        const portID = data.data.portID;
        const port = {
          sender: data.sender,
          postMessage: data => {
            sendToForeground({
              event: 'postMessage',
              portID
            }, data.randomMessageID);
          },
          onMessage: {
            addListener: callback => {
              const portCallbacks = polyfillStorage.portOnMessageCallbacks[portID];
              polyfillStorage.portOnMessageCallbacks[portID] = portCallbacks || [];
              polyfillStorage.portOnMessageCallbacks[portID].push(callback);
            }
          },
          onDisconnect: {
            // eslint-disable-next-line no-unused-vars
            addListener: callback => { } // can't really detect disconnect so just ignore
          }
        }; // construct a fake port
          // pass the fake port to all listeners that were waiting for a port connection 
        polyfillStorage.onConnectCallbacks.forEach(callback => callback(port));
        return;
      } else if (data.data.event == 'postMessage') {
        // received a postMessage sent through a port.
        (polyfillStorage.portOnMessageCallbacks[data.data.portID] || []).forEach(
          callback => callback(data.data.data)
        ); // pass the data to all listeners of this port
        return;
      }
    }
    // if it's none of the above, that means it's a standalone message
    // (which i don't think happens in the content script but i'll support it anyway) 
    if (data.type == 'sendToForeground' || data.type == 'sendToBackground') {
      polyfillStorage.onMessageCallbacks.forEach(callback => callback(data.data));
    }
  } catch (e) {
    console.debug(e);
  }
});