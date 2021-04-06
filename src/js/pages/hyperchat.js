import App from '../../submodules/chat/src/App.vue';
import Vue from 'vue';

new Vue( Object.assign({}, App, {
  propsData: { }
})).$mount(document.body);
