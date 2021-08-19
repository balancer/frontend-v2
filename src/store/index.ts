import { createStore } from 'vuex';
import modules from '~/store/modules';

const store = createStore({
  modules,
  strict: import.meta.env.NODE_ENV !== 'production'
});

export default store;
