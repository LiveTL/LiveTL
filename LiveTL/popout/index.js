params = parseParams();

let progress = {
  current: null,
  previous: null
};

let queued = new class QueuedMessages {
  next = null
  messages = {}
  push(message, secs) {
    if (!this.next) this.next = secs;
    if (!this.messages[secs]) this.messages[secs] = [];
    this.messages[secs].push(message);
  }
  pop(secs) {
    if (!this.next || secs < this.next) return false;
    let m = [...this.messages[this.next]];
    delete this.messages[this.next];
    this.next = Object.keys(this.messages)[0]; // Assume order
    return m;
  }
  clear() {
    this.messages = {};
    this.next = null;
  }
}

let messageReceive = (m) => {
  d = JSON.parse(JSON.stringify(m.data));
  if (typeof d == 'object') {
    setTimeout(() => {
      if (d['yt-player-video-progress']) {
        progress.current = d['yt-player-video-progress'];
        if (!progress.previous) progress.previous = progress.current;
        if (Math.abs(progress.previous - progress.current) > 1) {
          // Difference in progress above a second, assume user scrubbed, clear.
          queued.clear();
        }
        // Find queued messages for current timeframe
        let m = queued.pop(progress.current);
        if (m) {
          m.forEach(onNewMessage);
        }
        progress.previous = progress.current;
        // console.debug('Received timestamp update:', progress.current);
      } else if (d.type === 'messageChunk') {
        if (params.isReplay) {
          if (params.v != d.video) return;
          d.messages = d.messages.filter(message => {
            let secs = Array.from(message.timestamp.split(':'), t => parseInt(t)).reverse();
            secs = secs[0] + (secs[1] ? secs[1] * 60 : 0)
              + (secs[2] ? secs[2] * 60 * 60 : 0);

            let diff = progress.current - secs;
            if (diff < 0) { // Message from the future ✨🔮, queue
              queued.push(message, secs);
              return false; // Remove from original event
            } else return true;
          });
        }
        // Send past and current messages
        d.messages.forEach(onNewMessage);
        console.debug('Received message chunk:', d);
      }
    }, 0);
  }
};

window.addEventListener('message', messageReceive);
chrome.runtime.onMessage.addListener(messageReceive);

runLiveTL();
