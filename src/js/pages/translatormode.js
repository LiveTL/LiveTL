import App from '../../components/TranslatorMode.svelte';

let app;

(() => {
  const newbody = document.createElement('body');
  const container = document.querySelector('#input')?.parentElement;

  if (!container) {
    console.log('#input not found, not injecting translator mode.');
    return;
  }
  
  newbody.classList.add('ltl-tl-mode');
  
  container.querySelectorAll('.ltl-tl-mode').forEach(e => e.remove());
  container.appendChild(newbody);
  container.cleanUpCbs = container.cleanUpCbs || [];
  
  app = new App({
    target: newbody,
    props: {
      container,
    }
  });

  window.app = app;
})();

export default app;
