window.setTimeout(() => {
    let vid = document.querySelector('video');
    if (vid) vid.muted = true;
    let loading = document.querySelector('#loadingOverlay');
    if (loading) return;
    loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    let loader = document.createElement('div');
    loader.className = 'loader';
    loading.appendChild(loader);
    document.body.appendChild(loading);
    let style = document.createElement('style');
    style.innerHTML = `
    #loadingOverlay {
        width: 100vw;
        height: 100vh;
        background-color: black;
        z-index: 10000;
        top: 0px;
        left: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
    }

    .loader {
        border: min(5vh, 5vw) solid #f3f3f3;
        border-radius: 50%;
        border-top: min(5vh, 5vw) solid #3498db;
        width: min(25vh, 25vw);
        height: min(25vh, 25vw);
        animation: spin 2s linear infinite;
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
}, 100);