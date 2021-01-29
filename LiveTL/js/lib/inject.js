window.setTimeout(async () => {
  let loading = document.querySelector('#loadingOverlay');
  if (loading) return;
  loading = document.createElement('div');
  loading.id = 'loadingOverlay';
  let loader = document.createElement('div');
  loader.className = 'loader';
  loading.appendChild(loader);
  document.body.appendChild(loading);
  let text = document.createElement('span');
  text.id = 'text';
  text.innerText = `Waiting for YouTube to respond. This may take a while...`;
  loading.appendChild(text);
  let style = document.createElement('style');
  style.innerHTML = `
      #loadingOverlay {
          width: 100vw;
          height: 100vh;
          background-color: black;
          z-index: 10000;
          top: 0px;
          left: 0px;
          display: grid;
          justify-content: center;
          position: fixed;
          color: white;
          margin: auto;
      }
  
      #text {
          width: 75%;
          text-align: center;
          margin: auto;
          user-select: none;
      }
  
      .loader {
          border: min(5vh, 5vw) solid #f3f3f3;
          border-radius: 50%;
          border-top: min(5vh, 5vw) solid #3498db;
          width: min(25vh, 25vw);
          height: min(25vh, 25vw);
          animation: spin 2s linear infinite;
          margin: auto;
      }
  
      @keyframes spin {
          0% {
              transform: rotate(0deg);
          }
          100% {
              transform: rotate(360deg);
          }
      }
  
      body {
          position: fixed;
          top: 0px;
          left: 0px;
      }
    `;
  document.body.appendChild(style);
  try {
    const VIDEO = (new URLSearchParams(location.search)).get('v');
    const continuation = (await
      (await fetch(`https://www.youtube.com/watch?v=${VIDEO}`)).text())
      .split('"reloadContinuationData":{"continuation":"')[1].split('"')[0];
    window.fetchedContinuationToken = continuation;
  } catch (e) {
    text.innerText = 'Stream could not be loaded.';
  }
  window.Android.startedLoading();
}, 100);