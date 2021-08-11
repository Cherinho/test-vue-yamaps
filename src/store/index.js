import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    allBaloons: [],
  },
  mutations: {
    initializeStore(state) {
      if (localStorage.getItem('baloons')) {
        state.allBaloons = JSON.parse(localStorage.getItem('baloons'));
      }
      // console.log(state.allBaloons);
    },
    addBaloon(state, payload) {
      state.allBaloons.push(payload);
      localStorage.setItem('baloons', JSON.stringify(state.allBaloons));
    },
  },
  actions: {},
  modules: {},
});
