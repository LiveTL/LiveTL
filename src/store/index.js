import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    translations: []
  },
  mutations: {
    addTranslation(state, val) {
      state.translations.push(val);
    }
  },
  getters: {
    getTranslations(state) {
      return state.translations;
    }
  }
});
