(async () => {
  window.addEventListener('message', m => {
    if (typeof m.data == 'object') {
      switch (m.data.type) {
        case 'messageChunk':
          console.log(m.data.messages);
          m.data.messages.forEach(onNewMessage);
          break;
      }
    }
  });
  runLiveTL();
})();