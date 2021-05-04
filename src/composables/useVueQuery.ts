import { VUE_QUERY_CLIENT } from 'vue-query';
import { inject } from 'vue';

export default function useVueQuery() {
  const queryClient = inject(VUE_QUERY_CLIENT) as ReturnType<any>;
  if (!queryClient) throw new Error('No vueQuery client!');

  return queryClient;
}
