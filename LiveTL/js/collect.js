




function getRequestArray(){
  return new Promise((res, rej) => {
    window.addEventListener('ytDataCallback', d => {
      res(d);
      //document.head.removeChild(collectScript);
    });
    let collectScript = document.createElement("script")
collectScript.innerHTML = `
window.dispatchEvent(new CustomEvent('ytDataCallback', {
  detail: JSON.stringify({
    "context":{
       "client":{
          "hl":window.ytcfg.get("INNERTUBE_CONTEXT").client.hl, 
          "gl":window.ytcfg.get("INNERTUBE_CONTEXT").client.gl, 
          "deviceMake":window.ytcfg.get("INNERTUBE_CONTEXT").client.deviceMake, 
          "visitorData":window.ytcfg.get("INNERTUBE_CONTEXT").client.visitorData, 
          "userAgent":window.ytcfg.get("INNERTUBE_CONTEXT").client.userAgent, 
          "clientName":window.ytcfg.get("INNERTUBE_CONTEXT").client.clientName, 
          "clientVersion":window.ytcfg.get("INNERTUBE_CONTEXT").client.clientVersion, 
          "osName":window.ytcfg.get("INNERTUBE_CONTEXT").client.osName, 
          "osVersion":window.ytcfg.get("INNERTUBE_CONTEXT").client.osVersion, 
          "browserName":window.ytcfg.get("INNERTUBE_CONTEXT").client.browserName, 
          "browserVersion":window.ytcfg.get("INNERTUBE_CONTEXT").client.browserVersion, 
          "screenWidthPoints":window.innerWidth, 
          "screenHeightPoints":window.innerHeight, 
          "screenPixelDensity":Math.round(window.devicePixelRatio || 1), 
          "screenDensityFloat":window.devicePixelRatio || 1, 
          "utcOffsetMinutes":-Math.floor(new Date().getTimezoneOffset()), 
          "userInterfaceTheme":"USER_INTERFACE_THEME_DARK", 
          "mainAppWebInfo":{
             "graftUrl":window.location.href
          },
          "timeZone":Intl.DateTimeFormat().resolvedOptions().timeZone 
       },
       "request":{
          "sessionId":window.ytcfg.get("INNERTUBE_CONTEXT").request.sessionId, 
          "internalExperimentFlags":[
             
          ], 
          "consistencyTokenJars":[
             
          ] 
       },
       "user":{
          "onBehalfOfUser":window.ytcfg.get("DELEGATED_SESSION_ID") 
       },
    },
    "continuation":document.getElementsByTagName("yt-live-chat-renderer")[0].__data.data.continuations[0].invalidationContinuationData.continuation,
    "webClientInfo":{
       "isDocumentHidden":false
    }
 })
}));

`

    document.head.appendChild(collectScript)
    //document.head.replaceChild(collectScript, collectScript)
    //document.head.childNodes.collectScript
  });
}

async function ourThing() {
  //document.head.removeChild(collectScript)
  //let continuation = await getRequestArray();
  console.log(await getRequestArray());
}

// need to inject script b/c cross domain protections
//document.head.appendChild(collectScript)
