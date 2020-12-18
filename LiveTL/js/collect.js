let collectScript = document.createElement("script")
//Array key: [hl, gl, deviceMake, visitorData, userAgent, clientName, clientVersion, osName, osVersion, browserName, browserVersion, screenWidthPoints, screenHeightPoints, screenPixelDensity, screenDensityFloat, utcOffsetMinutes, userInterfaceTheme, graftUrl, timeZone, sessionId, onBehalfOfUser]
collectScript.innerHTML = `
    let liveTlId = "` + browser.runtime.id + `"
    let continuation = document.getElementsByTagName("yt-live-chat-renderer")[0].__data.data.continuations[0].invalidationContinuationData.continuation

    let requestArray = [
        window.ytcfg.get("INNERTUBE_CONTEXT").client.hl,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.gl,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.deviceMake,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.visitorData,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.userAgent,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.clientName,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.clientVersion,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.osName,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.osVersion,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.browserName,
        window.ytcfg.get("INNERTUBE_CONTEXT").client.browserVersion,
        window.innerWidth,
        window.innerHeight,
        Math.round(window.devicePixelRatio || 1),
        window.devicePixelRatio || 1,
        -Math.floor(new Date().getTimezoneOffset()),
        window.ytcfg.get("INNERTUBE_CONTEXT").client.userInterfaceTheme,
        window.location.href,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        window.ytcfg.get("INNERTUBE_CONTEXT").request.sessionId,
        window.ytcfg.get("DELEGATED_SESSION_ID")
    ];
    console.log(requestArray)
    window.postMessage({requestArray: requestArray}, "*");
    window.postMessage({continuation: continuation}, "*");

`
// need to inject script b/c cross domain protections
document.head.appendChild(collectScript)

window.addEventListener("message", function(event) {
    var requestArray = event.data;
    browser.runtime.sendMessage(requestArray);
}, false);

