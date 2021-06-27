export const sseToStream = link => readable(null, set => {
  const source = new EventSource(link);

  source.onmessage = event => {
    set(JSON.parse(event.data));
  }

  return function stop() {
    source.close();
  }
});
