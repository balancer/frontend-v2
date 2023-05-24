import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { subgraphRequest } from '@/lib/utils/subgraph';
import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
export type PoolGauges = {
  __name: 'PoolGauges';
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

type QueryOptions = UseQueryOptions<PoolGauges>;

/**
 * Fetches all gauges for a given pool and specifies which gauge is the
 * preferential gauge.
 */
export default function usePoolGaugesQuery(
  poolAddress: Ref<string | undefined>,
  options: UseQueryOptions<PoolGauges> = {}
) {
  /**
   * QUERY KEY
   */
  const queryKey = reactive(QUERY_KEYS.Pool.Gauges(poolAddress));

  /**
   * COMPUTED
   */
  const enabled = computed((): boolean => !!poolAddress?.value);

  const subgraphQuery = computed(() => ({
    __name: 'PoolGauges',
    pool: {
      __args: {
        id: poolAddress.value?.toLowerCase(),
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
          poolAddress: poolAddress.value?.toLowerCase(),
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
    enabled,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery<PoolGauges>(queryKey, queryFn, queryOptions as QueryOptions);
}
