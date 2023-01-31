import { UseQueryOptions } from 'react-query/types';
import { computed, reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { subgraphRequest } from '@/lib/utils/subgraph';
import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
export type PoolGauges = {
  pool: {
    preferentialGauge: {
      id: string | null;
    };
    gauges: {
      id: string;
      relativeWeightCap: string;
    }[];
  };
  liquidityGauges: { id: string }[];
};

/**
 * Fetches all gauges for a given pool and specifies which gauge is the
 * preferential gauge.
 */
export default function usePoolGaugesQuery(
  poolAddress: Ref<string>,
  options: UseQueryOptions<PoolGauges> = {}
) {
  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Pool.Gauges(poolAddress));

  /**
   * COMPUTED
   */
  const subgraphQuery = computed(() => ({
    pool: {
      __args: {
        id: poolAddress.value.toLowerCase(),
      },
      preferentialGauge: {
        id: true,
      },
      gauges: {
        id: true,
        relativeWeightCap: true,
      },
    },
    liquidityGauges: {
      __args: {
        where: {
          poolAddress: poolAddress.value.toLowerCase(),
        },
      },
      id: true,
    },
  }));

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      return await subgraphRequest<PoolGauges>({
        url: configService.network.subgraphs.gauge,
        query: subgraphQuery.value,
      });
    } catch (error) {
      console.error(
        `Failed to fetch pool gauge for pool: ${poolAddress.value}`,
        {
          cause: error,
        }
      );
      throw error;
    }
  };

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: true,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery<PoolGauges>(queryKey, queryFn, queryOptions);
}
