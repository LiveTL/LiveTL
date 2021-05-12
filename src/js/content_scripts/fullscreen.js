const initFullscreenButton = () => {
  // eslint-disable-next-line no-self-assign
  let oldElement = document.querySelector('.ytp-fullscreen-button');
  let fsButton = oldElement.cloneNode(true);
  oldElement.parentNode.replaceChild(fsButton, oldElement);
  fsButton.ariaDisabled = false;
  fsButton.addEventListener('click', () => {
    window.parent.postMessage({ event: 'fullscreen' }, '*');
  });
  // document.querySelector('.ytp-youtube-button').style.display = 'none';
  // document.querySelector('#movie_player>.ytp-generic-popup').style.opacity = '0';
  window.removeEventListener('mousedown', initFullscreenButton);
};
initFullscreenButton();
