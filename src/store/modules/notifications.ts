import { clone } from '@/utils';

const state = {
  items: [],
  watch: []
};

const mutations = {
  notify(_state, payload) {
    _state.items.push({ ...payload, timestamp: Date.now() });
  },
  NOTIFY_SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  }
};

const actions = {
  notify: ({ commit }, payload) => {
    Array.isArray(payload)
      ? commit('notify', { message: payload[1], type: payload[0] })
      : commit('notify', { message: payload, type: 'green' });
  },
  watchTx: async ({ commit }, tx) => {
    let watch = clone(state.watch);
    // @ts-ignore
    watch.push(tx.hash);
    commit('NOTIFY_SET', { watch });
    await tx.wait(1);
    watch = watch.filter(hash => hash !== tx.hash);
    commit('NOTIFY_SET', { watch });
  }
};

export default {
  state,
  mutations,
  actions
};
