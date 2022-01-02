import { computed, reactive } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import useApp from '@/composables/useApp';
import { Farm } from '@/beethovenx/services/subgraph/subgraph-types';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';

type FarmsQueryResponse = {
  farms: Farm[];
  skip?: number;
};

export default function useFarmsQuery(
  options: UseInfiniteQueryOptions<FarmsQueryResponse> = {}
) {
  // COMPOSABLES
  const { appLoading } = useApp();

  // DATA
  const queryKey = QUERY_KEYS.Farms.All;

  // COMPUTED
  const enabled = computed(() => !appLoading.value);

  // METHODS
  const queryFn = async () => {
    const farms = await beethovenxService.getBeetsFarms();

    return { farms };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: FarmsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<FarmsQueryResponse>(queryKey, queryFn, queryOptions);
}
