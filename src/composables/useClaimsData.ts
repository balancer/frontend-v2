import { computed, reactive } from 'vue';

import { Gauge } from '@/services/balancer/gauges/types';
import { PoolToken } from '@/services/pool/types';
import { PoolType } from '@/services/pool/types';

import useGaugesDecorationQuery from './queries/useGaugesDecorationQuery';
import useGaugesQuery from './queries/useGaugesQuery';
import useGraphQuery from './queries/useGraphQuery';
import useProtocolRewardsQuery, {
  ProtocolRewardsQueryResponse,
} from './queries/useProtocolRewardsQuery';
import { isQueryLoading } from './queries/useQueryHelpers';
import { isKovan, isL2 } from './useNetwork';
import { subgraphFallbackService } from '@/services/balancer/subgraph/subgraph-fallback.service';

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
  const protocolRewardsQuery = useProtocolRewardsQuery();
  const protocolRewards = computed(
    (): ProtocolRewardsQueryResponse => protocolRewardsQuery.data.value || {}
  );

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
    subgraphFallbackService.url.value,
    ['claim', 'gauge', 'pools'],
    () => ({
      pools: {
        __args: {
          where: { id_in: gaugePoolIds.value },
        },
        id: true,
        address: true,
        poolType: true,
        tokensList: true,
        tokens: {
          address: true,
          weight: true,
        },
      },
    }),
    reactive({ enabled: gaugePoolQueryEnabled })
  );

  /**
   * COMPUTED
   */
  const gaugePools = computed(
    (): GaugePool[] => gaugePoolQuery.data.value?.pools || []
  );

  const isLoading = computed(
    (): boolean =>
      isQueryLoading(gaugePoolQuery) ||
      (!isL2.value && !isKovan.value && isQueryLoading(protocolRewardsQuery))
  );

  return {
    gauges,
    gaugePools,
    protocolRewards,
    isLoading,
  };
}
