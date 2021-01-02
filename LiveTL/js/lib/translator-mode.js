// TranslatorMode.run()
// Make sure to setTimeout when running at initialization

const TranslatorMode = (() => {

async function run() {
  addTextToYTC('[en] ');
}

function addTextToYTC(text) {
  let [container, chatbox] = document.querySelectorAll('#input');
  container.setAttribute('has-text', '');
  chatbox.textContent = text;
}

function observeYTC(observer) {
  observer.observe(document.querySelector('#input'), { attributes: true });
}

function observerCallback(attributeChanged) {
  console.log(attributeChanged);
}

return { run };
})();
