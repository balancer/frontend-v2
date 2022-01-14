import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';

export default function useLgesQuery(options: UseQueryOptions<GqlLge[]> = {}) {
  const queryKey = reactive(QUERY_KEYS.Lges.All);

  const queryFn = async () => {
    return beethovenxService.getLges();
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<GqlLge[]>(queryKey, queryFn, queryOptions);
}
