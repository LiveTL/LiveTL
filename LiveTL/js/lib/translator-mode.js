// TranslatorMode.run()
// Make sure to setTimeout when running at initialization

const TranslatorMode = (() => {

const [container, chatbox] = document.querySelectorAll('#input');

async function run() {
  createObserver();
}

function checkAndAddTLTag() {
  if (chatbox.textContent === '') {
    addTextToYTC('[en] ');
  }
}

function addTextToYTC(text) {
  container.setAttribute('has-text', '');
  chatbox.textContent = text;
}

function createObserver() {
  let observer = new MutationObserver((mutations, _observer) => {
    mutations.forEach(observerCallback);
  });
  observeYTC(observer);
  return observer;
}

function observeYTC(observer) {
  observer.observe(container, { attributes: true });
}

function observerCallback(mutation) {
  const { attributeName } = mutation;
  const focused = container.getAttribute('focused');
  if (attributeName === 'focused' && focused === '') {
    checkAndAddTLTag();
  }
}

return { run };
})();
