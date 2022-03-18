import { Gauge } from '@/services/balancer/gauges/types';
import { PoolToken, PoolType } from '@/services/balancer/subgraph/types';
import { computed, reactive } from 'vue';
import useGaugesDecorationQuery from './queries/useGaugesDecorationQuery';
import useGaugesQuery from './queries/useGaugesQuery';
import useGraphQuery, { subgraphs } from './queries/useGraphQuery';

export type GaugePool = {
  id: string;
  address: string;
  poolType: PoolType;
  tokens: PoolToken[];
  tokensList: string[];
};

type GaugePoolQueryResponse = {
  pools: GaugePool[];
};

/**
 * @summary Combines queries for fetching claims page gauges and associated pools.
 */
export function useClaimsData() {
  // Fetch subgraph liquidity gauges
  const subgraphGaugesQuery = useGaugesQuery();

  // Decorate subgraph gauges with current account's claim data, e.g. reward values
  const gaugesQuery = useGaugesDecorationQuery(subgraphGaugesQuery.data);
  const gauges = computed((): Gauge[] => gaugesQuery.data.value || []);
  const gaugePoolIds = computed((): string[] => {
    return gauges.value.map(gauge => gauge.poolId);
  });

  // Fetch pools associated with gauges
  const gaugePoolQueryEnabled = computed(
    (): boolean => gaugePoolIds?.value && gaugePoolIds.value?.length > 0
  );
  const gaugePoolQuery = useGraphQuery<GaugePoolQueryResponse>(
    subgraphs.balancer,
    ['claim', 'gauge', 'pools'],
    () => ({
      pools: {
        __args: {
          where: { id_in: gaugePoolIds.value }
        },
        id: true,
        address: true,
        poolType: true,
        tokensList: true,
        tokens: {
          address: true,
          weight: true
        }
      }
    }),
    reactive({ enabled: gaugePoolQueryEnabled })
  );

  /**
   * COMPUTED
   */
  const gaugePools = computed(
    (): GaugePool[] => gaugePoolQuery.data.value?.pools || []
  );

  const queriesLoading = computed(
    (): boolean =>
      gaugePoolQueryEnabled.value &&
      (gaugePoolQuery.isLoading.value ||
        gaugePoolQuery.isIdle.value ||
        !!gaugePoolQuery.error.value)
  );

  return {
    gauges,
    gaugePools,
    queriesLoading
  };
}
