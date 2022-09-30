import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { Pool } from '@/services/pool/types';
import useNetwork from '../useNetwork';

export default function usePoolAmpUpdatesQuery(id: string) {
  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork();

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.AmpUpdates(networkId, id);

  const queryFn = async () => {
    const ampUpdates = await balancerSubgraphService.poolAmpUpdates.get({
      where: {
        poolId: id.toLowerCase(),
      },
    });
    return ampUpdates;
  };

  const queryOptions = reactive({});

  return useQuery<Pool>(queryKey, queryFn, queryOptions);
}
