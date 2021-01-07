params = parseParams();

const progress = {
  current: null,
  previous: null
};

class Queue {
  constructor () {
    this.clear();
  }

  clear () {
    this.top = null;
    this.last = this.top;
  }

  pop () {
    const front = this.top;
    this.top = this.top.next;
    if (front == this.last) {
      this.last = null;
    }
    return front;
  }

  push (item) {
    const newItem = { data: item };
    if (this.last == null) {
      this.top = newItem;
      this.last = this.top;
    } else {
      this.last.next = newItem;
      this.last = newItem;
    }
  }
}

const queued = new Queue();

let lastChunk = '';
const messageReceive = (m) => {
  try {
    d = JSON.parse(JSON.stringify(m.data));
  } catch (e) { return; }
  if (typeof d === 'object') {
    setTimeout(() => {
      if (params.v != d.video) return;
      if (d['yt-player-video-progress']) {
        console.debug('Received timestamp');
        progress.current = d['yt-player-video-progress'];
        if (Math.abs(progress.previous - progress.current) > 1 || progress.current == null) {
          // Difference in progress above a second, assume user scrubbed, clear.
          // queued.clear();
          while (queued.top) {
            onNewMessage(queued.pop().data.message);
          }
        } else {
          while (queued.top != null && queued.top.data.timestamp <= progress.current) {
            onNewMessage(queued.pop().data.message);
          }
        }
        progress.previous = progress.current;
      } else if (d.type === 'messageChunk') {
        const str = JSON.stringify(d.messages);
        if (str == lastChunk) return;
        lastChunk = str;
        if (params.isReplay) {
          d.messages.forEach(message => {
            let secs = Array.from(message.timestamp.split(':'), t => parseInt(t)).reverse();
            secs = secs[0] + (secs[1] ? secs[1] * 60 : 0) +
              (secs[2] ? secs[2] * 60 * 60 : 0);
            queued.push({
              timestamp: secs,
              message: message
            });
          });
        } else {
          d.messages.forEach(onNewMessage);
        }
        console.debug('Received message chunk:', d);
      }
      //  else if (d.type === 'messageChunk') {
      //   let str = JSON.stringify(d.messages);
      //   if (str == lastChunk) return;
      //   lastChunk = str;

      //   if (params.isReplay) {
      //     if (params.v != d.video) return;
      //     d.messages = d.messages.filter(message => {
      //       let secs = Array.from(message.timestamp.split(':'), t => parseInt(t)).reverse();
      //       secs = secs[0] + (secs[1] ? secs[1] * 60 : 0)
      //         + (secs[2] ? secs[2] * 60 * 60 : 0);

      //       let diff = progress.current - secs;
      //       if (diff < 0) { // Message from the future ✨🔮, queue
      //         queued.push(message, secs);
      //         return false; // Remove from original event
      //       } else return true;
      //     });
      //   }
      // commented out because it delays some messages indefinitely
      // will re-implement some parts later
      // Send past and current messages
      // }

      // uncomment if the queueing code is too buggy
      // if (d.type === 'messageChunk') {
      //   let str = JSON.stringify(d.messages);
      //   if (str == lastChunk) return;
      //   lastChunk = str;
      //   d.messages.forEach(onNewMessage);
      //   console.debug('Received message chunk:', d);
      // }
    }, 0);
  }
};

window.addEventListener('message', messageReceive);
chrome.runtime.onMessage.addListener(messageReceive);

runLiveTL();
