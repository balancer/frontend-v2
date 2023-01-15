import { QueryClient, VUE_QUERY_CLIENT } from 'vue-query';

export const queryClient = new QueryClient();

export default {
  install: app => {
    queryClient.mount();

    // Make plugin available in options API
    app.config.globalProperties.$queryClient = queryClient || {};

    // Make plugin available in composition API
    app.provide(VUE_QUERY_CLIENT, queryClient);
  },
};
