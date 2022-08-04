import { QueryClient, VUE_QUERY_CLIENT } from 'vue-query';

export default {
  install: app => {
    const queryClient = new QueryClient();

    queryClient.mount();

    // Make plugin available in options API
    app.config.globalProperties.$queryClient = queryClient || {};

    // Make plugin available in composition API
    app.provide(VUE_QUERY_CLIENT, queryClient);
  },
};
