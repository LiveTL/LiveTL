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
    setTimeout(()=>{
        window.Android.startedLoading();
    }, 500);
}, 100);