import { reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';

export default function useLgeQuery(
  id: Ref<string>,
  options: UseQueryOptions<GqlLge> = {}
) {
  const queryKey = reactive(QUERY_KEYS.Lges.Current(id));

  const queryFn = async () => {
    return beethovenxService.getLge(id.value);
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<GqlLge>(queryKey, queryFn, queryOptions);
}
