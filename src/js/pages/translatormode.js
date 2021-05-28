import App from '../../components/TranslatorMode.svelte';

const newbody = document.createElement('body');
const container = document.querySelector('#input').parentElement;

newbody.classList.add('ltl-tl-mode');

container.querySelectorAll('.ltl-tl-mode').forEach(e => e.remove());
container.appendChild(newbody);
container.cleanUpCbs = container.cleanUpCbs || [];

const app = new App({
  target: newbody,
  props: {
    container,
  }
});

window.app = app;

export default app;
