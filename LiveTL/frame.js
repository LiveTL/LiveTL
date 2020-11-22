runLiveTL = () => {
    console.log("Running LiveTL!");
}

if (parent === top) {
    try {
        var params = JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
        if (params.useLiveTL) {
            runLiveTL();
        }
    } catch (e) {
    }
}