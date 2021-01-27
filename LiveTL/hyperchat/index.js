(async () => {
  const temp = await (await fetch(await getWAR('/hyperchat/index.html#/chat'))).text();
  new Vue({
    data: () => ({}),
    template: temp
  }).$mount('#app');
})();