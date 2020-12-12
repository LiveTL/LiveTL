
parseParams = () => {
  let s = decodeURI(location.search.substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
  return s == '' ? {} : JSON.parse('{"' + s + '"}')
}

embedVideo = v => {
  let tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  let firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  let frameDiv = document.createElement('div');
  frameDiv.id = "frame_div";
  document.body.appendChild(frameDiv);

  // https://developers.google.com/youtube/iframe_api_reference
  window.onYouTubeIframeAPIReady = () => {
    let player;
    loadVideo = (id) => {
      if (!player) {
        player = new YT.Player('frame_div', {
          height: '100%',
          width: '100%',
          videoId: id,
          playerVars: {
            autoplay: 0
          }
        });
      } else {
        loadVideoInternal(id);
      }
    }
    loadVideo(v, false);
  }
}

window.addEventListener('load', () => {
  let params = parseParams()
  let v = params.v || '5qap5aO4i9A'
  let c = params.continuation
  let mode = params.mode || "chat"
  let ltl = params.useLiveTL || "";
  document.title = decodeURIComponent(params.title || "LiveTL");
  switch (mode) {
    case "chat":
      let frame = document.createElement("iframe");
      document.body.appendChild(frame);
      if (c) {
        frame.src = `https://www.youtube.com/live_chat_replay?continuation=${c}&embed_domain=${document.domain}&dark_theme=1&useLiveTL=${ltl}`
      } else {
        frame.src = `https://www.youtube.com/live_chat?v=${v}&embed_domain=${document.domain}&dark_theme=1&useLiveTL=${ltl}`
      }
      window.addEventListener('message', d => {
        try {
          frame.contentWindow.postMessage(d.data, "*");
        } catch (e) { }
      });
      break;

    case "video":
      embedVideo(v);
      window.addEventListener('message', d => {
        try {
          d = JSON.parse(d.data);
          if (d.event == "infoDelivery") {
            parent.postMessage({ "yt-player-video-progress": d.info.currentTime }, "*");
          }
        }
        catch (e) { }
      });
      break;
  }
});