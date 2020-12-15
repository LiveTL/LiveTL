(async () => {
  window.addEventListener('message', m => {
    if (typeof m.data == 'object') {
      switch (m.data.type) {
        case 'messageChunk':
          (m.data.messages || []).forEach(onNewMessage);
          break;
      }
    }
  });
  runLiveTL();
})();