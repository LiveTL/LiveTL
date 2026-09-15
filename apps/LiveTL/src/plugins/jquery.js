// needs those redeclarations of window.jQuery bc jQuery is a little shit and somehow
// yeets itself from window
import j from 'jquery';
window.jQuery = j;
import './jquery-ui-bundle.js';
window.jQuery = j;
import './jquery.ui.touch-punch';

export { j };
