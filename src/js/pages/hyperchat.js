import App from '../../submodules/chat/src/App.vue';
import Vue from 'vue';
import vuetify from '../../plugins/vuetify.js';

App.vuetify = vuetify;
new Vue(App).$mount(document.body);
