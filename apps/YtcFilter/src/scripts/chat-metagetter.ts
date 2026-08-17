window.dispatchEvent(new CustomEvent('fetchMeta', {
  detail: JSON.stringify(window.ytcfg)
}));

export {};
